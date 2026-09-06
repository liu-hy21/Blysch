import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import {
  applyExp,
  feedsLeft,
  foodById,
  goldFoodReady,
  isTodaysBackpackFood,
  serializePet,
} from "@/lib/pet-rules";
import { settlePetRecord } from "@/lib/pet-settle";
import { feedSchema } from "@/lib/validators";
import { todayKey } from "@/lib/utils";

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const raw = await prisma.pet.findUnique({ where: { userId: ctx.user.id } });
  if (!raw) return jsonError("还没有宠物", 404);
  const pet = await settlePetRecord(raw);
  if (!pet) return jsonError("还没有宠物", 404);
  const body = await req.json().catch(() => null);
  const parsed = feedSchema.safeParse(body);
  if (!parsed.success) return jsonError("没有这种食物", 400);
  const food = foodById(parsed.data.foodId);
  if (!food) return jsonError("没有这种食物", 400);

  const today = todayKey();
  if (!isTodaysBackpackFood(food.id, today)) {
    return jsonError("今天背包里没有这个", 409);
  }
  if (feedsLeft(pet, today) <= 0) return jsonError("今天喂饱了，明天再来", 409);
  if ("gold" in food && food.gold && !goldFoodReady(pet, today)) {
    return jsonError("金苹果一天只能一颗", 409);
  }

  const grown = applyExp(pet, food.exp);
  const feedsToday = (pet.feedDate === today ? pet.feedsToday : 0) + 1;
  const updated = await prisma.pet.update({
    where: { id: pet.id },
    data: {
      intimacy: pet.intimacy + food.intimacy,
      level: grown.level,
      exp: grown.exp,
      feedDate: today,
      feedsToday,
      ...("gold" in food && food.gold ? { goldFoodDate: today } : {}),
    },
  });
  return NextResponse.json({
    pet: serializePet(updated),
    levelsGained: grown.levelsGained,
    food: food.name,
  });
}
