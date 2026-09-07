import { MEMORY_IMAGE_PREVIEW } from "@/lib/constants";
import { shuffleMemoryImages } from "@/lib/memory-images";
import { memoryPageRange, type MemoryCard } from "@/lib/memory-paging";
import { prisma } from "@/lib/prisma";

function serializeMemory(m: {
  id: string;
  title: string;
  content: string | null;
  category: string;
  date: Date;
  placeId: string | null;
  images: { url: string }[];
  author: { nickname: string };
  place: { id: string; name: string } | null;
  _count: { images: number };
}): MemoryCard {
  return {
    id: m.id,
    title: m.title,
    content: m.content,
    category: m.category,
    date: m.date.toISOString().slice(0, 10),
    images: shuffleMemoryImages(
      m.images.map((i) => i.url),
      m.id,
    ).slice(0, MEMORY_IMAGE_PREVIEW),
    imageCount: m._count.images,
    author: m.author.nickname,
    placeId: m.placeId,
    placeName: m.place?.name ?? null,
  };
}

export async function listMemoryPage(
  coupleId: string,
  input: { page?: number; category?: string; around?: string; through?: boolean } = {},
) {
  const category =
    input.category && input.category !== "全部" ? input.category : undefined;
  const where = { coupleId, ...(category ? { category } : {}) };
  const around = input.around?.trim() || "";
  const [total, idRows] = await Promise.all([
    prisma.memory.count({ where }),
    around
      ? prisma.memory.findMany({
          where,
          select: { id: true },
          orderBy: { date: "desc" },
        })
      : Promise.resolve([] as { id: string }[]),
  ]);
  const aroundIndex = around ? idRows.findIndex((m) => m.id === around) : -1;
  const through = Boolean(input.through || around);
  const { page, pageCount, skip, take } = memoryPageRange(
    total,
    input.page ?? 0,
    aroundIndex,
    through,
  );
  const rows = await prisma.memory.findMany({
    where,
    include: {
      images: {
        where: { hidden: false },
        orderBy: { sortOrder: "asc" },
      },
      author: { select: { nickname: true } },
      place: { select: { id: true, name: true } },
      _count: { select: { images: { where: { hidden: false } } } },
    },
    orderBy: { date: "desc" },
    skip,
    take,
  });
  return {
    memories: rows.map(serializeMemory),
    total,
    page,
    pageCount,
  };
}
