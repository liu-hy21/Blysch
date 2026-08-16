import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DaysClient } from "./days-client";
import { PageStack } from "@/components/app/page-stack";

export default async function DaysPage() {
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const days = await prisma.day.findMany({
    where: { coupleId },
    orderBy: { targetDate: "asc" },
  });
  return (
    <PageStack>
    <DaysClient
      days={days.map((d) => ({
        id: d.id,
        title: d.title,
        targetDate: d.targetDate.toISOString().slice(0, 10),
      }))}
    />
    </PageStack>
  );
}
