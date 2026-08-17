import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ file: string }> };

function contentType(name: string) {
  return name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
}

export async function GET(_req: Request, { params }: Params) {
  const { file } = await params;
  const filePath = resolveUploadPath(file);
  if (!filePath) return new NextResponse("Not found", { status: 404 });
  try {
    const buf = await readFile(filePath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType(file),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
