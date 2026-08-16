import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePet } from "@/lib/pet-rules";
import { PetsClient } from "./pets-client";

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
  return (
    <PetsClient
      mine={mine ? serializePet(mine) : null}
      partner={theirs ? serializePet(theirs) : null}
      partnerNickname={partner?.nickname ?? "对方"}
      initialTab={side === "partner" ? "partner" : "mine"}
    />
  );
}
