import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { GET } from "../app/api/uploads/[file]/route";
import { resolveUploadPath, safeUploadFilename } from "./uploads";

describe("safeUploadFilename", () => {
  it("accepts generated upload names", () => {
    assert.equal(
      safeUploadFilename("1786894317093-ek2wk8.jpg"),
      "1786894317093-ek2wk8.jpg",
    );
    assert.equal(safeUploadFilename("photo.png"), "photo.png");
  });

  it("rejects path traversal and unexpected types", () => {
    assert.equal(safeUploadFilename("../secret.jpg"), null);
    assert.equal(safeUploadFilename("..\\secret.jpg"), null);
    assert.equal(safeUploadFilename("a/b.jpg"), null);
    assert.equal(safeUploadFilename("a\\b.jpg"), null);
    assert.equal(safeUploadFilename("note.txt"), null);
    assert.equal(safeUploadFilename(""), null);
  });
});

describe("resolveUploadPath", () => {
  it("stays inside the upload directory", () => {
    const resolved = resolveUploadPath("1786894317093-ek2wk8.jpg");
    assert.ok(resolved);
    const dir = path.dirname(resolved);
    assert.equal(path.basename(dir), "uploads");
    assert.equal(path.basename(resolved), "1786894317093-ek2wk8.jpg");
  });

  it("does not resolve unsafe names", () => {
    assert.equal(resolveUploadPath("../next.config.ts"), null);
  });
});

describe("GET /api/uploads/[file]", () => {
  it("serves an existing uploaded jpeg", async () => {
    const file = "1786894317093-ek2wk8.jpg";
    const filePath = resolveUploadPath(file);
    assert.ok(filePath);
    const onDisk = await readFile(filePath);
    const res = await GET(new Request("http://localhost/uploads/" + file), {
      params: Promise.resolve({ file }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "image/jpeg");
    const body = Buffer.from(await res.arrayBuffer());
    assert.equal(body.length, onDisk.length);
  });

  it("returns 404 for a missing upload", async () => {
    const res = await GET(new Request("http://localhost/uploads/missing.jpg"), {
      params: Promise.resolve({ file: "missing.jpg" }),
    });
    assert.equal(res.status, 404);
  });
});
