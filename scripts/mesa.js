(function () {
  const PARAMETRO_MESA = "mesa";

  function generarIdMesa() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    const tiempo = Date.now().toString(36);
    const aleatorio = Math.random().toString(36).slice(2, 10);
    return `${tiempo}-${aleatorio}`;
  }

  function abrirNuevaLlave() {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAMETRO_MESA, generarIdMesa());
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  window.TorneoMesa = {
    abrirNuevaLlave,
  };
})();
