import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { listMemoryPage } from "@/lib/memory-page";
import { memorySchema } from "@/lib/validators";

export async function GET(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 0);
  const category = url.searchParams.get("category") ?? "全部";
  const around = url.searchParams.get("around") ?? undefined;
  const through = url.searchParams.get("through") === "1";
  const data = await listMemoryPage(ctx.coupleId, { page, category, around, through });
  return NextResponse.json(data);
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
