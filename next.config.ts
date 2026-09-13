import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  async rewrites() {
    return [{ source: "/uploads/:file", destination: "/api/uploads/:file" }];
  },
};

export default nextConfig;
