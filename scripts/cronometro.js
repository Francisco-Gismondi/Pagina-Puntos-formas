(function () {
  // Asegúrate de que las comillas del canal estén presentes
  const canalTv = new BroadcastChannel("canal_cronometro_global");

  let tiempoInicio = 0;
  let tiempoAcumulado = 0;
  let enMarcha = false;
  let limiteActualMs = 0;
  let formaActual = "-";
  let animacionPC = null;

  function obtenerLimiteMs(nombreForma) {
    const tiempoTexto = window.TorneoTules?.TULES[nombreForma];
    if (!tiempoTexto) return 0;
    return parseInt(tiempoTexto, 10) * 1000;
  }

  // Si incluirMs es true, muestra mm:ss:ms; si es false, solo mm:ss
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

    // En ejecución: mm:ss.d
    display.innerText = formatearTiempo(transcurrido, false);

    if (limiteMs > 0 && transcurrido >= limiteMs) {
      display.classList.add("tiempo-agotado");
    } else {
      display.classList.remove("tiempo-agotado");
    }

    animacionTV = requestAnimationFrame(actualizarReloj);
  }

  function emitirATV(accion) {
    const comando = {
      accion: accion,
      nombreForma: formaActual,
      limite: limiteActualMs,
      tiempoAcumulado: tiempoAcumulado,
      timestamp: Date.now(),
    };
    canalTv.postMessage(comando);
  }

  function buclePC() {
    if (!enMarcha) return;
    const transcurrido = tiempoAcumulado + (Date.now() - tiempoInicio);

    const displayPC = document.getElementById("displayCronometroPC");
    if (displayPC) {
      // Mientras corre: solo mm:ss
      displayPC.innerText = formatearTiempo(transcurrido, false);
      displayPC.style.color = limiteActualMs > 0 && transcurrido >= limiteActualMs ? "#dc3545" : "white";
    }

    animacionPC = requestAnimationFrame(buclePC);
  }

  function iniciar() {
    if (enMarcha) return;
    tiempoInicio = Date.now();
    enMarcha = true;
    emitirATV("INICIAR");
    if (animacionPC) cancelAnimationFrame(animacionPC);
    buclePC();
  }

  function pausar() {
    if (!enMarcha) return;
    enMarcha = false;
    if (animacionPC) cancelAnimationFrame(animacionPC);
    tiempoAcumulado += Date.now() - tiempoInicio;
    emitirATV("PAUSAR");

    // Al pausar: se revelan las milésimas
    const displayPC = document.getElementById("displayCronometroPC");
    if (displayPC) {
      displayPC.innerText = formatearTiempo(tiempoAcumulado, true);
    }
  }

  function alternar() {
    if (enMarcha) {
      pausar();
    } else {
      iniciar();
    }
  }

  function reiniciar(nombreForma = null) {
    pausar();
    tiempoInicio = 0;
    tiempoAcumulado = 0;
    enMarcha = false;

    if (nombreForma && nombreForma !== "-") {
      formaActual = nombreForma;
      limiteActualMs = obtenerLimiteMs(nombreForma);
    } else {
      formaActual = "-";
      limiteActualMs = 0;
    }

    const displayPC = document.getElementById("displayCronometroPC");
    if (displayPC) {
      displayPC.innerText = "00:00:000";
      displayPC.style.color = "white";
    }

    emitirATV("REINICIAR");
  }

  function abrirTV() {
    const urlParams = new URLSearchParams(window.location.search);
    const idMesa = urlParams.get("mesa");
    window.open(`./pages/marcador.html?mesa=${idMesa}`, "MarcadorTV", "width=800,height=600");
  }

  window.TorneoCronometro = { iniciar, pausar, alternar, reiniciar, abrirTV };
})();
