/** Tile maps that match the existing dream layout percentages. */

export const TILE = 16;
export const SCALE = 2;
export const CELL = TILE * SCALE;

export type TownSprite = { kind: "town"; x: number; y: number; id: number; z: number };
export type DungeonSprite = { kind: "dungeon"; x: number; y: number; id: number; z: number };
export type SheetSprite = {
  kind: "indoor";
  x: number;
  y: number;
  col: number;
  row: number;
  w: number;
  h: number;
  z: number;
};
export type WaterCell = { x: number; y: number };
export type DreamSprite = TownSprite | DungeonSprite | SheetSprite;

export type YardMap = {
  sprites: DreamSprite[];
  water: WaterCell[];
};

export type HouseMap = {
  sprites: DreamSprite[];
  floors: { x: number; y: number; w: number; h: number; palette: FloorPalette }[];
};

export type FloorPalette = "kitchen" | "bath" | "living" | "bedroom";

/** Tiny Town 0-based tile ids (Kenney, 12-wide sheet). */
export const TOWN = {
  grass: 0,
  grassTuft: 1,
  grassAlt: 2,
  treeOrange: 3,
  treeGreen: 4,
  bush: 7,
  flowerA: 21,
  flowerB: 22,
  flowerC: 23,
  dirt: 43,
  dirtEdge: 13,
  roofL: 48,
  roofM: 49,
  roofM2: 50,
  roofR: 51,
  fenceH: 53,
  fenceM: 54,
  fencePost: 52,
  fenceV: 57,
  wallTL: 60,
  wallT: 61,
  wallTR: 62,
  window: 63,
  wallBL: 72,
  wallB: 73,
  wallBR: 75,
  windowLit: 84,
  door: 85,
  stone: 96,
  stone2: 97,
  stone3: 98,
  wellTop: 92,
  well: 104,
  mushroom: 106,
} as const;

export const DUNGEON = {
  floorDark: 1,
  floorMid: 2,
  floorWood: 6,
  wall: 24,
  door: 36,
} as const;

const TOWN_IDS = new Set<number>(Object.values(TOWN));
const DUNGEON_IDS = new Set<number>(Object.values(DUNGEON));

export function townTileUrls() {
  return [...TOWN_IDS].map((id) => townUrl(id));
}

export function dungeonTileUrls() {
  return [...DUNGEON_IDS].map((id) => dungeonUrl(id));
}

export function townUrl(id: number) {
  return `/dream/kenney/tiny-town/Tiles/tile_${pad(id)}.png`;
}

export function dungeonUrl(id: number) {
  return `/dream/kenney/tiny-dungeon/Tiles/tile_${pad(id)}.png`;
}

export const INDOOR_SHEET = "/dream/kenney/roguelike-indoors/Tilesheets/roguelikeIndoor_transparent.png";

function pad(id: number) {
  return String(id).padStart(4, "0");
}

function tile(pct: number, n: number) {
  return Math.max(0, Math.min(n - 1, Math.floor((pct / 100) * n)));
}

function town(x: number, y: number, id: number, z = 0): TownSprite {
  return { kind: "town", x, y, id, z };
}

function dungeon(x: number, y: number, id: number, z = 0): DungeonSprite {
  return { kind: "dungeon", x, y, id, z };
}

function indoor(x: number, y: number, col: number, row: number, w = 1, h = 1, z = 2): SheetSprite {
  return { kind: "indoor", x, y, col, row, w, h, z };
}

export function buildYard(cols: number, rows: number): YardMap {
  const sprites: DreamSprite[] = [];
  const water: WaterCell[] = [];
  const riverY0 = tile(56, rows);
  const riverY1 = Math.min(rows - 2, riverY0 + 1);
  const bridgeX0 = tile(36, cols);
  const bridgeX1 = tile(64, cols);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const edge = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
      if (edge) {
        sprites.push(
          town(
            x,
            y,
            y === 0 || y === rows - 1 ? (x % 2 === 0 ? TOWN.fencePost : TOWN.fenceH) : TOWN.fenceV,
            3,
          ),
        );
        continue;
      }

      const inRiver = y >= riverY0 && y <= riverY1;
      const onBridge = inRiver && x >= bridgeX0 && x <= bridgeX1;
      if (inRiver && !onBridge) {
        water.push({ x, y });
        continue;
      }

      const grassFront = x >= tile(26, cols) && x < tile(74, cols) && y >= tile(40, rows) && y < tile(52, rows);
      const grassLeft = x >= tile(8, cols) && x < tile(24, cols) && y >= tile(18, rows) && y < tile(32, rows);
      const grassRight = x >= tile(76, cols) && x < tile(92, cols) && y >= tile(72, rows) && y < tile(84, rows);
      const pathLow = x >= tile(40, cols) && x < tile(60, cols) && y >= tile(76, rows);
      const pathUp = x >= tile(42, cols) && x < tile(58, cols) && y >= tile(42, rows) && y < tile(54, rows);

      if (onBridge || pathLow || pathUp) {
        const stones = [TOWN.stone, TOWN.stone2, TOWN.stone3];
        sprites.push(town(x, y, stones[(x + y) % 3], 0));
        continue;
      }
      if (grassFront || grassLeft || grassRight) {
        sprites.push(town(x, y, (x + y) % 3 === 0 ? TOWN.grassTuft : TOWN.grass, 0));
        continue;
      }
      sprites.push(town(x, y, (x * 3 + y) % 5 === 0 ? TOWN.dirtEdge : TOWN.dirt, 0));
    }
  }

  const hx = tile(24, cols);
  const hy = tile(6, rows);
  const hw = Math.max(5, tile(76, cols) - hx);
  for (let i = 0; i < hw; i++) {
    const roof = i === 0 ? TOWN.roofL : i === hw - 1 ? TOWN.roofR : i % 2 === 0 ? TOWN.roofM : TOWN.roofM2;
    sprites.push(town(hx + i, hy, roof, 4));
  }
  for (let i = 0; i < hw; i++) {
    const mid = i === 0 ? TOWN.wallTL : i === hw - 1 ? TOWN.wallTR : i === 1 || i === hw - 2 ? TOWN.window : TOWN.wallT;
    sprites.push(town(hx + i, hy + 1, mid, 4));
  }
  const doorI = Math.floor(hw / 2);
  for (let i = 0; i < hw; i++) {
    const bottom =
      i === 0 ? TOWN.wallBL : i === hw - 1 ? TOWN.wallBR : i === doorI ? TOWN.door : i === 1 || i === hw - 2 ? TOWN.windowLit : TOWN.wallB;
    sprites.push(town(hx + i, hy + 2, bottom, 4));
  }

  const trees: [number, number, number][] = [
    [6, 20, TOWN.treeGreen],
    [78, 22, TOWN.treeOrange],
    [8, 68, TOWN.treeGreen],
    [78, 66, TOWN.treeOrange],
  ];
  for (const [px, py, id] of trees) {
    sprites.push(town(tile(px, cols), tile(py, rows), id, 5));
  }

  const flowers: [number, number, number][] = [
    [30, 42, TOWN.flowerA],
    [36, 44, TOWN.flowerB],
    [62, 43, TOWN.flowerC],
    [68, 46, TOWN.flowerA],
    [12, 20, TOWN.flowerB],
    [16, 24, TOWN.flowerC],
    [80, 74, TOWN.flowerA],
    [84, 78, TOWN.flowerB],
    [28, 82, TOWN.mushroom],
  ];
  for (const [px, py, id] of flowers) {
    sprites.push(town(tile(px, cols), tile(py, rows), id, 2));
  }

  sprites.push(town(tile(10, cols), tile(18, rows), TOWN.bush, 2));
  sprites.push(town(tile(84, cols), tile(20, rows), TOWN.wellTop, 5));
  sprites.push(town(tile(84, cols), tile(24, rows), TOWN.well, 5));

  return { sprites, water };
}

export function buildHouse(cols: number, rows: number): HouseMap {
  const kitchenW = Math.max(4, Math.round(cols * 0.7));
  const kitchenH = Math.max(4, Math.round(rows * 0.4));
  const bathW = cols - kitchenW;
  const livingH = rows - kitchenH;
  const livingW = Math.max(4, Math.round(cols * 0.5));

  const floors: HouseMap["floors"] = [
    { x: 0, y: 0, w: kitchenW, h: kitchenH, palette: "kitchen" },
    { x: kitchenW, y: 0, w: bathW, h: kitchenH, palette: "bath" },
    { x: 0, y: kitchenH, w: livingW, h: livingH, palette: "living" },
    { x: livingW, y: kitchenH, w: cols - livingW, h: livingH, palette: "bedroom" },
  ];

  const sprites: DreamSprite[] = [];

  for (const room of floors) {
    for (let x = room.x; x < room.x + room.w; x++) {
      sprites.push(dungeon(x, room.y, DUNGEON.wall, 3));
    }
  }

  sprites.push(dungeon(tile(18, cols), kitchenH - 1, DUNGEON.door, 4));
  sprites.push(dungeon(kitchenW - 1, tile(12, rows), DUNGEON.door, 4));
  sprites.push(dungeon(livingW - 1, tile(68, rows), DUNGEON.door, 4));
  sprites.push(dungeon(tile(82, cols), kitchenH - 1, DUNGEON.door, 4));

  sprites.push(indoor(1, 1, 10, 10, 2, 2, 2));
  sprites.push(indoor(3, 1, 10, 14, 2, 2, 2));
  sprites.push(indoor(1, 3, 0, 0, 4, 2, 2));
  sprites.push(indoor(2, 5, 2, 0, 1, 1, 2));
  sprites.push(indoor(5, 5, 2, 2, 1, 1, 2));

  sprites.push(indoor(kitchenW + 1, 1, 10, 14, 2, 2, 2));
  sprites.push(indoor(cols - 3, 2, 8, 0, 1, 1, 2));

  sprites.push(indoor(1, kitchenH + 2, 0, 9, 2, 2, 2));
  sprites.push(indoor(3, kitchenH + 2, 9, 0, 2, 2, 2));
  sprites.push(indoor(1, kitchenH + 5, 0, 8, 1, 1, 2));
  sprites.push(indoor(4, rows - 3, 0, 0, 4, 2, 2));
  sprites.push(indoor(5, rows - 4, 2, 0, 1, 1, 2));

  sprites.push(indoor(livingW + 1, kitchenH + 1, 0, 14, 4, 2, 2));
  sprites.push(indoor(livingW + 2, kitchenH + 3, 2, 4, 2, 2, 2));
  sprites.push(indoor(cols - 3, kitchenH + 1, 10, 0, 2, 2, 2));
  sprites.push(indoor(livingW + 1, rows - 3, 2, 9, 2, 2, 2));

  return { sprites, floors };
}
