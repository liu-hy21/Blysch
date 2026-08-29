import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { wishSchema } from "@/lib/validators";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const wishes = await prisma.wish.findMany({
    where: { coupleId: ctx.coupleId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(wishes);
}

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const parsed = wishSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数错误", 400);
  }
  const wish = await prisma.wish.create({
    data: {
      coupleId: ctx.coupleId,
      title: parsed.data.title,
      category: parsed.data.category,
      region: parsed.data.category === "旅行" ? parsed.data.region : null,
      stars: parsed.data.stars,
      note: parsed.data.note,
    },
  });
  return NextResponse.json(wish);
}
