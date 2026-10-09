(function () {
  const botonAbrir = document.getElementById("btnMenuConfiguracion");
  const botonCerrar = document.getElementById("btnCerrarConfiguracion");
  const overlay = document.getElementById("menuConfiguracion");
  const panel = overlay?.querySelector(".panel-configuracion");

  if (!botonAbrir || !botonCerrar || !overlay || !panel) {
    throw new Error("No se pudo inicializar el menú de configuración.");
  }

  function cerrarMenu() {
    if (overlay.hidden) return;

    overlay.hidden = true;
    botonAbrir.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    botonAbrir.focus();
  }

  function abrirMenu() {
    overlay.hidden = false;
    botonAbrir.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    botonCerrar.focus();
  }

  botonAbrir.addEventListener("click", abrirMenu);
  botonCerrar.addEventListener("click", cerrarMenu);

  overlay.addEventListener("click", (evento) => {
    if (evento.target === overlay) cerrarMenu();
  });

  document.addEventListener("keydown", (evento) => {
    if (overlay.hidden) return;

    if (evento.key === "Escape") {
      cerrarMenu();
      return;
    }

    if (evento.key !== "Tab") return;

    const elementosEnfocables = panel.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (elementosEnfocables.length === 0) {
      evento.preventDefault();
      panel.focus();
      return;
    }

    const primero = elementosEnfocables[0];
    const ultimo = elementosEnfocables[elementosEnfocables.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });
})();

(function () {
  const CLAVE = "torneo-distintas-formas";
  const interruptor = document.getElementById("switchDistintasFormas");

  if (!interruptor) return;

  try {
    interruptor.checked = localStorage.getItem(CLAVE) === "true";
  } catch (error) {
    interruptor.checked = false;
  }

  interruptor.addEventListener("change", () => {
    try {
      localStorage.setItem(CLAVE, String(interruptor.checked));
    } catch (error) {}
  });
})();

(function () {
  const CLAVE = "torneo-tema";
  const raiz = document.documentElement;
  const interruptor = document.getElementById("miSwitch");
  const mediaOscuro = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function leerGuardado() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (error) {
      return null;
    }
  }

  function aplicarTema(tema) {
    if (tema === "dark") raiz.setAttribute("data-theme", "dark");
    else raiz.removeAttribute("data-theme");
    if (interruptor) interruptor.checked = tema === "dark";
  }

  const guardado = leerGuardado();
  aplicarTema(guardado || (mediaOscuro && mediaOscuro.matches ? "dark" : "light"));

  if (interruptor) {
    interruptor.addEventListener("change", () => {
      const tema = interruptor.checked ? "dark" : "light";
      aplicarTema(tema);
      try {
        localStorage.setItem(CLAVE, tema);
      } catch (error) {}
    });
  }

  if (mediaOscuro && mediaOscuro.addEventListener) {
    mediaOscuro.addEventListener("change", (evento) => {
      if (!leerGuardado()) aplicarTema(evento.matches ? "dark" : "light");
    });
  }
})();
