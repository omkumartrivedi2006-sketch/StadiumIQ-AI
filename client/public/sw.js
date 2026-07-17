const CACHE_NAME = "stadium-iq-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/icon-192.svg",
  "/icon-512.svg",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static shell");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET requests and dev hot module replacement requests
  if (e.request.method !== "GET" || url.pathname.includes("@vite") || url.pathname.includes("hot-update")) {
    return;
  }

  // Handle API caching with a Network-First falling back to Cache strategy
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // If response is valid, clone it and store in cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return JSON indicating offline status for API requests
            return new Response(
              JSON.stringify({
                success: false,
                message: "You are currently offline. This action requires internet connection.",
                offline: true
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Navigation requests (serving Single Page Application shell if offline)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      })
    );
    return;
  }

  // Static Assets & Third-party requests (Cache-First strategy)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      });
    })
  );
});
