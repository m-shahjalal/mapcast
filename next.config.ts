import { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  distDir: ".next",
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["10.67.219.78"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply headers to service worker
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "text/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Apply headers to any JavaScript files in public
        source: "/(.*\\.js)",
        headers: [
          {
            key: "Content-Type",
            value: "text/javascript; charset=utf-8",
          },
        ],
      },
    ];
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
