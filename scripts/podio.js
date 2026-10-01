(function () {
  function rondaCompleta(id, ronda) {
    return [1, 2, 3, 4, 5].every((juez) => {
      const input = document.getElementById(`j${juez}_${id}_${ronda}`);
      return input && input.value.trim() !== "" && Number.isFinite(Number(input.value));
    });
  }

  function escaparHTML(valor) {
    return String(valor)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function calcularPodio(contadorCompetidores) {
    const competidores = [];
    const incompletos = [];

    for (let id = 1; id <= contadorCompetidores; id++) {
      const nombreInput = document.getElementById(`nombre_${id}`);
      if (!nombreInput) continue;

      const filaDesempate = document.getElementById(`fila_3_${id}`);
      if (!rondaCompleta(id, 1) || !rondaCompleta(id, 2)) {
        incompletos.push(nombreInput.value.trim() || `Competidor ${id}`);
        continue;
      }
      if (filaDesempate?.dataset.activo === "true" && !rondaCompleta(id, 3)) {
        incompletos.push(nombreInput.value.trim() || `Competidor ${id}`);
        continue;
      }

      competidores.push({
        id,
        nombre: nombreInput.value.trim() || `Competidor ${id}`,
        base: (parseFloat(document.getElementById(`subtotal_${id}_1`)?.innerText) || 0) +
          (parseFloat(document.getElementById(`subtotal_${id}_2`)?.innerText) || 0),
        desempate: parseFloat(document.getElementById(`subtotal_${id}_3`)?.innerText) || 0,
      });
    }

    const podioDOM = document.getElementById("podioContainer");
    const seccionPodio = document.getElementById("seccionPodio");
    const accionesPodio = document.getElementById("accionesPodio");
    if (!podioDOM || !seccionPodio) return;

    if (incompletos.length > 0) {
      podioDOM.replaceChildren();
      seccionPodio.style.display = "none";
      if (accionesPodio) accionesPodio.style.display = "none";
      alert(`Faltan las cinco notas en: ${incompletos.join(", ")}.`);
      return;
    }

    competidores.sort((a, b) =>
      b.base - a.base || b.desempate - a.desempate || a.id - b.id,
    );

    const rangos = [];
    for (const competidor of competidores) {
      const ultimo = rangos[rangos.length - 1];
      if (ultimo && ultimo.puntaje === competidor.base && ultimo.desempate === competidor.desempate) {
        ultimo.competidores.push(competidor);
      } else {
        rangos.push({ puntaje: competidor.base, desempate: competidor.desempate, competidores: [competidor] });
      }
    }

    podioDOM.replaceChildren();
    if (competidores.length === 0) {
      seccionPodio.style.display = "none";
      if (accionesPodio) accionesPodio.style.display = "none";
      return;
    }

    seccionPodio.style.display = "block";
    const gruposEmpatados = [];
    let lugaresOcupados = 0;
    for (const rango of rangos) {
      if (lugaresOcupados >= 3) break;
      if (rango.competidores.length > 1) gruposEmpatados.push(rango);
      lugaresOcupados += rango.competidores.length;
    }

    const idsEmpatados = new Set(
      gruposEmpatados.flatMap((rango) => rango.competidores.map((competidor) => competidor.id)),
    );

    for (let id = 1; id <= contadorCompetidores; id++) {
      const boton = document.getElementById(`btn_desempate_${id}`);
      const fila = document.getElementById(`fila_3_${id}`);
      const nombre = document.getElementById(`celda_nombre_${id}`);
      const total = document.getElementById(`total_${id}`);
      const activo = fila?.dataset.activo === "true";
      const debeMostrar = activo || idsEmpatados.has(id);

      if (boton) {
        boton.style.display = debeMostrar ? "block" : "none";
        boton.innerHTML = debeMostrar
          ? '<i class="fas fa-times-circle"></i> Quitar Desempate'
          : '<i class="fas fa-scale-balanced"></i> Desempate';
      }
      if (fila) {
        fila.style.display = debeMostrar ? "table-row" : "none";
        if (nombre) nombre.rowSpan = debeMostrar ? 3 : 2;
        if (total) total.rowSpan = debeMostrar ? 3 : 2;
      }
    }

    if (accionesPodio) accionesPodio.style.display = gruposEmpatados.length ? "block" : "none";

    function escalon(rango, clase, titulo, puesto) {
      const nombres = rango.competidores
        .map((competidor) => escaparHTML(competidor.nombre))
        .join("<br><small><i>y</i></small><br>");
      const aviso = rango.competidores.length > 1
        ? `<div class="alerta-empate">Desempate por ${puesto}</div>`
        : rango.desempate > 0
          ? `<div class="alerta-empate">Puntos desempate: ${rango.desempate}</div>`
          : "";
      return `<div class="puesto ${clase}">${titulo}<br><span class="nombres-podio">${nombres}</span><span>${rango.puntaje.toFixed(0)} pts</span>${aviso}</div>`;
    }

    let puesto = 1;
    let html = "";
    for (const rango of rangos) {
      if (puesto === 1) html += escalon(rango, "oro", "1°", "1° puesto");
      else if (puesto === 2) html += escalon(rango, "plata", "2°", "2° puesto");
      else if (puesto === 3) html += escalon(rango, "bronce", "3°", "3° puesto");
      else break;
      puesto += rango.competidores.length;
    }
    podioDOM.innerHTML = html;
  }

  window.TorneoPodio = { calcularPodio };
})();
