import type { Pet, PetSpecies } from "@/generated/prisma/client";
import { addDaysKey, daysBetweenKeys, isAutoCareDueForDay, todayKey } from "@/lib/utils";
import { furnitureFor } from "@/lib/dream-furniture";
import { buildPetRpg } from "@/lib/pet-rpg";

export const SPECIES = [
  "rabbit",
  "cow",
  "sheep",
  "deer",
  "dog",
  "cat",
] as const satisfies readonly PetSpecies[];

export const SPECIES_LABEL: Record<PetSpecies, string> = {
  rabbit: "兔",
  cow: "牛",
  sheep: "羊",
  deer: "鹿",
  dog: "狗",
  cat: "猫",
};

export const SPECIES_TYPE: Record<PetSpecies, string> = {
  rabbit: "妖精",
  cow: "地面",
  sheep: "一般",
  deer: "草",
  dog: "格斗",
  cat: "恶",
};

export type PetMood = "calm" | "content" | "miss";

export const MAX_FEEDS_PER_DAY = 3;

/** 10 intimacy → 1 lowest mark. 4-up after that: 4 → next, 16 → next, 64 → top. */
export const INTIMACY_UNIT = 10;
export const INTIMACY_STEP = 4;
export const INTIMACY_TIERS = ["crown", "sun", "moon", "star"] as const;
export type IntimacyTier = (typeof INTIMACY_TIERS)[number];
export type IntimacyRank = Record<IntimacyTier, number>;

export function expToNext(level: number) {
  const lv = Math.max(1, Math.floor(level));
  return 15 + lv * 10;
}

export function applyExp(pet: { level?: number | null; exp?: number | null }, gained: number) {
  let level = Number.isFinite(pet.level) ? Number(pet.level) : 1;
  let exp = Number.isFinite(pet.exp) ? Number(pet.exp) : 0;
  if (level < 1) level = 1;
  if (gained > 0) exp += gained;
  let levelsGained = 0;
  while (exp >= expToNext(level)) {
    exp -= expToNext(level);
    level += 1;
    levelsGained += 1;
  }
  return { level, exp, levelsGained };
}

export const MOOD_META = [
  { name: "赌气", emoji: ["💤"] },
  { name: "想念", emoji: ["💭"] },
  { name: "安静", emoji: ["💧"] },
  { name: "平常", emoji: ["🍃"] },
  { name: "快活", emoji: ["☀️"] },
  { name: "黏人", emoji: ["✨"] },
] as const;

export function moodEmoji(level: number): readonly string[] {
  return MOOD_META[level]?.emoji ?? MOOD_META[3].emoji;
}

export function petMood(pet: Pick<Pet, "lastCareDate">, today = todayKey()): PetMood {
  if (pet.lastCareDate === today) return "content";
  if (pet.lastCareDate && addDaysKey(pet.lastCareDate, 1) < today) return "miss";
  return "calm";
}

export type MoodSettleInput = {
  lastCareDate: string | null;
  careStreak: number;
  intimacy: number;
  moodLevel: number;
  moodSettledOn: string | null;
  hatchedAt: Date;
};

export function missedCareDays(pet: Pick<MoodSettleInput, "lastCareDate" | "hatchedAt">, today = todayKey()) {
  const yesterday = addDaysKey(today, -1);
  const hatchKey = todayKey(pet.hatchedAt);
  const start = pet.lastCareDate ? addDaysKey(pet.lastCareDate, 1) : addDaysKey(hatchKey, 1);
  if (start > yesterday) return 0;
  return daysBetweenKeys(start, yesterday) + 1;
}

export function applyOneMiss(mood: number) {
  return Math.max(0, Math.min(mood - 1, 1));
}

export function settleMoodState(pet: MoodSettleInput, today = todayKey()) {
  const moodLevel0 = Number.isFinite(pet.moodLevel) ? pet.moodLevel : 3;
  if (pet.moodSettledOn === today) {
    return {
      changed: false as const,
      moodLevel: moodLevel0,
      intimacy: pet.intimacy,
      careStreak: pet.careStreak,
      moodSettledOn: pet.moodSettledOn,
    };
  }
  const n = missedCareDays(pet, today);
  const prevN = pet.moodSettledOn ? missedCareDays(pet, pet.moodSettledOn) : 0;
  const delta = Math.max(0, n - prevN);
  let moodLevel = moodLevel0;
  let intimacy = pet.intimacy;
  let careStreak = pet.careStreak;
  if (delta > 0) {
    intimacy = Math.max(0, intimacy - 3 * delta);
    for (let i = 0; i < delta; i++) moodLevel = applyOneMiss(moodLevel);
  }
  return {
    changed: true as const,
    moodLevel,
    intimacy,
    careStreak,
    moodSettledOn: today,
  };
}

/** 连续照料只增不减（不因断档或低心情归零） */
export function nextCareStreak(
  pet: Pick<Pet, "lastCareDate" | "careStreak">,
  careDate: string,
) {
  if (pet.lastCareDate === careDate) return pet.careStreak;
  return pet.careStreak + 1;
}

export function nextCareGain(
  pet: Pick<Pet, "lastCareDate" | "careStreak"> & { moodLevel: number },
  careDate = todayKey(),
) {
  const mood = pet.moodLevel;
  const streak = nextCareStreak(pet, careDate);
  const extra = streak >= 2 ? 1 : 0;
  if (mood <= 0) {
    return { intimacyDelta: 2, expDelta: 10, careStreak: streak, moodLevel: 2 };
  }
  if (mood <= 2) {
    return {
      intimacyDelta: 3,
      expDelta: 10,
      careStreak: streak,
      moodLevel: Math.min(5, mood + 2),
    };
  }
  return {
    intimacyDelta: 3 + extra,
    expDelta: 10 + extra,
    careStreak: streak,
    moodLevel: Math.min(5, mood + 1),
  };
}

/** 需要自动补照料的自然日（上海日历）；当日须已过 23:59 */
export function autoCareDayKeys(
  pet: Pick<Pet, "lastCareDate" | "hatchedAt">,
  now = new Date(),
): string[] {
  const today = todayKey(now);
  const hatchKey = todayKey(pet.hatchedAt);
  let d = pet.lastCareDate ? addDaysKey(pet.lastCareDate, 1) : addDaysKey(hatchKey, 1);
  const days: string[] = [];
  while (d <= today) {
    if (d === today && !isAutoCareDueForDay(now)) break;
    days.push(d);
    d = addDaysKey(d, 1);
  }
  return days;
}

export const TYPE_COLOR: Record<string, string> = {
  一般: "#c4c4c0",
  草: "#78c850",
  妖精: "#ee99ac",
  地面: "#e0c068",
  飞行: "#a890f0",
  恶: "#705848",
  格斗: "#c03028",
  水: "#6890f0",
  火: "#f08030",
  岩: "#b8a038",
  火焰: "#f08030",
  冰霜: "#8fd4ee",
  奥术: "#9b59d0",
  神圣: "#f0d060",
  爱: "#ff8ec8",
};

export type SkillEffect = "damage" | "heal" | "buff" | "bond";

export type PetSkill = {
  id: string;
  name: string;
  type: string;
  power: number;
  unlockLevel: number;
  desc: string;
  /** 施放时消耗的蓝条。蓝条上限等于亲密度。 */
  cost: number;
  effect: SkillEffect;
  /** 法术、奥秘等。有它时不再显示威力。 */
  tag?: string;
};

/** 新建一条回忆时，小兔子和大牛子各增加的亲密度。 */
export const MEMORY_INTIMACY = 40;

/** 小兔子与大牛子的连携。双方都在场，并且各自扣同样的蓝。 */
export const BOND_SKILL: PetSkill = {
  id: "blysch",
  name: "Blysch",
  type: "爱",
  power: 30,
  unlockLevel: 1,
  cost: 6,
  effect: "bond",
  tag: "连携",
  desc: "两人一起打出一击，伤害按两人的攻击合计来算。",
};

const SPELL_TUNE: Record<string, Pick<PetSkill, "cost" | "effect" | "power">> = {
  frostbolt: { cost: 2, effect: "damage", power: 24 },
  fireball: { cost: 4, effect: "damage", power: 48 },
  blizzard: { cost: 6, effect: "damage", power: 36 },
  pyroblast: { cost: 8, effect: "damage", power: 80 },
  "holy-light": { cost: 2, effect: "heal", power: 60 },
  "starlight-groove": { cost: 3, effect: "buff", power: 10 },
  "blessing-of-kings": { cost: 4, effect: "buff", power: 18 },
  "lay-on-hands": { cost: 6, effect: "heal", power: 120 },
};

type SkillDef = Omit<PetSkill, "cost" | "effect"> & {
  cost?: number;
  effect?: SkillEffect;
};

const SKILL_SETS: Record<PetSpecies, SkillDef[]> = {
  rabbit: [
    {
      id: "frostbolt",
      name: "寒冰箭",
      type: "冰霜",
      power: 3,
      unlockLevel: 1,
      tag: "法术",
      desc: "对一个角色造成3点伤害，并使其冻结。",
    },
    {
      id: "fireball",
      name: "火球术",
      type: "火焰",
      power: 6,
      unlockLevel: 5,
      tag: "法术",
      desc: "造成6点伤害。",
    },
    {
      id: "blizzard",
      name: "暴风雪",
      type: "冰霜",
      power: 2,
      unlockLevel: 12,
      tag: "法术",
      desc: "对所有敌方随从造成2点伤害，并使其冻结。",
    },
    {
      id: "pyroblast",
      name: "炎爆术",
      type: "火焰",
      power: 10,
      unlockLevel: 20,
      tag: "法术",
      desc: "造成10点伤害。",
    },
  ],
  cow: [
    {
      id: "holy-light",
      name: "圣光术",
      type: "神圣",
      power: 6,
      unlockLevel: 1,
      tag: "法术",
      desc: "恢复6点生命值。",
    },
    {
      id: "starlight-groove",
      name: "星光节律",
      type: "奥术",
      power: 0,
      unlockLevel: 5,
      tag: "法术",
      desc: "使你的随从获得+2/+1。本回合你每施放一个神圣法术，本牌费用减少1。",
    },
    {
      id: "blessing-of-kings",
      name: "王者祝福",
      type: "神圣",
      power: 4,
      unlockLevel: 12,
      tag: "法术",
      desc: "使一个随从获得+4/+4。",
    },
    {
      id: "lay-on-hands",
      name: "圣疗术",
      type: "神圣",
      power: 8,
      unlockLevel: 20,
      tag: "法术",
      desc: "恢复8点生命值，抽三张牌。",
    },
  ],
  sheep: [
    { id: "tackle", name: "撞击", type: "一般", power: 18, unlockLevel: 1, desc: "毛茸茸地撞一下。" },
    { id: "wool", name: "绒毛盾", type: "一般", power: 0, unlockLevel: 5, desc: "把毛炸开挡一挡。" },
    { id: "roll", name: "滚草", type: "草", power: 44, unlockLevel: 12, desc: "缩成一团滚过去。" },
    { id: "cloud", name: "白云坠", type: "飞行", power: 66, unlockLevel: 20, desc: "从高处软软地砸下来。" },
  ],
  deer: [
    { id: "tackle", name: "撞击", type: "一般", power: 20, unlockLevel: 1, desc: "用肩轻轻顶一下。" },
    { id: "horn", name: "枝角刺", type: "草", power: 36, unlockLevel: 5, desc: "新抽的枝角往前刺。" },
    { id: "leap", name: "林间跃", type: "飞行", power: 50, unlockLevel: 12, desc: "在树影里跳来跳去。" },
    { id: "gale", name: "群岚", type: "草", power: 72, unlockLevel: 20, desc: "带着林风一起冲出来。" },
  ],
  dog: [
    { id: "tackle", name: "撞击", type: "一般", power: 21, unlockLevel: 1, desc: "扑上来贴贴。" },
    { id: "bark", name: "吠叫", type: "一般", power: 28, unlockLevel: 5, desc: "大声叫，给自己打气。" },
    { id: "dash", name: "迅扑", type: "格斗", power: 50, unlockLevel: 12, desc: "短距离加速扑咬。" },
    { id: "guard", name: "忠义守护", type: "格斗", power: 68, unlockLevel: 20, desc: "挡在你前面不让开。" },
  ],
  cat: [
    { id: "tackle", name: "撞击", type: "一般", power: 19, unlockLevel: 1, desc: "用脑袋顶一下。" },
    { id: "scratch", name: "挠挠", type: "恶", power: 34, unlockLevel: 5, desc: "轻轻挠，其实有点疼。" },
    { id: "shadow", name: "影袭", type: "恶", power: 52, unlockLevel: 12, desc: "从暗处忽然出现。" },
    { id: "eye", name: "夜瞳", type: "恶", power: 71, unlockLevel: 20, desc: "眼睛一亮，谁也跑不掉。" },
  ],
};

export function skillsFor(species: PetSpecies, level: number) {
  return SKILL_SETS[species].map((s) => {
    const tuned = SPELL_TUNE[s.id];
    return {
      ...s,
      power: tuned?.power ?? s.power,
      cost: tuned?.cost ?? Math.max(1, Math.ceil(s.power / 20)),
      effect: tuned?.effect ?? "damage",
      locked: level < s.unlockLevel,
    };
  });
}

export const DAILY_FOODS = [
  { id: "berry", name: "树果", exp: 12, intimacy: 1, desc: "路上随便摘的。" },
  { id: "carrot", name: "胡萝卜", exp: 14, intimacy: 1, desc: "洗干净了。" },
  { id: "candy", name: "糖豆", exp: 16, intimacy: 1, desc: "口袋里剩的几颗。" },
  { id: "hay", name: "干草捆", exp: 18, intimacy: 1, desc: "香香的一束。" },
  { id: "peach", name: "水蜜桃", exp: 20, intimacy: 1, desc: "咬一口会淌汁。" },
  { id: "block", name: "能量块", exp: 22, intimacy: 1, desc: "压得方方正正。" },
  { id: "milk", name: "鲜牛奶", exp: 24, intimacy: 1, desc: "还温着。" },
  { id: "soup", name: "热汤", exp: 26, intimacy: 1, desc: "小碗，吹一吹。" },
  { id: "cookie", name: "饼干", exp: 28, intimacy: 2, desc: "边角有点碎。" },
  { id: "honey", name: "蜂蜜罐", exp: 32, intimacy: 2, desc: "粘手，但是甜。" },
  { id: "dumpling", name: "小笼包", exp: 34, intimacy: 2, desc: "刚出笼。" },
  { id: "cake", name: "蛋糕", exp: 36, intimacy: 2, desc: "今天有点想吃甜的。" },
] as const;

export const GOLD_FOOD = {
  id: "apple",
  name: "金苹果",
  exp: 60,
  intimacy: 3,
  desc: "一天只能吃一颗。",
  gold: true as const,
};

export const FOODS = [...DAILY_FOODS, GOLD_FOOD] as const;
export const DAILY_BACKPACK_SIZE = 3;

export type FoodId = (typeof FOODS)[number]["id"];
export type Food = (typeof FOODS)[number];

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todaysBackpack(today = todayKey()): Food[] {
  const rand = mulberry32(hashString(`${today}:pet-backpack`));
  const pool = [...DAILY_FOODS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = pool[i];
    const b = pool[j];
    if (a === undefined || b === undefined) continue;
    pool[i] = b;
    pool[j] = a;
  }
  const daily = pool
    .slice(0, DAILY_BACKPACK_SIZE)
    .toSorted((a, b) => a.exp - b.exp);
  return [...daily, GOLD_FOOD];
}

export function foodById(id: string) {
  return FOODS.find((f) => f.id === id);
}

export function isTodaysBackpackFood(id: string, today = todayKey()) {
  return todaysBackpack(today).some((f) => f.id === id);
}

export function feedsLeft(pet: Pick<Pet, "feedDate" | "feedsToday">, today = todayKey()) {
  if (pet.feedDate !== today) return MAX_FEEDS_PER_DAY;
  return Math.max(0, MAX_FEEDS_PER_DAY - pet.feedsToday);
}

export function goldFoodReady(pet: Pick<Pet, "goldFoodDate">, today = todayKey()) {
  return pet.goldFoodDate !== today;
}

export function intimacyRank(intimacy: number): IntimacyRank {
  const n = Math.max(0, Math.floor(Number.isFinite(intimacy) ? intimacy : 0));
  const marks = Math.floor(n / INTIMACY_UNIT);
  const moonWorth = INTIMACY_STEP;
  const sunWorth = INTIMACY_STEP ** 2;
  const crownWorth = INTIMACY_STEP ** 3;
  return {
    crown: Math.floor(marks / crownWorth),
    sun: Math.floor((marks % crownWorth) / sunWorth),
    moon: Math.floor((marks % sunWorth) / moonWorth),
    star: marks % moonWorth,
  };
}

export function intimacyBadgeList(intimacy: number): IntimacyTier[] {
  const rank = intimacyRank(intimacy);
  return INTIMACY_TIERS.flatMap((tier) => Array.from({ length: rank[tier] }, () => tier));
}

const INTIMACY_MARK_NAME: Record<IntimacyTier, string> = {
  star: "星星",
  moon: "月亮",
  sun: "太阳",
  crown: "皇冠",
};

const SPECIES_MARK_NAME: Partial<Record<PetSpecies, Record<IntimacyTier, string>>> = {
  rabbit: { star: "胡萝卜", moon: "高脚杯", sun: "绒球", crown: "黄金" },
  cow: { star: "三叶草", moon: "云朵", sun: "奶罐", crown: "钻石" },
};

export function intimacyMarkName(tier: IntimacyTier, species?: PetSpecies) {
  const named = species ? SPECIES_MARK_NAME[species] : undefined;
  return named?.[tier] ?? INTIMACY_MARK_NAME[tier];
}

export function intimacyRankLabel(intimacy: number, species?: PetSpecies) {
  const rank = intimacyRank(intimacy);
  const parts = INTIMACY_TIERS.flatMap((tier) => {
    const count = rank[tier];
    if (count <= 0) return [];
    return [`${count} 个${intimacyMarkName(tier, species)}`];
  });
  if (parts.length === 0) return "亲密度";
  return `亲密度，${parts.join("、")}`;
}

export function serializePet(pet: Pet) {
  const today = todayKey();
  const next = expToNext(pet.level);
  return {
    id: pet.id,
    species: pet.species,
    name: pet.name,
    intimacy: pet.intimacy,
    lastCareDate: pet.lastCareDate,
    careStreak: pet.careStreak,
    hatchedAt: pet.hatchedAt.toISOString(),
    moodLevel: pet.moodLevel ?? 3,
    mood: petMood(pet),
    caredToday: pet.lastCareDate === today,
    speciesLabel: SPECIES_LABEL[pet.species],
    speciesType: SPECIES_TYPE[pet.species],
    level: pet.level ?? 1,
    exp: pet.exp ?? 0,
    expToNext: next,
    rpg: buildPetRpg(pet.species, pet.level ?? 1),
    feedsLeft: feedsLeft(pet, today),
    goldFoodReady: goldFoodReady(pet, today),
    backpack: todaysBackpack(today),
    skills: skillsFor(pet.species, pet.level),
    furniture: furnitureFor(pet.species, pet.level ?? 1),
  };
}

export type SerializedPet = ReturnType<typeof serializePet>;
