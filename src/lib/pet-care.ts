import "server-only";
import type { Pet } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { applyExp, autoCareDayKeys, nextCareGain } from "@/lib/pet-rules";

export function buildCareUpdate(pet: Pet, careDate: string) {
  const { intimacyDelta, expDelta, careStreak, moodLevel } = nextCareGain(pet, careDate);
  const grown = applyExp(pet, expDelta);
  return {
    intimacy: pet.intimacy + intimacyDelta,
    lastCareDate: careDate,
    careStreak,
    moodLevel,
    moodSettledOn: careDate,
    level: grown.level,
    exp: grown.exp,
    levelsGained: grown.levelsGained,
  };
}

export async function applyPetCare(pet: Pet, careDate: string): Promise<Pet> {
  const data = buildCareUpdate(pet, careDate);
  return prisma.pet.update({
    where: { id: pet.id },
    data: {
      intimacy: data.intimacy,
      lastCareDate: data.lastCareDate,
      careStreak: data.careStreak,
      moodLevel: data.moodLevel,
      moodSettledOn: data.moodSettledOn,
      level: data.level,
      exp: data.exp,
    },
  });
}

/** 补全所有到期未照料的自然日（含当日 23:59 后） */
export async function runAutoCareForPet(pet: Pet): Promise<Pet> {
  const days = autoCareDayKeys(pet);
  let current = pet;
  for (const day of days) {
    current = await applyPetCare(current, day);
  }
  return current;
}
