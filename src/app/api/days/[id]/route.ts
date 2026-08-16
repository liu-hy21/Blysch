import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { daySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.day.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("日子不存在", 404);
  const parsed = daySchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);
  const day = await prisma.day.update({
    where: { id },
    data: {
      title: parsed.data.title,
      targetDate: parsed.data.targetDate
        ? new Date(`${parsed.data.targetDate}T12:00:00+08:00`)
        : undefined,
    },
  });
  return NextResponse.json(day);
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.day.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("日子不存在", 404);
  await prisma.day.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
