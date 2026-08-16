import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "pets");

const W = 32;
const H = 32;
const FRAMES = 4;
const MOODS = 3;
const SW = W * FRAMES;
const SH = H * MOODS;

const INK = [28, 25, 23, 255];
const GOLD = [184, 149, 106, 255];
const ROSE = [142, 90, 90, 255];
const SAGE = [95, 111, 100, 255];
const STONE = [168, 162, 158, 255];
const OCHRE = [140, 106, 69, 255];
const CREAM = [255, 253, 248, 255];
const IVORY = [232, 224, 210, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength).copy(
      raw,
      y * (width * 4 + 1) + 1,
      y * width * 4,
      (y + 1) * width * 4,
    );
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function blank() {
  return new Uint8ClampedArray(SW * SH * 4);
}

function plot(sheet, x, y, color) {
  if (x < 0 || y < 0 || x >= SW || y >= SH) return;
  const i = (y * SW + x) * 4;
  sheet[i] = color[0];
  sheet[i + 1] = color[1];
  sheet[i + 2] = color[2];
  sheet[i + 3] = color[3];
}

function rect(sheet, x, y, w, h, color) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) plot(sheet, x + i, y + j, color);
  }
}

function outlineFill(sheet, pixels, fill, line = INK) {
  for (const [x, y] of pixels) plot(sheet, x, y, fill);
  const set = new Set(pixels.map(([x, y]) => `${x},${y}`));
  for (const [x, y] of pixels) {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      if (!set.has(`${x + dx},${y + dy}`)) plot(sheet, x + dx, y + dy, line);
    }
  }
}

function oval(cx, cy, rx, ry) {
  const pts = [];
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if (x * x * ry * ry + y * y * rx * rx <= rx * rx * ry * ry) {
        pts.push([cx + x, cy + y]);
      }
    }
  }
  return pts;
}

function shift(pts, dx, dy) {
  return pts.map(([x, y]) => [x + dx, y + dy]);
}

function drawFace(sheet, ox, oy, mood) {
  const eyeY = mood === 2 ? 1 : 0;
  plot(sheet, ox + 11, oy + 13 + eyeY, INK);
  plot(sheet, ox + 12, oy + 13 + eyeY, INK);
  plot(sheet, ox + 19, oy + 13 + eyeY, INK);
  plot(sheet, ox + 20, oy + 13 + eyeY, INK);
  if (mood === 1) {
    rect(sheet, ox + 14, oy + 17, 4, 2, ROSE);
  } else if (mood === 2) {
    rect(sheet, ox + 14, oy + 18, 4, 1, INK);
  } else {
    plot(sheet, ox + 15, oy + 17, INK);
    plot(sheet, ox + 16, oy + 17, INK);
  }
}

function drawBase(sheet, ox, oy, bodyColor, extra) {
  extra(sheet, ox, oy);
  outlineFill(sheet, shift(oval(16, 20, 9, 7), ox, oy), bodyColor);
  outlineFill(sheet, shift(oval(16, 12, 7, 6), ox, oy), bodyColor);
}

const drawers = {
  rabbit(sheet, ox, oy, mood) {
    const ear = mood === 2 ? 1 : 0;
    outlineFill(
      sheet,
      [
        ...shift(oval(11, 5 + ear, 2, 6), ox, oy),
        ...shift(oval(21, 5 + ear, 2, 6), ox, oy),
      ],
      CREAM,
    );
    rect(sheet, ox + 10, oy + 3 + ear, 2, 5, ROSE);
    rect(sheet, ox + 20, oy + 3 + ear, 2, 5, ROSE);
    drawBase(sheet, ox, oy, CREAM, () => {});
    drawFace(sheet, ox, oy, mood);
    rect(sheet, ox + 7, oy + 25, 3, 3, STONE);
    rect(sheet, ox + 22, oy + 25, 3, 3, STONE);
  },
  cow(sheet, ox, oy, mood) {
    rect(sheet, ox + 9, oy + 6, 2, 3, STONE);
    rect(sheet, ox + 21, oy + 6, 2, 3, STONE);
    drawBase(sheet, ox, oy, CREAM, () => {});
    outlineFill(sheet, shift(oval(12, 18, 2, 2), ox, oy), INK);
    outlineFill(sheet, shift(oval(20, 22, 2, 2), ox, oy), INK);
    rect(sheet, ox + 14, oy + 16, 4, 3, ROSE);
    drawFace(sheet, ox, oy, mood);
  },
  sheep(sheet, ox, oy, mood) {
    const fluff = shift(oval(16, 19, 10, 8), ox, oy);
    outlineFill(sheet, fluff, IVORY);
    outlineFill(sheet, shift(oval(16, 11, 6, 5), ox, oy), OCHRE);
    drawFace(sheet, ox, oy, mood);
    rect(sheet, ox + 8, oy + 26, 3, 3, OCHRE);
    rect(sheet, ox + 21, oy + 26, 3, 3, OCHRE);
  },
  deer(sheet, ox, oy, mood) {
    const antlerY = mood === 1 ? -1 : 0;
    plot(sheet, ox + 10, oy + 4 + antlerY, GOLD);
    plot(sheet, ox + 9, oy + 3 + antlerY, GOLD);
    plot(sheet, ox + 11, oy + 3 + antlerY, GOLD);
    plot(sheet, ox + 21, oy + 4 + antlerY, GOLD);
    plot(sheet, ox + 20, oy + 3 + antlerY, GOLD);
    plot(sheet, ox + 22, oy + 3 + antlerY, GOLD);
    drawBase(sheet, ox, oy, OCHRE, () => {});
    drawFace(sheet, ox, oy, mood);
    plot(sheet, ox + 10, oy + 16, CREAM);
    plot(sheet, ox + 21, oy + 16, CREAM);
  },
  dog(sheet, ox, oy, mood) {
    outlineFill(sheet, shift(oval(8, 12, 4, 3), ox, oy), OCHRE);
    outlineFill(sheet, shift(oval(24, 12, 4, 3), ox, oy), OCHRE);
    drawBase(sheet, ox, oy, GOLD, () => {});
    drawFace(sheet, ox, oy, mood);
    rect(sheet, ox + 22, oy + 20, 6, 3, GOLD);
  },
  cat(sheet, ox, oy, mood) {
    const pts = [
      [10, 8],
      [11, 7],
      [12, 6],
      [13, 7],
      [14, 8],
      [18, 8],
      [19, 7],
      [20, 6],
      [21, 7],
      [22, 8],
    ].map(([x, y]) => [x + ox, y + oy]);
    outlineFill(sheet, pts, STONE);
    drawBase(sheet, ox, oy, STONE, () => {});
    drawFace(sheet, ox, oy, mood);
    plot(sheet, ox + 8, oy + 16, INK);
    plot(sheet, ox + 7, oy + 16, INK);
    plot(sheet, ox + 23, oy + 16, INK);
    plot(sheet, ox + 24, oy + 16, INK);
    if (mood !== 2) rect(sheet, ox + 23, oy + 22, 5, 2, SAGE);
  },
};

function bounce(frame, mood) {
  if (mood === 2) return frame % 2;
  return [0, -1, 0, 1][frame];
}

mkdirSync(OUT, { recursive: true });

for (const [name, draw] of Object.entries(drawers)) {
  const sheet = blank();
  for (let mood = 0; mood < MOODS; mood++) {
    for (let frame = 0; frame < FRAMES; frame++) {
      const ox = frame * W;
      const oy = mood * H + bounce(frame, mood);
      draw(sheet, ox, oy, mood);
    }
  }
  writeFileSync(join(OUT, `${name}.png`), encodePng(SW, SH, sheet));
  console.log("wrote", name);
}
