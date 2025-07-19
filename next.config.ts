import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next",
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unpkg.com",
        pathname: "/leaflet@1.9.4/dist/images/**",
      },
    ],
  },
};

export default nextConfig;
