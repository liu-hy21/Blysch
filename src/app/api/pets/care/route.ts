import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { applyExp, nextCareGain, serializePet } from "@/lib/pet-rules";
import { settlePetRecord } from "@/lib/pet-settle";
import { todayKey } from "@/lib/utils";

export async function POST() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const raw = await prisma.pet.findUnique({ where: { userId: ctx.user.id } });
  if (!raw) return jsonError("还没有宠物", 404);
  const pet = await settlePetRecord(raw);
  if (!pet) return jsonError("还没有宠物", 404);
  const today = todayKey();
  if (pet.lastCareDate === today) return jsonError("今天已经照料过了", 409);
  const { intimacyDelta, expDelta, careStreak, moodLevel } = nextCareGain(pet, today);
  const grown = applyExp(pet, expDelta);
  const updated = await prisma.pet.update({
    where: { id: pet.id },
    data: {
      intimacy: pet.intimacy + intimacyDelta,
      lastCareDate: today,
      careStreak,
      moodLevel,
      moodSettledOn: today,
      level: grown.level,
      exp: grown.exp,
    },
  });
  return NextResponse.json({
    pet: serializePet(updated),
    levelsGained: grown.levelsGained,
  });
}
