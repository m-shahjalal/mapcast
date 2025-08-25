/// <reference lib="webworker" />

import type { PrecacheEntry } from "@serwist/precaching";
import { CacheFirst, StaleWhileRevalidate } from "@serwist/strategies";
import { installSerwist } from "@serwist/sw";

declare const self: DedicatedWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  registration: ServiceWorkerRegistration;
  clients: any;
  addEventListener: (type: string, listener: (event: any) => void) => void;
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true,
  runtimeCaching: [
    // Aggressively cache all app routes and pages
    {
      matcher: ({ request }: { request: Request }) => {
        return request.mode === "navigate";
      },
      handler: new CacheFirst({
        cacheName: "pages-cache",
      }),
    },
    // Cache static assets aggressively
    {
      matcher:
        /\.(?:js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|svg|gif|webp)$/i,
      handler: new CacheFirst({
        cacheName: "static-assets",
      }),
    },
    // Cache Next.js specific files
    {
      matcher: /\/_next\/static\/.*/,
      handler: new CacheFirst({
        cacheName: "next-static",
      }),
    },
    // Cache Next.js data files
    {
      matcher: /\/_next\/data\/.*/,
      handler: new StaleWhileRevalidate({
        cacheName: "next-data",
      }),
    },
  ],
});

// Keep your existing push notification functionality
self.addEventListener("push", (event: any) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: "/badge.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
      url: data.url || "/",
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event: any) => {
  console.info("Notification click received.");
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
