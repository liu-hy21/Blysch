import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageStack } from "@/components/app/page-stack";
import { listMemoryPage } from "@/lib/memory-page";
import { TimelineClient } from "./timeline-client";

export default async function TimelinePage() {
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const [page, places] = await Promise.all([
    listMemoryPage(coupleId, { page: 0, category: "全部" }),
    prisma.place.findMany({
      where: { coupleId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <PageStack>
      <TimelineClient initial={page} places={places} />
    </PageStack>
  );
}
