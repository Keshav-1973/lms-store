import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    middlewareClientMaxBodySize: 120 * 1024 * 1024,
  },
};

export default nextConfig;
