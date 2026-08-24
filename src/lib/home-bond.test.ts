import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOND_HOURS,
  BOND_SPECIAL_COUNT,
  currentBond,
  todaysBonds,
} from "./home-bond";

describe("todaysBonds", () => {
  it("picks five unique hours from the 17 daytime slots", () => {
    const slots = todaysBonds("couple-a", "2026-08-24");
    assert.equal(BOND_HOURS.length, 17);
    assert.equal(slots.length, BOND_SPECIAL_COUNT);
    const hours = slots.map((s) => s.hour);
    assert.equal(new Set(hours).size, 5);
    for (const hour of hours) {
      assert.ok((BOND_HOURS as readonly number[]).includes(hour));
    }
  });

  it("is the same for both people in the couple that day", () => {
    assert.deepEqual(
      todaysBonds("couple-a", "2026-08-24"),
      todaysBonds("couple-a", "2026-08-24"),
    );
    assert.notDeepEqual(
      todaysBonds("couple-a", "2026-08-24"),
      todaysBonds("couple-a", "2026-08-25"),
    );
    assert.notDeepEqual(
      todaysBonds("couple-a", "2026-08-24"),
      todaysBonds("couple-b", "2026-08-24"),
    );
  });
});

describe("currentBond", () => {
  it("is idle before 7 and at or after midnight", () => {
    const day = todaysBonds("couple-a", "2026-08-24");
    assert.equal(currentBond("couple-a", "2026-08-24", 6), null);
    assert.equal(currentBond("couple-a", "2026-08-24", 0), null);
    const hit = day[0];
    assert.ok(hit);
    assert.deepEqual(currentBond("couple-a", "2026-08-24", hit.hour), hit);
    const idleHour = BOND_HOURS.find((h) => !day.some((s) => s.hour === h));
    assert.ok(idleHour !== undefined);
    assert.equal(currentBond("couple-a", "2026-08-24", idleHour), null);
  });
});
