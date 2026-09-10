(function () {
  const { TULES, generarOpcionesTules, sortearFormas } = window.TorneoTules;
  const { guardarCaché, cargarCaché, limpiarCaché } = window.TorneoStorage;
  const { calcularPodio } = window.TorneoPodio;

  const appTorneo = (function () {
    let contadorCompetidores = 0;

    function getCategoriaActual() {
      const select = document.getElementById("inputCategoria");
      const inputCustom = document.getElementById(
        "inputCategoriaPersonalizada",
      );

      if (!select) return "";

      if (select.value === "Personalizada") {
        if (inputCustom && inputCustom.value.trim()) {
          return inputCustom.value.trim();
        }
        return "";
      }

      return select.value.trim();
    }

    function actualizarEstadoCategoriaPersonalizada() {
      const select = document.getElementById("inputCategoria");
      const contenedor = document.getElementById("campoCategoriaPersonalizada");
      const inputCustom = document.getElementById(
        "inputCategoriaPersonalizada",
      );

      if (!select || !contenedor || !inputCustom) return;

      const esPersonalizada = select.value === "Personalizada";
      contenedor.style.display = esPersonalizada ? "flex" : "none";
      if (!esPersonalizada) inputCustom.value = "";
    }

    function actualizarBotonesEliminar() {
      const botones = document.querySelectorAll(".btn-eliminar");
      const mostrar = botones.length > 1 ? "block" : "none";
      botones.forEach((btn) => (btn.style.display = mostrar));
    }

    function actualizarTiempo(selectElem, idCompetidor, ronda) {
      const forma = selectElem.value;
      const tiempo = TULES[forma] ? TULES[forma] : "-";
      const celdaTiempo = document.getElementById(
        `tiempo_${idCompetidor}_${ronda}`,
      );
      if (celdaTiempo) celdaTiempo.innerText = tiempo;
      guardarCaché(contadorCompetidores);
    }

    function procsarNotas(id, ronda) {
      const notasObj = [];

      for (let j = 1; j <= 5; j++) {
        const input = document.getElementById(`j${j}_${id}_${ronda}`);
        if (!input) continue;

        let valor = parseInt(input.value, 10);
        if (valor > 100) {
          valor = 100;
          input.value = 100;
        } else if (valor < 0) {
          valor = 0;
          input.value = 0;
        }

        if (Number.isNaN(valor)) valor = 0;

        input.classList.remove("juez-descartado");
        notasObj.push({ elemento: input, valor });
      }

      if (notasObj.length === 0) return;

      let indexMax = 0;
      for (let i = 1; i < notasObj.length; i++) {
        if (notasObj[i].valor > notasObj[indexMax].valor) indexMax = i;
      }

      let indexMin = -1;
      let minVal = Infinity;
      for (let i = 0; i < notasObj.length; i++) {
        if (i === indexMax) continue;
        if (notasObj[i].valor < minVal) {
          minVal = notasObj[i].valor;
          indexMin = i;
        }
      }

      notasObj[indexMax].elemento.classList.add("juez-descartado");
      notasObj[indexMin].elemento.classList.add("juez-descartado");

      let subtotal = 0;
      for (let i = 0; i < notasObj.length; i++) {
        if (i !== indexMax && i !== indexMin) subtotal += notasObj[i].valor;
      }

      const subtotalEl = document.getElementById(`subtotal_${id}_${ronda}`);
      if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(0);

      actualizarTotal(id);
    }

    function actualizarTotal(id) {
      const sub1 =
        parseInt(document.getElementById(`subtotal_${id}_1`)?.innerText, 10) ||
        0;
      const sub2 =
        parseInt(document.getElementById(`subtotal_${id}_2`)?.innerText, 10) ||
        0;
      const sub3 =
        parseInt(document.getElementById(`subtotal_${id}_3`)?.innerText, 10) ||
        0;

      const total = document.getElementById(`total_${id}`);
      if (total) total.innerText = (sub1 + sub2 + sub3).toFixed(0);

      guardarCaché(contadorCompetidores);
    }

    function agregarCompetidor(datos = null) {
      contadorCompetidores += 1;
      const id = datos ? datos.id : contadorCompetidores;
      if (datos && datos.id > contadorCompetidores)
        contadorCompetidores = datos.id;

      const tbody = document.getElementById("listaPuntajes");

      const html = `
        <tr id="fila_1_${id}">
          <td id="celda_nombre_${id}" rowspan="2" style="vertical-align: middle;">
            <input type="text" id="nombre_${id}" placeholder="Nombre competidor...">
            <button id="btn_desempate_${id}" class="btn-desempate ocultar-en-pdf" style="display: none;" data-id="${id}">
              <i class="fas fa-scale-balanced"></i> Desempate
            </button>
            <button class="btn-eliminar ocultar-en-pdf" data-id="${id}">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          </td>
          <td>1ra Forma</td>
          <td><select id="forma_${id}_1" data-id="${id}" data-ronda="1">${generarOpcionesTules()}</select></td>
          <td id="tiempo_${id}_1">-</td>
          <td><input type="number" min="0" max="100" step="1" id="j1_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" id="j2_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" id="j3_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" id="j4_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" id="j5_${id}_1"></td>
          <td id="subtotal_${id}_1" style="font-weight: bold;">0</td>
          <td rowspan="2" id="total_${id}" style="vertical-align: middle; font-size: 1.5em; font-weight: bold; background: #e9ecef;">0</td>
        </tr>
        <tr class="fila-oscura" id="fila_2_${id}">
          <td>2da Forma</td>
          <td><select id="forma_${id}_2" data-id="${id}" data-ronda="2">${generarOpcionesTules()}</select></td>
          <td id="tiempo_${id}_2">-</td>
          <td><input type="number" min="0" max="100" step="1" id="j1_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" id="j2_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" id="j3_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" id="j4_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" id="j5_${id}_2"></td>
          <td id="subtotal_${id}_2" style="font-weight: bold;">0</td>
        </tr>
        <tr class="fila-desempate" id="fila_3_${id}" style="display: none;">
          <td>Desempate</td>
          <td><select id="forma_${id}_3" data-id="${id}" data-ronda="3">${generarOpcionesTules()}</select></td>
          <td id="tiempo_${id}_3">-</td>
          <td><input type="number" min="0" max="100" step="1" id="j1_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" id="j2_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" id="j3_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" id="j4_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" id="j5_${id}_3"></td>
          <td id="subtotal_${id}_3" style="font-weight: bold;">0</td>
        </tr>
      `;

      tbody.insertAdjacentHTML("beforeend", html);

      const nombreInput = document.getElementById(`nombre_${id}`);
      const btnDesempate = document.getElementById(`btn_desempate_${id}`);
      const eliminarBtn = document.querySelector(
        `.btn-eliminar[data-id="${id}"]`,
      );

      if (btnDesempate) {
        btnDesempate.addEventListener("click", () => toggleDesempate(id));
      }

      if (eliminarBtn) {
        eliminarBtn.addEventListener("click", () => eliminarCompetidor(id));
      }

      if (nombreInput) {
        nombreInput.addEventListener("input", () =>
          guardarCaché(contadorCompetidores),
        );
      }

      for (let ronda = 1; ronda <= 3; ronda++) {
        const select = document.getElementById(`forma_${id}_${ronda}`);
        if (select) {
          select.addEventListener("change", (event) => {
            actualizarTiempo(
              event.target,
              id,
              Number(event.target.dataset.ronda),
            );
          });
        }

        for (let j = 1; j <= 5; j++) {
          const input = document.getElementById(`j${j}_${id}_${ronda}`);
          if (input) {
            input.addEventListener("input", () => {
              procsarNotas(id, ronda);
            });
          }
        }
      }

      if (datos) {
        nombreInput.value = datos.nombre || "";
        for (let ronda = 1; ronda <= 3; ronda++) {
          if (datos[`f${ronda}`]) {
            const select = document.getElementById(`forma_${id}_${ronda}`);
            if (select) {
              select.value = datos[`f${ronda}`];
              actualizarTiempo(select, id, ronda);
            }
          }

          for (let j = 1; j <= 5; j++) {
            const input = document.getElementById(`j${j}_${id}_${ronda}`);
            if (input && Array.isArray(datos[`j${ronda}`])) {
              input.value = datos[`j${ronda}`][j - 1] || "";
            }
          }

          procsarNotas(id, ronda);
        }

        if (datos.desempateActivo) toggleDesempate(id, true);
      }

      actualizarBotonesEliminar();
    }

    function toggleDesempate(id, forceShow = false) {
      const fila3 = document.getElementById(`fila_3_${id}`);
      const tdNombre = document.getElementById(`celda_nombre_${id}`);
      const tdTotal = document.getElementById(`total_${id}`);
      const btnDesempate = document.getElementById(`btn_desempate_${id}`);

      if (fila3.style.display === "none" || forceShow) {
        fila3.style.display = "table-row";
        tdNombre.rowSpan = 3;
        tdTotal.rowSpan = 3;
        if (btnDesempate) {
          btnDesempate.innerHTML =
            '<i class="fas fa-times-circle"></i> Quitar Desempate';
        }
      } else {
        fila3.style.display = "none";
        tdNombre.rowSpan = 2;
        tdTotal.rowSpan = 2;
        if (btnDesempate) {
          btnDesempate.innerHTML =
            '<i class="fas fa-scale-balanced"></i> Desempate';
        }

        for (let j = 1; j <= 5; j++) {
          const input = document.getElementById(`j${j}_${id}_3`);
          if (input) input.value = "";
        }

        const select = document.getElementById(`forma_${id}_3`);
        if (select) select.value = "";

        const tiempo = document.getElementById(`tiempo_${id}_3`);
        if (tiempo) tiempo.innerText = "-";

        const subtotal = document.getElementById(`subtotal_${id}_3`);
        if (subtotal) subtotal.innerText = "0";

        actualizarTotal(id);
      }

      guardarCaché(contadorCompetidores);
    }

    function eliminarCompetidor(id) {
      if (confirm("¿Estás seguro de eliminar a este competidor?")) {
        const f1 = document.getElementById(`fila_1_${id}`);
        const f2 = document.getElementById(`fila_2_${id}`);
        const f3 = document.getElementById(`fila_3_${id}`);

        if (f1) f1.remove();
        if (f2) f2.remove();
        if (f3) f3.remove();

        actualizarBotonesEliminar();
        guardarCaché(contadorCompetidores);
      }
    }

    function verificarBotonSorteo() {
      const select = document.getElementById("inputCategoria");
      const contenedorSorteo = document.getElementById("contenedor_sorteo");
      const categoriaActual = getCategoriaActual();

      actualizarEstadoCategoriaPersonalizada();

      if (select && contenedorSorteo) {
        contenedorSorteo.style.display =
          select.value === "Personalizada"
            ? categoriaActual
              ? "flex"
              : "none"
            : select.value.includes("Dan") || categoriaActual
              ? "flex"
              : "none";
      }
      guardarCaché(contadorCompetidores);
    }

    function sortearYAsignar() {
      const categoriaElement = document.getElementById("inputCategoria");

      if (!categoriaElement) {
        alert("Error: No se encontró el campo de categoría.");
        return;
      }

      const categoriaSeleccionada = getCategoriaActual();

      if (!categoriaSeleccionada) {
        alert("Debes ingresar un nombre para la categoría personalizada.");
        return;
      }

      if (
        !confirm(
          `Se sortearán formas de manera aleatoria e individual para cada competidor en la categoría: ${categoriaSeleccionada}.\n\n¿Deseas continuar?`,
        )
      ) {
        return;
      }

      for (let i = 1; i <= contadorCompetidores; i++) {
        const selectF1 = document.getElementById(`forma_${i}_1`);
        const selectF2 = document.getElementById(`forma_${i}_2`);

        if (selectF1 && selectF2) {
          const formasSorteadas = sortearFormas(categoriaSeleccionada);

          selectF1.value = formasSorteadas.forma1;
          selectF2.value = formasSorteadas.forma2;

          const celdaTiempo1 = document.getElementById(`tiempo_${i}_1`);
          const celdaTiempo2 = document.getElementById(`tiempo_${i}_2`);

          if (celdaTiempo1)
            celdaTiempo1.innerText = TULES[formasSorteadas.forma1] || "-";
          if (celdaTiempo2)
            celdaTiempo2.innerText = TULES[formasSorteadas.forma2] || "-";
        }
      }

      guardarCaché(contadorCompetidores);
    }

    function sortearFormaEmpate() {
      const categoriaActual = getCategoriaActual() || "default";
      const puntajes = [];

      for (let i = 1; i <= contadorCompetidores; i++) {
        const totalEl = document.getElementById(`total_${i}`);
        if (!totalEl) continue;

        const total = parseFloat(totalEl.innerText) || 0;
        if (total > 0) {
          puntajes.push({ id: i, total });
        }
      }

      if (puntajes.length === 0) {
        alert("No hay competidores con puntaje para desempatar.");
        return;
      }

      const maximo = Math.max(
        ...puntajes.map((competidor) => competidor.total),
      );
      const empatados = puntajes.filter(
        (competidor) => competidor.total === maximo,
      );

      if (empatados.length < 2) {
        alert("No hay empate en el primer puesto para sortear una forma.");
        return;
      }

      empatados.forEach((competidor) => {
        toggleDesempate(competidor.id, true);

        const select = document.getElementById(`forma_${competidor.id}_3`);
        if (!select) return;

        const formasSorteadas = sortearFormas(categoriaActual || "default");
        const formaElegida =
          Math.random() < 0.5 ? formasSorteadas.forma1 : formasSorteadas.forma2;

        select.value = formaElegida;
        actualizarTiempo(select, competidor.id, 3);
      });

      alert(
        `Se sorteó la forma de desempate entre ${empatados.length} competidores empatados.`,
      );
    }

    function reiniciarPlanilla() {
      if (
        confirm(
          "¿Estás seguro de reiniciar la planilla? Se borrará todo para comenzar una nueva categoría.",
        )
      ) {
        limpiarCaché();
        location.reload();
      }
    }

    function exportarPDF() {
      const categoriaActual = getCategoriaActual() || "SinCategoria";
      const cat = categoriaActual.trim().replace(/[\\/\\:*?"<>|]/g, "_");

      const edad =
        document
          .getElementById("inputEdad")
          .value.trim()
          .replace(/[\\/\\:*?"<>|]/g, "_") || "SinEdad";
      const nombreArchivo = `Planilla_Formas_${cat}_${edad}`;

      const tituloOriginal = document.title;
      document.title = nombreArchivo;
      window.print();
      document.title = tituloOriginal;
    }

    function exportarExcel() {
      if (confirm("¿Deseas descargar los datos actuales en formato Excel?")) {
        const datosExcel = [];

        const cat = getCategoriaActual() || "";
        const edad = document.getElementById("inputEdad").value || "";
        const catNombre =
          cat.trim().replace(/[\\/\\:*?"<>|]/g, "_") || "SinCategoria";
        const edadNombre =
          edad.trim().replace(/[\\/\\:*?"<>|]/g, "_") || "SinEdad";
        const nombreArchivo = `Planilla_Formas_${catNombre}_${edadNombre}.xlsx`;

        datosExcel.push(["Categoría / Cinturón:", cat, "", "Edades:", edad]);
        datosExcel.push([]);
        datosExcel.push([
          "Competidor",
          "Ronda",
          "Forma",
          "Tiempo",
          "Juez 1",
          "Juez 2",
          "Juez 3",
          "Juez 4",
          "Juez 5",
          "SubTotal",
          "Total",
        ]);

        for (let i = 1; i <= contadorCompetidores; i++) {
          const inputNombre = document.getElementById(`nombre_${i}`);
          if (!inputNombre) continue;

          const nombre = inputNombre.value;
          const total = document.getElementById(`total_${i}`).innerText;

          const forma1 = document.getElementById(`forma_${i}_1`).value || "-";
          const tiempo1 = document.getElementById(`tiempo_${i}_1`).innerText;
          const sub1 = document.getElementById(`subtotal_${i}_1`).innerText;
          const j1 = [1, 2, 3, 4, 5].map(
            (j) => document.getElementById(`j${j}_${i}_1`).value || 0,
          );

          datosExcel.push([
            nombre,
            "1ra Forma",
            forma1,
            tiempo1,
            ...j1,
            sub1,
            total,
          ]);

          const forma2 = document.getElementById(`forma_${i}_2`).value || "-";
          const tiempo2 = document.getElementById(`tiempo_${i}_2`).innerText;
          const sub2 = document.getElementById(`subtotal_${i}_2`).innerText;
          const j2 = [1, 2, 3, 4, 5].map(
            (j) => document.getElementById(`j${j}_${i}_2`).value || 0,
          );

          datosExcel.push(["", "2da Forma", forma2, tiempo2, ...j2, sub2, ""]);

          if (document.getElementById(`fila_3_${i}`).style.display !== "none") {
            const forma3 = document.getElementById(`forma_${i}_3`).value || "-";
            const tiempo3 = document.getElementById(`tiempo_${i}_3`).innerText;
            const sub3 = document.getElementById(`subtotal_${i}_3`).innerText;
            const j3 = [1, 2, 3, 4, 5].map(
              (j) => document.getElementById(`j${j}_${i}_3`).value || 0,
            );
            datosExcel.push([
              "",
              "Desempate",
              forma3,
              tiempo3,
              ...j3,
              sub3,
              "",
            ]);
          }
        }

        const hoja = XLSX.utils.aoa_to_sheet(datosExcel);
        hoja["!cols"] = [
          { wch: 25 },
          { wch: 12 },
          { wch: 15 },
          { wch: 10 },
          { wch: 8 },
          { wch: 8 },
          { wch: 8 },
          { wch: 8 },
          { wch: 8 },
          { wch: 10 },
          { wch: 10 },
        ];

        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Puntuaciones");
        XLSX.writeFile(libro, nombreArchivo);
      }
    }

    function cargarEstadoGuardado() {
      const estado = cargarCaché();

      if (estado) {
        let catSelect = document.getElementById("inputCategoria");
        let inputCustom = document.getElementById(
          "inputCategoriaPersonalizada",
        );

        if (catSelect && estado.categoria) {
          catSelect.value = estado.categoria;
        }

        if (inputCustom && estado.categoriaCustom) {
          inputCustom.value = estado.categoriaCustom;
        }

        document.getElementById("inputEdad").value = estado.edad || "";

        if (estado.competidores.length > 0) {
          estado.competidores.forEach((comp) => agregarCompetidor(comp));
          calcularPodio(contadorCompetidores);
        } else {
          agregarCompetidor();
        }
      } else {
        agregarCompetidor();
      }

      actualizarBotonesEliminar();
      verificarBotonSorteo();
    }

    return {
      agregarCompetidor,
      toggleDesempate,
      eliminarCompetidor,
      actualizarTiempo,
      procsarNotas,
      actualizarTotal,
      sortearYAsignar,
      sortearFormaEmpate,
      verificarBotonSorteo,
      calcularPodio: () => calcularPodio(contadorCompetidores),
      guardarCaché: () => guardarCaché(contadorCompetidores),
      cargarCaché: cargarEstadoGuardado,
      reiniciarPlanilla,
      exportarPDF,
      exportarExcel,
    };
  })();

  window.appTorneo = appTorneo;
})();

window.onload = function () {
  appTorneo.cargarCaché();
  document
    .querySelector(".contenedor")
    .addEventListener("input", () => appTorneo.guardarCaché());
};
