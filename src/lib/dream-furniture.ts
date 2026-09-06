import type { PetSpecies } from "@/generated/prisma/client";
import { dreamPx } from "./dream-grid";

export const DREAM_ROOMS = ["yard", "kitchen", "living", "bedroom", "bathroom"] as const;
export type DreamRoom = (typeof DREAM_ROOMS)[number];
export type DreamScene = "yard" | "house";

/** Pets spawn in rooms that exist on the current house map. */
export const DREAM_STATIONS = ["yard", "kitchen", "living", "bedroom", "bathroom"] as const;

export type FurnitureSlot = { top: number | string; left: number | string };

function at(c: number, r: number): FurnitureSlot {
  const { top, left } = dreamPx(c, r);
  return { top, left };
}

export type FurnitureDef = {
  id: string;
  name: string;
  desc: string;
  scene: DreamScene;
  area: DreamRoom;
  unlockLevel: number;
  slot: FurnitureSlot;
};

export type FurnitureItem = FurnitureDef & { locked: boolean };

const UNLOCK_LEVELS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] as const;

const RABBIT: Omit<FurnitureDef, "unlockLevel">[] = [
  { id: "rabbit-lamp", name: "胡萝卜灯", desc: "一根胡萝卜立灯。", scene: "house", area: "living", slot: at(34, 50) },
  { id: "rabbit-cushion", name: "绒垫", desc: "给蹦蹦跳跳歇脚。", scene: "house", area: "bedroom", slot: at(36, 52) },
  { id: "rabbit-sill", name: "窗台花", desc: "窗边一小盆。", scene: "house", area: "living", slot: at(42, 16) },
  { id: "rabbit-tapestry", name: "月夜挂毯", desc: "挂在床边墙上。", scene: "house", area: "bedroom", slot: at(50, 8) },
  { id: "rabbit-table", name: "小木桌", desc: "刚好放得下一盏灯。", scene: "house", area: "kitchen", slot: at(8, 32) },
  { id: "rabbit-stool", name: "蘑菇凳", desc: "软乎乎的座。", scene: "house", area: "kitchen", slot: at(6, 40) },
  { id: "rabbit-star", name: "星灯笼", desc: "夜里会亮一格。", scene: "house", area: "bathroom", slot: at(8, 8) },
  { id: "rabbit-chime", name: "胡萝卜风铃", desc: "挂在门边。", scene: "yard", area: "yard", slot: { top: "22%", left: "58%" } },
  { id: "rabbit-bed", name: "篱边花圃", desc: "篱笆根下的花。", scene: "yard", area: "yard", slot: { top: "42%", left: "10%" } },
  { id: "rabbit-swing", name: "月亮秋千", desc: "院子角落。", scene: "yard", area: "yard", slot: { top: "28%", left: "8%" } },
];

const COW: Omit<FurnitureDef, "unlockLevel">[] = [
  { id: "cow-can", name: "牛奶罐", desc: "铁皮罐，沉甸甸。", scene: "house", area: "kitchen", slot: at(19, 14) },
  { id: "cow-hay", name: "干草垫", desc: "睡上去沙沙响。", scene: "house", area: "bedroom", slot: at(34, 56) },
  { id: "cow-bell", name: "铃铛挂饰", desc: "轻轻一碰会响。", scene: "house", area: "living", slot: at(34, 8) },
  { id: "cow-bed", name: "厚实木床", desc: "占卧室主位。", scene: "house", area: "bedroom", slot: at(38, 34) },
  { id: "cow-lantern", name: "谷仓灯", desc: "暖黄一盏。", scene: "house", area: "living", slot: at(36, 40) },
  { id: "cow-blanket", name: "羊毛毯", desc: "搭在床尾。", scene: "house", area: "bedroom", slot: at(42, 46) },
  { id: "cow-fountain", name: "汉白玉喷泉", desc: "双层白石，水面会亮。", scene: "yard", area: "yard", slot: { top: "74%", left: "28%" } },
  { id: "cow-box", name: "栅栏花箱", desc: "钉在篱笆上。", scene: "yard", area: "yard", slot: { top: "18%", left: "72%" } },
  { id: "cow-mill", name: "石磨小景", desc: "角落一盘石。", scene: "yard", area: "yard", slot: { top: "78%", left: "58%" } },
  { id: "cow-porch", name: "铜铃门廊", desc: "门楣上的铜铃。", scene: "yard", area: "yard", slot: { top: "16%", left: "46%" } },
];

const CATALOG: Partial<Record<PetSpecies, Omit<FurnitureDef, "unlockLevel">[]>> = {
  rabbit: RABBIT,
  cow: COW,
};

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
