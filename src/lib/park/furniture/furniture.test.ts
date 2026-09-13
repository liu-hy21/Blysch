import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { furnitureFor } from "../../dream-furniture";
import { FURNITURE_BY_SPECIES, furnitureById } from "./index";

describe("furniture registry", () => {
  it("has ten pieces per species, in unlock order", () => {
    assert.equal(FURNITURE_BY_SPECIES.rabbit?.length, 10);
    assert.equal(FURNITURE_BY_SPECIES.cow?.length, 10);
    assert.equal(FURNITURE_BY_SPECIES.rabbit?.[0].id, "rabbit-lamp");
    assert.equal(FURNITURE_BY_SPECIES.cow?.[0].id, "cow-can");
  });

  it("resolves every catalog item to an object that can render", () => {
    for (const item of [...furnitureFor("rabbit", 30), ...furnitureFor("cow", 30)]) {
      const piece = furnitureById(item.id);
      assert.ok(piece, `missing furniture object: ${item.id}`);
      // def() 与目录数据一致(纯数据,可序列化)
      assert.deepEqual(piece.def(), {
        id: item.id,
        name: item.name,
        desc: item.desc,
        scene: item.scene,
        area: item.area,
        slot: item.slot,
      });
      // render() 产出 React 元素
      assert.ok(piece.render(), `empty render: ${item.id}`);
    }
  });

  it("keeps original slots for spot checks", () => {
    assert.deepEqual(furnitureById("rabbit-lamp")?.meta.slot, { top: 400, left: 272 });
    assert.deepEqual(furnitureById("cow-fountain")?.meta.slot, { top: "74%", left: "28%" });
  });
});
