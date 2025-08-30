import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MapCast | update with latest global news",
    short_name: "MapCast",
    description:
      "MapCast is top news app that keeps you updated with the latest global news. Stay informed and stay ahead of the news.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities"],
    lang: "en",
    dir: "ltr",
    theme_color: "rgba(0,0,0,0.3)",
    background_color: "rgba(0,0,0,0.3)",
    icons: [
      // Regular icons (purpose: "any" is default)
      {
        sizes: "48x48",
        src: "/icons/icon_x48.png", // Create regular versions of your icons
        type: "image/png",
      },
      {
        sizes: "72x72",
        src: "/icons/icon_x72.png",
        type: "image/png",
      },
      {
        sizes: "96x96",
        src: "/icons/icon_x96.png",
        type: "image/png",
      },
      {
        sizes: "128x128",
        src: "/icons/icon_x128.png",
        type: "image/png",
      },
      {
        sizes: "192x192",
        src: "/icons/icon_x192.png",
        type: "image/png",
      },
      {
        sizes: "384x384",
        src: "/icons/icon_x384.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icons/icon_x512.png",
        type: "image/png",
      },
      // Maskable icons
      {
        purpose: "maskable",
        sizes: "48x48",
        src: "/icons/maskable_icon_x48.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "72x72",
        src: "/icons/maskable_icon_x72.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "96x96",
        src: "/icons/maskable_icon_x96.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "128x128",
        src: "/icons/maskable_icon_x128.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "192x192",
        src: "/icons/maskable_icon_x192.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "384x384",
        src: "/icons/maskable_icon_x384.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/maskable_icon_x512.png",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Quick Start",
        short_name: "Start",
        description: "Jump right into the app",
        url: "/",
        icons: [{ src: "/icons/icon_x192.png", sizes: "192x192" }],
      },
    ],
  };
}