import type { PetSpecies } from "@/generated/prisma/client";
import type { FurnitureObject } from "./base";
import {
  CowBed,
  CowBell,
  CowBlanket,
  CowBox,
  CowCan,
  CowFountain,
  CowHay,
  CowLantern,
  CowMill,
  CowPorch,
} from "./cow";
import {
  RabbitBed,
  RabbitChime,
  RabbitCushion,
  RabbitLamp,
  RabbitSill,
  RabbitStar,
  RabbitStool,
  RabbitSwing,
  RabbitTable,
  RabbitTapestry,
} from "./rabbit";

/**
 * 家具注册表:每个物种一串家具对象,数组顺序即解锁顺序
 * (第 i 件在 UNLOCK_LEVELS[i] 级解锁,见 dream-furniture.ts)。
 */
export const FURNITURE_BY_SPECIES: Partial<Record<PetSpecies, FurnitureObject[]>> = {
  rabbit: [
    new RabbitLamp(),
    new RabbitCushion(),
    new RabbitSill(),
    new RabbitTapestry(),
    new RabbitTable(),
    new RabbitStool(),
    new RabbitStar(),
    new RabbitChime(),
    new RabbitBed(),
    new RabbitSwing(),
  ],
  cow: [
    new CowCan(),
    new CowHay(),
    new CowBell(),
    new CowBed(),
    new CowLantern(),
    new CowBlanket(),
    new CowFountain(),
    new CowBox(),
    new CowMill(),
    new CowPorch(),
  ],
};

const BY_ID = new Map<string, FurnitureObject>(
  Object.values(FURNITURE_BY_SPECIES).flatMap((list) =>
    (list ?? []).map((piece) => [piece.id, piece] as const),
  ),
);

/** 按 id 找家具对象(渲染侧用)。 */
export function furnitureById(id: string): FurnitureObject | undefined {
  return BY_ID.get(id);
}
