import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

const nextConfig = async (phase: string): Promise<NextConfig> => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  
  const config: NextConfig = {
    distDir: ".next",
    productionBrowserSourceMaps: false,
    experimental: {
      viewTransition: true,
    },
    transpilePackages: ["next-mdx-remote"],
    eslint: {
      ignoreDuringBuilds: true,
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            // Add CSP for all pages to allow external resources
            {
              key: "Content-Security-Policy",
              value: [
                "default-src 'self'",
                // Allow connections to external services (map tiles + analytics)
                isDev 
                  ? "connect-src 'self' https: http: ws: wss:" 
                  : "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://region1.analytics.google.com https://analytics.google.com https://server.arcgisonline.com https://*.arcgisonline.com https://services.arcgisonline.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://tile.opentopomap.org https://*.tile.openstreetmap.fr",
                // Allow scripts from external sources
                isDev 
                  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:" 
                  : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://tagmanager.google.com",
                // Allow images from external sources (important for map tiles)
                "img-src 'self' data: blob: https://server.arcgisonline.com https://*.arcgisonline.com https://services.arcgisonline.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://tile.opentopomap.org https://*.tile.openstreetmap.fr",
                "style-src 'self' 'unsafe-inline'",
                "font-src 'self' data:",
                "worker-src 'self' blob:",
                "child-src 'self' blob:",
              ].join('; ')
            },
          ],
        },
        {
          source: "/sw.js",
          headers: [
            {
              key: "Content-Type",
              value: "application/javascript; charset=utf-8",
            },
            {
              key: "Cache-Control",
              value: "no-cache, no-store, must-revalidate",
            },
            // Updated CSP for service worker to allow external fetches
            {
              key: "Content-Security-Policy",
              value: isDev 
                ? "default-src 'self'; script-src 'self' 'unsafe-eval'; connect-src 'self' https: http:" 
                : "default-src 'self'; script-src 'self' 'unsafe-eval'; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://region1.analytics.google.com https://analytics.google.com https://server.arcgisonline.com https://*.arcgisonline.com https://services.arcgisonline.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://tile.opentopomap.org https://*.tile.openstreetmap.fr",
            },
          ],
        },
      ];
    },
    images: {
      remotePatterns: [
        {
          hostname: "**",
          port: "",
          pathname: "**",
        },
      ],
    },
  };

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
      cacheOnNavigation: true,
    });
    return withSerwist(config);
  }

  return config;
};

export default nextConfig;