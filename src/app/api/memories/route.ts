import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { memorySchema } from "@/lib/validators";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const memories = await prisma.memory.findMany({
    where: { coupleId: ctx.coupleId },
    include: {
      images: { where: { hidden: false }, orderBy: { sortOrder: "asc" } },
      author: { select: { nickname: true, username: true } },
      place: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(memories);
}

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const body = await req.json().catch(() => null);
  const parsed = memorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数错误", 400);
  }
  const { title, content, category, date, placeId, images } = parsed.data;
  const memory = await prisma.memory.create({
    data: {
      coupleId: ctx.coupleId,
      authorId: ctx.user.id,
      title,
      content,
      category,
      date: new Date(`${date}T12:00:00+08:00`),
      placeId: placeId || null,
      coverImage: images[0] ?? null,
      images: {
        create: images.map((url, i) => ({ url, sortOrder: i })),
      },
    },
    include: {
      images: true,
      author: { select: { nickname: true, username: true } },
      place: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(memory);
}
