import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Raised from the 1MB default so profile/cover photo uploads (validated
  // server-side up to 5MB in updateShopImage) can actually reach the action.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
