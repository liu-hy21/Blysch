import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { placeSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.place.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("足迹不存在", 404);
  const parsed = placeSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);
  const place = await prisma.place.update({
    where: { id },
    data: {
      name: parsed.data.name,
      city: parsed.data.city,
      note: parsed.data.note,
      images:
        parsed.data.images === undefined
          ? undefined
          : JSON.stringify(parsed.data.images),
    },
  });
  return NextResponse.json(place);
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const existing = await prisma.place.findFirst({
    where: { id, coupleId: ctx.coupleId },
  });
  if (!existing) return jsonError("足迹不存在", 404);
  await prisma.memory.updateMany({
    where: { placeId: id },
    data: { placeId: null },
  });
  await prisma.place.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
