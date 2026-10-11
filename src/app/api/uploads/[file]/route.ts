import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
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
    const info = await stat(filePath);
    const body = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType(file),
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
