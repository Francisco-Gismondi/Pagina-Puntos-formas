(function () {
  const urlParams = new URLSearchParams(window.location.search);
  let idMesa = urlParams.get("mesa");

  if (!idMesa) {
    idMesa = Date.now().toString(36);
    const nuevaUrl = window.location.pathname + "?mesa=" + idMesa;
    window.location.replace(nuevaUrl);
  }

  const STORAGE_KEY = `torneoTaekwondoCaché_${idMesa}`;

  function serializarEstado({
    categoria,
    categoriaCustom,
    edad,
    contadorCompetidores,
  }) {
    const estado = {
      categoria: categoria || "",
      categoriaCustom: categoriaCustom || "",
      edad: edad || "",
      competidores: [],
    };

    for (let id = 1; id <= contadorCompetidores; id++) {
      const nombreInput = document.getElementById(`nombre_${id}`);
      if (!nombreInput) continue;

      const filaDesempate = document.getElementById(`fila_3_${id}`);
      estado.competidores.push({
        id,
        nombre: nombreInput.value,
        cinturon: document.getElementById(`cinturon_${id}`)
          ? document.getElementById(`cinturon_${id}`).value
          : "",
        f1: document.getElementById(`forma_${id}_1`)
          ? document.getElementById(`forma_${id}_1`).value
          : "",
        f2: document.getElementById(`forma_${id}_2`)
          ? document.getElementById(`forma_${id}_2`).value
          : "",
        f3: document.getElementById(`forma_${id}_3`)
          ? document.getElementById(`forma_${id}_3`).value
          : "",
        j1: [1, 2, 3, 4, 5].map((j) =>
          document.getElementById(`j${j}_${id}_1`)
            ? document.getElementById(`j${j}_${id}_1`).value
            : "",
        ),
        j2: [1, 2, 3, 4, 5].map((j) =>
          document.getElementById(`j${j}_${id}_2`)
            ? document.getElementById(`j${j}_${id}_2`).value
            : "",
        ),
        j3: [1, 2, 3, 4, 5].map((j) =>
          document.getElementById(`j${j}_${id}_3`)
            ? document.getElementById(`j${j}_${id}_3`).value
            : "",
        ),
        desempateActivo: filaDesempate
          ? filaDesempate.style.display !== "none"
          : false,
      });
    }

    return estado;
  }

  function guardarCache(contadorCompetidores) {
    const estado = serializarEstado({
      categoria: document.getElementById("inputCategoria")
        ? document.getElementById("inputCategoria").value
        : "",
      categoriaCustom: document.getElementById("inputCategoriaPersonalizada")
        ? document.getElementById("inputCategoriaPersonalizada").value
        : "",
      edad: document.getElementById("inputEdad")
        ? document.getElementById("inputEdad").value
        : "",
      contadorCompetidores,
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch (error) {
      console.warn("Caché bloqueada por el navegador.", error);
    }
  }

  function cargarCache() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("No se pudo cargar el caché del torneo:", error);
      return null;
    }
  }

  function limpiarCache() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.TorneoStorage = {
    guardarCache,
    cargarCache,
    limpiarCache,
  };
})();
