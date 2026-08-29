import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishesClient } from "./wishes-client";
import { PageStack } from "@/components/app/page-stack";

export default async function WishesPage() {
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const wishes = await prisma.wish.findMany({
    where: { coupleId },
    orderBy: { createdAt: "desc" },
  });
  return (
    <PageStack>
    <WishesClient
      wishes={wishes.map((w) => ({
        id: w.id,
        title: w.title,
        category: w.category,
        region: w.region,
        status: w.status,
        stars: w.stars,
        note: w.note,
      }))}
    />
    </PageStack>
  );
}
