import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { wishFields } from "@/lib/validators";

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
  const parsed = wishFields.partial().safeParse(body);
  if (!parsed.success) return jsonError("参数错误", 400);
  const category = parsed.data.category ?? existing.category;
  const region =
    category === "旅行"
      ? (parsed.data.region !== undefined ? parsed.data.region : existing.region)
      : null;
  if (category === "旅行" && !region) {
    return jsonError("旅行需要选择国内或国外", 400);
  }
  const wish = await prisma.wish.update({
    where: { id },
    data: {
      ...parsed.data,
      region,
      whenText:
        parsed.data.whenText !== undefined
          ? parsed.data.whenText?.trim() || null
          : undefined,
    },
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
