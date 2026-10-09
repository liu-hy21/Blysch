import type { FoeKind } from "@/lib/pet-battle";
import { GEAR_PALETTE } from "@/lib/gear-sprites";

const SPRITES: Record<FoeKind, string[]> = {
  murloc: [
    "......llll......",
    "....lleeeell....",
    "...leeeeeeeel...",
    "..leeekkkeeeel..",
    "..leekwwkkeeel..",
    "..leeekkkeeeel..",
    "...leeeeeeeel...",
    "....lleeeell....",
    ".....llllll.....",
    "....ll....ll....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  undead: [
    "......ssss......",
    "....ssmmmmss....",
    "...smmmmmmmms...",
    "..smmkmmmkmms...",
    "..smmmmmmmmms...",
    "..smmmmmmmmms...",
    "...smmkmkmms....",
    "....ssmmmmss....",
    "......ssss......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  beast: [
    "..b........b....",
    "..bb......bb....",
    "...bbbbbbbb.....",
    "..bbkbbbkbbb....",
    "..bbybbbybbb....",
    "...bbbbbbbb.....",
    "....bbrrbb......",
    ".....bbbb.......",
    "....bb..bb......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  elemental: [
    "......iiii......",
    ".....iooori.....",
    "....iooyyyri....",
    "...iooyyyyori...",
    "..iooyyyyyyori..",
    "...iooyyyyori...",
    "....iooyyyri....",
    ".....iooori.....",
    "......iiii......",
    ".....i....i.....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
};

export function foeSprite(kind: FoeKind) {
  return SPRITES[kind];
}

export function FoeIcon({ kind, label, size = 64 }: { kind: FoeKind; label: string; size?: number }) {
  const rows = foeSprite(kind);
  const cells = rows.flatMap((row, y) =>
    [...row].flatMap((ch, x) => {
      const fill = GEAR_PALETTE[ch];
      if (!fill) return [];
      return [<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />];
    }),
  );
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="pixelated shrink-0"
      shapeRendering="crispEdges"
    >
      {cells}
    </svg>
  );
}
