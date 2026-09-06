import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  intimacyBadgeList,
  intimacyMarkName,
  intimacyRank,
  intimacyRankLabel,
} from "./pet-rules";

describe("intimacyRank", () => {
  it("needs ten intimacy for the first mark, then four-up", () => {
    assert.deepEqual(intimacyRank(0), { crown: 0, sun: 0, moon: 0, star: 0 });
    assert.deepEqual(intimacyRank(9), { crown: 0, sun: 0, moon: 0, star: 0 });
    assert.deepEqual(intimacyRank(10), { crown: 0, sun: 0, moon: 0, star: 1 });
    assert.deepEqual(intimacyRank(40), { crown: 0, sun: 0, moon: 1, star: 0 });
    assert.deepEqual(intimacyRank(50), { crown: 0, sun: 0, moon: 1, star: 1 });
    assert.deepEqual(intimacyRank(160), { crown: 0, sun: 1, moon: 0, star: 0 });
    assert.deepEqual(intimacyRank(640), { crown: 1, sun: 0, moon: 0, star: 0 });
  });

  it("keeps leftover lowest marks after higher ones", () => {
    assert.deepEqual(intimacyRank(179), { crown: 0, sun: 1, moon: 0, star: 1 });
    assert.deepEqual(intimacyRank(193), { crown: 0, sun: 1, moon: 0, star: 3 });
  });

  it("lists marks high-to-low for the row", () => {
    assert.deepEqual(intimacyBadgeList(50), ["moon", "star"]);
    assert.deepEqual(intimacyBadgeList(640), ["crown"]);
    assert.deepEqual(intimacyBadgeList(9), []);
  });

  it("names marks by species", () => {
    assert.equal(intimacyMarkName("star", "rabbit"), "胡萝卜");
    assert.equal(intimacyMarkName("moon", "rabbit"), "高脚杯");
    assert.equal(intimacyMarkName("sun", "rabbit"), "绒球");
    assert.equal(intimacyMarkName("crown", "rabbit"), "黄金");
    assert.equal(intimacyMarkName("star", "cow"), "三叶草");
    assert.equal(intimacyMarkName("moon", "cow"), "云朵");
    assert.equal(intimacyMarkName("sun", "cow"), "奶罐");
    assert.equal(intimacyMarkName("crown", "cow"), "钻石");
    assert.equal(intimacyMarkName("star"), "星星");
    assert.equal(intimacyMarkName("crown", "cat"), "皇冠");
    assert.match(intimacyRankLabel(40, "cow"), /1 个云朵/);
    assert.match(intimacyRankLabel(640, "rabbit"), /1 个黄金/);
  });
});
