import os from "os";
import type { NextConfig } from "next";

function localIpv4Hostnames(): string[] {
  const hosts = new Set<string>();
  for (const ifaces of Object.values(os.networkInterfaces())) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if ((iface.family === "IPv4" || iface.family === 4) && !iface.internal) {
        hosts.add(iface.address);
      }
    }
  }
  return [...hosts];
}

function allowedDevOriginsFromEnv(): string[] {
  const hosts = new Set<string>(["localhost", "127.0.0.1", ...localIpv4Hostnames()]);
  const site = process.env.SITE_URL?.trim();
  if (site) {
    try {
      hosts.add(new URL(site).hostname);
    } catch {
      /* ignore */
    }
  }
  for (const raw of process.env.DEV_ALLOWED_HOSTS?.split(",") ?? []) {
    const h = raw.trim();
    if (h) hosts.add(h);
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
