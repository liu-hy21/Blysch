import type { Pet, PetSpecies } from "@/generated/prisma/client";
import { addDaysKey, todayKey } from "@/lib/utils";

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

export function petMood(pet: Pick<Pet, "lastCareDate">, today = todayKey()): PetMood {
  if (pet.lastCareDate === today) return "content";
  if (pet.lastCareDate && addDaysKey(pet.lastCareDate, 1) < today) return "miss";
  return "calm";
}

export function nextCareGain(pet: Pick<Pet, "lastCareDate" | "careStreak">, today = todayKey()) {
  const continuing = pet.lastCareDate === addDaysKey(today, -1);
  const streak = continuing ? Math.min(pet.careStreak + 1, 7) : 1;
  const extra = streak >= 2 ? 1 : 0;
  return { intimacyDelta: 3 + extra, expDelta: 10 + extra, careStreak: streak };
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

export const FOODS = [
  { id: "berry", name: "树果", exp: 12, intimacy: 1, desc: "路上随便摘的。" },
  { id: "block", name: "能量块", exp: 22, intimacy: 1, desc: "压得方方正正。" },
  { id: "cake", name: "蛋糕", exp: 36, intimacy: 2, desc: "今天有点想吃甜的。" },
  { id: "apple", name: "金苹果", exp: 60, intimacy: 3, desc: "一天只能吃一颗。", gold: true },
] as const;

export type FoodId = (typeof FOODS)[number]["id"];

export function foodById(id: string) {
  return FOODS.find((f) => f.id === id);
}

export function feedsLeft(pet: Pick<Pet, "feedDate" | "feedsToday">, today = todayKey()) {
  if (pet.feedDate !== today) return MAX_FEEDS_PER_DAY;
  return Math.max(0, MAX_FEEDS_PER_DAY - pet.feedsToday);
}

export function goldFoodReady(pet: Pick<Pet, "goldFoodDate">, today = todayKey()) {
  return pet.goldFoodDate !== today;
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
    skills: skillsFor(pet.species, pet.level),
  };
}

export type SerializedPet = ReturnType<typeof serializePet>;
