export const BOND_HOURS = [
  7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
] as const;

export const BOND_SPECIAL_COUNT = 5;

export const BOND_KINDS = ["tree", "fight", "moon", "rain", "hearth"] as const;
export type BondKind = (typeof BOND_KINDS)[number];

export const BOND_LABEL: Record<BondKind, string> = {
  tree: "树下靠着",
  fight: "在打架",
  moon: "月下散步",
  rain: "檐下躲雨",
  hearth: "炉边烤火",
};

export type BondSlot = {
  hour: number;
  kind: BondKind;
};

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

export function todaysBonds(coupleId: string, dateKey: string): BondSlot[] {
  const rand = mulberry32(hashString(`${coupleId}:${dateKey}:home-bond`));
  const hours = [...BOND_HOURS];
  for (let i = hours.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = hours[i];
    const b = hours[j];
    if (a === undefined || b === undefined) continue;
    hours[i] = b;
    hours[j] = a;
  }
  return hours
    .slice(0, BOND_SPECIAL_COUNT)
    .toSorted((a, b) => a - b)
    .map((hour) => ({
      hour,
      kind: BOND_KINDS[Math.floor(rand() * BOND_KINDS.length)] ?? "tree",
    }));
}

export function currentBond(
  coupleId: string,
  dateKey: string,
  hour: number,
): BondSlot | null {
  if (hour < 7 || hour > 23) return null;
  return todaysBonds(coupleId, dateKey).find((slot) => slot.hour === hour) ?? null;
}
