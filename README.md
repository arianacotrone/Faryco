# Far & Co. — Liquidación

Landing de catálogo (ex Farenheite). Tres archivos, sin build ni dependencias:

- `index.html` — estructura de la página
- `styles.css` — todo el diseño
- `app.js` — la lógica: trae los productos, arma los filtros, el buscador y las tarjetas
- `products.fallback.js` — una copia fija de los 320 productos (se usa si todavía no conectaste la Google Sheet, o si por algún motivo no se puede llegar a ella)

## Publicarla en GitHub Pages con tu dominio

1. Subí estos 4 archivos a la raíz de un repo nuevo en GitHub.
2. **Settings → Pages → Source → Deploy from a branch**, elegí `main` y `/ (root)`. En unos minutos queda online en `https://tu-usuario.github.io/tu-repo/`.
3. Para tu dominio propio: **Settings → Pages → Custom domain**, escribí el dominio (esto crea un archivo `CNAME` en el repo). En tu proveedor de DNS agregá:
   - Subdominio (`www.tudominio.com`): registro **CNAME** → `tu-usuario.github.io`
   - Dominio raíz (`tudominio.com`): 4 registros **A** → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Tildá "Enforce HTTPS" cuando el DNS ya haya propagado.

## Cómo queda vinculado a tu Google Drive (y cómo se actualiza el stock)

La idea: el catálogo vive en una Google Sheet dentro de tu Drive. La página web la lee automáticamente cada vez que alguien la abre — vos **nunca tenés que tocar código para actualizar precios o stock**, solo editás la planilla.

> Nota: quise crear esa Google Sheet directo en tu Drive para dejarte todo funcionando, pero la conexión a Google Drive de esta sesión expiró a mitad de camino. Es un paso de 5 minutos que podés hacer vos (o reconectamos Drive y lo termino yo la próxima). Los pasos:

**1. Crear la Google Sheet**
- Te dejo aparte un archivo `catalogo_web.csv` con los 320 productos ya cargados (categoría, nombre, talles, unidades, precio original, precio de liquidación, y dos columnas vacías para las fotos: principal y alternativa).
- En Google Sheets: **Archivo → Importar → Subir** ese CSV → "Reemplazar hoja de cálculo actual". Poné a la pestaña el nombre `productos` (así viene por defecto en `app.js`).
- Te recomiendo guardarla en la misma carpeta de Drive donde ya tenés "VENTAS FHT / DETALLES", para tener todo junto.

**2. Hacerla legible desde la web**
- Botón **Compartir** (arriba a la derecha) → cambiar a "Cualquier persona con el enlace" → rol **Lector**. Sin este paso la página no va a poder leerla (va a mostrar el catálogo de respaldo en su lugar, así que nunca se rompe, pero tampoco se actualiza).

**3. Conectarla a la página**
- De la URL de la hoja (`https://docs.google.com/spreadsheets/d/ESTO_ES_EL_ID/edit`) copiá el ID.
- En `app.js`, al principio del archivo, pegalo acá:
  ```js
  const SHEET_ID = "ESTO_ES_EL_ID";
  ```
- Subís el `app.js` actualizado a GitHub y listo — la página ya lee la planilla en vivo.

**Cómo se actualiza el stock de ahí en adelante:** abrís la Google Sheet y editás directamente.
- ¿Se vendió todo un modelo? Poné `0` en la columna `unidades` (o borrá la fila) — desaparece solo de la web la próxima vez que alguien la abra. No hace falta tocar GitHub.
- ¿Cambiás el % de descuento? Editás la columna `precio_liquidacion`.
- ¿Cargás un producto nuevo? Agregás una fila con el mismo formato que las demás (podés copiar el `id` más alto +1).

La página recarga los datos de la Sheet cada vez que alguien la visita (no hay caché intermedio), así que los cambios se ven casi al instante.

## Cómo se actualizan las fotos

Cada producto tiene dos columnas en la Google Sheet: `imagen_url` (foto principal) e `imagen_url_alt` (foto alternativa — el mismo efecto que tiene farenheite.com de mostrar otra foto al pasar el mouse). Hoy las dos están vacías, por eso se ve el ícono de categoría con "Foto próximamente".

- Si solo cargás `imagen_url`, la tarjeta muestra esa foto fija (con un leve zoom al pasar el mouse).
- Si cargás las dos, al pasar el mouse por la tarjeta la foto principal se funde suavemente hacia la alternativa (ej: prenda sola → prenda puesta, o frente → espalda). No hace falta nada más, el efecto es automático apenas las dos celdas tienen datos.

Para conseguir el link de cada foto, dos formas:

- **Recomendado — carpeta `images/` en el mismo repo de GitHub:** subís la foto a una carpeta `images/` en tu repo (ej. `images/bermuda-lawes.jpg`) y en `imagen_url` ponés `https://raw.githubusercontent.com/tu-usuario/tu-repo/main/images/bermuda-lawes.jpg`. Es la opción más confiable — no depende de permisos de Drive ni se puede cortar por límites de tráfico.
- **Alternativa — imagen alojada en Drive:** subís la foto a Drive, click derecho → Compartir → "Cualquier persona con el enlace", copiás el link y lo transformás al formato `https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO` (el ID es la parte larga del link que copiaste). Funciona, pero Google a veces limita estas imágenes si reciben mucho tráfico — para el catálogo del día a día andá con la opción de GitHub.

En cuanto la celda `imagen_url` tiene algo cargado, la tarjeta del producto muestra esa foto en vez del placeholder — no hace falta cambiar nada más.

## Antes de publicar — el WhatsApp

En `app.js`, muy arriba, reemplazá el número de prueba por el real del negocio (código de país + número, sin `+` ni espacios):
```js
const WHATSAPP_NUMBER = "5491100000000";
```
