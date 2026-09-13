import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { PARK_MODELS } from "./models";

describe("park gltf scenes", () => {
  it("ships yard, first-floor, and second-floor glb files", () => {
    for (const src of Object.values(PARK_MODELS)) {
      const file = join(process.cwd(), "public", src.replace(/^\//, ""));
      assert.ok(existsSync(file), `missing ${file}`);
      assert.ok(statSync(file).size > 50_000, `${file} looks empty`);
    }
  });
});
