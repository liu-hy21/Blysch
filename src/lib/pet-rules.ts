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

export type PetMood = "calm" | "content" | "miss";

export function petMood(pet: Pick<Pet, "lastCareDate">, today = todayKey()): PetMood {
  if (pet.lastCareDate === today) return "content";
  if (pet.lastCareDate && addDaysKey(pet.lastCareDate, 1) < today) return "miss";
  return "calm";
}

export function nextCareGain(pet: Pick<Pet, "lastCareDate" | "careStreak">, today = todayKey()) {
  const continuing = pet.lastCareDate === addDaysKey(today, -1);
  const streak = continuing ? Math.min(pet.careStreak + 1, 7) : 1;
  const extra = streak >= 2 ? 1 : 0;
  return { intimacyDelta: 3 + extra, careStreak: streak };
}

export function serializePet(pet: Pet) {
  return {
    id: pet.id,
    species: pet.species,
    name: pet.name,
    intimacy: pet.intimacy,
    lastCareDate: pet.lastCareDate,
    careStreak: pet.careStreak,
    hatchedAt: pet.hatchedAt.toISOString(),
    mood: petMood(pet),
    caredToday: pet.lastCareDate === todayKey(),
    speciesLabel: SPECIES_LABEL[pet.species],
  };
}

export type SerializedPet = ReturnType<typeof serializePet>;
