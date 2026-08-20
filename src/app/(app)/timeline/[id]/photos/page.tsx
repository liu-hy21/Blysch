import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageStack } from "@/components/app/page-stack";
import { MemoryPhotosClient } from "./photos-client";

export default async function MemoryPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const coupleId = user.memberships[0]?.coupleId;
  if (!coupleId) return null;

  const memory = await prisma.memory.findFirst({
    where: { id, coupleId },
    include: {
      images: { where: { hidden: false }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!memory) notFound();

  return (
    <PageStack>
      <MemoryPhotosClient
        id={memory.id}
        title={memory.title}
        images={memory.images.map((i) => i.url)}
      />
    </PageStack>
  );
}
