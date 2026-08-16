import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/auth/setup-password"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return PUBLIC_API_PATHS.some((p) => pathname === p);
}

async function isValidToken(token: string | undefined) {
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function getAllowedOrigins() {
  const extra =
    process.env.ALLOWED_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const origins = [process.env.SITE_URL, ...extra].filter(Boolean) as string[];
  if (process.env.NODE_ENV === "development") origins.push("http://localhost:3000");
  return origins;
}

function isOriginAllowed(origin: string | null, referer: string | null) {
  if (process.env.NODE_ENV === "development") return true;
  const allowed = getAllowedOrigins();
  if (!origin && !referer) return true;
  const check = origin ?? referer ?? "";
  return allowed.some((o) => check.startsWith(o));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);
    const authPath = pathname.startsWith("/api/auth/");
    const max = authPath ? 8 : 80;
    const result = checkRateLimit(`${ip}:${authPath ? pathname : "/api"}`, max, 60_000);
    if (!result.allowed) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }
  }

  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    if (!isOriginAllowed(origin, referer)) {
      return NextResponse.json({ error: "请求来源不合法" }, { status: 403 });
    }
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await isValidToken(token);
  const isPublic = isPublicPath(pathname);

  if (!authed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    const response = NextResponse.redirect(url);
    if (token) {
      response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return response;
  }

  if (authed && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
