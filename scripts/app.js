(function () {
  const { TULES, generarOpcionesTules, sortearFormas, obtenerRangoFormas } = window.TorneoTules;
  const { guardarCache, cargarCache, limpiarCache } = window.TorneoStorage;
  const { calcularPodio } = window.TorneoPodio;
  const { abrirNuevaLlave } = window.TorneoMesa;

  const appTorneo = (function () {
    let contadorCompetidores = 0;
    let restaurando = false;

    function guardarCacheSeguro() {
      if (!restaurando) guardarCache(contadorCompetidores);
    }

    function getCategoriaActual() {
      const select = document.getElementById("inputCategoria");
      if (!select) return "";
      return select.value.trim();
    }

    function getCategoriaParaCompetidor(id) {
      if (getCategoriaActual() !== "Personalizada") return getCategoriaActual();
      return document.getElementById(`cinturon_${id}`)?.value.trim() || "";
    }

    function actualizarEstadoCategoriaPersonalizada() {
      const select = document.getElementById("inputCategoria");
      const contenedor = document.getElementById("campoCategoriaPersonalizada");
      const inputCustom = document.getElementById("inputCategoriaPersonalizada");

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

    function procesarNotas(id, ronda) {
      const notasObj = [];

      for (let j = 1; j <= 5; j++) {
        const input = document.getElementById(`j${j}_${id}_${ronda}`);
        if (!input) continue;

        input.classList.remove("juez-descartado");

        if (input.value.trim() !== "") {
          if (!/^-?\d+$/.test(input.value.trim())) {
            input.value = "";
            continue;
          }

          let valor = Number(input.value);

          if (!Number.isInteger(valor)) {
            input.value = "";
            continue;
          }

          if (valor > 100) {
            valor = 100;
            input.value = 100;
          } else if (valor < 0) {
            valor = 0;
            input.value = 0;
          }

          if (!Number.isFinite(valor)) continue;

          notasObj.push({ elemento: input, valor });
        }
      }

      let subtotal = 0;

      if (notasObj.length > 0) {
        if (notasObj.length >= 3) {
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

          if (indexMax !== -1 && notasObj[indexMax]) {
            notasObj[indexMax].elemento.classList.add("juez-descartado");
          }
          if (indexMin !== -1 && notasObj[indexMin]) {
            notasObj[indexMin].elemento.classList.add("juez-descartado");
          }
        }

        for (let i = 0; i < notasObj.length; i++) {
          if (!notasObj[i].elemento.classList.contains("juez-descartado")) {
            subtotal += notasObj[i].valor;
          }
        }
      }

      const subtotalEl = document.getElementById(`subtotal_${id}_${ronda}`);
      if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(0);

      actualizarTotal(id);
    }

    function actualizarTotal(id) {
      const sub1 = parseFloat(document.getElementById(`subtotal_${id}_1`)?.innerText) || 0;
      const sub2 = parseFloat(document.getElementById(`subtotal_${id}_2`)?.innerText) || 0;

      const total = document.getElementById(`total_${id}`);
      if (total) total.innerText = (sub1 + sub2).toFixed(0);

      guardarCacheSeguro();
    }

    function agregarCompetidor(datos = null) {
      const idGuardado = Number(datos?.id);
      const id = Number.isInteger(idGuardado) && idGuardado > 0 ? idGuardado : contadorCompetidores + 1;
      contadorCompetidores = Math.max(contadorCompetidores, id);

      const tbody = document.getElementById("listaPuntajes");

      const html = `
        <tr id="fila_1_${id}">
          <td id="celda_nombre_${id}" rowspan="2" style="vertical-align: middle;">
          <p class="numero-competidor ocultar-en-pdf">${id}</p>
            <input type="text" id="nombre_${id}" aria-label="Nombre o número del competidor ${id}" placeholder="Número/Nombre competidor...">

            <select id="cinturon_${id}" class="select-cinturon-individual" style="display: none; margin-top: 5px; width: 100%;">
              <option value="">Cinturón individual...</option>
              <option value="1 Gup">1 Gup</option>
              <option value="1er Dan">1er Dan</option>
              <option value="2do Dan">2do Dan</option>
              <option value="3er Dan">3er Dan</option>
              <option value="4to Dan">4to Dan</option>
              <option value="5to Dan">5to Dan</option>
            </select>
            
            <button id="btn_desempate_${id}" class="btn-desempate ocultar-en-pdf" style="display: none;" data-id="${id}">
              <i class="fas fa-scale-balanced"></i> Desempate
            </button>
            <button class="btn-eliminar ocultar-en-pdf" data-id="${id}">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          </td>
          <td>1ra Forma</td>
          <td><select id="forma_${id}_1" aria-label="Forma de la primera ronda del competidor ${id}" data-id="${id}" data-ronda="1">${generarOpcionesTules()}</select></td>
          <td id="tiempo_${id}_1">-</td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 1, primera forma, competidor ${id}" id="j1_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 2, primera forma, competidor ${id}" id="j2_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 3, primera forma, competidor ${id}" id="j3_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 4, primera forma, competidor ${id}" id="j4_${id}_1"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 5, primera forma, competidor ${id}" id="j5_${id}_1"></td>
          <td id="subtotal_${id}_1" style="font-weight: bold;">0</td>
          <td rowspan="2" id="total_${id}" style="vertical-align: middle; font-size: 1.5em; font-weight: bold;">0</td>
        </tr>
        <tr class="fila-oscura" id="fila_2_${id}">
          <td>2da Forma</td>
          <td><select id="forma_${id}_2" aria-label="Forma de la segunda ronda del competidor ${id}" data-id="${id}" data-ronda="2">${generarOpcionesTules()}</select></td>
          <td id="tiempo_${id}_2">-</td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 1, segunda forma, competidor ${id}" id="j1_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 2, segunda forma, competidor ${id}" id="j2_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 3, segunda forma, competidor ${id}" id="j3_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 4, segunda forma, competidor ${id}" id="j4_${id}_2"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 5, segunda forma, competidor ${id}" id="j5_${id}_2"></td>
          <td id="subtotal_${id}_2" style="font-weight: bold;">0</td>
        </tr>
        <tr class="fila-desempate" id="fila_3_${id}" style="display: none;">
          <td>Desempate</td>
          <td><select id="forma_${id}_3" aria-label="Forma de desempate del competidor ${id}" data-id="${id}" data-ronda="3">${generarOpcionesTules()}</select></td>
          <td id="tiempo_${id}_3">-</td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 1, desempate, competidor ${id}" id="j1_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 2, desempate, competidor ${id}" id="j2_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 3, desempate, competidor ${id}" id="j3_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 4, desempate, competidor ${id}" id="j4_${id}_3"></td>
          <td><input type="number" min="0" max="100" step="1" aria-label="Juez 5, desempate, competidor ${id}" id="j5_${id}_3"></td>
          <td id="subtotal_${id}_3" style="font-weight: bold;">0</td>
        </tr>
      `;

      tbody.insertAdjacentHTML("beforeend", html);

      const nombreInput = document.getElementById(`nombre_${id}`);
      const btnDesempate = document.getElementById(`btn_desempate_${id}`);
      const eliminarBtn = document.querySelector(`.btn-eliminar[data-id="${id}"]`);

      if (btnDesempate) {
        btnDesempate.addEventListener("click", () => toggleDesempate(id));
      }

      if (eliminarBtn) {
        eliminarBtn.addEventListener("click", () => eliminarCompetidor(id));
      }

      if (nombreInput) {
        nombreInput.addEventListener("input", guardarCacheSeguro);
      }

      for (let ronda = 1; ronda <= 3; ronda++) {
        const select = document.getElementById(`forma_${id}_${ronda}`);
        if (select) {
          select.addEventListener("change", (event) => {
            actualizarTiempo(event.target, id, Number(event.target.dataset.ronda));
          });
        }

        const celdaTiempo = document.getElementById(`tiempo_${id}_${ronda}`);
        if (celdaTiempo) {
          celdaTiempo.style.cursor = "pointer";
          celdaTiempo.style.color = "#0056b3";
          celdaTiempo.style.fontWeight = "bold";
          celdaTiempo.style.textDecoration = "underline";
          celdaTiempo.title = "Tocar para enviar forma y tiempo a la TV";

          celdaTiempo.addEventListener("click", () => {
            const formaSeleccionada = select.value;
            if (formaSeleccionada && formaSeleccionada !== "" && window.TorneoCronometro) {
              window.TorneoCronometro.reiniciar(formaSeleccionada);
              const colorOriginal = celdaTiempo.style.color;
              celdaTiempo.style.color = "#28a745";
              setTimeout(() => (celdaTiempo.style.color = colorOriginal), 500);
            }
          });
        }

        for (let j = 1; j <= 5; j++) {
          const input = document.getElementById(`j${j}_${id}_${ronda}`);
          if (input) {
            input.addEventListener("input", () => {
              procesarNotas(id, ronda);
            });
            input.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });
          }
        }
      }

      if (datos) {
        nombreInput.value = datos.nombre || "";
        const cinturonInput = document.getElementById(`cinturon_${id}`);
        if (cinturonInput && datos.cinturon) {
          cinturonInput.value = datos.cinturon;
        }
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

          procesarNotas(id, ronda);
        }

        const filaDesempate = document.getElementById(`fila_3_${id}`);
        if (filaDesempate) {
          filaDesempate.dataset.activo = datos.desempateActivo ? "true" : "false";
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
        fila3.dataset.activo = "true";
        fila3.style.display = "table-row";
        tdNombre.rowSpan = 3;
        tdTotal.rowSpan = 3;
        if (btnDesempate) {
          btnDesempate.innerHTML = '<i class="fas fa-times-circle"></i> Quitar Desempate';
        }
      } else {
        fila3.dataset.activo = "false";
        fila3.style.display = "none";
        tdNombre.rowSpan = 2;
        tdTotal.rowSpan = 2;
        if (btnDesempate) {
          btnDesempate.innerHTML = '<i class="fas fa-scale-balanced"></i> Desempate';
        }

        for (let j = 1; j <= 5; j++) {
          const input = document.getElementById(`j${j}_${id}_3`);
          if (input) {
            input.value = "";
            input.classList.remove("juez-descartado");
          }
        }

        const select = document.getElementById(`forma_${id}_3`);
        if (select) select.value = "";

        const tiempo = document.getElementById(`tiempo_${id}_3`);
        if (tiempo) tiempo.innerText = "-";

        const subtotal = document.getElementById(`subtotal_${id}_3`);
        if (subtotal) subtotal.innerText = "0";

        actualizarTotal(id);
      }

      guardarCacheSeguro();
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
        guardarCacheSeguro();
      }
    }

    function verificarBotonSorteo() {
      const select = document.getElementById("inputCategoria");
      const contenedorSorteo = document.getElementById("contenedor_sorteo");
      actualizarEstadoCategoriaPersonalizada();

      if (select && contenedorSorteo) {
        const categoriaSeleccionada = select.value;
        const esPersonalizada = categoriaSeleccionada === "Personalizada";

        const categoriaConSorteo = ["1 Gup", "1er Dan", "2do Dan", "3er Dan", "4to Dan", "5to Dan", "Personalizada"];

        contenedorSorteo.style.display = categoriaConSorteo.includes(categoriaSeleccionada) ? "flex" : "none";

        for (let i = 1; i <= contadorCompetidores; i++) {
          const selectIndividual = document.getElementById(`cinturon_${i}`);
          if (selectIndividual) {
            selectIndividual.style.display = esPersonalizada ? "block" : "none";
          }
        }
      }
      guardarCacheSeguro();
    }

    function sortearYAsignar() {
      const categoriaElement = document.getElementById("inputCategoria");

      if (!categoriaElement) {
        alert("Error: No se encontró el campo de categoría.");
        return;
      }

      const esPersonalizada = categoriaElement.value === "Personalizada";
      const categoriaSeleccionada = getCategoriaActual();

      if (!categoriaSeleccionada && !esPersonalizada) {
        alert("Debes seleccionar una categoría válida.");
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
          const catCompetidor = esPersonalizada
            ? getCategoriaParaCompetidor(i)
            : categoriaSeleccionada;
          if (!catCompetidor) continue;

          const tieneNotas = [1, 2].some((ronda) =>
            [1, 2, 3, 4, 5].some((juez) =>
              document.getElementById(`j${juez}_${i}_${ronda}`)?.value.trim() !== "",
            ),
          );
          if (tieneNotas && !confirm(`El competidor ${i} ya tiene notas. ¿Reemplazar sus formas?`)) continue;

          const formasSorteadas = sortearFormas(catCompetidor);

          selectF1.value = formasSorteadas.forma1;
          selectF2.value = formasSorteadas.forma2;

          const celdaTiempo1 = document.getElementById(`tiempo_${i}_1`);
          const celdaTiempo2 = document.getElementById(`tiempo_${i}_2`);

          if (celdaTiempo1) celdaTiempo1.innerText = TULES[formasSorteadas.forma1] || "-";
          if (celdaTiempo2) celdaTiempo2.innerText = TULES[formasSorteadas.forma2] || "-";
        }
      }

      guardarCacheSeguro();
    }

    function sortearFormaEmpate() {
      const categoriaActual = getCategoriaActual() || "default";
      const competidoresActivos = [];

      for (let i = 1; i <= contadorCompetidores; i++) {
        const inputNombre = document.getElementById(`nombre_${i}`);
        if (!inputNombre) continue;

        const sub1 = parseFloat(document.getElementById(`subtotal_${i}_1`)?.innerText) || 0;
        const sub2 = parseFloat(document.getElementById(`subtotal_${i}_2`)?.innerText) || 0;
        const desempate = parseFloat(document.getElementById(`subtotal_${i}_3`)?.innerText) || 0;
        const base = sub1 + sub2;
        const notasBaseCompletas = [1, 2].every((ronda) =>
          [1, 2, 3, 4, 5].every((juez) =>
            document.getElementById(`j${juez}_${i}_${ronda}`)?.value.trim() !== "",
          ),
        );

        if (notasBaseCompletas) {
          competidoresActivos.push({ id: i, base, desempate });
        }
      }

      if (competidoresActivos.length === 0) {
        alert("No hay competidores con puntaje para evaluar empates.");
        return;
      }

      competidoresActivos.sort((a, b) => {
        if (b.base !== a.base) return b.base - a.base;
        if (b.desempate !== a.desempate) return b.desempate - a.desempate;
        return 0;
      });

      const rangos = [];
      let rangoActual = {
        base: competidoresActivos[0].base,
        desempate: competidoresActivos[0].desempate,
        competidores: [competidoresActivos[0]],
      };

      for (let i = 1; i < competidoresActivos.length; i++) {
        const comp = competidoresActivos[i];
        if (comp.base === rangoActual.base && comp.desempate === rangoActual.desempate) {
          rangoActual.competidores.push(comp);
        } else {
          rangos.push(rangoActual);
          rangoActual = {
            base: comp.base,
            desempate: comp.desempate,
            competidores: [comp],
          };
        }
      }
      rangos.push(rangoActual);

      let lugaresOcupados = 0;
      let empatesEnPodio = [];

      for (const rango of rangos) {
        if (lugaresOcupados >= 3) break;

        if (rango.competidores.length > 1) {
          empatesEnPodio.push(rango.competidores);
        }
        lugaresOcupados += rango.competidores.length;
      }

      if (empatesEnPodio.length === 0) {
        alert("No se detectaron empates pendientes en zona de podio (1°, 2° o 3° puesto).");
        return;
      }

      const empatadosParaSortear = empatesEnPodio[empatesEnPodio.length - 1];

      empatadosParaSortear.forEach((comp) => {
        toggleDesempate(comp.id, true);

        const select = document.getElementById(`forma_${comp.id}_3`);
        if (!select) return;

        const formasUsadas = [1, 2]
          .map((ronda) => document.getElementById(`forma_${comp.id}_${ronda}`)?.value)
          .filter(Boolean);

        const categoriaCompetidor = getCategoriaParaCompetidor(comp.id) || categoriaActual;
        const { rango2 } = window.TorneoTules.obtenerRangoFormas(categoriaCompetidor || "default");

        const formasDisponibles = rango2.filter((forma) => !formasUsadas.includes(forma));

        let formaElegida = "-";
        if (formasDisponibles.length > 0) {
          const indiceAleatorio = Math.floor(Math.random() * formasDisponibles.length);
          formaElegida = formasDisponibles[indiceAleatorio];
        }

        for (let juez = 1; juez <= 5; juez++) {
          const input = document.getElementById(`j${juez}_${comp.id}_3`);
          if (input) {
            input.value = "";
            input.classList.remove("juez-descartado");
          }
        }
        document.getElementById(`subtotal_${comp.id}_3`).innerText = "0";
        select.value = formaElegida;
        actualizarTiempo(select, comp.id, 3);
      });

      alert(
        `Se sorteó la forma de desempate para los ${empatadosParaSortear.length} competidores empatados con ${empatadosParaSortear[0].base} puntos (Puesto menor priorizado).`,
      );
    }

    function reiniciarPlanilla() {
      if (confirm("¿Estás seguro de reiniciar la planilla? Se borrará todo para comenzar una nueva categoría.")) {
        limpiarCache();
        location.reload();
      }
    }

    function actualizarTiempo(selectElem, idCompetidor, ronda) {
      const forma = selectElem.value;
      const tiempo = TULES[forma] ? TULES[forma] : "-";
      const celdaTiempo = document.getElementById(`tiempo_${idCompetidor}_${ronda}`);

      if (celdaTiempo) celdaTiempo.innerText = tiempo;

      if (!restaurando && window.TorneoCronometro) {
        window.TorneoCronometro.reiniciar(forma);
      }

      guardarCacheSeguro();
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
      const selectoresForma = document.querySelectorAll("#tablaCompetidores td select");
      const valoresFormaPDF = [];

      selectoresForma.forEach((select) => {
        const valor = document.createElement("span");
        valor.className = "valor-forma-pdf";
        valor.textContent = select.options[select.selectedIndex]?.textContent.trim() || "-";
        select.classList.add("ocultar-en-pdf");
        select.after(valor);
        valoresFormaPDF.push({ select, valor });
      });

      const restaurarControles = () => {
        valoresFormaPDF.forEach(({ select, valor }) => {
          select.classList.remove("ocultar-en-pdf");
          valor.remove();
        });
        document.title = tituloOriginal;
      };

      document.title = nombreArchivo;
      window.addEventListener("afterprint", restaurarControles, { once: true });
      window.print();
    }

    function exportarExcel() {
      if (typeof XLSX === "undefined") {
        alert("No se pudo cargar el exportador de Excel. Verificá la conexión o usá Exportar PDF.");
        return;
      }

      if (confirm("¿Deseas descargar los datos actuales en formato Excel?")) {
        const datosExcel = [];

        const cat = getCategoriaActual() || "";
        const edad = document.getElementById("inputEdad").value || "";
        const catNombre = cat.trim().replace(/[\\/\\:*?"<>|]/g, "_") || "SinCategoria";
        const edadNombre = edad.trim().replace(/[\\/\\:*?"<>|]/g, "_") || "SinEdad";
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
          "Total base",
        ]);

        for (let i = 1; i <= contadorCompetidores; i++) {
          const inputNombre = document.getElementById(`nombre_${i}`);
          if (!inputNombre) continue;

          const nombre = inputNombre.value;
          const total = document.getElementById(`total_${i}`).innerText;

          const forma1 = document.getElementById(`forma_${i}_1`).value || "-";
          const tiempo1 = document.getElementById(`tiempo_${i}_1`).innerText;
          const sub1 = document.getElementById(`subtotal_${i}_1`).innerText;
          const j1 = [1, 2, 3, 4, 5].map((j) => document.getElementById(`j${j}_${i}_1`).value || 0);

          datosExcel.push([nombre, "1ra Forma", forma1, tiempo1, ...j1, sub1, total]);

          const forma2 = document.getElementById(`forma_${i}_2`).value || "-";
          const tiempo2 = document.getElementById(`tiempo_${i}_2`).innerText;
          const sub2 = document.getElementById(`subtotal_${i}_2`).innerText;
          const j2 = [1, 2, 3, 4, 5].map((j) => document.getElementById(`j${j}_${i}_2`).value || 0);

          datosExcel.push(["", "2da Forma", forma2, tiempo2, ...j2, sub2, ""]);

          if (document.getElementById(`fila_3_${i}`).style.display !== "none") {
            const forma3 = document.getElementById(`forma_${i}_3`).value || "-";
            const tiempo3 = document.getElementById(`tiempo_${i}_3`).innerText;
            const sub3 = document.getElementById(`subtotal_${i}_3`).innerText;
            const j3 = [1, 2, 3, 4, 5].map((j) => document.getElementById(`j${j}_${i}_3`).value || 0);
            datosExcel.push(["", "Desempate", forma3, tiempo3, ...j3, sub3, ""]);
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
      const estado = cargarCache();

      restaurando = true;
      try {
        if (estado) {
          const catSelect = document.getElementById("inputCategoria");
          const inputCustom = document.getElementById("inputCategoriaPersonalizada");
          if (catSelect) catSelect.value = estado.categoria || "";
          if (inputCustom) inputCustom.value = estado.categoriaCustom || "";
          document.getElementById("inputEdad").value = estado.edad || "";

          if (estado.competidores.length > 0) {
            estado.competidores.forEach((comp) => agregarCompetidor(comp));
          } else {
            agregarCompetidor();
          }
        } else {
          agregarCompetidor();
        }
      } catch (error) {
        console.error("No se pudo restaurar la planilla:", error);
        document.getElementById("listaPuntajes")?.replaceChildren();
        contadorCompetidores = 0;
        agregarCompetidor();
      } finally {
        restaurando = false;
      }

      actualizarBotonesEliminar();
      verificarBotonSorteo();
      guardarCache(contadorCompetidores);
    }

    function inicializarControles() {
      document.getElementById("btnAgregarCompetidor")?.addEventListener("click", () => agregarCompetidor());
      document.getElementById("btnCalcularPodio")?.addEventListener("click", () => calcularPodio(contadorCompetidores));
      document.getElementById("btnNuevaLlave")?.addEventListener("click", abrirNuevaLlave);
      document.getElementById("btnExportarExcel")?.addEventListener("click", exportarExcel);
      document.getElementById("btnExportarPDF")?.addEventListener("click", exportarPDF);
      document.getElementById("btnReiniciarPlanilla")?.addEventListener("click", reiniciarPlanilla);
      document.getElementById("btnSortearFormas")?.addEventListener("click", sortearYAsignar);
      document.getElementById("btnSortearDesempate")?.addEventListener("click", sortearFormaEmpate);
      document.getElementById("inputCategoria")?.addEventListener("change", verificarBotonSorteo);
      document.getElementById("inputCategoriaPersonalizada")?.addEventListener("input", verificarBotonSorteo);
      document.getElementById("inputEdad")?.addEventListener("change", verificarBotonSorteo);
      document.addEventListener("keydown", (event) => {
        const elementoActivo = document.activeElement;
        const esCampoEditable = elementoActivo?.matches('input, textarea, select, button, [contenteditable="true"]');

        if (event.code !== "Space" || event.repeat || esCampoEditable) return;

        event.preventDefault();
        window.TorneoCronometro.alternar();
      });
      document.getElementById("btnCronoPlay")?.addEventListener("click", window.TorneoCronometro.iniciar);
      document.getElementById("btnCronoPausa")?.addEventListener("click", window.TorneoCronometro.pausar);
      document.getElementById("btnCronoReset")?.addEventListener("click", () => window.TorneoCronometro.reiniciar());
      document.getElementById("btnAbrirTV")?.addEventListener("click", window.TorneoCronometro.abrirTV);
    }

    inicializarControles();

    return {
      agregarCompetidor,
      toggleDesempate,
      eliminarCompetidor,
      actualizarTiempo,
      procesarNotas,
      actualizarTotal,
      sortearYAsignar,
      sortearFormaEmpate,
      verificarBotonSorteo,
      calcularPodio: () => calcularPodio(contadorCompetidores),
      guardarCache: () => guardarCache(contadorCompetidores),
      cargarCache: cargarEstadoGuardado,
      reiniciarPlanilla,
      exportarPDF,
      exportarExcel,
    };
  })();

  window.appTorneo = appTorneo;
})();

window.onload = function () {
  appTorneo.cargarCache();
};
