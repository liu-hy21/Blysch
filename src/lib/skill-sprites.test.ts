import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PetSpecies } from "@/generated/prisma/client";
import { GEAR_PALETTE } from "@/lib/gear-sprites";
import { BOND_SKILL, skillsFor } from "@/lib/pet-rules";
import { skillSprite } from "@/lib/skill-sprites";

const SPECIES = ["rabbit", "cow", "sheep", "deer", "dog", "cat"] as const satisfies readonly PetSpecies[];

describe("skill sprites", () => {
  it("is a 16 by 16 picture for every skill", () => {
    for (const species of SPECIES) {
      for (const skill of skillsFor(species, 99)) {
        const rows = skillSprite(species, skill.id);
        assert.equal(rows.length, 16, `${species} ${skill.id} rows`);
        for (const row of rows) {
          assert.equal([...row].length, 16, `${species} ${skill.id} cols ${row}`);
          for (const ch of row) {
            assert.ok(ch === "." || ch in GEAR_PALETTE, `${species} ${skill.id} ink ${ch}`);
          }
        }
      }
    }
    for (const species of ["rabbit", "cow"] as const) {
      const rows = skillSprite(species, BOND_SKILL.id);
      assert.equal(rows.length, 16);
      for (const row of rows) {
        assert.equal([...row].length, 16, `${species} heart`);
        for (const ch of row) assert.ok(ch === "." || ch in GEAR_PALETTE);
      }
    }
  });
});
