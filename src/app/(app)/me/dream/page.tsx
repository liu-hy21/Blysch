import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePet } from "@/lib/pet-rules";
import { PageStack } from "@/components/app/page-stack";
import { DreamClient } from "./dream-client";

export default async function DreamPage() {
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;
  const partner = user.memberships[0]?.couple.members.find((m) => m.userId !== user.id)?.user;
  const [mine, theirs] = await Promise.all([
    prisma.pet.findUnique({ where: { userId: user.id } }),
    partner ? prisma.pet.findUnique({ where: { userId: partner.id } }) : null,
  ]);
  return (
    <PageStack>
      <DreamClient
        coupleId={coupleId}
        mine={mine ? serializePet(mine) : null}
        partner={theirs ? serializePet(theirs) : null}
      />
    </PageStack>
  );
}
