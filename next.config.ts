import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/uploads/:file", destination: "/api/uploads/:file" }];
  },
};

export default nextConfig;
