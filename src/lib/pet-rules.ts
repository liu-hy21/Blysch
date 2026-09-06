import type { Pet, PetSpecies } from "@/generated/prisma/client";
import { addDaysKey, daysBetweenKeys, todayKey } from "@/lib/utils";
import { furnitureFor } from "@/lib/dream-furniture";

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

export const MAX_LEVEL = 30;
export const MAX_FEEDS_PER_DAY = 3;

/** 10 intimacy → 1 lowest mark. 4-up after that: 4 → next, 16 → next, 64 → top. */
export const INTIMACY_UNIT = 10;
export const INTIMACY_STEP = 4;
export const INTIMACY_TIERS = ["crown", "sun", "moon", "star"] as const;
export type IntimacyTier = (typeof INTIMACY_TIERS)[number];
export type IntimacyRank = Record<IntimacyTier, number>;

export function expToNext(level: number) {
  if (level >= MAX_LEVEL) return 0;
  return 15 + level * 10;
}

export function applyExp(pet: { level?: number | null; exp?: number | null }, gained: number) {
  let level = Number.isFinite(pet.level) ? Number(pet.level) : 1;
  let exp = Number.isFinite(pet.exp) ? Number(pet.exp) : 0;
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, exp: 0, levelsGained: 0 };
  }
  exp += gained;
  let levelsGained = 0;
  while (level < MAX_LEVEL && exp >= expToNext(level)) {
    exp -= expToNext(level);
    level += 1;
    levelsGained += 1;
  }
  if (level >= MAX_LEVEL) exp = 0;
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
    careStreak = 0;
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

export function nextCareGain(
  pet: Pick<Pet, "lastCareDate" | "careStreak"> & { moodLevel: number },
  today = todayKey(),
) {
  const mood = pet.moodLevel;
  if (mood <= 0) {
    return { intimacyDelta: 2, expDelta: 10, careStreak: 1, moodLevel: 2 };
  }
  if (mood <= 2) {
    return {
      intimacyDelta: 3,
      expDelta: 10,
      careStreak: 1,
      moodLevel: Math.min(5, mood + 2),
    };
  }
  const continuing = pet.lastCareDate === addDaysKey(today, -1);
  const streak = continuing ? pet.careStreak + 1 : 1;
  const extra = streak >= 2 ? 1 : 0;
  return {
    intimacyDelta: 3 + extra,
    expDelta: 10 + extra,
    careStreak: streak,
    moodLevel: Math.min(5, mood + 1),
  };
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
};

export type PetSkill = {
  id: string;
  name: string;
  type: string;
  power: number;
  unlockLevel: number;
  desc: string;
};

const SKILL_SETS: Record<PetSpecies, PetSkill[]> = {
  rabbit: [
    { id: "tackle", name: "撞击", type: "一般", power: 20, unlockLevel: 1, desc: "用身体撞过去。" },
    { id: "hop", name: "蹦跳", type: "妖精", power: 32, unlockLevel: 5, desc: "轻巧地弹起来再落下。" },
    { id: "carrot", name: "胡萝卜箭", type: "草", power: 48, unlockLevel: 12, desc: "把胡萝卜当箭射出去。" },
    { id: "moon", name: "月下踏", type: "妖精", power: 70, unlockLevel: 20, desc: "借着月光全力一踏。" },
  ],
  cow: [
    { id: "tackle", name: "撞击", type: "一般", power: 22, unlockLevel: 1, desc: "沉稳地顶上去。" },
    { id: "tail", name: "甩尾", type: "一般", power: 30, unlockLevel: 5, desc: "尾巴扫过地面。" },
    { id: "stomp", name: "大地踏", type: "地面", power: 52, unlockLevel: 12, desc: "蹄子砸出一声闷响。" },
    { id: "rush", name: "蛮牛冲", type: "格斗", power: 74, unlockLevel: 20, desc: "低着头直线冲锋。" },
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
  return SKILL_SETS[species].map((s) => ({
    ...s,
    locked: level < s.unlockLevel,
  }));
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
    maxLevel: pet.level >= MAX_LEVEL,
    feedsLeft: feedsLeft(pet, today),
    goldFoodReady: goldFoodReady(pet, today),
    backpack: todaysBackpack(today),
    skills: skillsFor(pet.species, pet.level),
    furniture: furnitureFor(pet.species, pet.level ?? 1),
  };
}

export type SerializedPet = ReturnType<typeof serializePet>;
