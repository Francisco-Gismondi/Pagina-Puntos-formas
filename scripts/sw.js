const CACHE_NAME = "torneo-tkd-v1";

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
];

// 1. Instalar el Service Worker y guardar los archivos en Caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caché abierto");
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
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
});
