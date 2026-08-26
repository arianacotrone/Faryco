# Far & Co. — Liquidación

Landing de catálogo con carrito y envío (ex Farenheite). Cuatro archivos, sin build ni dependencias:

- `index.html` — estructura de la página
- `styles.css` — todo el diseño
- `app.js` — la lógica: trae los productos, arma los filtros/submenú, las tarjetas, el carrito y el cálculo de envío
- `products.fallback.js` — una copia fija de los 320 productos (se usa si todavía no conectaste la Google Sheet, o si por algún motivo no se puede llegar a ella — así la página nunca se rompe)

## Cómo queda vinculado a tu Google Drive (y cómo se actualiza el stock)

El catálogo vive en un Google Sheet. La página la lee automáticamente cada vez que alguien la abre — **nunca tenés que tocar código para actualizar precios, stock o fotos**, solo editás la planilla.

- **1. Compartir la Sheet:** botón **Compartir** (arriba a la derecha) → "Cualquier persona con el enlace" → rol **Lector**. Sin este paso la página no puede leerla (muestra el catálogo de respaldo en su lugar, así que nunca se rompe, pero tampoco se actualiza).
- **2. Conectar el ID:** de la URL de la hoja (`https://docs.google.com/spreadsheets/d/ESTO_ES_EL_ID/edit`) copiá **solo el ID** — la parte larga de letras y números entre `/d/` y `/edit`, sin el resto de la URL. En `app.js`, al principio del archivo:
  ```js
  const SHEET_ID = "ESTO_ES_EL_ID";
  ```

**Cómo se actualiza el stock de ahí en adelante:** abrís la Google Sheet y editás directamente.
- ¿Se vendió todo un modelo? Poné `0` en la columna `unidades` (o borrá la fila) — desaparece solo de la web. No hace falta tocar GitHub.
- ¿Se vendió solo un talle? Editá la columna `talles` y sacá ese talle de la lista (ej: `S×1 | M×2` → `M×2` si se vendió la S). El carrito respeta el stock por talle: no deja agregar más unidades de las que quedan cargadas.
- ¿Cambiás el % de descuento? Editás `precio_liquidacion`.
- ¿Cargás un producto nuevo? Agregás una fila con el mismo formato que las demás (copiá el `id` más alto +1).

La página recarga los datos de la Sheet cada vez que alguien la visita (no hay caché intermedio), así que los cambios se ven casi al instante.

**Para editar la Sheet:** abrila normalmente desde Drive con Google Sheets (doble click, o click derecho → Abrir con → Google Sheets). No hace falta "importar" nada para editar día a día — eso solo se usa una vez, la primera vez que armás la planilla a partir de un CSV nuevo (ver más abajo).

## La columna nueva: `color`

Se agregó una columna `color` a la planilla para poder filtrar por color además de por talle. Le adivinamos el color a 256 de los 320 productos a partir del nombre (ej. "Amsterdam Negro" → Negro); quedaron **64 productos sin color asignado** porque el nombre no tenía ninguna palabra de color reconocible (nombres de estilo solos, tipo "Darling" o códigos de una letra). Esos productos van a aparecer en la web sin la etiqueta de color y no van a salir en ningún filtro de color — no rompen nada, pero conviene completarlos a mano cuando tengas un rato: abrí la Sheet, ordená por la columna `color` vacía y completá lo que falte mirando la prenda.

Si tu Sheet actual **no tiene todavía** la columna `color`, importá el archivo `catalogo_web.csv` que te dejamos aparte — está generado a partir de tu Sheet actual (con tus fotos ya cargadas, no se pierde nada) y ya incluye la columna nueva:
- **Archivo → Importar → Subir** ese CSV → elegí **"Reemplazar hoja de cálculo actual"** → confirmá que la casilla de "Convertir texto a números, fecha..." esté como estaba.
- Revisá que la pestaña siga llamándose `productos` (así la busca `app.js`).

## Cómo se actualizan las fotos

Cada producto tiene dos columnas: `imagen_url` (foto principal) e `imagen_url_alt` (foto alternativa — el mismo efecto que tiene farenheite.com de mostrar otra foto al pasar el mouse).

- Si solo cargás `imagen_url`, la tarjeta muestra esa foto fija (con un leve zoom al pasar el mouse).
- Si cargás las dos, al pasar el mouse por la tarjeta la foto principal se funde suavemente hacia la alternativa (ej: prenda sola → prenda puesta, o frente → espalda). Automático apenas las dos celdas tienen datos.

Para conseguir el link de cada foto, dos formas:

- **Recomendado — carpeta `images/` en el mismo repo de GitHub:** subís la foto a una carpeta `images/` en tu repo (ej. `images/bermuda-lawes.jpg`) y en `imagen_url` ponés `https://raw.githubusercontent.com/tu-usuario/tu-repo/main/images/bermuda-lawes.jpg`. Es la opción más confiable — no depende de permisos de Drive ni se puede cortar por límites de tráfico.
- **Alternativa — imagen alojada en Drive:** subís la foto a Drive, click derecho → Compartir → "Cualquier persona con el enlace", y pegás ese link **tal cual** en la columna (el que empieza con `https://drive.google.com/file/d/.../view?usp=sharing`) — **no hace falta transformarlo a mano**, `app.js` lo detecta y lo convierte solo al formato que se puede mostrar. Funciona bien, pero Google a veces limita estas imágenes si reciben mucho tráfico — para el catálogo del día a día andá con la opción de GitHub si podés.

## Filtro por talle y color (submenú)

Al elegir una categoría (Buzos, Bermudas, etc.) aparece debajo un submenú con chips de **Talle** y **Color**, calculados en el momento a partir de lo que hay disponible en esa categoría (si no queda stock de un talle o color, no aparece el chip). Se pueden combinar los dos filtros con la búsqueda de arriba. Esto es automático, no hay nada que configurar.

## El carrito y la compra por WhatsApp

Cada producto tiene un selector de talle, un contador de cantidad y un botón "Agregar al carrito" (además del botón chico de "Consultar por WhatsApp" para el que solo quiere preguntar sin armar un pedido). El carrito:

- Respeta el stock cargado por talle — no deja agregar más de lo que hay.
- Se guarda en el navegador de quien compra (si cierra la página y vuelve, lo mantiene) — esto no toca tu Sheet ni tu stock real hasta que ella o él te escribe.
- Al tocar "Finalizar pedido por WhatsApp" arma un mensaje prearmado con el detalle del pedido, el nombre, teléfono y dirección cargados, y el envío calculado — vos lo recibís y confirmás la venta como siempre. **No hay pago online**, el pedido se cierra por WhatsApp como ya lo venías haciendo.

## Envío gratis a zona sur y tarifas estimadas

Reglas cargadas, todas editables al principio de `app.js`:

- **Envío gratis** en el Partido de Almirante Brown (zona sur) para compras desde `$100.000`. El monto se controla con:
  ```js
  const FREE_SHIPPING_MIN = 100000;
  ```
- **Localidades de Almirante Brown** que cuentan como zona sur — agregá o sacá localidades libremente, es solo una lista de texto:
  ```js
  const ALMIRANTE_BROWN_LOCALIDADES = ["Rafael Calzada", "Adrogué", "Burzaco", ...];
  ```
- **Tarifas** para el resto de los pedidos (zona sur por debajo de $100.000, CABA/GBA, resto de la provincia, interior del país), por tramo de peso, en `SHIPPING_ZONES`:
  ```js
  const SHIPPING_ZONES = {
    almirante_brown: { label: "...", rates: { hasta1: 3500, hasta3: 4500, mas3: 6000 } },
    caba_gba:        { label: "...", rates: { hasta1: 5500, hasta3: 7000, mas3: 9500 } },
    ...
  };
  ```
  **Importante:** estos números son una **tabla estimada**, armada a partir de tarifas públicas de referencia de Correo Argentino (no una cotización oficial en vivo — no tenés acceso a esa API, así que no se puede consultar el precio exacto en tiempo real). Antes de lanzar, te recomendamos verificarlos con el cotizador oficial de Correo Argentino desde el CP `1847` (Rafael Calzada) y ajustar los valores acá. Por eso en el carrito el envío dice "estimado" y el mensaje final de WhatsApp aclara que el total se confirma antes de despachar — así nunca te comprometés a un precio que después no cierra.
- **Peso estimado por categoría** (para elegir el tramo de tarifa), en `CATEGORY_WEIGHT_KG` — ajustalo si el peso real de tus prendas es distinto:
  ```js
  const CATEGORY_WEIGHT_KG = { buzos: 0.5, bermudas: 0.35, camisas: 0.3, remeras: 0.22, camperas: 0.7, mallas: 0.15 };
  ```

## Antes de publicar — el WhatsApp

En `app.js`, muy arriba, confirmá que el número sea el real del negocio (código de país + número, sin `+` ni espacios):
```js
const WHATSAPP_NUMBER = "5491134442814";
```
