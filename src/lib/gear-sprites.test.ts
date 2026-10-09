import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PetSpecies } from "@/generated/prisma/client";
import { GEAR_PALETTE, gearSprite } from "./gear-sprites";
import type { RewardKind } from "./pet-rpg";

const SPECIES = ["rabbit", "cow", "sheep", "deer", "dog", "cat"] as const satisfies readonly PetSpecies[];
const KINDS = ["weapon", "armor", "trinket", "trait"] as const satisfies readonly RewardKind[];

describe("gear sprites", () => {
  it("is a 16 by 16 picture for every species and slot", () => {
    for (const species of SPECIES) {
      for (const kind of KINDS) {
        const rows = gearSprite(species, kind);
        assert.equal(rows.length, 16, `${species} ${kind} rows`);
        for (const row of rows) {
          assert.equal([...row].length, 16, `${species} ${kind} cols`);
          for (const ch of row) {
            assert.ok(ch === "." || ch in GEAR_PALETTE, `${species} ${kind} ink ${ch}`);
          }
        }
      }
    }
  });
});
