import type { NextConfig } from "next";

function allowedDevOriginsFromEnv(): string[] {
  const hosts = new Set<string>();
  for (const raw of [
    process.env.SITE_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(",") ?? []),
  ]) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      hosts.add(new URL(value).hostname);
    } catch {
      hosts.add(value.replace(/:\d+$/, ""));
    }
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedDevOriginsFromEnv(),
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  async rewrites() {
    return [{ source: "/uploads/:file", destination: "/api/uploads/:file" }];
  },
};

export default nextConfig;
