import "server-only";
import type { Pet } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { serializePet, settleMoodState } from "@/lib/pet-rules";

export async function settlePetRecord(pet: Pet | null) {
  if (!pet) return null;
  const next = settleMoodState({
    lastCareDate: pet.lastCareDate,
    careStreak: pet.careStreak,
    intimacy: pet.intimacy,
    moodLevel: pet.moodLevel ?? 3,
    moodSettledOn: pet.moodSettledOn ?? null,
    hatchedAt: pet.hatchedAt,
  });
  if (!next.changed) return pet;
  return prisma.pet.update({
    where: { id: pet.id },
    data: {
      moodLevel: next.moodLevel,
      moodSettledOn: next.moodSettledOn,
      intimacy: next.intimacy,
      careStreak: next.careStreak,
    },
  });
}

export async function settleAndSerialize(pet: Pet | null) {
  const settled = await settlePetRecord(pet);
  return settled ? serializePet(settled) : null;
}
