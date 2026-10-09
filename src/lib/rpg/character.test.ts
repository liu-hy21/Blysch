import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addToInventory,
  allocateStatPoint,
  canEquip,
  computeSnapshot,
  createCharacter,
  equip,
  grantXp,
} from "./character";

describe("RPG character system", () => {
  it("creates a warrior with level-1 skills", () => {
    const c = createCharacter({
      id: "1",
      name: "阿勇",
      classId: "warrior",
      startingItems: ["iron_sword"],
    });
    assert.equal(c.level, 1);
    assert.ok(c.learnedSkillIds.includes("slash"));
  });

  it("levels up and learns skills from class table", () => {
    let c = createCharacter({ id: "1", name: "阿勇", classId: "warrior" });
    c = grantXp(c, xpNeedForLevel(5));
    assert.ok(c.level >= 5);
    assert.ok(c.learnedSkillIds.includes("power_strike"));
    assert.ok(c.unspentStatPoints > 0);
  });

  it("restricts equipment by class tags", () => {
    const mage = addToInventory(
      createCharacter({ id: "m", name: "法师", classId: "mage" }),
      "iron_sword",
    );
    const check = canEquip(mage, "iron_sword");
    assert.equal(check.ok, false);
  });

  it("equips weapon and raises attack in snapshot", () => {
    let c = createCharacter({
      id: "1",
      name: "阿勇",
      classId: "warrior",
      startingItems: ["iron_sword"],
    });
    const before = computeSnapshot(c).combatStats.attack;
    c = equip(c, "iron_sword");
    const after = computeSnapshot(c).combatStats.attack;
    assert.ok(after > before);
    assert.equal(c.equipped.mainHand, "iron_sword");
  });

  it("allocates stat points into base stats", () => {
    let c = createCharacter({ id: "1", name: "阿勇", classId: "warrior" });
    c = { ...c, unspentStatPoints: 2 };
    c = allocateStatPoint(c, "str");
    c = allocateStatPoint(c, "str");
    assert.equal(c.allocatedStats.str, 2);
    assert.equal(c.unspentStatPoints, 0);
  });
});

function xpNeedForLevel(target: number): number {
  let total = 0;
  for (let l = 1; l < target; l++) {
    total += 50 + l * l * 15;
  }
  return total + 1;
}
