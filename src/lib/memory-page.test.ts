import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampMemoryPage, memoryPageRange, mergeMemoryPages, type MemoryCard } from "./memory-paging";

describe("clampMemoryPage", () => {
  it("keeps a single empty page", () => {
    assert.deepEqual(clampMemoryPage(0, 0), { page: 0, pageCount: 1 });
    assert.deepEqual(clampMemoryPage(0, 4), { page: 0, pageCount: 1 });
  });

  it("uses five memories per page", () => {
    assert.deepEqual(clampMemoryPage(5, 0), { page: 0, pageCount: 1 });
    assert.deepEqual(clampMemoryPage(6, 0), { page: 0, pageCount: 2 });
    assert.deepEqual(clampMemoryPage(12, 9), { page: 2, pageCount: 3 });
  });

  it("jumps to the page that holds an around index", () => {
    assert.deepEqual(clampMemoryPage(20, 0, 0), { page: 0, pageCount: 4 });
    assert.deepEqual(clampMemoryPage(20, 0, 5), { page: 1, pageCount: 4 });
    assert.deepEqual(clampMemoryPage(20, 0, 19), { page: 3, pageCount: 4 });
  });
});

describe("memoryPageRange", () => {
  it("loads one page of five", () => {
    assert.deepEqual(memoryPageRange(20, 1), {
      page: 1,
      pageCount: 4,
      skip: 5,
      take: 5,
    });
  });

  it("loads from the start through a later page", () => {
    assert.deepEqual(memoryPageRange(20, 2, -1, true), {
      page: 2,
      pageCount: 4,
      skip: 0,
      take: 15,
    });
  });

  it("loads from the start through an around index", () => {
    assert.deepEqual(memoryPageRange(20, 0, 19, true), {
      page: 3,
      pageCount: 4,
      skip: 0,
      take: 20,
    });
  });
});

describe("mergeMemoryPages", () => {
  const card = (id: string): MemoryCard => ({
    id,
    title: id,
    content: null,
    category: "旅行",
    date: "2026-01-01",
    images: [],
    imageCount: 0,
    author: "航羽",
    placeId: null,
    placeName: null,
  });

  it("appends unseen memories", () => {
    const merged = mergeMemoryPages([card("a"), card("b")], [card("b"), card("c")]);
    assert.deepEqual(
      merged.map((m) => m.id),
      ["a", "b", "c"],
    );
  });

  it("keeps the previous array when nothing new arrives", () => {
    const prev = [card("a")];
    assert.equal(mergeMemoryPages(prev, [card("a")]), prev);
  });
});
