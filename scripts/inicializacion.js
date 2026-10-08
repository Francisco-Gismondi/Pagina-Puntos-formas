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

    // Si ya había un SW controlando la página, un cambio de controlador
    // significa que hay una versión nueva. Si no, es la primera instalación.
    const teniaControlador = !!navigator.serviceWorker.controller;
    let recargando = false;
    let esperandoReinicio = false;

    function recargarSiEsSeguro() {
      if (recargando) return;

      // Si el cronómetro está en uso, esperar a que se reinicie
      if (window.TorneoCronometro?.estaEnUso?.()) {
        if (!esperandoReinicio) {
          esperandoReinicio = true;
          console.log("Nueva versión lista: se recargará cuando el cronómetro se reinicie");
          const espera = setInterval(() => {
            if (!window.TorneoCronometro?.estaEnUso?.()) {
              clearInterval(espera);
              esperandoReinicio = false;
              recargarSiEsSeguro();
            }
          }, 1000);
        }
        return;
      }

      recargando = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!teniaControlador) return;
      recargarSiEsSeguro();
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(ruta, { updateViaCache: "none" })
        .then((reg) => {
          console.log("ServiceWorker registrado con éxito");

          const buscarActualizacion = () => reg.update().catch(() => {});

          // Al volver a la pestaña o reabrir el navegador en el celular
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") buscarActualizacion();
          });
          window.addEventListener("focus", buscarActualizacion);
          window.addEventListener("online", buscarActualizacion);

          // Por si la página queda abierta mucho tiempo
          setInterval(buscarActualizacion, 5 * 60 * 1000);
        })
        .catch((error) =>
          console.log("Error al registrar el ServiceWorker: ", error),
        );
    });
  }

  actualizarEnlacesInternos();
  registrarServiceWorker();
})();