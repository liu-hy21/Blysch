/** 六维基础属性（类似 D&D / 经典 JRPG） */
export type BaseStats = {
  str: number;
  dex: number;
  vit: number;
  int: number;
  wis: number;
  luk: number;
};

/** 战斗用衍生属性 */
export type CombatStats = {
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  critRate: number;
};

export type StatKey = keyof BaseStats;

export type EquipmentSlot =
  | "head"
  | "chest"
  | "legs"
  | "hands"
  | "feet"
  | "neck"
  | "ring1"
  | "ring2"
  | "mainHand"
  | "offHand";

/** 装备类型标签，用于职业 `equipmentTags` 校验 */
export type EquipmentTag =
  | "sword"
  | "axe"
  | "dagger"
  | "bow"
  | "staff"
  | "wand"
  | "shield"
  | "heavy_armor"
  | "light_armor"
  | "robe"
  | "accessory";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type SkillId = string;
export type ClassId = string;
export type ItemId = string;

export type SkillLearnEntry = {
  level: number;
  skillId: SkillId;
};

/** 职业模板：数据驱动，与角色实例分离 */
export type ClassDefinition = {
  id: ClassId;
  name: string;
  description: string;
  /** 1 级基础战斗属性（再叠等级成长与装备） */
  baseCombat: Omit<CombatStats, "critRate"> & { critRate?: number };
  /** 每升一级增加的战斗属性 */
  growthPerLevel: Partial<Omit<CombatStats, "critRate">> & { critRate?: number };
  /** 每级对六维属性的加成（可全 0，由装备/加点为主） */
  statGrowthPerLevel: Partial<BaseStats>;
  skillLearnset: SkillLearnEntry[];
  equipmentTags: EquipmentTag[];
  /** 主属性，用于部分技能缩放说明 */
  primaryStat: StatKey;
};

export type EquipmentDefinition = {
  id: ItemId;
  name: string;
  description: string;
  slot: EquipmentSlot;
  tags: EquipmentTag[];
  rarity: ItemRarity;
  requiredLevel: number;
  statBonus: Partial<BaseStats>;
  combatBonus: Partial<Omit<CombatStats, "critRate">> & { critRate?: number };
};

export type EquippedGear = Partial<Record<EquipmentSlot, ItemId>>;

/** 角色运行时状态 */
export type Character = {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  /** 未分配的属性点（升级获得） */
  unspentStatPoints: number;
  /** 玩家分配后的六维（不含装备） */
  allocatedStats: BaseStats;
  equipped: EquippedGear;
  /** 背包中的装备实例 id 列表 */
  inventoryItemIds: ItemId[];
  learnedSkillIds: SkillId[];
};

export type CharacterSnapshot = Character & {
  baseStats: BaseStats;
  combatStats: CombatStats;
};
