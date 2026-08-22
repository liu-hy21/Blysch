"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Application, extend, useTick } from "@pixi/react";
import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { DreamScene } from "@/lib/dream-furniture";
import {
  CELL,
  INDOOR_SHEET,
  SCALE,
  TILE,
  buildHouse,
  buildYard,
  dungeonTileUrls,
  dungeonUrl,
  townTileUrls,
  townUrl,
  type DreamSprite,
  type FloorPalette,
  type HouseMap,
  type WaterCell,
} from "@/lib/dream-pixi-map";

extend({ Container, Graphics, Sprite });

const indoorFrames = new Map<string, Texture>();

function nearest(texture: Texture) {
  texture.source.scaleMode = "nearest";
  return texture;
}

function indoorFrame(col: number, row: number, w: number, h: number) {
  const key = `${col}:${row}:${w}:${h}`;
  const cached = indoorFrames.get(key);
  if (cached) return cached;
  const sheet = Texture.from(INDOOR_SHEET);
  const texture = nearest(
    new Texture({
      source: sheet.source,
      frame: new Rectangle(
        col * (TILE + 1),
        row * (TILE + 1),
        w * TILE + (w - 1),
        h * TILE + (h - 1),
      ),
    }),
  );
  indoorFrames.set(key, texture);
  return texture;
}

function useKenney() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const urls = [...townTileUrls(), ...dungeonTileUrls(), INDOOR_SHEET];
    Assets.load(urls)
      .then(() => {
        for (const url of urls) nearest(Texture.from(url));
        if (alive) setReady(true);
      })
      .catch(() => {
        if (alive) setReady(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

function TileSprite({ s }: { s: DreamSprite }) {
  if (s.kind === "indoor") {
    return (
      <pixiSprite
        texture={indoorFrame(s.col, s.row, s.w, s.h)}
        x={s.x * CELL}
        y={s.y * CELL}
        scale={SCALE}
        zIndex={s.z}
        roundPixels
      />
    );
  }
  const texture = Texture.from(s.kind === "town" ? townUrl(s.id) : dungeonUrl(s.id));
  return (
    <pixiSprite
      texture={texture}
      x={s.x * CELL}
      y={s.y * CELL}
      scale={SCALE}
      zIndex={s.z}
      roundPixels
    />
  );
}

function WaterLayer({ cells }: { cells: WaterCell[] }) {
  const [wave, setWave] = useState(0);
  useTick((ticker) => {
    const next = Math.floor(ticker.lastTime / 380) % 2;
    setWave((current) => (current === next ? current : next));
  });
  return (
    <pixiGraphics
      zIndex={1}
      draw={(g) => {
        g.clear();
        for (const cell of cells) {
          const x = cell.x * CELL;
          const y = cell.y * CELL;
          g.rect(x, y, CELL, CELL);
          g.fill({ color: (cell.x + cell.y + wave) % 2 === 0 ? 0x4a8fc8 : 0x3d7ab0 });
          g.rect(x + 6, y + 8 + wave * 2, 10, 3);
          g.fill({ color: 0x7ec8ff });
        }
      }}
    />
  );
}

const FLOOR_A: Record<FloorPalette, number> = {
  kitchen: 0xc4784a,
  bath: 0xc5d0d8,
  living: 0xc4a06a,
  bedroom: 0xd4b0a8,
};
const FLOOR_B: Record<FloorPalette, number> = {
  kitchen: 0xd4a574,
  bath: 0x9bb0bc,
  living: 0x8b6239,
  bedroom: 0xb07a78,
};

function Floors({ floors }: { floors: HouseMap["floors"] }) {
  return (
    <pixiGraphics
      zIndex={0}
      draw={(g) => {
        g.clear();
        for (const room of floors) {
          for (let y = 0; y < room.h; y++) {
            for (let x = 0; x < room.w; x++) {
              const px = (room.x + x) * CELL;
              const py = (room.y + y) * CELL;
              const alt = room.palette === "living" ? y % 2 === 0 : (x + y) % 2 === 0;
              g.rect(px, py, CELL, CELL);
              g.fill({ color: alt ? FLOOR_A[room.palette] : FLOOR_B[room.palette] });
              g.rect(px, py, CELL, 2);
              g.fill({ color: 0x3d3228, alpha: 0.18 });
            }
          }
        }
      }}
    />
  );
}

function DreamWorld({ scene, width, height }: { scene: DreamScene; width: number; height: number }) {
  const ready = useKenney();
  const cols = Math.max(12, Math.ceil(width / CELL));
  const rows = Math.max(16, Math.ceil(height / CELL));
  const yard = useMemo(() => buildYard(cols, rows), [cols, rows]);
  const house = useMemo(() => buildHouse(cols, rows), [cols, rows]);
  if (!ready) return null;
  const sprites = scene === "yard" ? yard.sprites : house.sprites;
  return (
    <pixiContainer sortableChildren>
      {scene === "house" ? <Floors floors={house.floors} /> : null}
      {scene === "yard" ? <WaterLayer cells={yard.water} /> : null}
      {sprites.map((s, i) => (
        <TileSprite key={`${s.kind}-${s.x}-${s.y}-${i}`} s={s} />
      ))}
    </pixiContainer>
  );
}

export function DreamPixi({ scene }: { scene: DreamScene }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight || 640 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden>
      {size.w > 0 ? (
        <Application
          width={size.w}
          height={size.h}
          antialias={false}
          roundPixels
          autoDensity
          resolution={1}
          preference="webgl"
          background={scene === "yard" ? 0xc4a06a : 0x3d3228}
          className="dream-pixi-canvas"
        >
          <DreamWorld scene={scene} width={size.w} height={size.h} />
        </Application>
      ) : null}
    </div>
  );
}
