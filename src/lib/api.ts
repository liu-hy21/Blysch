import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function requireApiCouple() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "未登录" }, { status: 401 }),
    } as const;
  }
  const membership = user.memberships[0];
  if (!membership) {
    return {
      error: NextResponse.json({ error: "空间未就绪，请先执行 seed" }, { status: 400 }),
    } as const;
  }
  const partner = membership.couple.members.find((m) => m.userId !== user.id)?.user;
  if (!partner) {
    return {
      error: NextResponse.json({ error: "缺少另一位成员" }, { status: 400 }),
    } as const;
  }
  return {
    user,
    partner,
    coupleId: membership.coupleId,
    couple: membership.couple,
  } as const;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
