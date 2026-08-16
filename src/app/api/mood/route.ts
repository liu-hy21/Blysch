import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { moodSchema } from "@/lib/validators";
import { todayKey } from "@/lib/utils";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const date = todayKey();
  const moods = await prisma.mood.findMany({
    where: { coupleId: ctx.coupleId, date },
  });
  return NextResponse.json({
    date,
    mine: moods.find((m) => m.userId === ctx.user.id)?.mood ?? null,
    partner: moods.find((m) => m.userId === ctx.partner.id)?.mood ?? null,
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const body = await req.json().catch(() => null);
  const parsed = moodSchema.safeParse(body);
  if (!parsed.success) return jsonError("心情无效", 400);
  const date = todayKey();
  const row = await prisma.mood.upsert({
    where: { userId_date: { userId: ctx.user.id, date } },
    update: { mood: parsed.data.mood, coupleId: ctx.coupleId },
    create: {
      userId: ctx.user.id,
      coupleId: ctx.coupleId,
      mood: parsed.data.mood,
      date,
    },
  });
  return NextResponse.json(row);
}
