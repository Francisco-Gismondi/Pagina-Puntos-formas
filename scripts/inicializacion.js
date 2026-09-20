(function () {
  function conservarParametros(path) {
    const url = new URL(path, window.location.href);
    const params = new URLSearchParams(window.location.search);

    for (const [key, value] of params.entries()) {
      url.searchParams.set(key, value);
    }

    return `${url.pathname}${url.search}`;
  }

  function actualizarEnlacesInternos() {
    document.querySelectorAll("a[href]").forEach((enlace) => {
      const destino = new URL(enlace.href, window.location.href);
      if (destino.origin !== window.location.origin) return;

      enlace.href = conservarParametros(enlace.getAttribute("href"));
    });
  }

  function registrarServiceWorker() {
    const script = document.currentScript;
    const ruta = script?.dataset.serviceWorker;

    if (!ruta || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(ruta)
        .then(() => console.log("ServiceWorker registrado con éxito"))
        .catch((error) =>
          console.log("Error al registrar el ServiceWorker: ", error),
        );
    });
  }

  actualizarEnlacesInternos();
  registrarServiceWorker();
})();
