// // public/sw.js - Minimal service worker for PWA install prompt
// const CACHE_NAME = "pinews-v1";

// // Install event
// self.addEventListener("install", (event) => {
//   console.log("🔧 Service Worker installing...");

//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log("📦 Cache opened");
//       // Cache essential files
//       return cache.addAll(["/", "/manifest.json"]);
//     })
//   );

//   // Force the waiting service worker to become the active service worker
//   self.skipWaiting();
// });

// // Activate event
// self.addEventListener("activate", (event) => {
//   console.log("🚀 Service Worker activating...");

//   event.waitUntil(
//     Promise.all([
//       // Clean up old caches
//       caches.keys().then((cacheNames) => {
//         return Promise.all(
//           cacheNames.map((cacheName) => {
//             if (cacheName !== CACHE_NAME) {
//               console.log("🗑️ Deleting old cache:", cacheName);
//               return caches.delete(cacheName);
//             }
//           })
//         );
//       }),
//       // Take control of all pages
//       self.clients.claim(),
//     ])
//   );

//   console.log("✅ Service Worker activated and ready");
// });

// // Fetch event - basic network-first strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         // If online, return network response
//         return response;
//       })
//       .catch(() => {
//         // If offline, try to serve from cache
//         return caches.match(event.request);
//       })
//   );
// });
