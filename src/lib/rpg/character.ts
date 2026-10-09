import { getClassDefinition } from "./data/classes";
import { getEquipmentDefinition } from "./data/equipment";
import type {
  BaseStats,
  Character,
  CharacterSnapshot,
  CombatStats,
  EquipmentSlot,
  ItemId,
  StatKey,
} from "./types";

const EMPTY_STATS: BaseStats = {
  str: 0,
  dex: 0,
  vit: 0,
  int: 0,
  wis: 0,
  luk: 0,
};

/** 升到下一级所需经验（简单二次曲线） */
export function xpToNextLevel(level: number): number {
  return 50 + level * level * 15;
}

export function createCharacter(params: {
  id: string;
  name: string;
  classId: string;
  startingItems?: ItemId[];
}): Character {
  const classDef = getClassDefinition(params.classId);
  const startingSkills = classDef.skillLearnset
    .filter((e) => e.level <= 1)
    .map((e) => e.skillId);

  return {
    id: params.id,
    name: params.name,
    classId: params.classId,
    level: 1,
    xp: 0,
    unspentStatPoints: 0,
    allocatedStats: { ...EMPTY_STATS },
    equipped: {},
    inventoryItemIds: params.startingItems ?? [],
    learnedSkillIds: [...new Set(startingSkills)],
  };
}

function sumStatGrowth(
  partial: Partial<BaseStats>,
  levelsGained: number,
): BaseStats {
  const out = { ...EMPTY_STATS };
  for (const key of Object.keys(out) as StatKey[]) {
    out[key] = (partial[key] ?? 0) * levelsGained;
  }
  return out;
}

function addStats(a: BaseStats, b: Partial<BaseStats>): BaseStats {
  const out = { ...a };
  for (const key of Object.keys(out) as StatKey[]) {
    out[key] += b[key] ?? 0;
  }
  return out;
}

function scaleCombatGrowth(
  base: Omit<CombatStats, "critRate"> & { critRate?: number },
  growth: Partial<Omit<CombatStats, "critRate">> & { critRate?: number },
  levelsAboveOne: number,
): CombatStats {
  const critBase = base.critRate ?? 0;
  const critGrow = growth.critRate ?? 0;
  return {
    maxHp: base.maxHp + (growth.maxHp ?? 0) * levelsAboveOne,
    maxMp: base.maxMp + (growth.maxMp ?? 0) * levelsAboveOne,
    attack: base.attack + (growth.attack ?? 0) * levelsAboveOne,
    defense: base.defense + (growth.defense ?? 0) * levelsAboveOne,
    magicAttack: base.magicAttack + (growth.magicAttack ?? 0) * levelsAboveOne,
    magicDefense:
      base.magicDefense + (growth.magicDefense ?? 0) * levelsAboveOne,
    speed: base.speed + (growth.speed ?? 0) * levelsAboveOne,
    critRate: Math.min(0.5, critBase + critGrow * levelsAboveOne),
  };
}

function applyEquipmentToStats(
  character: Character,
  stats: BaseStats,
  combat: CombatStats,
): { stats: BaseStats; combat: CombatStats } {
  let s = { ...stats };
  let c = { ...combat };

  for (const itemId of Object.values(character.equipped)) {
    if (!itemId) continue;
    const item = getEquipmentDefinition(itemId);
    s = addStats(s, item.statBonus);
    c = {
      ...c,
      maxHp: c.maxHp + (item.combatBonus.maxHp ?? 0),
      maxMp: c.maxMp + (item.combatBonus.maxMp ?? 0),
      attack: c.attack + (item.combatBonus.attack ?? 0),
      defense: c.defense + (item.combatBonus.defense ?? 0),
      magicAttack: c.magicAttack + (item.combatBonus.magicAttack ?? 0),
      magicDefense: c.magicDefense + (item.combatBonus.magicDefense ?? 0),
      speed: c.speed + (item.combatBonus.speed ?? 0),
      critRate: Math.min(
        0.5,
        c.critRate + (item.combatBonus.critRate ?? 0),
      ),
    };
  }

  // 六维对战斗属性的轻量换算（可替换为更复杂的公式）
  s = addStats(s, EMPTY_STATS);
  c.maxHp += s.vit * 8 + s.str * 2;
  c.maxMp += s.int * 4 + s.wis * 3;
  c.attack += s.str * 1.5 + s.dex * 0.5;
  c.defense += s.vit * 0.8 + s.str * 0.3;
  c.magicAttack += s.int * 1.8 + s.wis * 0.5;
  c.magicDefense += s.wis * 1.2 + s.int * 0.4;
  c.speed += s.dex * 0.6 + s.luk * 0.2;
  c.critRate = Math.min(0.5, c.critRate + s.luk * 0.002);

  return { stats: s, combat: c };
}

export function computeSnapshot(character: Character): CharacterSnapshot {
  const classDef = getClassDefinition(character.classId);
  const levelsAboveOne = character.level - 1;

  const classStatGrowth = sumStatGrowth(
    classDef.statGrowthPerLevel,
    levelsAboveOne,
  );
  let baseStats = addStats(character.allocatedStats, classStatGrowth);

  let combatStats = scaleCombatGrowth(
    { ...classDef.baseCombat, critRate: classDef.baseCombat.critRate ?? 0 },
    classDef.growthPerLevel,
    levelsAboveOne,
  );

  const merged = applyEquipmentToStats(character, baseStats, combatStats);
  baseStats = merged.stats;
  combatStats = merged.combat;

  return {
    ...character,
    baseStats,
    combatStats,
  };
}

function syncSkillsForLevel(character: Character): Character {
  const classDef = getClassDefinition(character.classId);
  const skills = new Set(character.learnedSkillIds);
  for (const entry of classDef.skillLearnset) {
    if (entry.level <= character.level) skills.add(entry.skillId);
  }
  return { ...character, learnedSkillIds: [...skills] };
}

function levelUpOnce(character: Character): Character {
  let next = {
    ...character,
    level: character.level + 1,
    unspentStatPoints: character.unspentStatPoints + 3,
  };
  next = syncSkillsForLevel(next);
  return next;
}

export function grantXp(character: Character, amount: number): Character {
  if (amount <= 0) return character;
  let c = { ...character, xp: character.xp + amount };
  while (c.xp >= xpToNextLevel(c.level)) {
    c = { ...c, xp: c.xp - xpToNextLevel(c.level) };
    c = levelUpOnce(c);
  }
  return c;
}

export function allocateStatPoint(
  character: Character,
  stat: StatKey,
): Character {
  if (character.unspentStatPoints <= 0) return character;
  return {
    ...character,
    unspentStatPoints: character.unspentStatPoints - 1,
    allocatedStats: {
      ...character.allocatedStats,
      [stat]: character.allocatedStats[stat] + 1,
    },
  };
}

export function canEquip(
  character: Character,
  itemId: ItemId,
  slot?: EquipmentSlot,
): { ok: true } | { ok: false; reason: string } {
  const item = getEquipmentDefinition(itemId);
  const targetSlot = slot ?? item.slot;
  if (item.slot !== targetSlot && !(item.slot === "ring1" && targetSlot === "ring2")) {
    if (item.slot.startsWith("ring") && targetSlot.startsWith("ring")) {
      // allow ring in ring1 or ring2
    } else if (item.slot !== targetSlot) {
      return { ok: false, reason: `该物品应装备在 ${item.slot}` };
    }
  }
  if (character.level < item.requiredLevel) {
    return { ok: false, reason: `需要等级 ${item.requiredLevel}` };
  }
  const classDef = getClassDefinition(character.classId);
  const allowed = item.tags.some((t) => classDef.equipmentTags.includes(t));
  if (!allowed) {
    return { ok: false, reason: "当前职业无法使用该装备类型" };
  }
  if (!character.inventoryItemIds.includes(itemId)) {
    return { ok: false, reason: "物品不在背包中" };
  }
  return { ok: true };
}

export function equip(
  character: Character,
  itemId: ItemId,
  slot?: EquipmentSlot,
): Character {
  const item = getEquipmentDefinition(itemId);
  const targetSlot = slot ?? item.slot;
  const check = canEquip(character, itemId, targetSlot);
  if (!check.ok) throw new Error(check.reason);

  const prev = character.equipped[targetSlot];
  let inventory = character.inventoryItemIds.filter((id) => id !== itemId);
  if (prev) inventory = [...inventory, prev];

  return {
    ...character,
    inventoryItemIds: inventory,
    equipped: { ...character.equipped, [targetSlot]: itemId },
  };
}

export function unequip(
  character: Character,
  slot: EquipmentSlot,
): Character {
  const itemId = character.equipped[slot];
  if (!itemId) return character;
  const { [slot]: _, ...restEquipped } = character.equipped;
  return {
    ...character,
    equipped: restEquipped,
    inventoryItemIds: [...character.inventoryItemIds, itemId],
  };
}

export function addToInventory(
  character: Character,
  itemId: ItemId,
): Character {
  getEquipmentDefinition(itemId);
  return {
    ...character,
    inventoryItemIds: [...character.inventoryItemIds, itemId],
  };
}
