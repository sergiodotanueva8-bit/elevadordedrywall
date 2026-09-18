# Landing de venta — Producto 2 (pedidos directos a WhatsApp)

Copia de la landing original, pero **sin base de datos**.
Aquí el pedido **no viaja a Supabase ni a la app de ventas**: al confirmar la compra
se guarda un respaldo en el navegador y se abre **WhatsApp de la tienda** con todos
los datos que el cliente llenó, listos para enviar.

---

## 1. Qué cambió respecto a la landing original

| | Landing original | Esta landing |
|---|---|---|
| Base de datos | Supabase (`pedidos`, `eventos_analytics`) | Ninguna |
| Al confirmar | Guardaba en Supabase, tú escribías desde la app admin | Abre WhatsApp de la tienda con el pedido completo |
| Archivos | `js/supabase-client.js`, `supabase/schema.sql`, CDN de Supabase | `js/pedidos.js` |
| Claves/API keys | Sí | No hace falta ninguna |

---

## 2. Lo único que tienes que editar: `js/config.js`

```js
WHATSAPP_NUMERO: "51923757221",   // ← número de la TIENDA (sin +, sin espacios)
TIENDA_NOMBRE:   "Mr. Barril Store",
PRODUCTO_NOMBRE: "NOMBRE DEL PRODUCTO NUEVO",
PRECIO_REGULAR:  150.00,
PRECIO_TACHADO:  200.00,
COSTO_INSTALACION_LIMA: 50.00,
PRECIO_X2_UNIDAD: 140,
PRECIO_X3_UNIDAD: 135,
ABRIR_WHATSAPP_AUTOMATICO: true,  // false = el cliente lo envía con el botón verde
```

---

## 3. Cómo funciona el flujo ahora

1. El cliente llena el formulario (Lima o Provincia) y toca **Confirmar pedido**.
2. Se valida todo igual que antes (nombre, WhatsApp, distrito/dirección, DNI, sede Shalom, etc.).
3. El pedido se guarda en `localStorage` con un **código** tipo `PED-260917-A3F2`.
4. Se abre WhatsApp apuntando a `WHATSAPP_NUMERO` con un mensaje como:

```
🛒 NUEVO PEDIDO — Mr. Barril Store
Código: PED-260917-A3F2

📦 Nombre del producto
Cantidad: 2
Color: Negro
Precio unitario: S/ 140.00
Subtotal: S/ 280.00

📍 Envío a Lima
Nombre: Juan Pérez
WhatsApp: 987654321
Distrito: Surco
Dirección: Av. Principal 123 Dpto 402
Instalación: Sí, agregar (S/ 50.00)
Ubicación GPS: https://www.google.com/maps?q=-12.10,-77.01

💰 Total a pagar: S/ 330.00
Modalidad: Pago contra entrega
```

5. El cliente ve la pantalla de éxito con su código y un botón verde
   **"Enviar mi pedido por WhatsApp"** (respaldo si el navegador bloqueó la apertura).

> Ojo: WhatsApp siempre requiere que el cliente presione "enviar". Ningún sitio web
> puede mandar el mensaje solo. Por eso la pantalla de éxito se lo recuerda.

---

## 4. Ver los pedidos guardados en el navegador

Los respaldos son locales al navegador del cliente (no los ves tú a distancia).
En tu propio equipo, abriendo la consola del navegador (F12):

```js
Pedidos.leerPedidosGuardados()   // lista de pedidos
Pedidos.descargarCSV()           // descarga pedidos.csv
```

Sirve para pruebas. **Tu registro real de ventas es el WhatsApp.**

---

## 5. Para adaptar al producto nuevo

- `js/config.js` → nombre, precios, WhatsApp.
- `index.html` → textos, título de la página, testimonios, FAQs
  (quedan 41 menciones al producto anterior: busca "tendedero" y reemplaza).
- `assets/images/` → reemplaza las fotos manteniendo los mismos nombres de archivo
  y no tienes que tocar el HTML.
- `assets/videos/producto-video.mp4` → video del producto nuevo.
- Si el producto nuevo **no se instala**, quita del `index.html` la tarjeta de
  instalación y el checkbox `campo-agrega-instalacion` (el resumen se ajusta solo).

---

## 6. Desplegar

Es un sitio 100% estático: sirve cualquier hosting.

- **Render**: New → Static Site → conecta el repo → Publish directory `./` (o usa `render.yaml`).
- **Netlify / Vercel / GitHub Pages**: arrastra la carpeta o conecta el repo. Sin build.
