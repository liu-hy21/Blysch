import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settlePetRecord } from "@/lib/pet-settle";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** 每日 23:59（上海）由 Vercel Cron 或外部调度触发，为所有宠物补当日照料 */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pets = await prisma.pet.findMany();
  let careApplied = 0;
  for (const pet of pets) {
    const before = pet.lastCareDate;
    const after = await settlePetRecord(pet);
    if (after && after.lastCareDate !== before) careApplied += 1;
  }
  return NextResponse.json({ ok: true, pets: pets.length, careApplied });
}
