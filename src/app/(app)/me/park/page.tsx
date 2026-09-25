import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageStack } from "@/components/app/page-stack";
import { DreamClient } from "./dream-client";
import { settleAndSerialize } from "@/lib/pet-settle";
import { parseParkPlace } from "@/lib/park/places";

export const metadata: Metadata = {
  title: "乐园",
};

export default async function ParkPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const user = await requireUser();
  const { place } = await searchParams;
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const partner = user.memberships[0]?.couple.members.find((m) => m.userId !== user.id)?.user;
  const [mine, theirs] = await Promise.all([
    prisma.pet.findUnique({ where: { userId: user.id } }),
    partner ? prisma.pet.findUnique({ where: { userId: partner.id } }) : null,
  ]);
  const [minePet, partnerPet] = await Promise.all([
    settleAndSerialize(mine),
    settleAndSerialize(theirs),
  ]);
  return (
    <PageStack>
      <div className="flex min-h-0 flex-1 flex-col">
        <DreamClient
          coupleId={coupleId}
          mine={minePet}
          partner={partnerPet}
          initialPlace={parseParkPlace(place)}
        />
      </div>
    </PageStack>
  );
}
