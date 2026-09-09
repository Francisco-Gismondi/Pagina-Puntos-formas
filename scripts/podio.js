(function () {
  function calcularPodio(contadorCompetidores) {
    const competidores = [];

    for (let i = 1; i <= contadorCompetidores; i++) {
      const nombreInput = document.getElementById(`nombre_${i}`);
      const totalCelda = document.getElementById(`total_${i}`);

      if (nombreInput && totalCelda) {
        const nombre = nombreInput.value.trim() || `Competidor ${i}`;
        const total = parseFloat(totalCelda.innerText) || 0;
        if (total > 0) {
          competidores.push({ id: i, nombre, puntaje: total });
        }
      }
    }

    for (let i = 1; i <= contadorCompetidores; i++) {
      const btnDesempate = document.getElementById(`btn_desempate_${i}`);
      const fila3 = document.getElementById(`fila_3_${i}`);

      if (btnDesempate && fila3) {
        if (fila3.style.display !== "none") {
          btnDesempate.style.display = "block";
          btnDesempate.innerHTML =
            '<i class="fas fa-times-circle"></i> Quitar Desempate';
        } else {
          btnDesempate.style.display = "none";
          btnDesempate.innerHTML =
            '<i class="fas fa-scale-balanced"></i> Desempate';
        }
      }
    }

    competidores.sort((a, b) => b.puntaje - a.puntaje);

    const podioDOM = document.getElementById("podioContainer");
    const seccionPodio = document.getElementById("seccionPodio");
    const accionesPodio = document.getElementById("accionesPodio");
    podioDOM.innerHTML = "";

    if (!competidores.length) {
      seccionPodio.style.display = "none";
      if (accionesPodio) accionesPodio.style.display = "none";
      return;
    }

    seccionPodio.style.display = "block";
    if (accionesPodio) accionesPodio.style.display = "none";

    const rangos = [];
    let rangoActual = {
      puntaje: competidores[0].puntaje,
      competidores: [competidores[0]],
    };

    for (let i = 1; i < competidores.length; i++) {
      if (competidores[i].puntaje === rangoActual.puntaje) {
        rangoActual.competidores.push(competidores[i]);
      } else {
        rangos.push(rangoActual);
        rangoActual = {
          puntaje: competidores[i].puntaje,
          competidores: [competidores[i]],
        };
      }
    }

    rangos.push(rangoActual);

    let huboEmpate = false;

    for (const rango of rangos) {
      if (rango.puntaje > 0 && rango.competidores.length > 1) {
        huboEmpate = true;
        rango.competidores.forEach((comp) => {
          const btn = document.getElementById(`btn_desempate_${comp.id}`);
          if (btn) btn.style.display = "block";
        });
      }
    }

    if (accionesPodio) {
      accionesPodio.style.display = huboEmpate ? "block" : "none";
    }

    function armarEscalon(rango, claseCss, titulo) {
      const esEmpate = rango.competidores.length > 1;
      const nombresHTML = rango.competidores
        .map((c) => c.nombre)
        .join("<br><small><i>y</i></small><br>");
      const alerta = esEmpate
        ? '<div class="alerta-empate">⚠️ Desempate</div>'
        : "";

      return `
        <div class="puesto ${claseCss}">
          ${titulo}<br>
          <span class="nombres-podio">${nombresHTML}</span>
          <span>${rango.puntaje} pts</span>
          ${alerta}
        </div>
      `;
    }

    const htmlOro = rangos[0] ? armarEscalon(rangos[0], "oro", "1°") : "";
    const indicePlata = rangos[0] && rangos[0].competidores.length > 1 ? -1 : 1;
    const indiceBronce =
      indicePlata === 1
        ? rangos[1] && rangos[1].competidores.length > 1
          ? -1
          : 2
        : rangos[0].competidores.length > 2
          ? -1
          : 1;

    const htmlPlata =
      indicePlata !== -1 && rangos[indicePlata]
        ? armarEscalon(rangos[indicePlata], "plata", "2°")
        : "";
    const htmlBronce =
      indiceBronce !== -1 && rangos[indiceBronce]
        ? armarEscalon(rangos[indiceBronce], "bronce", "3°")
        : "";

    podioDOM.innerHTML = htmlOro + htmlPlata + htmlBronce;

    setTimeout(() => {
      const elOro = document.querySelector(".oro");
      const elPlata = document.querySelector(".plata");
      const elBronce = document.querySelector(".bronce");

      const altoBronce = elBronce ? elBronce.scrollHeight : 0;
      const altoPlata = elPlata ? elPlata.scrollHeight : 0;
      const altoOro = elOro ? elOro.scrollHeight : 0;

      const finalBronce = Math.max(95, altoBronce);
      const finalPlata = Math.max(130, altoPlata, finalBronce + 35);
      const finalOro = Math.max(170, altoOro, finalPlata + 40);

      if (elBronce) elBronce.style.minHeight = `${finalBronce}px`;
      if (elPlata) elPlata.style.minHeight = `${finalPlata}px`;
      if (elOro) elOro.style.minHeight = `${finalOro}px`;
    }, 10);
  }

  window.TorneoPodio = { calcularPodio };
})();
