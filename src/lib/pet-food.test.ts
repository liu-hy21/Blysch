import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAILY_BACKPACK_SIZE,
  DAILY_FOODS,
  GOLD_FOOD,
  isTodaysBackpackFood,
  todaysBackpack,
} from "./pet-rules";

describe("todaysBackpack", () => {
  it("keeps the gold apple every day and picks three daily foods", () => {
    const pack = todaysBackpack("2026-09-06");
    assert.equal(pack.length, DAILY_BACKPACK_SIZE + 1);
    assert.equal(pack.at(-1)?.id, GOLD_FOOD.id);
    const daily = pack.slice(0, DAILY_BACKPACK_SIZE);
    assert.equal(new Set(daily.map((f) => f.id)).size, DAILY_BACKPACK_SIZE);
    for (const food of daily) {
      assert.ok(DAILY_FOODS.some((item) => item.id === food.id));
      assert.equal("gold" in food, false);
    }
  });

  it("is stable on the same day and rotates on another day", () => {
    assert.deepEqual(todaysBackpack("2026-09-06"), todaysBackpack("2026-09-06"));
    assert.notDeepEqual(
      todaysBackpack("2026-09-06").slice(0, DAILY_BACKPACK_SIZE).map((f) => f.id),
      todaysBackpack("2026-09-07").slice(0, DAILY_BACKPACK_SIZE).map((f) => f.id),
    );
    assert.equal(todaysBackpack("2026-09-07").at(-1)?.id, GOLD_FOOD.id);
  });

  it("only accepts foods that are in today's pack", () => {
    const today = "2026-09-06";
    assert.equal(isTodaysBackpackFood("apple", today), true);
    const ids = new Set(todaysBackpack(today).map((f) => f.id));
    const outsider = DAILY_FOODS.find((f) => !ids.has(f.id));
    assert.ok(outsider);
    assert.equal(isTodaysBackpackFood(outsider.id, today), false);
  });
});
