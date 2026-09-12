(function () {
  function calcularPodio(contadorCompetidores) {
    const competidores = [];

    for (let i = 1; i <= contadorCompetidores; i++) {
      const nombreInput = document.getElementById(`nombre_${i}`);
      const subtotal1 = document.getElementById(`subtotal_${i}_1`);
      const subtotal2 = document.getElementById(`subtotal_${i}_2`);
      const subtotal3 = document.getElementById(`subtotal_${i}_3`);

      if (nombreInput) {
        const nombre = nombreInput.value.trim() || `Competidor ${i}`;
        const base =
          (parseFloat(subtotal1?.innerText) || 0) +
          (parseFloat(subtotal2?.innerText) || 0);
        const desempate = parseFloat(subtotal3?.innerText) || 0;

        if (base > 0 || desempate > 0) {
          competidores.push({
            id: i,
            nombre,
            base,
            desempate,
          });
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

    competidores.sort((a, b) => {
      if (b.base !== a.base) return b.base - a.base;
      if (b.desempate !== a.desempate) return b.desempate - a.desempate;
      return 0;
    });

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
      puntaje: competidores[0].base,
      desempate: competidores[0].desempate,
      competidores: [competidores[0]],
    };

    for (let i = 1; i < competidores.length; i++) {
      const esMismoGrupo =
        competidores[i].base === rangoActual.puntaje &&
        competidores[i].desempate === rangoActual.desempate;

      if (esMismoGrupo) {
        rangoActual.competidores.push(competidores[i]);
      } else {
        rangos.push(rangoActual);
        rangoActual = {
          puntaje: competidores[i].base,
          desempate: competidores[i].desempate,
          competidores: [competidores[i]],
        };
      }
    }

    rangos.push(rangoActual);

    const gruposPodio = (() => {
      const gruposValidos = [];
      // Solo nos importan los primeros 3 puestos reales para activar desempates
      let lugaresOcupados = 0;
      for (const rango of rangos) {
        if (lugaresOcupados >= 3) break;

        if (rango.competidores.length > 1) {
          gruposValidos.push(rango);
        }
        lugaresOcupados += rango.competidores.length;
      }
      return gruposValidos;
    })();

    const idsEmpatePodio = new Set();
    gruposPodio.forEach((rango) => {
      rango.competidores.forEach((comp) => idsEmpatePodio.add(comp.id));
    });

    // 3. (El bucle de visibilidad de botones se mantiene igual aquí)
    for (let i = 1; i <= contadorCompetidores; i++) {
      const btn = document.getElementById(`btn_desempate_${i}`);
      const fila3 = document.getElementById(`fila_3_${i}`);
      const tdNombre = document.getElementById(`celda_nombre_${i}`);
      const tdTotal = document.getElementById(`total_${i}`);
      const perteneceAlPodioEmpatado = idsEmpatePodio.has(i);
      const filaActiva =
        (fila3 && fila3.style.display !== "none") ||
        (fila3 && fila3.dataset.activo === "true");

      if (btn) {
        // Se muestra si hay empate real o si la fila ya fue forzada a abrirse
        btn.style.display =
          perteneceAlPodioEmpatado || filaActiva ? "block" : "none";

        // Si la fila está visible (por empate o manual), el botón es para CANCELAR
        if (perteneceAlPodioEmpatado || filaActiva) {
          btn.innerHTML =
            '<i class="fas fa-times-circle"></i> Quitar Desempate';
          btn.classList.add("btn-peligro"); // Opcional: ponerlo en rojo para que denote "borrar"
        } else {
          btn.innerHTML = '<i class="fas fa-scale-balanced"></i> Desempate';
          btn.classList.remove("btn-peligro");
        }
      }

      if (fila3) {
        if (perteneceAlPodioEmpatado || filaActiva) {
          fila3.style.display = "table-row";
          if (tdNombre) tdNombre.rowSpan = 3;
          if (tdTotal) tdTotal.rowSpan = 3;
        } else {
          fila3.style.display = "none";
          if (tdNombre) tdNombre.rowSpan = 2;
          if (tdTotal) tdTotal.rowSpan = 2;
        }
      }
    }

    if (accionesPodio) {
      accionesPodio.style.display = gruposPodio.length > 0 ? "block" : "none";
    }

    function armarEscalon(rango, claseCss, titulo, etiquetaPosicion, detalle) {
      // (Esta función se mantiene exactamente igual a la tuya)
      const esEmpate = rango.competidores.length > 1;
      const nombresHTML = rango.competidores
        .map((c) => c.nombre)
        .join("<br><small><i>y</i></small><br>");
      const desempateTexto =
        rango.competidores.length === 1 && rango.desempate > 0
          ? `<div class="alerta-empate"> Puntos Desempate: ${rango.desempate} pts</div>`
          : esEmpate
            ? `<div class="alerta-empate">⚠️ ${detalle || `Desempate por ${etiquetaPosicion}`}</div>`
            : "";

      return `
        <div class="puesto ${claseCss}">
          ${titulo}<br>
          <span class="nombres-podio">${nombresHTML}</span>
          <span>${rango.puntaje} pts</span>
          ${desempateTexto}
        </div>
      `;
    }

    // 4. CORREGIMOS EL DESPLAZAMIENTO DE MEDALLAS
    let puestoActual = 1;
    let oro = null,
      plata = null,
      bronce = null;

    for (const rango of rangos) {
      if (puestoActual === 1) {
        oro = rango;
        puestoActual += rango.competidores.length; // Si empatan 2, el próximo puesto será el 3
      } else if (puestoActual === 2) {
        plata = rango;
        puestoActual += rango.competidores.length;
      } else if (puestoActual === 3) {
        bronce = rango;
        puestoActual += rango.competidores.length;
      } else {
        break; // Ya pasamos del 3er lugar
      }
    }

    const htmlOro = oro
      ? armarEscalon(
          oro,
          "oro",
          "1°",
          "1° puesto",
          oro.competidores.length > 1
            ? "Desempate por 1° puesto"
            : "Puntaje base",
        )
      : "";
    const htmlPlata = plata
      ? armarEscalon(
          plata,
          "plata",
          "2°",
          "2° puesto",
          plata.competidores.length > 1
            ? "Desempate por 2° puesto"
            : "Puntaje base",
        )
      : "";
    const htmlBronce = bronce
      ? armarEscalon(
          bronce,
          "bronce",
          "3°",
          "3° puesto",
          bronce.competidores.length > 1
            ? "Desempate por 3° puesto"
            : "Puntaje base",
        )
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
