const CACHE_NAME = "torneo-tkd-v11";

const urlsToCache = [
  "./",
  "./index.html",
  "./pages/manual.html",
  "./styles/styles.css",
  "./scripts/tules.js",
  "./scripts/mesa.js",
  "./scripts/storage.js",
  "./scripts/podio.js",
  "./scripts/app.js",
  "./images/icon.png",
  "./pages/marcador.html",
  "./scripts/cronometro.js",
  "./scripts/marcador.js",
  "./scripts/inicializacion.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caché abierto");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const isSameOrigin = event.request.url.startsWith(self.location.origin);
          const isCdn = event.request.url.startsWith("https://cdnjs.cloudflare.com");

          if (networkResponse && networkResponse.status === 200 && (isSameOrigin || isCdn)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return (
              caches.match("./index.html") ||
              caches.match("./pages/manual.html") ||
              Response.error()
            );
          }
          return caches.match(event.request) || Response.error();
        });
    }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});
