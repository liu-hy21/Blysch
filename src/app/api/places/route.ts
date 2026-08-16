import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { placeSchema } from "@/lib/validators";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const places = await prisma.place.findMany({
    where: { coupleId: ctx.coupleId },
    orderBy: { visitedAt: "desc" },
  });
  return NextResponse.json(places);
}

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const parsed = placeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数错误", 400);
  }
  const place = await prisma.place.create({
    data: {
      coupleId: ctx.coupleId,
      name: parsed.data.name,
      city: parsed.data.city,
      note: parsed.data.note,
      images: JSON.stringify(parsed.data.images),
    },
  });
  return NextResponse.json(place);
}
