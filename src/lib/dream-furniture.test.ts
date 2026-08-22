import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DREAM_ROOMS,
  DREAM_STATIONS,
  dreamRoom,
  furnitureCount,
  furnitureFor,
} from "./dream-furniture";

describe("furnitureCount", () => {
  it("unlocks one piece every 3 levels", () => {
    assert.equal(furnitureCount(1), 0);
    assert.equal(furnitureCount(2), 0);
    assert.equal(furnitureCount(3), 1);
    assert.equal(furnitureCount(5), 1);
    assert.equal(furnitureCount(6), 2);
    assert.equal(furnitureCount(29), 9);
    assert.equal(furnitureCount(30), 10);
  });
});

describe("furnitureFor", () => {
  it("returns 10 rabbit pieces with lock state from level", () => {
    const list = furnitureFor("rabbit", 6);
    assert.equal(list.length, 10);
    assert.equal(list.filter((p) => !p.locked).length, 2);
    assert.equal(list[0].id, "rabbit-lamp");
    assert.equal(list[0].locked, false);
    assert.equal(list[1].locked, false);
    assert.equal(list[2].locked, true);
    assert.equal(list[2].unlockLevel, 9);
  });

  it("returns empty catalog for species without furniture", () => {
    assert.deepEqual(furnitureFor("cat", 30), []);
  });
});

describe("dreamRoom", () => {
  it("includes yard and four indoor rooms", () => {
    assert.deepEqual([...DREAM_ROOMS], [
      "yard",
      "kitchen",
      "living",
      "bedroom",
      "bathroom",
    ]);
  });

  it("stays on the same room for the same day", () => {
    const a = dreamRoom("couple-1", "pet-1", "2026-08-20");
    const b = dreamRoom("couple-1", "pet-1", "2026-08-20");
    assert.equal(a, b);
    assert.ok((DREAM_STATIONS as readonly string[]).includes(a));
  });

  it("can change on a different day", () => {
    const rooms = new Set(
      ["2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24"].map((d) =>
        dreamRoom("couple-1", "pet-1", d),
      ),
    );
    assert.ok(rooms.size >= 2);
  });
});
