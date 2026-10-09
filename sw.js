const VERSION = "v17";
const CACHE_NAME = `torneo-tkd-${VERSION}`;
const LIBRARY_CACHE_NAME = "torneo-tkd-libraries-v1";

const TIMEOUT_RED_MS = 5000;

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pages/manual.html",
  "./pages/marcador.html",
  "./styles/styles.css",
  "./scripts/tules.js",
  "./scripts/mesa.js",
  "./scripts/storage.js",
  "./scripts/podio.js",
  "./scripts/app.js",
  "./scripts/menu-configuracion.js",
  "./scripts/cronometro.js",
  "./scripts/marcador.js",
  "./scripts/inicializacion.js",
  "./images/icon.png",
  "./images/icon-192.png",
  "./images/icon-512.png",
];

const HOST_LIBRERIAS = "https://cdnjs.cloudflare.com";
const urlsLibrerias = [
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2",
];

async function precachear() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urlsToCache);

  const cacheLibrerias = await caches.open(LIBRARY_CACHE_NAME);
  const resultados = await Promise.allSettled(
    urlsLibrerias.map((url) => cacheLibrerias.add(new Request(url, { cache: "reload" }))),
  );
  resultados.forEach((resultado, indice) => {
    if (resultado.status === "rejected") {
      console.warn("No se pudo cachear la dependencia:", urlsLibrerias[indice]);
    }
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
  const cache = await caches.open(LIBRARY_CACHE_NAME);
  const guardado = await cache.match(request);
  if (guardado) return guardado;

  const resp = await fetch(request);
  if (resp && resp.status === 200) {
    const copia = resp.clone();
    cache.put(request, copia).catch((error) => {
      console.warn("No se pudo guardar dependencia en caché:", error);
    });
  }
  return resp;
}

self.addEventListener("install", (event) => {
  event.waitUntil(precachear().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith("torneo-tkd-") && nombre !== CACHE_NAME && nombre !== LIBRARY_CACHE_NAME)
          .map((nombre) => caches.delete(nombre)),
      ))
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
