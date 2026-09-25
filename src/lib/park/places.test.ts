import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  parkDioramaUrls,
  parkModelFor,
  parkPlaceHref,
  parseParkPlace,
} from "./places";

describe("park places", () => {
  it("treats unknown query as home", () => {
    assert.equal(parseParkPlace(undefined), "home");
    assert.equal(parseParkPlace("nope"), "home");
    assert.equal(parseParkPlace("konbini"), "konbini");
  });

  it("keeps home floors and diorama files separate", () => {
    assert.equal(parkModelFor("home", "yard", 1), "/models/park/yard.glb");
    assert.equal(parkModelFor("home", "house", 2), "/models/park/house-l2.glb");
    assert.equal(parkModelFor("home", "house", 0), "/models/park/house-b1.glb");
    assert.equal(parkModelFor("cottage", "yard", 1), "/lib/cottage_diorama.glb");
    assert.equal(parkPlaceHref("home"), "/me/park");
    assert.equal(parkPlaceHref("ryokan"), "/me/park?place=ryokan");
  });

  it("ships every diorama glb", () => {
    for (const src of parkDioramaUrls()) {
      const file = join(process.cwd(), "public", src.replace(/^\//, ""));
      assert.ok(existsSync(file), `missing ${file}`);
      assert.ok(statSync(file).size > 50_000, `${file} looks empty`);
    }
  });
});
