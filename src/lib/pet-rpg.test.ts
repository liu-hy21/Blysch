import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyExp, expToNext } from "./pet-rules";
import { buildPetRpg, rewardAt, rewardsBetween } from "./pet-rpg";

describe("uncapped pet exp", () => {
  it("always has a next threshold", () => {
    assert.equal(expToNext(1), 25);
    assert.ok(expToNext(30) > 0);
    assert.ok(expToNext(80) > 0);
  });

  it("keeps gaining levels past the old cap", () => {
    const grown = applyExp({ level: 30, exp: 0 }, expToNext(30));
    assert.equal(grown.level, 31);
    assert.equal(grown.exp, 0);
    assert.equal(grown.levelsGained, 1);
  });
});

describe("reward every two levels", () => {
  it("gives nothing on odd levels", () => {
    assert.equal(rewardAt("rabbit", 1), null);
    assert.equal(rewardAt("rabbit", 3), null);
  });

  it("cycles weapon, armor, trinket, trait", () => {
    assert.equal(rewardAt("cow", 2)?.kind, "weapon");
    assert.equal(rewardAt("cow", 4)?.kind, "armor");
    assert.equal(rewardAt("cow", 6)?.kind, "trinket");
    assert.equal(rewardAt("cow", 8)?.kind, "trait");
    assert.equal(rewardAt("cow", 10)?.name, "灰烬使者·2");
  });

  it("lists only the even levels crossed", () => {
    const got = rewardsBetween("cat", 3, 6);
    assert.deepEqual(
      got.map((r) => r.level),
      [4, 6],
    );
  });

  it("raises attack when the weapon lands, and not on the level in between", () => {
    const lv1 = buildPetRpg("dog", 1);
    const lv2 = buildPetRpg("dog", 2);
    const lv3 = buildPetRpg("dog", 3);
    assert.equal(lv1.slots[0]?.name, null);
    assert.equal(lv2.slots[0]?.name, "项圈刺");
    assert.ok(lv2.combat.atk > lv1.combat.atk);
    assert.equal(lv3.slots[0]?.name, "项圈刺");
    assert.equal(lv3.slots[1]?.name, null);
    assert.equal(lv2.nextRewardLevel, 4);
  });
});
