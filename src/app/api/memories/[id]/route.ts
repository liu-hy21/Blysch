import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { memorySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.memory.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("回忆不存在", 404);
  const body = await req.json().catch(() => null);
  const parsed = memorySchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("参数错误", 400);
  const data = parsed.data;
  const memory = await prisma.$transaction(async (tx) => {
    if (data.images) {
      await tx.memoryImage.deleteMany({ where: { memoryId: id } });
      await tx.memoryImage.createMany({
        data: data.images.map((url, i) => ({ memoryId: id, url, sortOrder: i })),
      });
    }
    return tx.memory.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        date: data.date ? new Date(`${data.date}T12:00:00+08:00`) : undefined,
        placeId: data.placeId === undefined ? undefined : data.placeId || null,
        coverImage: data.images ? (data.images[0] ?? null) : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        author: { select: { nickname: true, username: true } },
        place: { select: { id: true, name: true } },
      },
    });
  });
  return NextResponse.json(memory);
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.memory.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("回忆不存在", 404);
  await prisma.memory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
