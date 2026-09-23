(function () {
  const canalTv = new BroadcastChannel("canal_cronometro_global");

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
    const display = document.getElementById("displayTV");
    const formaDisplay = document.getElementById("nombreFormaTV");

    limiteMs = Number(comando.limite) || 0;

    if (comando.accion === "INICIAR") {
      tiempoInicio = Number(comando.timestamp) || Date.now();
      tiempoAcumulado = Number(comando.tiempoAcumulado) || 0;
      enMarcha = true;

      if (animacionTV) cancelAnimationFrame(animacionTV);
      actualizarReloj();
    } else if (comando.accion === "PAUSAR") {
      enMarcha = false;

      if (animacionTV) cancelAnimationFrame(animacionTV);
      tiempoAcumulado = Number(comando.tiempoAcumulado) || 0;

      // Al pausar: muestra el tiempo final exacto con milésimas
      if (display) display.innerText = formatearTiempo(tiempoAcumulado, true);
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

  canalTv.onmessage = function (event) {
    manejarComando(event.data);
  };
})();
