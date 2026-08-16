import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setupPasswordSchema } from "@/lib/validators";
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = setupPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数错误" },
      { status: 400 },
    );
  }
  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "用户尚未初始化，请先 seed" }, { status: 401 });
  }
  if (user.passwordHash) {
    return NextResponse.json({ error: "已设置过密码，请直接登录" }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  const token = await createSessionToken({
    sub: user.id,
    username: user.username,
  });
  await setSessionCookie(token);
  return NextResponse.json({
    user: { id: user.id, username: user.username, nickname: user.nickname },
  });
}
