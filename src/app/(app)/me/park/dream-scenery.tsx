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

function Lounge({ c, r }: { c: number; r: number }) {
  return (
    <>
      <Cell c={c} r={r} w={4} h={7} z={5} className="dream-la-lounge-frame" />
      <Cell c={c} r={r} w={4} h={2} z={6} className="dream-la-lounge-head" />
      <Cell c={c} r={r + 2} w={4} h={4} z={6} className="dream-la-lounge-pad" />
      <Cell c={c + 1} r={r + 6} w={2} h={1} z={6} className="dream-la-lounge-leg" />
    </>
  );
}

function Bbq({ c, r }: { c: number; r: number }) {
  return (
    <>
      <Cell c={c} r={r + 5} w={5} h={1} z={5} className="dream-la-bbq-legs" />
      <Cell c={c} r={r + 2} w={5} h={3} z={6} className="dream-la-bbq-body" />
      <Cell c={c + 1} r={r} w={3} h={2} z={7} className="dream-la-bbq-lid" />
      <Cell c={c + 1} r={r + 3} w={3} h={1} z={7} className="dream-la-bbq-coal" />
      <Cell c={c + 5} r={r + 3} w={2} h={2} z={6} className="dream-la-bbq-shelf" />
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
      <Lounge c={43} r={40} />
      <Lounge c={48} r={40} />
      <Bbq c={34} r={36} />

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

function splashTiles() {
  const tiles: { c: number; r: number; w?: number; h?: number; className: string }[] = [];
  for (let row = 0; row < 2; row++) {
    const r = 14 + row * 2;
    const stagger = row % 2;
    for (let c = 12 + stagger; c <= 20; c += 2) {
      tiles.push({ c, r, w: 2, h: 2, className: tileClass(c, r) });
    }
  }
  return tiles;
}

function Sofa({ c, r }: { c: number; r: number }) {
  return (
    <>
      <Cell c={c} r={r + 6} w={14} h={2} z={4} className="dream-la-in-sofa-front" />
      <Cell c={c} r={r} w={14} h={7} z={5} className="dream-la-in-wood" />
      <Cell c={c + 1} r={r + 1} w={12} h={5} z={6} className="dream-la-lounge-pad" />
      <Cell c={c} r={r} w={3} h={6} z={7} className="dream-la-in-sofa-arm" />
      <Cell c={c + 11} r={r} w={3} h={6} z={7} className="dream-la-in-sofa-arm" />
    </>
  );
}

function Range({ c, r }: { c: number; r: number }) {
  return (
    <>
      <Cell c={c} r={r} w={6} h={4} z={6} className="dream-la-in-steel" />
      <Cell c={c + 1} r={r} w={4} h={1} z={7} className="dream-la-in-steel-hi" />
      <Cell c={c + 1} r={r + 1} w={1} h={1} z={7} className="dream-la-bbq-coal" />
      <Cell c={c + 3} r={r + 1} w={1} h={1} z={7} className="dream-la-bbq-coal" />
    </>
  );
}

function HouseShell({
  southDoor,
  finish = "lower",
}: {
  southDoor: boolean;
  finish?: "lower" | "upper";
}) {
  const upper = finish === "upper";
  const wall = upper ? "dream-la-up-wall" : "dream-la-stucco";
  const floor = upper ? "dream-la-up-floor" : "dream-la-in-saltillo";
  const ceiling = upper ? "dream-la-up-ceiling" : "dream-la-in-ceiling";
  const beam = upper ? "dream-la-up-beam" : "dream-la-in-beam";
  const stair = upper ? "dream-la-up-stair" : "dream-la-in-stair";
  const lintel = upper ? "dream-la-up-walnut" : "dream-la-in-wood-hi";

  return (
    <>
      <Cell c={0} r={0} w={DREAM_COLS} h={6} z={0} className={ceiling} />
      <Cell c={0} r={1} w={DREAM_COLS} h={1} z={1} className={beam} />
      <Cell c={0} r={3} w={DREAM_COLS} h={1} z={1} className={beam} />
      <Cell c={0} r={5} w={DREAM_COLS} h={1} z={1} className={beam} />

      <Cell c={0} r={6} w={DREAM_COLS} h={16} z={2} className={wall} />
      <Cell c={0} r={6} w={3} h={66} z={3} className={wall} />
      <Cell c={57} r={6} w={3} h={66} z={3} className={wall} />
      {southDoor ? (
        <>
          <Cell c={0} r={70} w={26} h={10} z={4} className={wall} />
          <Cell c={34} r={70} w={26} h={10} z={4} className={wall} />
        </>
      ) : (
        <Cell c={0} r={70} w={DREAM_COLS} h={10} z={4} className={wall} />
      )}

      <Cell c={3} r={22} w={54} h={48} z={1} className={floor} />

      <Cell c={23} r={6} w={10} h={8} z={4} className={wall} />
      <Cell c={23} r={12} w={10} h={2} z={6} className={lintel} />

      <Cell c={33} r={58} w={6} h={10} z={5} className={stair} />
    </>
  );
}

function Bed({ c, r }: { c: number; r: number }) {
  return (
    <>
      <Cell c={c} r={r} w={16} h={12} z={4} className="dream-la-up-walnut" />
      <Cell c={c + 1} r={r + 2} w={14} h={8} z={5} className="dream-la-up-grey" />
      <Cell c={c + 1} r={r + 1} w={5} h={4} z={6} className="dream-la-up-pillow" />
      <Cell c={c + 7} r={r + 1} w={5} h={4} z={6} className="dream-la-up-pillow" />
    </>
  );
}

function GreySeat({ c, r, w = 10 }: { c: number; r: number; w?: number }) {
  return (
    <>
      <Cell c={c} r={r + 4} w={w} h={2} z={4} className="dream-la-up-grey-dk" />
      <Cell c={c} r={r} w={w} h={5} z={5} className="dream-la-up-grey" />
      <Cell c={c} r={r} w={2} h={5} z={6} className="dream-la-up-grey-dk" />
      <Cell c={c + w - 2} r={r} w={2} h={5} z={6} className="dream-la-up-grey-dk" />
    </>
  );
}

function Lamp({ c, r }: { c: number; r: number }) {
  return (
    <>
      <Cell c={c} r={r + 2} w={1} h={2} z={6} className="dream-la-up-walnut" />
      <Cell c={c} r={r} w={2} h={2} z={7} className="dream-la-lamp-glow" />
      <Cell c={c} r={r + 4} w={2} h={1} z={6} className="dream-la-spill" />
    </>
  );
}

function LowerStory() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <HouseShell southDoor />

      <Cell c={4} r={7} w={5} h={5} z={5} className="dream-la-in-wood" />
      <Cell c={4} r={13} w={6} h={3} z={3} className="dream-la-roof-mass" />
      <Cell c={11} r={13} w={11} h={5} z={3} className="dream-la-roof-mass" />
      <Bits z={4} items={splashTiles()} />
      <Cell c={4} r={18} w={18} h={2} z={5} className="dream-la-in-wood-hi" />
      <Cell c={4} r={20} w={18} h={3} z={5} className="dream-la-in-wood" />
      <Range c={4} r={16} />
      <Cell c={13} r={16} w={5} h={2} z={6} className="dream-la-in-sink" />
      <Cell c={15} r={14} w={1} h={2} z={7} className="dream-la-in-steel-hi" />
      <Cell c={18} r={8} w={4} h={1} z={6} className="dream-la-iron-rail" />
      <Cell c={18} r={9} w={2} h={2} z={7} className="dream-la-fountain" />
      <Cell c={20} r={9} w={2} h={3} z={7} className="dream-la-knob" />

      <Cell c={11} r={8} w={1} h={6} z={6} className="dream-la-shutter" />
      <Cell c={12} r={8} w={5} h={6} z={6} className="dream-la-window dream-la-window-lit" />
      <Cell c={17} r={8} w={1} h={6} z={6} className="dream-la-shutter" />

      <Cell c={38} r={10} w={1} h={8} z={6} className="dream-la-shutter" />
      <Cell c={39} r={10} w={8} h={8} z={6} className="dream-la-window dream-la-window-lit" />
      <Cell c={47} r={10} w={1} h={8} z={6} className="dream-la-shutter" />
      <Cell c={39} r={18} w={9} h={2} z={6} className="dream-la-planter" />
      <Cell c={40} r={17} w={1} h={1} z={7} className="dream-la-bougainvillea-lite" />
      <Cell c={42} r={17} w={2} h={1} z={7} className="dream-la-bougainvillea" />
      <Cell c={45} r={17} w={1} h={1} z={7} className="dream-la-bougainvillea-dk" />

      <Cell c={50} r={11} w={5} h={7} z={5} className="dream-la-in-nicho" />
      <Cell c={51} r={13} w={3} h={4} z={6} className="dream-la-in-nicho-in" />
      <Cell c={52} r={14} w={1} h={2} z={7} className="dream-la-lamp-glow" />

      <Cell c={34} r={42} w={18} h={14} z={2} className="dream-la-in-rug" />
      <Sofa c={40} r={36} />
      <Cell c={34} r={34} w={4} h={2} z={5} className="dream-la-planter" />
      <Cell c={35} r={32} w={1} h={2} z={6} className="dream-la-agave-hi" />
      <Cell c={36} r={31} w={2} h={3} z={6} className="dream-la-agave" />

      <Cell c={26} r={68} w={8} h={2} z={5} className="dream-la-stoop" />
      <Cell c={26} r={70} w={8} h={10} z={6} className="dream-la-door" />
      <Cell c={32} r={76} w={1} h={1} z={7} className="dream-la-knob" />
      <Cell c={27} r={69} w={4} h={1} z={6} className="dream-la-spill" />
    </div>
  );
}

function UpperStory() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <HouseShell southDoor={false} finish="upper" />

      <Cell c={11} r={8} w={1} h={8} z={6} className="dream-la-shutter" />
      <Cell c={12} r={8} w={5} h={8} z={6} className="dream-la-up-glass" />
      <Cell c={17} r={8} w={1} h={8} z={6} className="dream-la-shutter" />
      <Cell c={4} r={8} w={4} h={6} z={5} className="dream-la-up-mirror" />
      <Cell c={4} r={16} w={16} h={5} z={5} className="dream-la-up-walnut" />
      <Cell c={6} r={15} w={6} h={2} z={6} className="dream-la-up-basin" />
      <Cell c={8} r={14} w={1} h={1} z={7} className="dream-la-in-steel-hi" />
      <Cell c={4} r={28} w={16} h={10} z={6} className="dream-la-up-tub" />
      <Cell c={6} r={30} w={12} h={6} z={7} className="dream-la-water" />
      <Cell c={8} r={32} w={1} h={1} z={8} className="dream-la-glint" />
      <Cell c={14} r={33} w={1} h={1} z={8} className="dream-la-glint" />
      <Cell c={18} r={20} w={3} h={8} z={6} className="dream-la-up-towel" />
      <Cell c={4} r={40} w={4} h={2} z={5} className="dream-la-up-cream" />
      <Cell c={5} r={38} w={1} h={2} z={6} className="dream-la-agave-hi" />
      <Cell c={6} r={37} w={2} h={3} z={6} className="dream-la-agave" />

      <Cell c={37} r={8} w={1} h={12} z={6} className="dream-la-shutter" />
      <Cell c={38} r={8} w={10} h={12} z={6} className="dream-la-up-glass" />
      <Cell c={48} r={8} w={1} h={12} z={6} className="dream-la-shutter" />

      <Cell c={34} r={22} w={4} h={2} z={5} className="dream-la-up-cream" />
      <Cell c={35} r={20} w={1} h={2} z={6} className="dream-la-agave-hi" />
      <Cell c={36} r={19} w={2} h={3} z={6} className="dream-la-agave" />
      <GreySeat c={40} r={22} w={10} />
      <Cell c={44} r={28} w={4} h={3} z={5} className="dream-la-up-walnut" />
      <GreySeat c={51} r={22} w={6} />
      <Cell c={50} r={18} w={1} h={6} z={6} className="dream-la-up-walnut" />
      <Cell c={49} r={16} w={3} h={2} z={7} className="dream-la-up-cream" />
      <Cell c={49} r={19} w={3} h={1} z={6} className="dream-la-spill" />

      <Cell c={34} r={32} w={22} h={20} z={2} className="dream-la-up-rug" />
      <Cell c={38} r={30} w={16} h={2} z={3} className="dream-la-up-cream" />
      <Bed c={38} r={34} />
      <Cell c={34} r={34} w={4} h={5} z={5} className="dream-la-up-cream" />
      <Lamp c={35} r={30} />
      <Cell c={54} r={34} w={3} h={5} z={5} className="dream-la-up-cream" />
      <Lamp c={54} r={30} />
      <Cell c={42} r={46} w={8} h={3} z={5} className="dream-la-up-walnut" />
      <Cell c={43} r={46} w={6} h={2} z={6} className="dream-la-up-grey" />

      <Cell c={50} r={54} w={6} h={5} z={5} className="dream-la-up-walnut" />
      <Cell c={51} r={52} w={1} h={2} z={6} className="dream-la-lamp-glow" />
      <Cell c={54} r={52} w={1} h={2} z={6} className="dream-la-lamp-glow" />
    </div>
  );
}

export function HouseScenery({ story }: { story: 1 | 2 }) {
  return story === 2 ? <UpperStory /> : <LowerStory />;
}
