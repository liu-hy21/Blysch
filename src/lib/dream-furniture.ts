import type { PetSpecies } from "@/generated/prisma/client";
import type { FurnitureMeta } from "./park/furniture/base";
import { FURNITURE_BY_SPECIES } from "./park/furniture";

export const DREAM_ROOMS = ["yard", "kitchen", "living", "bedroom", "bathroom"] as const;
export type DreamRoom = (typeof DREAM_ROOMS)[number];
export type DreamScene = "yard" | "house";

/** Pets spawn in rooms that exist on the current house map. */
export const DREAM_STATIONS = ["yard", "kitchen", "living", "bedroom", "bathroom"] as const;

export type FurnitureSlot = { top: number | string; left: number | string };

export type FurnitureDef = FurnitureMeta & { unlockLevel: number };

export type FurnitureItem = FurnitureDef & { locked: boolean };

const UNLOCK_LEVELS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] as const;

/**
 * 图鉴目录:从家具对象注册表派生的纯数据(可序列化)。
 * 每件家具的元数据与外观由 src/lib/park/furniture/ 下的对象类持有,
 * 这里只负责解锁逻辑。
 */
const CATALOG: Partial<Record<PetSpecies, FurnitureMeta[]>> = Object.fromEntries(
  Object.entries(FURNITURE_BY_SPECIES).map(([species, pieces]) => [
    species,
    pieces.map((p) => p.def()),
  ]),
);

export function furnitureCount(level: number) {
  const n = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
  return Math.min(10, Math.floor(n / 3));
}

export function furnitureFor(species: PetSpecies, level: number): FurnitureItem[] {
  const catalog = CATALOG[species];
  if (!catalog) return [];
  const owned = furnitureCount(level);
  return catalog.map((piece, i) => ({
    ...piece,
    unlockLevel: UNLOCK_LEVELS[i],
    locked: i >= owned,
  }));
}

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function dreamRoom(coupleId: string, petId: string, dateKey: string): DreamRoom {
  const seed = hashString(`${coupleId}:${petId}:${dateKey}`);
  return DREAM_STATIONS[seed % DREAM_STATIONS.length];
}

export const ROOM_LABEL: Record<DreamRoom, string> = {
  yard: "院子",
  kitchen: "厨房",
  living: "客厅",
  bedroom: "卧室",
  bathroom: "浴室",
};
