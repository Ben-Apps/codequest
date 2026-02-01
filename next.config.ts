import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Fixes "inferred workspace root" when multiple lockfiles exist
    // (e.g. a pnpm-lock.yaml outside this project), which can break HMR.
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
