const VERSION = "v12";
const CACHE_NAME = `torneo-tkd-${VERSION}`;

const TIMEOUT_RED_MS = 5000;

const urlsToCache = [
  "./",
  "./index.html",
  "./pages/manual.html",
  "./pages/marcador.html",
  "./styles/styles.css",
  "./scripts/tules.js",
  "./scripts/mesa.js",
  "./scripts/storage.js",
  "./scripts/podio.js",
  "./scripts/app.js",
  "./scripts/cronometro.js",
  "./scripts/marcador.js",
  "./scripts/inicializacion.js",
  "./images/icon.png",
];

const HOST_LIBRERIAS = "https://cdnjs.cloudflare.com";

async function precachear() {
  const cache = await caches.open(CACHE_NAME);
  const resultados = await Promise.allSettled(urlsToCache.map((url) => cache.add(new Request(url, { cache: "reload" }))));
  resultados.forEach((r, i) => {
    if (r.status === "rejected") console.warn("No se pudo cachear:", urlsToCache[i]);
  });
}

function claveDeCache(request) {
  if (request.mode !== "navigate") return request;
  const u = new URL(request.url);
  return new Request(u.origin + u.pathname);
}

async function redPrimero(request) {
  const desdeRed = fetch(request, { cache: "no-cache" }).then((resp) => {
    if (resp && resp.status === 200) {
      const copia = resp.clone();
      caches.open(CACHE_NAME).then((c) => c.put(claveDeCache(request), copia));
    }
    return resp;
  });

  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_RED_MS));

  try {
    return await Promise.race([desdeRed, timeout]);
  } catch (error) {
    desdeRed.catch(() => {}); // si la red responde tarde, igual actualiza el caché

    const guardado = await caches.match(request, { ignoreSearch: true });
    if (guardado) return guardado;

    if (request.mode === "navigate") {
      const inicio = await caches.match("./index.html");
      if (inicio) return inicio;
    }

    return desdeRed;
  }
}

async function cachePrimero(request) {
  const guardado = await caches.match(request);
  if (guardado) return guardado;

  const resp = await fetch(request);
  if (resp && resp.status === 200) {
    const copia = resp.clone();
    caches.open(CACHE_NAME).then((c) => c.put(request, copia));
  }
  return resp;
}

self.addEventListener("install", (event) => {
  event.waitUntil(precachear());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(redPrimero(request));
  } else if (request.url.startsWith(HOST_LIBRERIAS)) {
    event.respondWith(cachePrimero(request));
  }
});
