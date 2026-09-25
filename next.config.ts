import type { NextConfig } from "next";

function allowedDevOriginsFromEnv(): string[] {
  const site = process.env.SITE_URL?.trim();
  if (!site) return [];
  try {
    return [new URL(site).hostname];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedDevOriginsFromEnv(),
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  async rewrites() {
    return [{ source: "/uploads/:file", destination: "/api/uploads/:file" }];
  },
};

export default nextConfig;
