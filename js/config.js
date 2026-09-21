/**
 * ============================================================
 * CONFIGURACIÓN DEL PROYECTO — Elevador de Paneles de Drywall
 * ============================================================
 * Esta landing NO usa base de datos (no hay Supabase).
 * Al confirmar el pedido:
 *   1. El pedido se guarda localmente en el navegador (respaldo).
 *   2. Se abre WhatsApp de la TIENDA con TODOS los datos del
 *      cliente ya escritos en el mensaje. El cliente decide si
 *      lo envía o no — ninguna web puede enviarlo sola.
 *
 * Este es el ÚNICO archivo que necesitas editar para los datos
 * del producto y del WhatsApp. Si cambias el nombre o el precio
 * aquí, recuerda también actualizar el <title> y las etiquetas
 * og:* en index.html (esas las lee WhatsApp/Facebook y no pueden
 * generarse con JavaScript).
 * ============================================================
 */

const CONFIG = {

  // ----------------------------------------------------------
  // 1. WHATSAPP DE LA TIENDA
  // ----------------------------------------------------------
  // Número donde llegarán los pedidos.
  // Formato: código de país + número, SIN "+", espacios ni guiones.
  WHATSAPP_NUMERO: "51923757221",

  // Nombre de la tienda (aparece en el mensaje de WhatsApp)
  TIENDA_NOMBRE: "Mr. Barril Store",

  // ----------------------------------------------------------
  // 2. PRODUCTO Y PRECIO
  // ----------------------------------------------------------
  // Se vende de a una sola unidad, a precio único (sin descuento
  // por cantidad y sin variantes de color).
  PRODUCTO_NOMBRE: "Elevador de Paneles de Drywall",
  PRECIO_REGULAR: 529.00,
  PRECIO_TACHADO: 650.00,

  // ----------------------------------------------------------
  // 3. COSTO DE DELIVERY (solo Lima)
  // ----------------------------------------------------------
  // Envío GRATIS tanto a Lima como a Provincia.
  // Los pedidos a LIMA no suman ningún costo de delivery (se paga
  // contraentrega, junto con el producto, sin cargo extra).
  // Los pedidos a PROVINCIA tampoco suman nada aquí: el flete de
  // Shalom está incluido; solo se coordina un pequeño adelanto de
  // S/ 20 por WhatsApp y la diferencia se paga al recoger.
  COSTO_ENVIO_LIMA: 0.00,

  // ----------------------------------------------------------
  // 4. OPCIONES DEL CHECKOUT
  // ----------------------------------------------------------
  // Abrir WhatsApp automáticamente al confirmar el pedido.
  // El cliente siempre tiene que tocar "enviar" en WhatsApp: eso
  // no se puede saltar. Esta opción solo controla si el chat se
  // le abre solo o si tiene que tocar el botón verde de la
  // pantalla de éxito.
  ABRIR_WHATSAPP_AUTOMATICO: true,

  // ----------------------------------------------------------
  // 5. ANALYTICS / TRACKING (opcional)
  // ----------------------------------------------------------
  // Déjalos vacíos ("") si todavía no los usas.
  META_PIXEL_ID: "",
  TIKTOK_PIXEL_ID: "D97EJ73C77U29TKO6ETG",

};
