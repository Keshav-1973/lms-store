import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shefsolutionsllc.com",
      },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: 120 * 1024 * 1024,
  },
};

export default nextConfig;
