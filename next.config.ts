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
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: "http://localhost:4000/:path*",
    },
  ],
};

export default nextConfig;
