/**
 * ============================================================
 * GESTOR DE PEDIDOS — SIN BASE DE DATOS
 * ============================================================
 * Reemplaza por completo a js/supabase-client.js.
 *
 * Qué hace:
 *   - guardarPedido()      -> guarda el pedido en localStorage
 *                             (respaldo dentro del navegador)
 *   - construirLinkWhatsapp() -> arma el link wa.me con el mensaje
 *   - enviarPedidoAWhatsapp() -> abre WhatsApp de la tienda
 *   - registrarEvento()    -> solo consola (no viaja a ningún lado)
 *
 * No hay servidor, no hay base de datos, no hay claves.
 * Todo vive en el navegador del cliente y termina en tu WhatsApp.
 * ============================================================
 */

const Pedidos = (function () {

  const CLAVE_STORAGE = "pedidos_landing";

  // ----------------------------------------------------------
  // Utilidades
  // ----------------------------------------------------------
  function obtenerUTMs() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
      utm_id: params.get("utm_id") || null,
      ttclid: params.get("ttclid") || null,
    };
  }

  let sessionIdMemoria = null;
  function obtenerSessionId() {
    if (!sessionIdMemoria) {
      sessionIdMemoria =
        "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    }
    return sessionIdMemoria;
  }

  function generarCodigoPedido() {
    // Código corto y legible para que tú y el cliente hablen del mismo pedido
    const fecha = new Date();
    const yy = String(fecha.getFullYear()).slice(2);
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PED-" + yy + mm + dd + "-" + azar;
  }

  // ----------------------------------------------------------
  // Guardado local (respaldo)
  // ----------------------------------------------------------
  function leerPedidosGuardados() {
    try {
      const crudo = localStorage.getItem(CLAVE_STORAGE);
      return crudo ? JSON.parse(crudo) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Guarda el pedido en el navegador. Devuelve el pedido ya
   * completado con código y fecha.
   */
  function guardarPedido(datosPedido) {
    const registro = Object.assign(
      {
        codigo: generarCodigoPedido(),
        fecha_iso: new Date().toISOString(),
        session_id: obtenerSessionId(),
        pagina: window.location.href,
      },
      datosPedido,
      obtenerUTMs()
    );

    try {
      const lista = leerPedidosGuardados();
      lista.push(registro);
      // Guardamos como máximo los últimos 50 para no llenar el storage
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista.slice(-50)));
    } catch (error) {
      console.warn("[Pedidos] No se pudo guardar el respaldo local:", error);
    }

    console.info("[Pedidos] Pedido registrado:", registro);
    return registro;
  }

  /**
   * Descarga todos los pedidos guardados en este navegador como CSV.
   * Útil si algún día quieres revisarlos desde tu propio equipo.
   * Se usa escribiendo en la consola: Pedidos.descargarCSV()
   */
  function descargarCSV() {
    const lista = leerPedidosGuardados();
    if (lista.length === 0) {
      console.info("[Pedidos] No hay pedidos guardados en este navegador.");
      return;
    }

    const columnas = Object.keys(
      lista.reduce(function (acc, p) {
        Object.keys(p).forEach(function (k) { acc[k] = true; });
        return acc;
      }, {})
    );

    const escapar = function (valor) {
      if (valor === null || valor === undefined) return "";
      return '"' + String(valor).replace(/"/g, '""').replace(/\n/g, " ") + '"';
    };

    const filas = [columnas.join(",")];
    lista.forEach(function (p) {
      filas.push(columnas.map(function (c) { return escapar(p[c]); }).join(","));
    });

    const blob = new Blob(["\uFEFF" + filas.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedidos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ----------------------------------------------------------
  // WhatsApp de la tienda
  // ----------------------------------------------------------
  function construirLinkWhatsapp(mensaje) {
    const numero = String(CONFIG.WHATSAPP_NUMERO || "").replace(/\D/g, "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);
  }

  /**
   * Abre el WhatsApp de la tienda con el mensaje ya armado.
   * Debe llamarse dentro del click del usuario para que el
   * navegador no lo bloquee como popup.
   */
  function enviarPedidoAWhatsapp(mensaje) {
    const url = construirLinkWhatsapp(mensaje);
    const ventana = window.open(url, "_blank");
    if (!ventana) {
      // Si el navegador bloqueó la pestaña, navegamos en la misma
      window.location.href = url;
    }
    return url;
  }

  // ----------------------------------------------------------
  // Eventos (antes iban a Supabase; ahora solo a consola)
  // ----------------------------------------------------------
  function registrarEvento(tipoEvento, metadata) {
    console.debug("[Evento]", tipoEvento, metadata || {});
  }

  return {
    guardarPedido,
    leerPedidosGuardados,
    descargarCSV,
    construirLinkWhatsapp,
    enviarPedidoAWhatsapp,
    registrarEvento,
    obtenerSessionId,
    obtenerUTMs,
  };
})();

window.Pedidos = Pedidos;

// Alias de compatibilidad: el resto de archivos heredados llaman a
// SupabaseCliente.registrarEvento(). Así no rompen y no envían nada.
window.SupabaseCliente = Pedidos;
