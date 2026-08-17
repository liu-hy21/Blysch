import { mkdir, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireApiCouple, jsonError } from "@/lib/api";
import { getUploadDir, resolveUploadPath } from "@/lib/uploads";

export async function POST(req: Request) {
  const ctx = await requireApiCouple();
  if ("error" in ctx) return ctx.error;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("请选择图片", 400);
  }
  if (file.size > 4 * 1024 * 1024) return jsonError("图片过大", 400);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.type.includes("png") ? "png" : "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dest = resolveUploadPath(name);
  if (!dest) return jsonError("无法保存图片", 500);
  await mkdir(getUploadDir(), { recursive: true });
  await writeFile(dest, buf);
  return NextResponse.json({ url: `/uploads/${name}` });
}
