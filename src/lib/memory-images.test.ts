import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { memoryWeekKey, shuffleMemoryImages } from "./memory-images";

describe("memoryWeekKey", () => {
  it("uses the Monday of that Shanghai week", () => {
    assert.equal(memoryWeekKey("2026-09-06"), "2026-08-31");
    assert.equal(memoryWeekKey("2026-09-07"), "2026-09-07");
    assert.equal(memoryWeekKey("2026-09-12"), "2026-09-07");
  });
});

describe("shuffleMemoryImages", () => {
  const seven = ["a", "b", "c", "d", "e", "f", "g"];

  it("leaves six or fewer images in place", () => {
    const six = ["a", "b", "c", "d", "e", "f"];
    assert.equal(shuffleMemoryImages(six, "m1"), six);
  });

  it("keeps the same photos, only the order", () => {
    const shuffled = shuffleMemoryImages(seven, "m1", "2026-08-31");
    assert.deepEqual([...shuffled].sort(), [...seven].sort());
    assert.equal(shuffled.length, seven.length);
  });

  it("is stable within a week and memory", () => {
    assert.deepEqual(
      shuffleMemoryImages(seven, "m1", "2026-08-31"),
      shuffleMemoryImages(seven, "m1", "2026-08-31"),
    );
  });

  it("changes by week or by memory", () => {
    const here = shuffleMemoryImages(seven, "m1", "2026-08-31").join(",");
    const nextWeek = shuffleMemoryImages(seven, "m1", "2026-09-07").join(",");
    const other = shuffleMemoryImages(seven, "m2", "2026-08-31").join(",");
    assert.notEqual(here, nextWeek);
    assert.notEqual(here, other);
  });
});
