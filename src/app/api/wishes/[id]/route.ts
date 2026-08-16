import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { wishSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.wish.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("心愿不存在", 404);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (body?.status === "DONE" || body?.status === "PLANNED") {
    const wish = await prisma.wish.update({
      where: { id },
      data: {
        status: body.status,
        completedAt: body.status === "DONE" ? new Date() : null,
      },
    });
    return NextResponse.json(wish);
  }
  const parsed = wishSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("参数错误", 400);
  const wish = await prisma.wish.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(wish);
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.wish.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("心愿不存在", 404);
  await prisma.wish.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
