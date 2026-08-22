import type { CSSProperties } from "react";
import { DREAM_COLS, dreamPx } from "@/lib/dream-grid";

function Cell({
  c,
  r,
  w = 2,
  h = 2,
  z,
  className,
}: {
  c: number;
  r: number;
  w?: number;
  h?: number;
  z?: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute box-border ${className ?? ""}`}
      style={{ ...dreamPx(c, r, w, h), zIndex: z } satisfies CSSProperties}
    />
  );
}

function Bits({
  z,
  items,
}: {
  z: number;
  items: { c: number; r: number; w?: number; h?: number; className: string }[];
}) {
  return items.map((p, i) => (
    <Cell key={`${p.className}-${p.c}-${p.r}-${i}`} z={z} w={2} h={2} {...p} />
  ));
}

function tileClass(c: number, r: number) {
  const n = (c * 3 + r * 5) % 7;
  if (n === 0) return "dream-la-tile-dk";
  if (n === 1 || n === 2) return "dream-la-tile-hi";
  return "dream-la-tile";
}

function Roof() {
  const rows = [
    { r: 12, c0: 24, c1: 36 },
    { r: 14, c0: 22, c1: 38 },
    { r: 16, c0: 20, c1: 40 },
    { r: 18, c0: 20, c1: 40 },
  ];
  const tiles: { c: number; r: number; className: string }[] = [];
  rows.forEach((row, i) => {
    const stagger = i % 2 === 0 ? 0 : 1;
    for (let c = row.c0 + stagger; c <= row.c1 - 2; c += 2) {
      tiles.push({ c, r: row.r, className: tileClass(c, row.r) });
    }
  });
  return (
    <>
      <Cell c={20} r={12} w={20} h={8} z={7} className="dream-la-roof-mass" />
      <Bits z={8} items={tiles.map((t) => ({ ...t, w: 2, h: 2 }))} />
    </>
  );
}

function Tree({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <Cell c={cx + 2} r={cy + 8} w={2} h={10} z={4} className="dream-la-palm-trunk" />
      <Cell c={cx} r={cy + 3} w={7} h={5} z={9} className="dream-la-palm-frond-dark" />
      <Cell c={cx + 1} r={cy + 1} w={5} h={4} z={10} className="dream-la-palm-frond" />
      <Cell c={cx + 2} r={cy} w={3} h={3} z={11} className="dream-la-palm-hi" />
      <Cell c={cx - 1} r={cy + 5} w={3} h={3} z={10} className="dream-la-palm-frond-dark" />
      <Cell c={cx + 5} r={cy + 5} w={3} h={3} z={10} className="dream-la-palm-frond" />
    </>
  );
}

const LAWN: { c: number; r: number; w?: number; h?: number; className: string }[] = [
  { c: 8, r: 42, w: 4, h: 2, className: "dream-la-lawn" },
  { c: 7, r: 44, w: 8, h: 2, className: "dream-la-lawn" },
  { c: 6, r: 46, w: 12, h: 4, className: "dream-la-lawn" },
  { c: 8, r: 50, w: 11, h: 4, className: "dream-la-lawn" },
  { c: 10, r: 54, w: 8, h: 3, className: "dream-la-lawn" },
  { c: 9, r: 48, w: 2, h: 2, className: "dream-la-lawn-tuft" },
  { c: 16, r: 47, w: 1, h: 2, className: "dream-la-lawn-tuft" },
  { c: 12, r: 52, w: 2, h: 1, className: "dream-la-lawn-tuft" },
  { c: 34, r: 40, w: 6, h: 2, className: "dream-la-lawn" },
  { c: 33, r: 42, w: 8, h: 4, className: "dream-la-lawn" },
  { c: 35, r: 46, w: 7, h: 4, className: "dream-la-lawn" },
  { c: 36, r: 50, w: 8, h: 3, className: "dream-la-lawn" },
  { c: 38, r: 44, w: 2, h: 2, className: "dream-la-lawn-tuft" },
  { c: 8, r: 56, w: 6, h: 2, className: "dream-la-lawn" },
  { c: 10, r: 58, w: 4, h: 1, className: "dream-la-lawn-tuft" },
];

const BOUG: { c: number; r: number; w?: number; h?: number; className: string }[] = [
  { c: 4, r: 16, w: 2, h: 2, className: "dream-la-bougainvillea" },
  { c: 6, r: 15, w: 2, h: 1, className: "dream-la-bougainvillea-lite" },
  { c: 5, r: 17, w: 3, h: 1, className: "dream-la-bougainvillea-dk" },
  { c: 4, r: 18, w: 2, h: 2, className: "dream-la-bougainvillea-lite" },
  { c: 7, r: 18, w: 2, h: 1, className: "dream-la-bougainvillea" },
  { c: 6, r: 19, w: 2, h: 2, className: "dream-la-bougainvillea" },
  { c: 4, r: 21, w: 3, h: 1, className: "dream-la-bougainvillea-dk" },
  { c: 8, r: 20, w: 1, h: 2, className: "dream-la-bougainvillea-lite" },
  { c: 5, r: 22, w: 2, h: 2, className: "dream-la-bougainvillea-lite" },
  { c: 7, r: 23, w: 2, h: 1, className: "dream-la-bougainvillea" },
];

const AGAVE: { c: number; r: number; w?: number; h?: number; className: string }[] = [
  { c: 44, r: 18, w: 1, h: 4, className: "dream-la-agave-dk" },
  { c: 45, r: 17, w: 2, h: 5, className: "dream-la-agave" },
  { c: 47, r: 16, w: 2, h: 6, className: "dream-la-agave-hi" },
  { c: 49, r: 18, w: 1, h: 4, className: "dream-la-agave-dk" },
];

export function YardScenery() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Cell c={0} r={0} w={DREAM_COLS} h={8} z={0} className="dream-la-sky" />
      <Cell c={0} r={76} w={DREAM_COLS} h={4} z={0} className="dream-la-street" />

      <Bits z={2} items={LAWN} />

      <Cell c={10} r={36} w={8} h={6} z={2} className="dream-la-gravel" />

      <Cell c={0} r={10} w={3} h={50} z={4} className="dream-la-hedge" />
      <Cell c={57} r={10} w={3} h={50} z={4} className="dream-la-hedge" />
      <Cell c={1} r={9} w={2} h={2} z={5} className="dream-la-hedge-tuft" />
      <Cell c={57} r={9} w={2} h={2} z={5} className="dream-la-hedge-tuft" />

      <Cell c={0} r={60} w={26} h={16} z={4} className="dream-la-street-wall" />
      <Cell c={32} r={60} w={28} h={16} z={4} className="dream-la-street-wall" />
      <Cell c={26} r={60} w={6} h={20} z={5} className="dream-la-iron" />
      <Cell c={26} r={68} w={6} h={1} z={6} className="dream-la-iron-rail" />

      <Cell c={26} r={34} w={6} h={26} z={2} className="dream-la-path" />
      <Cell c={26} r={32} w={6} h={3} z={3} className="dream-la-stoop" />
      <Cell c={27} r={31} w={4} h={1} z={3} className="dream-la-spill" />

      <Cell c={42} r={22} w={10} h={16} z={3} className="dream-la-pool" />
      <Cell c={45} r={26} w={1} h={1} z={4} className="dream-la-glint" />
      <Cell c={48} r={28} w={1} h={1} z={4} className="dream-la-glint" />
      <Cell c={46} r={32} w={1} h={1} z={4} className="dream-la-glint" />
      <Cell c={49} r={30} w={1} h={1} z={4} className="dream-la-glint" />
      <Cell c={44} r={34} w={1} h={1} z={4} className="dream-la-glint" />

      <Bits z={6} items={BOUG} />
      <Bits z={6} items={AGAVE} />

      <Cell c={12} r={38} w={6} h={6} z={5} className="dream-la-fountain" />
      <Cell c={13} r={40} w={4} h={3} z={6} className="dream-la-water" />
      <Cell c={14} r={36} w={2} h={4} z={7} className="dream-la-fountain-stem" />
      <Cell c={14} r={41} w={1} h={1} z={8} className="dream-la-glint" />
      <Cell c={16} r={42} w={1} h={1} z={8} className="dream-la-glint" />

      <Cell c={8} r={48} w={4} h={2} z={5} className="dream-la-planter" />
      <Cell c={9} r={46} w={1} h={2} z={6} className="dream-la-bougainvillea-lite" />
      <Cell c={10} r={47} w={2} h={1} z={6} className="dream-la-bougainvillea" />
      <Cell c={11} r={46} w={1} h={2} z={6} className="dream-la-bougainvillea-dk" />

      <Cell c={4} r={50} w={2} h={8} z={6} className="dream-la-lamp" />
      <Cell c={54} r={50} w={2} h={8} z={6} className="dream-la-lamp" />

      <Cell c={17} r={14} w={20} h={20} z={2} className="dream-la-cast" />
      <Roof />

      <Cell c={20} r={20} w={20} h={14} z={5} className="dream-la-stucco" />
      <Cell c={28} r={21} w={2} h={2} z={7} className="dream-la-lamp-glow" />
      <Cell c={27} r={23} w={4} h={1} z={6} className="dream-la-spill" />
      <Cell c={26} r={24} w={8} h={10} z={6} className="dream-la-door" />
      <Cell c={32} r={30} w={1} h={1} z={7} className="dream-la-knob" />

      <Cell c={20} r={22} w={1} h={4} z={6} className="dream-la-shutter" />
      <Cell c={21} r={22} w={3} h={4} z={6} className="dream-la-window dream-la-window-lit" />
      <Cell c={24} r={22} w={1} h={4} z={6} className="dream-la-shutter" />
      <Cell c={35} r={22} w={1} h={4} z={6} className="dream-la-shutter" />
      <Cell c={36} r={22} w={3} h={4} z={6} className="dream-la-window" />
      <Cell c={39} r={22} w={1} h={4} z={6} className="dream-la-shutter" />
      <Cell c={20} r={26} w={5} h={2} z={6} className="dream-la-planter" />
      <Cell c={35} r={26} w={5} h={2} z={6} className="dream-la-planter" />
      <Cell c={21} r={25} w={1} h={1} z={7} className="dream-la-bougainvillea-lite" />
      <Cell c={22} r={25} w={1} h={1} z={7} className="dream-la-bougainvillea" />
      <Cell c={23} r={25} w={1} h={1} z={7} className="dream-la-bougainvillea-lite" />
      <Cell c={36} r={25} w={1} h={1} z={7} className="dream-la-bougainvillea" />
      <Cell c={37} r={25} w={1} h={1} z={7} className="dream-la-bougainvillea-lite" />
      <Cell c={38} r={25} w={1} h={1} z={7} className="dream-la-bougainvillea" />

      <Tree cx={8} cy={0} />
      <Tree cx={46} cy={0} />
    </div>
  );
}

function Room({
  name,
  floor,
  paper,
  className,
}: {
  name: string;
  floor: string;
  paper: string;
  className: string;
}) {
  return (
    <div className={`dream-room absolute ${floor} ${className}`}>
      <div className={`absolute inset-x-0 top-0 h-[28%] border-b-2 border-ink ${paper}`} />
      <p className="absolute left-2 top-1 z-[1] text-[11px] text-[#4a3a2c]">{name}</p>
    </div>
  );
}

function Doorway({ className }: { className: string }) {
  return <div className={`dream-doorway absolute z-[8] ${className}`} />;
}

export function HouseScenery() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Room
        name="厨房"
        floor="dream-floor-kitchen"
        paper="dream-paper-kitchen"
        className="left-0 top-0 h-[40%] w-[70%]"
      />
      <Room
        name="浴室"
        floor="dream-floor-bath"
        paper="dream-paper-bath"
        className="right-0 top-0 h-[40%] w-[30%]"
      />
      <Room
        name="客厅"
        floor="dream-floor-living"
        paper="dream-paper-living"
        className="bottom-0 left-0 h-[60%] w-1/2"
      />
      <Room
        name="卧室"
        floor="dream-floor-bedroom"
        paper="dream-paper-bedroom"
        className="bottom-0 right-0 h-[60%] w-1/2"
      />

      <Doorway className="left-[18%] top-[calc(40%-22px)] h-11 w-9" />
      <Doorway className="left-[calc(70%-18px)] top-[12%] h-9 w-11" />
      <Doorway className="left-[calc(50%-18px)] top-[68%] h-9 w-11" />
      <Doorway className="left-[82%] top-[calc(40%-22px)] h-11 w-9" />

      <div className="absolute left-[6%] top-[7%] h-8 w-28 border-2 border-ink bg-[#8b6239]" />
      <div className="absolute left-[8%] top-[5%] h-3 w-6 border-2 border-ink bg-[#7ec8ff]" />

      <div className="dream-hearth absolute bottom-[26%] left-[3%] h-[14%] w-[14%]">
        <div className="dream-flame absolute bottom-2 left-1/2 h-5 w-4 -translate-x-1/2" />
      </div>
      <div className="absolute left-[8%] top-[48%] h-10 w-8 border-2 border-ink bg-[#7ec8ff] shadow-[inset_2px_2px_0_rgba(255,255,255,0.45)]" />

      <div className="absolute right-[8%] top-[48%] h-10 w-8 border-2 border-ink bg-[#c8d8e8] shadow-[inset_2px_2px_0_rgba(255,255,255,0.5)]" />

      <div className="absolute right-[4%] top-[8%] h-10 w-12 border-2 border-ink bg-[#9bb0bc]" />
      <div className="absolute right-[6%] top-[10%] h-3 w-8 border-2 border-ink bg-[#c5d0d8]" />
      <div className="absolute right-[5%] top-[24%] h-5 w-4 border-2 border-ink bg-[#fff8ec]" />
    </div>
  );
}
