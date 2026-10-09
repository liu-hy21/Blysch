import type { PetSpecies } from "@/generated/prisma/client";

export type BattleSide = "ally" | "foe";

export type BattleUnit = {
  id: string;
  name: string;
  side: BattleSide;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  species?: PetSpecies;
  foeKind?: FoeKind;
  /** 本局蓝条。上限在开战时记成亲密度，打完不写回。 */
  mp?: number;
  maxMp?: number;
};

export type BattleSkill = {
  id: string;
  name: string;
  cost: number;
  power: number;
  effect: "damage" | "heal" | "buff" | "bond";
};

export type FoeKind = "murloc" | "undead" | "beast" | "elemental";

export const FOES: Record<FoeKind, { name: string; hp: number; atk: number; def: number; spd: number }> = {
  murloc: { name: "鱼人", hp: 320, atk: 100, def: 48, spd: 42 },
  undead: { name: "亡灵", hp: 400, atk: 170, def: 55, spd: 16 },
  beast: { name: "野兽", hp: 560, atk: 125, def: 108, spd: 36 },
  elemental: { name: "元素", hp: 380, atk: 155, def: 130, spd: 72 },
};

/** 攻击不超过防御时不掉血，超过时只扣差值。 */
export function strikeDamage(atk: number, def: number) {
  if (atk <= def) return 0;
  return atk - def;
}

/** 速度高的先动。速度相同则我方先动。 */
export function livingOrder(units: BattleUnit[]) {
  return units
    .filter((unit) => unit.hp > 0)
    .toSorted((a, b) => b.spd - a.spd || (a.side === b.side ? 0 : a.side === "ally" ? -1 : 1));
}

export function foeUnit(kind: FoeKind): BattleUnit {
  const foe = FOES[kind];
  return {
    id: `foe-${kind}`,
    name: foe.name,
    side: "foe",
    hp: foe.hp,
    maxHp: foe.hp,
    atk: foe.atk,
    def: foe.def,
    spd: foe.spd,
    foeKind: kind,
  };
}

function targetOf(units: BattleUnit[], actor: BattleUnit) {
  const opposite = actor.side === "ally" ? "foe" : "ally";
  return units.find((unit) => unit.side === opposite && unit.hp > 0) ?? null;
}

export function strike(units: BattleUnit[], actorId: string) {
  const actor = units.find((unit) => unit.id === actorId && unit.hp > 0);
  if (!actor) return { units, line: "" };
  const target = targetOf(units, actor);
  if (!target) return { units, line: "" };
  const damage = strikeDamage(actor.atk, target.def);
  const next = units.map((unit) =>
    unit.id === target.id ? { ...unit, hp: Math.max(0, unit.hp - damage) } : unit,
  );
  const line =
    damage === 0
      ? `${actor.name} 使用打击。${target.name} 的防御完全挡住了。`
      : `${actor.name} 使用打击，对 ${target.name} 造成 ${damage} 点伤害。`;
  return { units: next, line };
}

function spend(unit: BattleUnit, cost: number) {
  return { ...unit, mp: (unit.mp ?? 0) - cost };
}

/** 打击不耗蓝。技能按费用扣蓝：伤害把威力加进攻击再和防御比，治疗直接回血，增益提高攻击。 */
export function castSkill(units: BattleUnit[], actorId: string, skill: BattleSkill) {
  const actor = units.find((unit) => unit.id === actorId && unit.hp > 0);
  if (!actor) return { units, line: "", ok: false };
  const mana = actor.mp ?? 0;

  if (skill.effect === "bond") {
    const partner = units.find((unit) => unit.side === "ally" && unit.id !== actor.id && unit.hp > 0);
    if (!partner) return { units, line: "连携需要小兔子和大牛子都在场。", ok: false };
    if (mana < skill.cost || (partner.mp ?? 0) < skill.cost) {
      return { units, line: "蓝条不够。", ok: false };
    }
    const target = targetOf(units, actor);
    if (!target) return { units, line: "", ok: false };
    const damage = strikeDamage(actor.atk + partner.atk + skill.power, target.def);
    const next = units.map((unit) => {
      if (unit.id === actor.id || unit.id === partner.id) return spend(unit, skill.cost);
      if (unit.id === target.id) return { ...unit, hp: Math.max(0, unit.hp - damage) };
      return unit;
    });
    const line =
      damage === 0
        ? `${actor.name} 和 ${partner.name} 施放${skill.name}。${target.name} 的防御完全挡住了。`
        : `${actor.name} 和 ${partner.name} 施放${skill.name}，对 ${target.name} 造成 ${damage} 点伤害。`;
    return { units: next, line, ok: true };
  }

  if (mana < skill.cost) return { units, line: "蓝条不够。", ok: false };
  const spent = units.map((unit) => (unit.id === actor.id ? spend(unit, skill.cost) : unit));

  if (skill.effect === "heal") {
    const wounded = spent
      .filter((unit) => unit.side === "ally" && unit.hp > 0 && unit.hp < unit.maxHp)
      .toSorted((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (!wounded) return { units, line: `${actor.name} 这边的生命已经满了。`, ok: false };
    const gain = Math.min(skill.power, wounded.maxHp - wounded.hp);
    const next = spent.map((unit) => (unit.id === wounded.id ? { ...unit, hp: unit.hp + gain } : unit));
    return {
      units: next,
      line: `${actor.name} 施放${skill.name}，${wounded.name} 恢复 ${gain} 点生命。`,
      ok: true,
    };
  }

  if (skill.effect === "buff") {
    const next = spent.map((unit) =>
      unit.id === actor.id ? { ...unit, atk: unit.atk + skill.power } : unit,
    );
    return {
      units: next,
      line: `${actor.name} 施放${skill.name}，攻击提高 ${skill.power}。`,
      ok: true,
    };
  }

  const target = targetOf(spent, actor);
  if (!target) return { units, line: "", ok: false };
  const damage = strikeDamage(actor.atk + skill.power, target.def);
  const next = spent.map((unit) =>
    unit.id === target.id ? { ...unit, hp: Math.max(0, unit.hp - damage) } : unit,
  );
  const line =
    damage === 0
      ? `${actor.name} 施放${skill.name}。${target.name} 的防御完全挡住了。`
      : `${actor.name} 施放${skill.name}，对 ${target.name} 造成 ${damage} 点伤害。`;
  return { units: next, line, ok: true };
}

export function outcome(units: BattleUnit[]): "win" | "lose" | "ongoing" {
  const allies = units.some((unit) => unit.side === "ally" && unit.hp > 0);
  const foes = units.some((unit) => unit.side === "foe" && unit.hp > 0);
  if (!foes && allies) return "win";
  if (!allies) return "lose";
  return "ongoing";
}
