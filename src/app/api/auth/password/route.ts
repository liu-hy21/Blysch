import { NextResponse } from "next/server";
import { requireApiCouple, jsonError } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validators";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "参数错误", 400);
  }
  if (!ctx.user.passwordHash) {
    return jsonError("请先完成首次设密", 400);
  }
  if (!(await verifyPassword(parsed.data.oldPassword, ctx.user.passwordHash))) {
    return jsonError("当前密码不正确", 400);
  }
  await prisma.user.update({
    where: { id: ctx.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return NextResponse.json({ ok: true });
}
