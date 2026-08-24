import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PetsClient } from "./pets-client";
import { settleAndSerialize } from "@/lib/pet-settle";

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string }>;
}) {
  const user = await requireUser();
  const { side } = await searchParams;
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
    <PetsClient
      mine={minePet}
      partner={partnerPet}
      partnerNickname={partner?.nickname ?? "对方"}
      initialTab={side === "partner" ? "partner" : "mine"}
    />
  );
}
