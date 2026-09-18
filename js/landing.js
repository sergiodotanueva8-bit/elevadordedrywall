/**
 * ============================================================
 * LANDING — lógica principal de la página
 * ============================================================
 * Maneja: galería de imágenes/video, selección de cantidad,
 * contador de stock dinámico, barra fija inferior, y registro
 * de eventos de analytics básicos.
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", function () {

  Pixels.inicializar();
  Pedidos.registrarEvento("page_view");

  Pixels.dispararEvento("ViewContent", "ViewContent", {
    content_id: CONFIG.PRODUCTO_NOMBRE,
    content_name: CONFIG.PRODUCTO_NOMBRE,
    value: CONFIG.PRECIO_REGULAR,
    currency: "PEN",
  });

  // ----------------------------------------------------------
  // GALERÍA: carrusel táctil (scroll-snap) con dots + miniaturas
  // ----------------------------------------------------------
  const carrusel = document.getElementById("galeria-carrusel");
  const slides = document.querySelectorAll(".galeria__slide");
  const dots = document.querySelectorAll(".galeria__dot");
  const miniaturas = document.querySelectorAll(".miniatura[data-indice]");
  // Sin selector de color: el Elevador de Drywall no tiene variantes.

  let navegandoManual = false;
  let timerNavManual;

  function irASlide(indice) {
    if (!carrusel || !slides[indice]) return;
    // Marca de inmediato y bloquea el detector de scroll para que no lo pise
    navegandoManual = true;
    clearTimeout(timerNavManual);
    marcarActivo(indice);
    carrusel.scrollTo({ left: carrusel.clientWidth * indice, behavior: "smooth" });
    // Reactiva el detector cuando el scroll suave ya terminó
    timerNavManual = setTimeout(function () { navegandoManual = false; }, 600);
  }

  function marcarActivo(indice) {
    dots.forEach(function (dot) {
      dot.classList.toggle("activo", parseInt(dot.getAttribute("data-indice"), 10) === indice);
    });
    miniaturas.forEach(function (m) {
      m.classList.toggle("activa", parseInt(m.getAttribute("data-indice"), 10) === indice);
    });
  }

  // Clicks en dots y miniaturas mueven el carrusel
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      irASlide(parseInt(dot.getAttribute("data-indice"), 10));
    });
  });

  miniaturas.forEach(function (miniatura) {
    miniatura.addEventListener("click", function () {
      irASlide(parseInt(miniatura.getAttribute("data-indice"), 10));
    });
  });

  // ── Video del producto (slide 0): al tocar ▶ se reproduce el video ──
  const btnPlay = document.getElementById("btn-play-video");
  const video = document.getElementById("video-producto");
  const posterImg = document.getElementById("video-poster-img");
  if (btnPlay && video) {
    btnPlay.addEventListener("click", function () {
      // Ocultar imagen, botón y textos superpuestos; mostrar y reproducir video
      if (posterImg) posterImg.style.display = "none";
      btnPlay.style.display = "none";
      document.querySelectorAll("[data-overlay-video]").forEach(function (el) {
        el.style.display = "none";
      });
      video.style.display = "block";
      video.setAttribute("controls", "controls");
      video.play();
    });
    // Al terminar el video, volver a mostrar la imagen y el botón ▶
    video.addEventListener("ended", function () {
      video.style.display = "none";
      video.removeAttribute("controls");
      if (posterImg) posterImg.style.display = "";
      btnPlay.style.display = "";
      document.querySelectorAll("[data-overlay-video]").forEach(function (el) {
        el.style.display = "";
      });
    });
  }

  // Al deslizar con el dedo, detecta en qué slide quedó y actualiza dots/miniaturas
  if (carrusel) {
    let timeoutScroll;
    carrusel.addEventListener("scroll", function () {
      if (navegandoManual) return; // no pisar la selección hecha por dot/color
      clearTimeout(timeoutScroll);
      timeoutScroll = setTimeout(function () {
        const indiceActual = Math.round(carrusel.scrollLeft / carrusel.clientWidth);
        marcarActivo(indiceActual);
      }, 80);
    });
  }

  // ----------------------------------------------------------
  // PRECIO ÚNICO — sin descuento por cantidad ni selector de unidades.
  // El Elevador de Drywall se vende de a una sola unidad.
  // ----------------------------------------------------------
  var cantidadSeleccionada = 1;

  function obtenerPrecioUnitarioPorCantidad(_cantidadIgnorada) {
    return CONFIG.PRECIO_REGULAR;
  }

  // ----------------------------------------------------------
  // BARRA FIJA: nombre y precio (fijos, sin variación por cantidad)
  // ----------------------------------------------------------
  function actualizarBarraFija() {
    var precioUnit = CONFIG.PRECIO_REGULAR;

    var nombreEl = document.getElementById("barra-fija-nombre");
    if (nombreEl) nombreEl.textContent = CONFIG.PRODUCTO_NOMBRE;

    var precioEl = document.getElementById("barra-fija-precio");
    if (precioEl) precioEl.textContent = "S/ " + precioUnit.toFixed(2);

    // EDITAR: si cambias el precio regular o el tachado en config.js,
    // actualiza también este porcentaje del badge de descuento.
    var badgeEl = document.getElementById("barra-fija-badge");
    if (badgeEl) badgeEl.textContent = "-19%";
  }

  // Inicializar barra fija con valores por defecto
  actualizarBarraFija();

  // ----------------------------------------------------------
  // CONTADOR DE STOCK — 100% SIMULADO (decorativo, genera urgencia)
  // ----------------------------------------------------------
  // Ya NO se lee de Supabase. Arranca en STOCK_SIMULADO_INICIAL y
  // va variando solo de a poquitos (nunca saltos bruscos, nunca
  // llega a 0). Cada visitante ve su propia simulación independiente.
  // ----------------------------------------------------------
  const STOCK_SIMULADO_INICIAL = 32;
  const STOCK_SIMULADO_MINIMO = 6;   // nunca baja de aquí (genera urgencia sin asustar)
  const STOCK_SIMULADO_MAXIMO = 32;  // nunca sube más que el inicial
  const STOCK_MAXIMO_VISUAL = STOCK_SIMULADO_MAXIMO; // referencia para el ancho de la barra

  let stockSimuladoActual = STOCK_SIMULADO_INICIAL;
  // Sesgo hacia abajo: la mayoría de los movimientos restan, generando
  // la sensación de "se está agotando", pero a veces sube un poco
  // (simulando que llegó reposición o que alguien canceló).
  let tendenciaBajando = true;

  function pintarStock(unidades) {
    const porcentaje = Math.max(5, Math.min(100, (unidades / STOCK_MAXIMO_VISUAL) * 100));

    document.querySelectorAll("[data-stock-texto]").forEach(function (el) {
      el.textContent = "¡SOLO QUEDAN " + unidades + " UNIDADES!";
    });

    document.querySelectorAll("[data-stock-numero]").forEach(function (el) {
      el.textContent = unidades;
    });

    document.querySelectorAll("[data-stock-barra]").forEach(function (el) {
      el.style.width = porcentaje + "%";
    });
  }

  function siguientePasoStock() {
    // Si toca el piso o el techo, invierte la tendencia.
    if (stockSimuladoActual <= STOCK_SIMULADO_MINIMO) tendenciaBajando = false;
    if (stockSimuladoActual >= STOCK_SIMULADO_MAXIMO) tendenciaBajando = true;

    // 75% de probabilidad de seguir la tendencia actual, 25% de
    // quedarse igual ese tick (para que no se sienta mecánico).
    const azar = Math.random();
    let delta = 0;
    if (azar < 0.75) {
      delta = tendenciaBajando ? -1 : 1;
    }
    // Pequeña chance de revertir la tendencia incluso sin tocar los límites,
    // simulando variación natural (alguien compró, llegó reposición, etc.)
    if (Math.random() < 0.08) tendenciaBajando = !tendenciaBajando;

    stockSimuladoActual = Math.max(
      STOCK_SIMULADO_MINIMO,
      Math.min(STOCK_SIMULADO_MAXIMO, stockSimuladoActual + delta)
    );

    pintarStock(stockSimuladoActual);
  }

  function iniciarContadorStockSimulado() {
    pintarStock(stockSimuladoActual);
    // Cambia cada 7-15 segundos (aleatorio), para que no se sienta
    // como un timer mecánico de intervalo fijo.
    function programarSiguiente() {
      const espera = 7000 + Math.random() * 8000;
      setTimeout(function () {
        siguientePasoStock();
        programarSiguiente();
      }, espera);
    }
    programarSiguiente();
  }

  iniciarContadorStockSimulado();

  // ----------------------------------------------------------
  // BARRA FIJA INFERIOR: aparece después de hacer scroll
  // ----------------------------------------------------------
  const barraFija = document.getElementById("barra-fija-inferior");
  const seccionProducto = document.getElementById("seccion-producto");

  if (barraFija && seccionProducto) {
    const observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) {
            barraFija.classList.add("visible");
          } else {
            barraFija.classList.remove("visible");
          }
        });
      },
      { threshold: 0 }
    );
    observador.observe(seccionProducto);
  }

  // ----------------------------------------------------------
  // CONTADOR "X personas están viendo este producto" (variación leve)
  // ----------------------------------------------------------
  const elementoViendo = document.querySelector("[data-personas-viendo]");
  if (elementoViendo) {
    setInterval(function () {
      const base = 18;
      const variacion = Math.floor(Math.random() * 8); // entre 0 y 7
      elementoViendo.textContent = (base + variacion) + " personas están viendo este producto";
    }, 8000);
  }

  // ----------------------------------------------------------
  // BOTONES QUE ABREN EL MODAL DE CHECKOUT
  // ----------------------------------------------------------
  document.querySelectorAll("[data-abrir-checkout]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      Pedidos.registrarEvento("click_cta_principal");
      Pixels.dispararEvento("AddToCart", "AddToCart", {
        content_id: CONFIG.PRODUCTO_NOMBRE,
        content_name: CONFIG.PRODUCTO_NOMBRE,
        quantity: cantidadSeleccionada,
        value: obtenerPrecioUnitarioPorCantidad(cantidadSeleccionada) * cantidadSeleccionada,
        currency: "PEN",
      });
      Pixels.dispararEvento("InitiateCheckout", "InitiateCheckout", {
        content_id: CONFIG.PRODUCTO_NOMBRE,
        content_name: CONFIG.PRODUCTO_NOMBRE,
        quantity: cantidadSeleccionada,
        value: obtenerPrecioUnitarioPorCantidad(cantidadSeleccionada) * cantidadSeleccionada,
        currency: "PEN",
      });
      if (window.CheckoutModal) {
        window.CheckoutModal.abrir();
      }
    });
  });

  // ----------------------------------------------------------
  // BOTÓN FLOTANTE DE WHATSAPP (contacto directo, fuera del checkout)
  // ----------------------------------------------------------
  const whatsappFlotante = document.getElementById("whatsapp-flotante");
  if (whatsappFlotante) {
    whatsappFlotante.addEventListener("click", function () {
      Pedidos.registrarEvento("click_whatsapp_flotante");
    });
  }

});