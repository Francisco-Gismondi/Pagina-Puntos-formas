(function () {
  const canalTv = new BroadcastChannel(`canal_cronometro_global`);

  let tiempoInicio = 0;
  let tiempoAcumulado = 0;
  let enMarcha = false;
  let limiteActualMs = 0;
  let formaActual = "-";
  let intervaloPC = null;

  function obtenerLimiteMs(nombreForma) {
    const tiempoTexto = window.TorneoTules?.TULES[nombreForma];
    if (!tiempoTexto) return 0;
    return parseInt(tiempoTexto, 10) * 1000;
  }

  function formatearTiempo(milisegundosTotales) {
    const min = Math.floor(milisegundosTotales / 60000)
      .toString()
      .padStart(2, "0");
    const seg = Math.floor((milisegundosTotales % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    const ms = (milisegundosTotales % 1000).toString().padStart(3, "0");
    return `${min}:${seg}:${ms}`;
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
      displayPC.innerText = formatearTiempo(transcurrido);
      displayPC.style.color = limiteActualMs > 0 && transcurrido >= limiteActualMs ? "#dc3545" : "white";
    }
  }

  function iniciar() {
    if (enMarcha) return;
    tiempoInicio = Date.now();
    enMarcha = true;
    emitirATV("INICIAR");
    if (intervaloPC) clearInterval(intervaloPC);
    intervaloPC = setInterval(buclePC, 47);
  }

  function pausar() {
    if (!enMarcha) return;
    enMarcha = false;
    clearInterval(intervaloPC);
    tiempoAcumulado += Date.now() - tiempoInicio;
    emitirATV("PAUSAR");
    buclePC();
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
