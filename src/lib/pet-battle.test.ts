import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GEAR_PALETTE } from "@/lib/gear-sprites";
import {
  castSkill,
  foeUnit,
  livingOrder,
  outcome,
  strike,
  strikeDamage,
  type BattleUnit,
} from "@/lib/pet-battle";
import { BOND_SKILL } from "@/lib/pet-rules";
import { foeSprite } from "@/components/pets/foe-icon";

describe("pet battle", () => {
  it("deals only the amount above defense", () => {
    assert.equal(strikeDamage(10, 10), 0);
    assert.equal(strikeDamage(9, 10), 0);
    assert.equal(strikeDamage(18, 10), 8);
  });

  it("acts in speed order and lets allies go first on a tie", () => {
    const units: BattleUnit[] = [
      { id: "slow", name: "慢", side: "ally", hp: 1, maxHp: 1, atk: 1, def: 0, spd: 5 },
      { id: "fast", name: "快", side: "foe", hp: 1, maxHp: 1, atk: 1, def: 0, spd: 9 },
      { id: "tie", name: "同", side: "foe", hp: 1, maxHp: 1, atk: 1, def: 0, spd: 5 },
    ];
    assert.deepEqual(
      livingOrder(units).map((unit) => unit.id),
      ["fast", "slow", "tie"],
    );
  });

  it("hits the front ally and stops at zero", () => {
    const units: BattleUnit[] = [
      { id: "cow", name: "大牛子", side: "ally", hp: 20, maxHp: 20, atk: 12, def: 8, spd: 4 },
      { id: "rabbit", name: "小兔子", side: "ally", hp: 20, maxHp: 20, atk: 15, def: 3, spd: 9 },
      foeUnit("murloc"),
    ];
    const hit = strike(units, "foe-murloc");
    assert.equal(hit.units.find((unit) => unit.id === "cow")?.hp, 0);
    assert.equal(hit.units.find((unit) => unit.id === "rabbit")?.hp, 20);
    const blocked = strike(
      [{ id: "wall", name: "墙", side: "ally", hp: 10, maxHp: 10, atk: 1, def: 200, spd: 1 }, foeUnit("beast")],
      "foe-beast",
    );
    assert.equal(blocked.units[0]?.hp, 10);
    assert.match(blocked.line, /完全挡住/);
    const dead = strike(
      [{ id: "soft", name: "软", side: "foe", hp: 5, maxHp: 5, atk: 1, def: 0, spd: 1 }, { id: "a", name: "我", side: "ally", hp: 9, maxHp: 9, atk: 20, def: 0, spd: 1 }],
      "a",
    );
    assert.equal(outcome(dead.units), "win");
  });

  it("spends mana on a skill and refuses a cast that costs more than the bar", () => {
    const units: BattleUnit[] = [
      { id: "rabbit", name: "小兔子", side: "ally", hp: 30, maxHp: 30, atk: 40, def: 0, spd: 5, mp: 3, maxMp: 3 },
      foeUnit("murloc"),
    ];
    const short = castSkill(units, "rabbit", {
      id: "fireball",
      name: "火球术",
      cost: 4,
      power: 10,
      effect: "damage",
    });
    assert.equal(short.ok, false);
    assert.equal(short.units[0]?.mp, 3);
    const cast = castSkill(units, "rabbit", {
      id: "frostbolt",
      name: "寒冰箭",
      cost: 2,
      power: 20,
      effect: "damage",
    });
    assert.equal(cast.ok, true);
    assert.equal(cast.units.find((unit) => unit.id === "rabbit")?.mp, 1);
    assert.equal(cast.units.find((unit) => unit.id === "foe-murloc")?.hp, 320 - (40 + 20 - 48));
  });

  it("charges both pets for the bond skill", () => {
    const units: BattleUnit[] = [
      { id: "cow", name: "大牛子", side: "ally", hp: 40, maxHp: 40, atk: 12, def: 8, spd: 2, mp: 8, maxMp: 8 },
      { id: "rabbit", name: "小兔子", side: "ally", hp: 30, maxHp: 30, atk: 15, def: 3, spd: 9, mp: 8, maxMp: 8 },
      foeUnit("murloc"),
    ];
    const cast = castSkill(units, "rabbit", BOND_SKILL);
    assert.equal(cast.ok, true);
    assert.equal(cast.units.find((unit) => unit.id === "rabbit")?.mp, 2);
    assert.equal(cast.units.find((unit) => unit.id === "cow")?.mp, 2);
    assert.ok((cast.units.find((unit) => unit.id === "foe-murloc")?.hp ?? 999) < 320);
  });

  it("draws every foe as 16 by 16", () => {
    for (const kind of ["murloc", "undead", "beast", "elemental"] as const) {
      const rows = foeSprite(kind);
      assert.equal(rows.length, 16);
      for (const row of rows) {
        assert.equal([...row].length, 16, row);
        for (const ch of row) assert.ok(ch === "." || ch in GEAR_PALETTE);
      }
    }
  });
});
