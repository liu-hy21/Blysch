import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { isAllowedUsername } from "@/lib/constants";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数错误" },
      { status: 400 },
    );
  }
  const { username, password } = parsed.data;
  if (!isAllowedUsername(username)) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "用户尚未初始化，请先 seed" }, { status: 401 });
  }
  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "请先设置密码", needsSetup: true },
      { status: 409 },
    );
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }
  const token = await createSessionToken({
    sub: user.id,
    username: user.username,
  });
  await setSessionCookie(token);
  return NextResponse.json({
    user: { id: user.id, username: user.username, nickname: user.nickname },
  });
}
