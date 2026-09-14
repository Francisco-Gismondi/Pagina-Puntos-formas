const CACHE_NAME = "torneo-tkd-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./pages/manual.html",
  "./styles/base.css",
  "./styles/layout.css",
  "./styles/components.css",
  "./styles/podio.css",
  "./styles/print.css",
  "./styles/manual.css",
  "./scripts/tules.js",
  "./scripts/storage.js",
  "./scripts/podio.js",
  "./scripts/app.js",
  "./images/icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caché abierto v4");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    // El ignoreSearch: true es LA clave para que las URLs con ?mesa= funcionen offline
    caches
      .match(event.request, { ignoreSearch: true })
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            const isSameOrigin = event.request.url.startsWith(
              self.location.origin,
            );
            const isCdn = event.request.url.startsWith(
              "https://cdnjs.cloudflare.com",
            );

            if (
              networkResponse &&
              networkResponse.status === 200 &&
              (isSameOrigin || isCdn)
            ) {
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
                caches.match("./index.html", { ignoreSearch: true }) ||
                caches.match("./pages/manual.html", { ignoreSearch: true }) ||
                Response.error()
              );
            }
            return (
              caches.match(event.request, { ignoreSearch: true }) ||
              Response.error()
            );
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
