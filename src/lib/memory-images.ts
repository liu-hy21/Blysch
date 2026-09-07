import { MEMORY_IMAGE_PREVIEW } from "@/lib/constants";
import { todayKey } from "@/lib/utils";

/** Monday (Shanghai calendar) of the week, used as the shuffle seed. */
export function memoryWeekKey(today = todayKey()): string {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const toMonday = dow === 0 ? -6 : 1 - dow;
  dt.setUTCDate(dt.getUTCDate() + toMonday);
  return dt.toISOString().slice(0, 10);
}

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle image order when a memory has more than the timeline preview count. */
export function shuffleMemoryImages<T>(
  images: T[],
  memoryId: string,
  week = memoryWeekKey(),
  preview = MEMORY_IMAGE_PREVIEW,
): T[] {
  if (images.length <= preview) return images;
  const next = [...images];
  const rand = mulberry32(hashString(`${week}:${memoryId}`));
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}
