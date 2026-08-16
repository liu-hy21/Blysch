import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimelineClient } from "./timeline-client";

export default async function TimelinePage() {
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const [memories, places] = await Promise.all([
    prisma.memory.findMany({
      where: { coupleId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        author: { select: { nickname: true } },
        place: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.place.findMany({
      where: { coupleId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <TimelineClient
      memories={memories.map((m) => ({
        id: m.id,
        title: m.title,
        content: m.content,
        category: m.category,
        date: m.date.toISOString().slice(0, 10),
        images: m.images.map((i) => i.url),
        author: m.author.nickname,
        placeId: m.placeId,
        placeName: m.place?.name ?? null,
      }))}
      places={places}
    />
  );
}
