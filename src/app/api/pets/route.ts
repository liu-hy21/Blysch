import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { hatchSchema, petNameSchema } from "@/lib/validators";
import { serializePet } from "@/lib/pet-rules";
import { settleAndSerialize } from "@/lib/pet-settle";
import { todayKey } from "@/lib/utils";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const [mine, partner] = await Promise.all([
    prisma.pet.findUnique({ where: { userId: ctx.user.id } }),
    prisma.pet.findUnique({ where: { userId: ctx.partner.id } }),
  ]);
  const [minePet, partnerPet] = await Promise.all([
    settleAndSerialize(mine),
    settleAndSerialize(partner),
  ]);
  return NextResponse.json({
    mine: minePet,
    partner: partnerPet,
    partnerNickname: ctx.partner.nickname,
  });
}

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const existing = await prisma.pet.findUnique({ where: { userId: ctx.user.id } });
  if (existing) return jsonError("已经认养过了", 409);
  const body = await req.json().catch(() => null);
  const parsed = hatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数错误", 400);
  }
  const pet = await prisma.pet.create({
    data: {
      userId: ctx.user.id,
      species: parsed.data.species,
      name: parsed.data.name,
      moodLevel: 3,
      moodSettledOn: todayKey(),
    },
  });
  return NextResponse.json(serializePet(pet));
}

export async function PATCH(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const body = await req.json().catch(() => null);
  const parsed = petNameSchema.safeParse(body);
  if (!parsed.success) return jsonError("名字 2～8 字", 400);
  const existing = await prisma.pet.findUnique({ where: { userId: ctx.user.id } });
  if (!existing) return jsonError("还没有宠物", 404);
  const pet = await prisma.pet.update({
    where: { id: existing.id },
    data: { name: parsed.data.name },
  });
  return NextResponse.json(serializePet(pet));
}
