import { MEMORY_PAGE_SIZE } from "@/lib/constants";

export type MemoryCard = {
  id: string;
  title: string;
  content: string | null;
  category: string;
  date: string;
  images: string[];
  imageCount: number;
  author: string;
  placeId: string | null;
  placeName: string | null;
};

export function clampMemoryPage(
  total: number,
  page: number,
  aroundIndex = -1,
  size = MEMORY_PAGE_SIZE,
) {
  const pageCount = Math.max(1, Math.ceil(Math.max(0, total) / size));
  let next = Number.isFinite(page) ? Math.floor(page) : 0;
  if (aroundIndex >= 0) next = Math.floor(aroundIndex / size);
  next = Math.min(Math.max(0, next), pageCount - 1);
  return { page: next, pageCount };
}

/** skip/take for one page, or from the start through that page. */
export function memoryPageRange(
  total: number,
  page: number,
  aroundIndex = -1,
  through = false,
  size = MEMORY_PAGE_SIZE,
) {
  const clamped = clampMemoryPage(total, page, aroundIndex, size);
  if (through) {
    return { ...clamped, skip: 0, take: (clamped.page + 1) * size };
  }
  return { ...clamped, skip: clamped.page * size, take: size };
}

export function mergeMemoryPages(prev: MemoryCard[], next: MemoryCard[]) {
  if (next.length === 0) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const extra = next.filter((m) => !seen.has(m.id));
  if (extra.length === 0) return prev;
  return [...prev, ...extra];
}
