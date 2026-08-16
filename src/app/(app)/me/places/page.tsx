import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlacesClient } from "./places-client";
import { PageStack } from "@/components/app/page-stack";

export default async function PlacesPage() {
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const places = await prisma.place.findMany({
    where: { coupleId },
    orderBy: { visitedAt: "desc" },
  });
  return (
    <PageStack>
    <PlacesClient
      places={places.map((p) => ({
        id: p.id,
        name: p.name,
        city: p.city,
        note: p.note,
        images: p.images ? (JSON.parse(p.images) as string[]) : [],
      }))}
    />
    </PageStack>
  );
}
