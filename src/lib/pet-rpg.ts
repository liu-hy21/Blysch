import type { PetSpecies } from "@/generated/prisma/client";

/** 偶数级发一件收益；奇数级只长面板。 */
export const REWARD_EVERY = 2;

const KINDS = ["weapon", "armor", "trinket", "trait"] as const;
export type RewardKind = (typeof KINDS)[number];

export const REWARD_KIND_LABEL: Record<RewardKind, string> = {
  weapon: "武器",
  armor: "护甲",
  trinket: "饰品",
  trait: "特性",
};

type Combat = { hp: number; atk: number; def: number; spd: number };

const ROLE: Record<
  PetSpecies,
  { title: string; blurb: string; base: Combat; growth: Combat }
> = {
  rabbit: {
    title: "法师",
    blurb: "火焰、冰霜与元素。",
    base: { hp: 70, atk: 16, def: 8, spd: 14 },
    growth: { hp: 8, atk: 3, def: 1, spd: 1 },
  },
  cow: {
    title: "圣骑士",
    blurb: "圣光、祝福与奥术。",
    base: { hp: 120, atk: 14, def: 16, spd: 8 },
    growth: { hp: 14, atk: 2, def: 3, spd: 0 },
  },
  sheep: {
    title: "牧师",
    blurb: "护甲与回复。",
    base: { hp: 95, atk: 10, def: 12, spd: 9 },
    growth: { hp: 11, atk: 2, def: 2, spd: 1 },
  },
  deer: {
    title: "猎人",
    blurb: "速度与远程。",
    base: { hp: 88, atk: 15, def: 9, spd: 16 },
    growth: { hp: 9, atk: 3, def: 1, spd: 2 },
  },
  dog: {
    title: "战士",
    blurb: "扑击，护在前面。",
    base: { hp: 110, atk: 15, def: 13, spd: 12 },
    growth: { hp: 12, atk: 3, def: 2, spd: 1 },
  },
  cat: {
    title: "潜行者",
    blurb: "暴击，从暗处出手。",
    base: { hp: 80, atk: 17, def: 7, spd: 18 },
    growth: { hp: 8, atk: 3, def: 1, spd: 2 },
  },
};

const GEAR_NAME: Record<PetSpecies, Record<RewardKind, string>> = {
  rabbit: { weapon: "炎爆法杖", armor: "大法师长袍", trinket: "法力宝石", trait: "寒冰屏障" },
  cow: { weapon: "灰烬使者", armor: "圣光铠甲", trinket: "圣契", trait: "圣盾" },
  sheep: { weapon: "绒锤", armor: "毛毡甲", trinket: "羊毛结", trait: "软盾" },
  deer: { weapon: "枝角弓", armor: "叶甲", trinket: "风铃", trait: "林风" },
  dog: { weapon: "项圈刺", armor: "护胸", trinket: "忠犬牌", trait: "守势" },
  cat: { weapon: "影爪", armor: "夜衣", trinket: "夜瞳石", trait: "暗袭" },
};

export type PetReward = {
  level: number;
  kind: RewardKind;
  kindLabel: string;
  tier: number;
  name: string;
};

export type PetGearSlot = {
  kind: RewardKind;
  kindLabel: string;
  name: string | null;
  tier: number;
};

export type PetRpgView = {
  classTitle: string;
  classBlurb: string;
  combat: Combat;
  slots: PetGearSlot[];
  nextRewardLevel: number;
  nextRewardName: string;
  nextRewardKind: RewardKind;
  nextRewardKindLabel: string;
};

function rewardIndex(level: number) {
  return Math.floor(level / REWARD_EVERY);
}

export function isRewardLevel(level: number) {
  return level >= REWARD_EVERY && level % REWARD_EVERY === 0;
}

export function nextRewardLevel(level: number) {
  const n = Math.max(1, Math.floor(level));
  return Math.floor(n / REWARD_EVERY) * REWARD_EVERY + REWARD_EVERY;
}

export function rewardAt(species: PetSpecies, level: number): PetReward | null {
  if (!isRewardLevel(level)) return null;
  const index = rewardIndex(level);
  const kind = KINDS[(index - 1) % KINDS.length];
  const tier = Math.floor((index - 1) / KINDS.length) + 1;
  const base = GEAR_NAME[species][kind];
  return {
    level,
    kind,
    kindLabel: REWARD_KIND_LABEL[kind],
    tier,
    name: tier > 1 ? `${base}·${tier}` : base,
  };
}

export function rewardsBetween(species: PetSpecies, fromLevel: number, toLevel: number) {
  const list: PetReward[] = [];
  for (let lv = fromLevel + 1; lv <= toLevel; lv++) {
    const reward = rewardAt(species, lv);
    if (reward) list.push(reward);
  }
  return list;
}

function bonusFor(kind: RewardKind, tier: number): Combat {
  if (kind === "weapon") return { hp: 0, atk: 4 * tier, def: 0, spd: 0 };
  if (kind === "armor") return { hp: 0, atk: 0, def: 4 * tier, spd: 0 };
  if (kind === "trinket") return { hp: 0, atk: 0, def: 0, spd: 2 * tier };
  return { hp: 12 * tier, atk: 0, def: 0, spd: 0 };
}

function addCombat(a: Combat, b: Combat): Combat {
  return {
    hp: a.hp + b.hp,
    atk: a.atk + b.atk,
    def: a.def + b.def,
    spd: a.spd + b.spd,
  };
}

export function buildPetRpg(species: PetSpecies, level: number): PetRpgView {
  const role = ROLE[species];
  const lv = Math.max(1, Math.floor(level));
  const steps = lv - 1;
  let combat: Combat = {
    hp: role.base.hp + role.growth.hp * steps,
    atk: role.base.atk + role.growth.atk * steps,
    def: role.base.def + role.growth.def * steps,
    spd: role.base.spd + role.growth.spd * steps,
  };

  const best = new Map<RewardKind, PetReward>();
  const earned = rewardIndex(lv);
  for (let i = 1; i <= earned; i++) {
    const reward = rewardAt(species, i * REWARD_EVERY);
    if (!reward) continue;
    combat = addCombat(combat, bonusFor(reward.kind, reward.tier));
    const prev = best.get(reward.kind);
    if (!prev || reward.tier >= prev.tier) best.set(reward.kind, reward);
  }

  const upcoming = rewardAt(species, nextRewardLevel(lv));
  return {
    classTitle: role.title,
    classBlurb: role.blurb,
    combat,
    slots: KINDS.map((kind) => {
      const item = best.get(kind);
      return {
        kind,
        kindLabel: REWARD_KIND_LABEL[kind],
        name: item?.name ?? null,
        tier: item?.tier ?? 0,
      };
    }),
    nextRewardLevel: upcoming?.level ?? nextRewardLevel(lv),
    nextRewardName: upcoming?.name ?? "",
    nextRewardKind: upcoming?.kind ?? "weapon",
    nextRewardKindLabel: upcoming?.kindLabel ?? "",
  };
}
