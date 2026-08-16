import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { daySchema } from "@/lib/validators";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const days = await prisma.day.findMany({
    where: { coupleId: ctx.coupleId },
    orderBy: { targetDate: "asc" },
  });
  return NextResponse.json(days);
}

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const parsed = daySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数错误", 400);
  }
  const day = await prisma.day.create({
    data: {
      coupleId: ctx.coupleId,
      title: parsed.data.title,
      targetDate: new Date(`${parsed.data.targetDate}T12:00:00+08:00`),
    },
  });
  return NextResponse.json(day);
}
