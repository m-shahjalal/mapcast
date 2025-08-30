import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  SerwistGlobalConfig,
  RuntimeCaching,
} from "serwist";
import { Serwist, CacheFirst, NetworkFirst } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Custom runtime caching with external resources - properly typed
const customRuntimeCaching: RuntimeCaching[] = [
  // Handle ArcGIS map tiles
  {
    matcher: ({ request }) => {
      return (
        request.url.includes("server.arcgisonline.com") ||
        request.url.includes("arcgis.com")
      );
    },
    handler: new CacheFirst({
      cacheName: "arcgis-tiles",
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Handle OpenStreetMap tiles
  {
    matcher: ({ request }) => {
      return (
        request.url.includes("tile.openstreetmap.org") ||
        request.url.includes("tile.openstreetmap.fr")
      );
    },
    handler: new CacheFirst({
      cacheName: "osm-tiles",
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Handle CartoDB/CARTO tiles
  {
    matcher: ({ request }) => {
      return request.url.includes("basemaps.cartocdn.com");
    },
    handler: new CacheFirst({
      cacheName: "carto-tiles",
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Handle OpenTopoMap tiles
  {
    matcher: ({ request }) => {
      return request.url.includes("tile.opentopomap.org");
    },
    handler: new CacheFirst({
      cacheName: "topo-tiles",
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Handle Google Tag Manager and Analytics
  {
    matcher: ({ request }) => {
      return (
        request.url.includes("www.googletagmanager.com") ||
        request.url.includes("www.google-analytics.com") ||
        request.url.includes("analytics.google.com")
      );
    },
    handler: new NetworkFirst({
      cacheName: "google-analytics",
      networkTimeoutSeconds: 3,
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Include default cache strategies
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customRuntimeCaching,
});

// Add custom fetch event handling for external resources
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Handle all map tile providers with proper CORS
  const isMapTile =
    url.hostname.includes("arcgisonline.com") ||
    url.hostname.includes("arcgis.com") ||
    url.hostname.includes("tile.openstreetmap.org") ||
    url.hostname.includes("tile.openstreetmap.fr") ||
    url.hostname.includes("basemaps.cartocdn.com") ||
    url.hostname.includes("tile.opentopomap.org");

  if (isMapTile) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request.clone(), {
          mode: "cors",
          credentials: "omit",
          headers: {
            Accept: "image/png,image/jpeg,image/webp,image/*,*/*",
          },
        })
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              // Determine cache name based on provider
              let cacheName = "map-tiles";
              if (url.hostname.includes("arcgis")) cacheName = "arcgis-tiles";
              else if (url.hostname.includes("openstreetmap"))
                cacheName = "osm-tiles";
              else if (url.hostname.includes("cartocdn"))
                cacheName = "carto-tiles";
              else if (url.hostname.includes("opentopomap"))
                cacheName = "topo-tiles";

              caches.open(cacheName).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch((error) => {
            console.log("Map tile fetch failed:", error);
            // Return a transparent 1x1 PNG as fallback for missing tiles
            const transparentPng =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=";
            return fetch(transparentPng);
          });
      })
    );
    return;
  }

  // Let Serwist handle other requests - this is important!
  // Don't interfere with Serwist's handling of other requests
});

serwist.addEventListeners();
