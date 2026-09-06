import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyOneMiss,
  missedCareDays,
  nextCareGain,
  moodEmoji,
  settleMoodState,
} from "./pet-rules";

function hatch(key: string) {
  return new Date(`${key}T12:00:00+08:00`);
}

describe("missedCareDays", () => {
  it("does not penalize hatch day or the day after with no care yet", () => {
    assert.equal(
      missedCareDays({ lastCareDate: null, hatchedAt: hatch("2026-08-24") }, "2026-08-24"),
      0,
    );
    assert.equal(
      missedCareDays({ lastCareDate: null, hatchedAt: hatch("2026-08-23") }, "2026-08-24"),
      0,
    );
  });

  it("counts yesterday as one miss after hatch plus a skipped day", () => {
    assert.equal(
      missedCareDays({ lastCareDate: null, hatchedAt: hatch("2026-08-22") }, "2026-08-24"),
      1,
    );
  });

  it("counts consecutive empty days after last care", () => {
    assert.equal(
      missedCareDays(
        { lastCareDate: "2026-08-20", hatchedAt: hatch("2026-08-01") },
        "2026-08-24",
      ),
      3,
    );
    assert.equal(
      missedCareDays(
        { lastCareDate: "2026-08-23", hatchedAt: hatch("2026-08-01") },
        "2026-08-24",
      ),
      0,
    );
  });
});

describe("applyOneMiss", () => {
  it("drops at least to miss on one skipped day, then to sulk", () => {
    assert.equal(applyOneMiss(5), 1);
    assert.equal(applyOneMiss(4), 1);
    assert.equal(applyOneMiss(3), 1);
    assert.equal(applyOneMiss(2), 1);
    assert.equal(applyOneMiss(1), 0);
    assert.equal(applyOneMiss(0), 0);
  });
});

describe("settleMoodState", () => {
  const base = {
    lastCareDate: "2026-08-22",
    careStreak: 6,
    intimacy: 40,
    moodLevel: 4,
    moodSettledOn: null as string | null,
    hatchedAt: hatch("2026-08-01"),
  };

  it("applies one miss when opening the next day after a skip", () => {
    const next = settleMoodState(base, "2026-08-24");
    assert.equal(next.changed, true);
    assert.equal(next.careStreak, 0);
    assert.equal(next.moodLevel, 1);
    assert.equal(next.intimacy, 37);
    assert.equal(next.moodSettledOn, "2026-08-24");
  });

  it("does not double-penalize the same calendar day", () => {
    const first = settleMoodState(base, "2026-08-24");
    const again = settleMoodState({ ...base, ...first }, "2026-08-24");
    assert.equal(again.changed, false);
    assert.equal(again.moodLevel, 1);
    assert.equal(again.intimacy, 37);
  });

  it("only charges the new missed days after a previous settle", () => {
    const day1 = settleMoodState(base, "2026-08-24");
    const day2 = settleMoodState(
      { ...base, ...day1, lastCareDate: base.lastCareDate },
      "2026-08-25",
    );
    assert.equal(day2.moodLevel, 0);
    assert.equal(day2.intimacy, 34);
    assert.equal(day2.careStreak, 0);
  });

  it("stamps today with no penalty when nothing was missed", () => {
    const next = settleMoodState(
      { ...base, lastCareDate: "2026-08-23", moodSettledOn: "2026-08-23" },
      "2026-08-24",
    );
    assert.equal(next.moodLevel, 4);
    assert.equal(next.intimacy, 40);
    assert.equal(next.careStreak, 6);
    assert.equal(next.moodSettledOn, "2026-08-24");
  });
});

describe("nextCareGain", () => {
  it("continues a streak from calm-or-better", () => {
    const gain = nextCareGain(
      { lastCareDate: "2026-08-23", careStreak: 3, moodLevel: 4 },
      "2026-08-24",
    );
    assert.equal(gain.careStreak, 4);
    assert.equal(gain.intimacyDelta, 4);
    assert.equal(gain.expDelta, 11);
    assert.equal(gain.moodLevel, 5);
  });

  it("keeps growing past seven days", () => {
    const gain = nextCareGain(
      { lastCareDate: "2026-08-23", careStreak: 13, moodLevel: 5 },
      "2026-08-24",
    );
    assert.equal(gain.careStreak, 14);
    assert.equal(gain.intimacyDelta, 4);
    assert.equal(gain.expDelta, 11);
    assert.equal(gain.moodLevel, 5);
  });

  it("pulls miss back toward calm without streak bonus", () => {
    const gain = nextCareGain(
      { lastCareDate: "2026-08-22", careStreak: 0, moodLevel: 1 },
      "2026-08-24",
    );
    assert.equal(gain.careStreak, 1);
    assert.equal(gain.intimacyDelta, 3);
    assert.equal(gain.moodLevel, 3);
  });

  it("soothes sulk to quiet with a smaller intimacy bump", () => {
    const gain = nextCareGain(
      { lastCareDate: "2026-08-21", careStreak: 0, moodLevel: 0 },
      "2026-08-24",
    );
    assert.equal(gain.careStreak, 1);
    assert.equal(gain.intimacyDelta, 2);
    assert.equal(gain.moodLevel, 2);
  });
});

describe("moodEmoji", () => {
  it("keeps a small mark for every mood level", () => {
    assert.deepEqual(moodEmoji(5), ["✨"]);
    assert.deepEqual(moodEmoji(4), ["☀️"]);
    assert.deepEqual(moodEmoji(3), ["🍃"]);
    assert.deepEqual(moodEmoji(2), ["💧"]);
    assert.deepEqual(moodEmoji(1), ["💭"]);
    assert.deepEqual(moodEmoji(0), ["💤"]);
  });
});
