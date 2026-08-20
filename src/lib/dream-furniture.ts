import type { PetSpecies } from "@/generated/prisma/client";

export const DREAM_ROOMS = ["yard", "kitchen", "living", "bedroom", "bathroom"] as const;
export type DreamRoom = (typeof DREAM_ROOMS)[number];
export type DreamScene = "yard" | "house";

export type FurnitureDef = {
  id: string;
  name: string;
  desc: string;
  scene: DreamScene;
  area: DreamRoom;
  unlockLevel: number;
  slot: { top: string; left: string };
};

export type FurnitureItem = FurnitureDef & { locked: boolean };

const UNLOCK_LEVELS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] as const;

const RABBIT: Omit<FurnitureDef, "unlockLevel">[] = [
  { id: "rabbit-lamp", name: "胡萝卜灯", desc: "一根胡萝卜立灯。", scene: "house", area: "living", slot: { top: "70%", left: "8%" } },
  { id: "rabbit-cushion", name: "绒垫", desc: "给蹦蹦跳跳歇脚。", scene: "house", area: "bedroom", slot: { top: "76%", left: "58%" } },
  { id: "rabbit-sill", name: "窗台花", desc: "窗边一小盆。", scene: "house", area: "living", slot: { top: "48%", left: "28%" } },
  { id: "rabbit-tapestry", name: "月夜挂毯", desc: "挂在床边墙上。", scene: "house", area: "bedroom", slot: { top: "44%", left: "72%" } },
  { id: "rabbit-table", name: "小木桌", desc: "刚好放得下一盏灯。", scene: "house", area: "kitchen", slot: { top: "18%", left: "18%" } },
  { id: "rabbit-stool", name: "蘑菇凳", desc: "软乎乎的座。", scene: "house", area: "kitchen", slot: { top: "28%", left: "8%" } },
  { id: "rabbit-star", name: "星灯笼", desc: "夜里会亮一格。", scene: "house", area: "bathroom", slot: { top: "8%", left: "88%" } },
  { id: "rabbit-chime", name: "胡萝卜风铃", desc: "挂在门边。", scene: "yard", area: "yard", slot: { top: "22%", left: "58%" } },
  { id: "rabbit-bed", name: "篱边花圃", desc: "篱笆根下的花。", scene: "yard", area: "yard", slot: { top: "42%", left: "10%" } },
  { id: "rabbit-swing", name: "月亮秋千", desc: "院子角落。", scene: "yard", area: "yard", slot: { top: "28%", left: "8%" } },
];

const COW: Omit<FurnitureDef, "unlockLevel">[] = [
  { id: "cow-can", name: "牛奶罐", desc: "铁皮罐，沉甸甸。", scene: "house", area: "kitchen", slot: { top: "24%", left: "42%" } },
  { id: "cow-hay", name: "干草垫", desc: "睡上去沙沙响。", scene: "house", area: "bedroom", slot: { top: "86%", left: "80%" } },
  { id: "cow-bell", name: "铃铛挂饰", desc: "轻轻一碰会响。", scene: "house", area: "living", slot: { top: "44%", left: "4%" } },
  { id: "cow-bed", name: "厚实木床", desc: "占卧室主位。", scene: "house", area: "bedroom", slot: { top: "58%", left: "64%" } },
  { id: "cow-lantern", name: "谷仓灯", desc: "暖黄一盏。", scene: "house", area: "living", slot: { top: "64%", left: "30%" } },
  { id: "cow-blanket", name: "羊毛毯", desc: "搭在床尾。", scene: "house", area: "bedroom", slot: { top: "78%", left: "78%" } },
  { id: "cow-trough", name: "木食槽", desc: "装饰用，不真喂。", scene: "yard", area: "yard", slot: { top: "74%", left: "28%" } },
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
  return DREAM_ROOMS[seed % DREAM_ROOMS.length];
}

export const ROOM_LABEL: Record<DreamRoom, string> = {
  yard: "院子",
  kitchen: "厨房",
  living: "客厅",
  bedroom: "卧室",
  bathroom: "浴室",
};
