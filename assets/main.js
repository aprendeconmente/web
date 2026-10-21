// Aprende con Mente: servicios, precios y movimiento.
// Script clásico (sin módulos) para que funcione también abriendo el archivo desde el disco.
// Para cambiar precios: editar assets/pricing.json. Si no se puede leer (por ejemplo, abriendo
// el archivo sin servidor), se usan los datos de respaldo de abajo. Mantener ambos iguales.

// Las animaciones solo se activan si este script corre. Si no corre, todo el contenido queda visible.
document.documentElement.classList.add("anim");

const RESPALDO = {
  servicios: [
    {
      id: "acompanamiento-psicopedagogico",
      titulo: "Acompañamiento psicopedagógico",
      descripcion: "Sesiones individuales para trabajar dificultades de aprendizaje, atención, memoria, funciones cognitivas y alfabetización inicial desde el origen del problema.",
      icono: "📘",
      precioSesion: "ARS 45.000",
      detalleSesion: "por sesión de 45 min",
      planMensual: { activo: true, precio: "Consultar", detalle: "pagos mensuales preferenciales", etiqueta: "", destacado: false },
      orden: 1,
      activo: true
    },
    {
      id: "grupos-estimulacion-alfabetizacion",
      titulo: "Grupos de estimulación y alfabetización",
      descripcion: "Espacios reducidos para potenciar lectura, escritura, lenguaje, conducta y habilidades previas al aprendizaje con recursos lúdicos y estructurados.",
      icono: "🌟",
      precioSesion: "ARS 60.000",
      detalleSesion: "programa grupal",
      planMensual: { activo: false, precio: "", detalle: "", etiqueta: "", destacado: false },
      orden: 2,
      activo: false
    },
    {
      id: "inclusion-educativa",
      titulo: "Inclusión educativa",
      descripcion: "Orientación a docentes, adaptaciones pedagógicas y seguimiento escolar para que la inclusión sea real, posible y sostenida en el tiempo.",
      icono: "🏫",
      precioSesion: "ARS 45.000",
      detalleSesion: "por sesión de 45 min",
      planMensual: { activo: false, precio: "", detalle: "", etiqueta: "", destacado: false },
      orden: 3,
      activo: true
    }
  ]
};

const LISTA = document.getElementById("lista-servicios");
const SIN_MOVIMIENTO = window.matchMedia("(prefers-reduced-motion: reduce)");

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : String(texto);
  return div.innerHTML;
}

// Íconos lineales propios: trazo uniforme, esquinas redondeadas, grilla de 24 px.
const ICONOS = {
  "acompanamiento-psicopedagogico": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5v-.8a6.2 6.2 0 0 1 6.2-6.2h2.6a6.2 6.2 0 0 1 6.2 6.2v.8"/></svg>`,
  "inclusion-educativa": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.3"/><path d="M3 20v-.6a5.4 5.4 0 0 1 5.4-5.4h1.2a5.4 5.4 0 0 1 5.4 5.4v.6"/><path d="M15.6 4.9a3.3 3.3 0 0 1 0 6.2"/><path d="M17.6 14.6a5.4 5.4 0 0 1 3.4 5v.4"/></svg>`,
  "grupos-estimulacion-alfabetizacion": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.5" cy="8" r="2.6"/><circle cx="17.5" cy="8" r="2.6"/><circle cx="12" cy="15.5" r="2.6"/></svg>`
};

function tarjeta(servicio) {
  const plan = servicio.planMensual || {};
  const precioPlan = plan.precio && plan.precio.trim() !== "" ? plan.precio : "Consultar";

  return `
    <article class="card${plan.destacado ? " card-highlight" : ""} reveal">
      <span class="icon-tile" aria-hidden="true">${ICONOS[servicio.id] || escapar(servicio.icono)}</span>
      <h3>${escapar(servicio.titulo)}</h3>
      <p>${escapar(servicio.descripcion)}</p>
      <div class="price">
        <span class="price-main">${escapar(servicio.precioSesion)}</span>
        <span class="price-detail">${escapar(servicio.detalleSesion)}</span>
      </div>
      ${plan.activo ? `
      <div class="price price-plan">
        ${plan.etiqueta ? `<span class="badge">${escapar(plan.etiqueta)}</span>` : ""}
        <span class="price-main">${escapar(precioPlan)}</span>
        <span class="price-detail">${escapar(plan.detalle)}</span>
      </div>` : ""}
    </article>`;
}

function pintarServicios(datos) {
  const servicios = (datos.servicios || [])
    .filter((s) => s.activo !== false)
    .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99));
  LISTA.innerHTML = servicios.map(tarjeta).join("");
}

async function cargarServicios() {
  try {
    const respuesta = await fetch("assets/pricing.json", { cache: "no-cache" });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    pintarServicios(await respuesta.json());
  } catch (error) {
    // Sin servidor (archivo abierto desde el disco) o sin conexión: usamos los datos de respaldo.
    pintarServicios(RESPALDO);
  }
  activarRevelado();
}

// Revelado al hacer scroll, con entrada escalonada entre hermanos.
function activarRevelado() {
  document.querySelectorAll(".checklist li").forEach((li) => li.classList.add("reveal"));
  const elementos = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          const el = entrada.target;
          el.classList.add("is-visible");
          observador.unobserve(el);
          // Se limpia el retraso para que el hover no quede demorado
          setTimeout(() => { el.style.transitionDelay = ""; }, 1600);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
  );
  elementos.forEach((el) => {
    const hermanos = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    const orden = Math.max(0, hermanos.indexOf(el));
    el.style.transitionDelay = `${Math.min(orden, 5) * 110}ms`;
    observador.observe(el);
  });
}

// Imagen principal con leve desplazamiento al hacer scroll
function activarParallax() {
  if (SIN_MOVIMIENTO.matches) return;
  const imagenes = document.querySelectorAll("[data-parallax]");
  if (!imagenes.length) return;
  let pendiente = false;
  window.addEventListener("scroll", () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      imagenes.forEach((figura) => {
        const factor = parseFloat(figura.dataset.parallax) || 0.08;
        const desplazamiento = Math.max(-40, Math.min(40, window.scrollY * factor * -1));
        figura.style.transform = `translate3d(0, ${desplazamiento}px, 0)`;
      });
      pendiente = false;
    });
  }, { passive: true });
}

// Método: en computadora, los tres pilares se van reemplazando mientras se baja la página.
function activarMetodo() {
  const track = document.querySelector(".metodo-track");
  if (!track) return;
  const pilares = track.querySelectorAll(".pillar");
  const puntos = track.querySelectorAll(".metodo-dots span");
  const escritorio = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  let pendiente = false;

  const actualizar = () => {
    pendiente = false;
    if (!escritorio.matches) return;
    const rango = track.offsetHeight - window.innerHeight;
    const avance = rango > 0
      ? Math.min(1, Math.max(0, -track.getBoundingClientRect().top / rango))
      : 0;
    const indice = Math.min(pilares.length - 1, Math.floor(avance * pilares.length));
    pilares.forEach((p, i) => p.classList.toggle("is-active", i === indice));
    puntos.forEach((p, i) => p.classList.toggle("is-active", i === indice));
  };
  const pedir = () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  };

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  actualizar();
}

// Números que cuentan al entrar en pantalla
function activarContadores() {
  if (SIN_MOVIMIENTO.matches || !("IntersectionObserver" in window)) return;
  const contadores = document.querySelectorAll("[data-count]");
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        observador.unobserve(el);
        const destino = parseInt(el.dataset.count, 10) || 0;
        const sufijo = el.dataset.suffix || "";
        const duracion = 3200;
        let inicio = null;
        const paso = (ahora) => {
          if (inicio === null) inicio = ahora;
          const t = Math.min(1, (ahora - inicio) / duracion);
          const suave = 1 - Math.pow(1 - t, 3);
          el.textContent = `${Math.round(destino * suave)}${sufijo}`;
          if (t < 1) requestAnimationFrame(paso);
        };
        el.textContent = `0${sufijo}`;
        requestAnimationFrame(paso);
      });
    },
    { threshold: 0.5 }
  );
  contadores.forEach((el) => observador.observe(el));
}

// Menú desplegable en celular
function activarMenu() {
  const boton = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu-principal");
  if (!boton || !menu) return;
  const cerrar = () => {
    boton.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };
  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    menu.classList.toggle("is-open", !abierto);
  });
  menu.querySelectorAll("a").forEach((enlace) => enlace.addEventListener("click", cerrar));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
}

// Título principal: se anima palabra por palabra al cargar
function animarTitulo() {
  const titulo = document.querySelector(".hero h1");
  if (!titulo) return;
  titulo.querySelectorAll(".w").forEach((palabra, i) => palabra.style.setProperty("--i", i));
  requestAnimationFrame(() => titulo.classList.add("in"));
}

cargarServicios();
activarParallax();
activarMenu();
animarTitulo();
activarMetodo();
activarContadores();
