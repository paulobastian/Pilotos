import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Thumbnails and favicons come from arbitrary third-party domains, so we
    // allow any https host. Optimisation still runs through the Next.js loader.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    dangerouslyAllowLocalIP: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
