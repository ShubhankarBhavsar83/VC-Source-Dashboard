import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/x-data-grid"],
  },
};

export default nextConfig;