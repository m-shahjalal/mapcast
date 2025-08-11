import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PiNews | update with latest global news",
    short_name: "PiNews",
    description:
      "PiNews is top news app that keeps you updated with the latest global news. Stay informed and stay ahead of the news.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
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
