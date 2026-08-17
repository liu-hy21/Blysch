import path from "node:path";

const UPLOAD_NAME_RE = /^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png)$/i;

export function getUploadDir() {
  const raw = process.env.UPLOAD_DIR?.trim();
  if (raw) return path.resolve(raw);
  return path.join(process.cwd(), "uploads");
}

export function safeUploadFilename(name: string): string | null {
  if (!name || name.length > 120) return null;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) return null;
  if (!UPLOAD_NAME_RE.test(name)) return null;
  return name;
}

export function resolveUploadPath(name: string): string | null {
  const safe = safeUploadFilename(name);
  if (!safe) return null;
  const dir = getUploadDir();
  const resolved = path.resolve(dir, safe);
  const relative = path.relative(dir, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}
