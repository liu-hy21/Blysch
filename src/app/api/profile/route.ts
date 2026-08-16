import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiCouple, jsonError } from "@/lib/api";
import { profileSchema } from "@/lib/validators";

export async function GET() {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  return NextResponse.json({
    id: ctx.user.id,
    username: ctx.user.username,
    nickname: ctx.user.nickname,
    avatar: ctx.user.avatar,
    startDate: ctx.couple.startDate.toISOString().slice(0, 10),
    partner: {
      username: ctx.partner.username,
      nickname: ctx.partner.nickname,
      avatar: ctx.partner.avatar,
    },
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);
  if (parsed.data.nickname !== undefined || parsed.data.avatar !== undefined) {
    await prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        nickname: parsed.data.nickname,
        avatar: parsed.data.avatar === undefined ? undefined : parsed.data.avatar,
      },
    });
  }
  if (parsed.data.startDate) {
    await prisma.couple.update({
      where: { id: ctx.coupleId },
      data: { startDate: new Date(`${parsed.data.startDate}T12:00:00+08:00`) },
    });
  }
  return GET();
}
