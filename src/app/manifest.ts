import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Install App | Get the Best Experience",
    short_name: "InstallApp",
    description:
      "A modern progressive web application with the best user experience",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/manifest-icon-512.maskable.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Quick Start",
        short_name: "Start",
        description: "Jump right into the app",
        url: "/",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
    ],
  };
}
