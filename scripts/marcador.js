(function () {
  const parametros = new URLSearchParams(window.location.search);
  const idMesa = parametros.get("mesa") || "default";
  const canalTv = typeof BroadcastChannel === "function"
    ? new BroadcastChannel(`canal_cronometro_${idMesa}`)
    : null;

  let enMarcha = false;
  let tiempoInicio = 0;
  let tiempoAcumulado = 0;
  let limiteMs = 0;
  let animacionTV = null;

  function formatearTiempo(milisegundosTotales, incluirMs = false) {
    const min = Math.floor(milisegundosTotales / 60000)
      .toString()
      .padStart(2, "0");
    const seg = Math.floor((milisegundosTotales % 60000) / 1000)
      .toString()
      .padStart(2, "0");

    if (!incluirMs) {
      const decima = Math.floor((milisegundosTotales % 1000) / 100);
      return `${min}:${seg}.${decima}`;
    }

    const ms = (milisegundosTotales % 1000).toString().padStart(3, "0");
    return `${min}:${seg}:${ms}`;
  }

  function actualizarReloj() {
    if (!enMarcha) return;

    const transcurrido = tiempoAcumulado + (Date.now() - tiempoInicio);
    const display = document.getElementById("displayTV");

    if (!display) return;

    // Mientras corre: solo mm:ss para el estadio
    display.innerText = formatearTiempo(transcurrido, false);

    if (limiteMs > 0 && transcurrido >= limiteMs) {
      display.classList.add("tiempo-agotado");
    } else {
      display.classList.remove("tiempo-agotado");
    }

    animacionTV = requestAnimationFrame(actualizarReloj);
  }

  function manejarComando(comando) {
    if (!comando || typeof comando !== "object") return;
    const display = document.getElementById("displayTV");
    const formaDisplay = document.getElementById("nombreFormaTV");

    limiteMs = Number(comando.limite) || 0;

    if (comando.accion === "INICIAR" || comando.accion === "ESTADO") {
      tiempoInicio = Number(comando.timestamp) || Date.now();
      tiempoAcumulado = Number(comando.tiempoAcumulado) || 0;
      enMarcha = comando.accion === "INICIAR" || comando.enMarcha === true;
      if (formaDisplay) formaDisplay.innerText = comando.nombreForma || "-";

      if (animacionTV) cancelAnimationFrame(animacionTV);
      if (enMarcha) {
        actualizarReloj();
      } else {
        if (display) display.innerText = formatearTiempo(tiempoAcumulado, true);
        if (display && limiteMs > 0 && tiempoAcumulado >= limiteMs) {
          display.classList.add("tiempo-agotado");
        } else {
          display?.classList.remove("tiempo-agotado");
        }
      }
    } else if (comando.accion === "PAUSAR") {
      enMarcha = false;

      if (animacionTV) cancelAnimationFrame(animacionTV);
      tiempoAcumulado = Number(comando.tiempoAcumulado) || 0;

      // Al pausar: muestra el tiempo final exacto con milésimas
      if (display) display.innerText = formatearTiempo(tiempoAcumulado, true);
      if (formaDisplay) formaDisplay.innerText = comando.nombreForma || "-";
    } else if (comando.accion === "REINICIAR") {
      enMarcha = false;

      if (animacionTV) cancelAnimationFrame(animacionTV);
      tiempoAcumulado = 0;

      if (display) {
        display.innerText = "00:00:000";
        display.classList.remove("tiempo-agotado");
      }

      if (formaDisplay) {
        formaDisplay.innerText = comando.nombreForma || "-";
      }
    }
  }

  canalTv?.addEventListener("message", (event) => manejarComando(event.data));
  canalTv?.postMessage({ accion: "SOLICITAR_ESTADO" });
})();
