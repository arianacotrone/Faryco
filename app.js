// ======================================================================
// CONFIGURACIÓN — lo único que normalmente vas a tocar
// ======================================================================

// Número de WhatsApp del negocio para "Consultar" y para cerrar el pedido del carrito.
// Formato: código de país + número, SIN "+" y SIN espacios. Ej: 5491122334455
const WHATSAPP_NUMBER = "5491134442814";

// ID de la Google Sheet que funciona como "base de datos" del catálogo.
// Se saca de la URL de la hoja: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
// Dejalo vacío ("") para que la página use solo los datos embebidos en products.fallback.js.
const SHEET_ID = "1i19uO_mq9iejI-e5fdFf3joGCJCphSmACIp2vqzV9Sg"; 

// Nombre de la pestaña (tab) dentro de esa Google Sheet que tiene la tabla de productos.
const SHEET_NAME = "productos";

// A partir de qué monto de compra el envío a zona sur es gratis.
const FREE_SHIPPING_MIN = 50000;

// Localidades del Partido de Almirante Brown = "zona sur" con envío gratis desde el monto de arriba.
// Agregá o sacá localidades libremente, es solo una lista de texto.
const ALMIRANTE_BROWN_LOCALIDADES = [
  "Rafael Calzada", "Adrogué", "Burzaco", "Claypole", "Don Orione", "Glew",
  "José Mármol", "Longchamps", "Malvinas Argentinas", "Ministro Rivadavia (San José)",
  "San Francisco Solano"
];

// Peso estimado (en kg) de una prenda de cada categoría, para calcular el tramo de envío.
// Son valores aproximados — ajustalos si ves que el peso real de tus prendas es distinto.
const CATEGORY_WEIGHT_KG = {
  buzos: 0.5, bermudas: 0.35, camisas: 0.3, remeras: 0.22, camperas: 0.7, mallas: 0.15
};

// Tarifas ESTIMADAS de envío por zona y por peso total del pedido, saliendo desde CP 1847
// (Rafael Calzada). Son valores de referencia armados a partir de tarifas públicas de Correo
// Argentino — antes de lanzar, verificalas con el cotizador oficial y ajustá los números acá.
// El total real siempre se termina de confirmar por WhatsApp antes de despachar.
const SHIPPING_ZONES = {
  almirante_brown: { label: "Zona sur (Almirante Brown)", rates: { hasta1: 3500, hasta3: 4500, mas3: 6000 } },
  caba_gba:        { label: "CABA / Gran Buenos Aires",   rates: { hasta1: 5500, hasta3: 7000, mas3: 9500 } },
  resto_bsas:      { label: "Resto de la Provincia de Buenos Aires", rates: { hasta1: 7500, hasta3: 9500, mas3: 13000 } },
  interior:        { label: "Otra provincia / interior del país",   rates: { hasta1: 9500, hasta3: 13000, mas3: 18000 } }
};

// ======================================================================
// A partir de acá no hace falta tocar nada para el uso normal.
// ======================================================================

const ICONS = {
  buzos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3 3 7l3 3 2-1.4V21h8V8.6L18 10l3-3-5-4-2 2h-4L8 3Z"/></svg>',
  bermudas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3h14l1 8-2 10h-4l-1-8-1 8H8L6 11 5 3Z"/></svg>',
  camisas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3 4 6l1.5 3L8 8v13h8V8l2.5 1L20 6l-4-3-2 2h-4L8 3Z"/><path d="M10 3v3a2 2 0 0 0 4 0V3"/></svg>',
  remeras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3 3 7l3 3 2-1.4V21h8V8.6L19 10l3-3-5-4-2 2h-4L8 3Z"/></svg>',
  camperas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3 3 7l3 3 2-1.4V21h2v-6h4v6h2V8.6L19 10l3-3-5-4-2 2h-4L8 3Z"/><line x1="12" y1="9" x2="12" y2="21"/></svg>',
  mallas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h12l1 5-3 1v12H8V9L5 8l1-5Z"/></svg>'
};
const WA_ICON = '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.2.58 4.27 1.6 6.06L4 29l8.16-1.56A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.62 28 15S22.64 3 16.02 3Zm6.98 16.6c-.3.85-1.5 1.56-2.46 1.76-.66.14-1.5.25-4.36-.94-3.65-1.5-6-5.2-6.18-5.44-.18-.24-1.47-1.96-1.47-3.74 0-1.78.92-2.65 1.26-3.02.3-.33.66-.4.88-.4.22 0 .44 0 .63.01.2.01.47-.08.74.56.3.7 1 2.42 1.08 2.6.08.18.14.4.03.64-.1.24-.16.4-.32.6-.16.2-.34.45-.48.6-.16.18-.33.37-.14.7.18.33.82 1.36 1.77 2.2 1.22 1.08 2.24 1.42 2.58 1.58.34.16.53.14.73-.08.2-.22.85-1 1.08-1.34.22-.34.44-.28.74-.17.3.1 1.9.9 2.22 1.06.32.16.53.24.6.38.08.14.08.8-.22 1.64Z"/></svg>';
const TRASH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>';

const SWATCH_COLORS = {
  buzos:"#8a6a4f", bermudas:"#5c7a63", camisas:"#4d6a80", remeras:"#a5622f", camperas:"#5b5266", mallas:"#b1483f"
};

const SIZE_ORDER = ["XS","S","M","L","XL","XXL","2XL","3XL"];
function sizeCompare(a, b){
  const an = Number(a), bn = Number(b);
  if (!isNaN(an) && !isNaN(bn)) return an - bn;
  const ai = SIZE_ORDER.indexOf(a), bi = SIZE_ORDER.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.localeCompare(b, "es");
}

const CART_KEY = "farco_cart_v1";
let PRODUCTS = [];
let CART = [];
let activeCat = "all";
let activeTalle = null;
let activeColor = null;
let query = "";

function money(n){ return "$" + Number(n).toLocaleString("es-AR"); }

// Convierte un link de "Compartir" de Google Drive (.../file/d/ID/view...) en un link
// que se puede mostrar directo como imagen. Si ya es un link directo, o de otro origen,
// lo deja igual.
function normalizeImgUrl(url){
  if (!url) return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const m = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  const m2 = trimmed.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  return trimmed;
}

function parseSizeStock(tallesStr){
  const out = [];
  (tallesStr || "").split("|").forEach(part => {
    part = part.trim();
    if (!part || part.indexOf("×") === -1) return;
    const [size, qtyStr] = part.split("×");
    const qty = Number(String(qtyStr).trim()) || 0;
    if (size && qty > 0) out.push({ size: size.trim(), qty });
  });
  return out;
}

// ---- parseo de la Google Sheet publicada como CSV ----
// Google devuelve el CSV con líneas separadas por \r\n y celdas entre comillas cuando
// tienen comas adentro; este parser simple cubre ese caso sin depender de librerías externas.
function parseCSV(text){
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++){
    const c = text[i];
    if (inQuotes){
      if (c === '"'){
        if (text[i+1] === '"'){ cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ','){ row.push(cell); cell = ""; }
      else if (c === '\n'){ row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (c === '\r'){ /* ignore */ }
      else cell += c;
    }
  }
  if (cell.length || row.length){ row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => v !== ""));
}

function rowsToProducts(rows){
  const header = rows[0].map(h => h.trim().toLowerCase());
  const idx = name => header.indexOf(name);
  const iId = idx("id"), iCat = idx("categoria"), iCatName = idx("categoria_nombre"),
        iName = idx("nombre"), iColor = idx("color"), iTalles = idx("talles"), iUnid = idx("unidades"),
        iOrig = idx("precio_original"), iLiq = idx("precio_liquidacion"),
        iImg = idx("imagen_url"), iImg2 = idx("imagen_url_alt");
  const out = [];
  for (let r = 1; r < rows.length; r++){
    const row = rows[r];
    if (!row[iName]) continue;
    const unidades = Number(row[iUnid]) || 0;
    if (unidades <= 0) continue; // vendido / sin stock -> no se muestra
    const talles = (row[iTalles] || "").split("|").map(t => t.trim()).filter(Boolean);
    out.push({
      id: row[iId] || String(r),
      cat: row[iCat] || "otros",
      catName: row[iCatName] || row[iCat] || "Otros",
      name: row[iName],
      color: iColor > -1 ? (row[iColor] || "").trim() : "",
      talles,
      sizeStock: parseSizeStock(row[iTalles]),
      unidades,
      orig: Number(row[iOrig]) || 0,
      liq: Number(row[iLiq]) || 0,
      img: normalizeImgUrl(iImg > -1 ? row[iImg] : ""),
      img2: normalizeImgUrl(iImg2 > -1 ? row[iImg2] : "")
    });
  }
  return out;
}

async function loadProducts(){
  if (!SHEET_ID){
    PRODUCTS = PRODUCTS_FALLBACK;
    return;
  }
  try{
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const rows = parseCSV(text);
    const products = rowsToProducts(rows);
    if (!products.length) throw new Error("La hoja no devolvió productos");
    PRODUCTS = products;
    setSyncNote(`Envío gratis dentro de Almirante Brown en compras superiores a 50000 · Precios y disponibilidad sujetos a stock real al momento de la consulta.`);
  } catch (err){
    console.warn("No se pudo leer la Google Sheet, usando datos embebidos:", err);
    PRODUCTS = PRODUCTS_FALLBACK.map(p => ({ ...p, sizeStock: p.sizeStock || parseSizeStock(p.talles.join("|")) }));
    setSyncNote("No se pudo conectar con Google Sheets — mostrando la última copia guardada en el sitio.");
  }
}

function setSyncNote(msg){
  let el = document.getElementById("syncNote");
  if (!el){
    el = document.createElement("div");
    el.id = "syncNote";
    el.className = "sync-note";
    document.querySelector(".hero").insertAdjacentElement("afterend", el);
  }
  el.textContent = msg;
}

function renderStats(){
  const totalUnidades = PRODUCTS.reduce((s,p)=>s+p.unidades,0);
  const totalRefs = PRODUCTS.length;
  const el = document.getElementById("statRow");
  el.innerHTML = `
    <div class="stat"><div class="num">${totalRefs}</div><div class="lbl">Modelos</div></div>
    <div class="stat"><div class="num">${totalUnidades}</div><div class="lbl">Prendas</div></div>
    <div class="stat"><div class="num">~35%</div><div class="lbl">Off promedio</div></div>
  `;
}

function renderFilters(){
  const cats = [...new Map(PRODUCTS.map(p => [p.cat, p.catName])).entries()];
  const el = document.getElementById("filterRow");
  const chips = [["all","Todo"], ...cats];
  el.innerHTML = chips.map(([key,label]) =>
    `<button class="chip ${activeCat===key?'active':''}" data-cat="${key}">${label}</button>`
  ).join("") + `<span class="count" id="countLbl"></span>`;
  el.querySelectorAll(".chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      activeCat = btn.dataset.cat;
      activeTalle = null;
      activeColor = null;
      renderFilters();
      renderSubmenu();
      renderGrid();
    });
  });
}

// ---- submenú de talle / color, una vez elegida una categoría ----
function renderSubmenu(){
  const el = document.getElementById("submenu");
  if (activeCat === "all"){
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  const inCat = PRODUCTS.filter(p => p.cat === activeCat);
  const sizesMap = new Map();
  const colorsSet = new Set();
  inCat.forEach(p => {
    p.sizeStock.forEach(s => { if (s.qty > 0) sizesMap.set(s.size, true); });
    if (p.color) colorsSet.add(p.color);
  });
  const sizes = [...sizesMap.keys()].sort(sizeCompare);
  const colors = [...colorsSet].sort((a,b) => a.localeCompare(b, "es"));

  let html = "";
  if (sizes.length){
    html += `<div class="submenu-row"><span class="submenu-label">Talle</span><div class="submenu-chips">`;
    html += `<button class="chip chip-sm ${!activeTalle?'active':''}" data-kind="talle" data-val="">Todos</button>`;
    sizes.forEach(s => {
      html += `<button class="chip chip-sm ${activeTalle===s?'active':''}" data-kind="talle" data-val="${s}">${s}</button>`;
    });
    html += `</div></div>`;
  }
  if (colors.length){
    html += `<div class="submenu-row"><span class="submenu-label">Color</span><div class="submenu-chips">`;
    html += `<button class="chip chip-sm ${!activeColor?'active':''}" data-kind="color" data-val="">Todos</button>`;
    colors.forEach(c => {
      html += `<button class="chip chip-sm ${activeColor===c?'active':''}" data-kind="color" data-val="${c}">${c}</button>`;
    });
    html += `</div></div>`;
  }
  el.innerHTML = html;
  el.hidden = !html;
  el.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.kind, val = btn.dataset.val || null;
      if (kind === "talle") activeTalle = val;
      else activeColor = val;
      renderSubmenu();
      renderGrid();
    });
  });
}

function waLink(p){
  const talles = p.talles.join(", ");
  const msg = `Hola! Vi en la web de liquidación el ${p.name} (${p.catName}) — talles disponibles: ${talles}. ¿Sigue disponible?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function cardHTML(p){
  const off = p.orig ? Math.round((1 - p.liq/p.orig)*100) : 0;
  const availableSizes = p.sizeStock.filter(s => s.qty > 0);
  const totalUnidades = availableSizes.reduce((s,x) => s+x.qty, 0);
  const lowStock = totalUnidades <= 1;
  const hasImg = p.img && p.img.trim();
  const hasAlt = hasImg && p.img2 && p.img2.trim();
  const primaryLayer = hasImg
    ? `<div class="layer primary${hasAlt ? " has-alt" : ""}" style="background-image:url('${p.img}')"></div>`
    : `<div class="layer primary">${ICONS[p.cat] || ""}<span class="ph-label">Foto próximamente</span></div>`;
  const altLayer = hasAlt ? `<div class="layer alt" style="background-image:url('${p.img2}')"></div>` : "";
  const sizeOptions = availableSizes.map(s => `<option value="${s.size}">${s.size}</option>`).join("");
  return `
    <div class="card">
      <div class="swatch cat-${p.cat}">
        ${primaryLayer}
        ${altLayer}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.catName}${p.color ? " · " + p.color : ""}</div>
        <div class="card-name">${p.name}</div>
        <div class="talles">${p.talles.map(t=>`<span class="talle">${t}</span>`).join("")}</div>
        <div class="price-row">
          <span class="price-orig">${money(p.orig)}</span>
          <span class="price-liq">${money(p.liq)}</span>
          <span class="off-badge">-${off}%</span>
        </div>
        <div class="stock-note">${lowStock ? "Última unidad" : totalUnidades + " unidades en stock"}</div>
        <div class="card-controls">
          <select class="talle-select" data-id="${p.id}" aria-label="Elegir talle">
            <option value="">Talle</option>
            ${sizeOptions}
          </select>

          <div class="qty-stepper">
              <button type="button" class="qty-btn qty-minus" aria-label="Restar" disabled>−</button>
              <span class="qty-value text-muted">1</span>
              <button type="button" class="qty-btn qty-plus" aria-label="Sumar" disabled>+</button>
          </div>
        </div>
        <button type="button" class="add-cart-btn" data-id="${p.id}">Agregar al carrito</button>
        <a class="wa-link-small" href="${waLink(p)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
      </div>
    </div>
  `;
}

function renderGrid(){
  const q = query.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p=>{
    const catOk = activeCat==="all" || p.cat===activeCat;
    const qOk = !q || p.name.toLowerCase().includes(q) || p.catName.toLowerCase().includes(q) || (p.color||"").toLowerCase().includes(q);
    const talleOk = !activeTalle || p.sizeStock.some(s => s.size===activeTalle && s.qty>0);
    const colorOk = !activeColor || p.color===activeColor;
    return catOk && qOk && talleOk && colorOk;
  });
  const grid = document.getElementById("grid");
  const empty = document.getElementById("emptyState");
  const countLbl = document.getElementById("countLbl");
  if (countLbl) countLbl.textContent = `Mostrando ${filtered.length} de ${PRODUCTS.length}`;
  if (filtered.length === 0){
    grid.innerHTML = ""; empty.style.display = "block"; return;
  }
  empty.style.display = "none";
  grid.innerHTML = filtered.map(cardHTML).join("");
  filtered.forEach((p,i)=>{
    if (!(p.img && p.img.trim())){
      const layerEl = grid.children[i].querySelector(".swatch .layer.primary");
      if (layerEl) layerEl.style.background = SWATCH_COLORS[p.cat] || "#8a7a68";
    }
  });
}

document.getElementById("searchInput").addEventListener("input", (e)=>{
  query = e.target.value; renderGrid();
});

// ======================================================================
// CARRITO
// ======================================================================

function loadCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    CART = raw ? JSON.parse(raw) : [];
  } catch (e){ CART = []; }
}
function saveCart(){
  try { localStorage.setItem(CART_KEY, JSON.stringify(CART)); } catch (e){ /* almacenamiento no disponible */ }
}
function cartItemKey(productId, talle){ return productId + "::" + talle; }

function addToCart(product, talle, qty){
  const stockForSize = (product.sizeStock.find(s => s.size === talle) || {}).qty || 0;
  if (stockForSize <= 0) return false;

  const key = cartItemKey(product.id, talle);
  const existing = CART.find(c => c.key === key);
  const currentQty = existing ? existing.qty : 0;

  // Verificar si ya alcanzó el máximo disponible
  if (currentQty + qty > stockForSize) {
    alert(`Solo quedan ${stockForSize} unidad(es) disponibles en talle ${talle}.`);
    return false;
  }

  const newQty = currentQty + qty;
  if (existing) existing.qty = newQty;
  else CART.push({
    key, id: product.id, name: product.name, catName: product.catName, cat: product.cat,
    color: product.color, talle, unitPrice: product.liq, qty: newQty, maxQty: stockForSize,
    img: product.img || ""
  });
  saveCart();
  renderCart();
  return true;
}

function updateCartQty(key, delta){
  const item = CART.find(c => c.key === key);
  if (!item) return;
  item.qty = Math.max(0, Math.min(item.qty + delta, item.maxQty));
  if (item.qty === 0) CART = CART.filter(c => c.key !== key);
  saveCart();
  renderCart();
}
function removeFromCart(key){
  CART = CART.filter(c => c.key !== key);
  saveCart();
  renderCart();
}
function cartSubtotal(){ return CART.reduce((s,c) => s + c.unitPrice*c.qty, 0); }
function cartWeightKg(){ return CART.reduce((s,c) => s + (CATEGORY_WEIGHT_KG[c.cat] || 0.3) * c.qty, 0); }

function zoneForLocalidad(value){
  if (ALMIRANTE_BROWN_LOCALIDADES.includes(value)) return "almirante_brown";
  if (value === "__caba_gba__") return "caba_gba";
  if (value === "__resto_bsas__") return "resto_bsas";
  if (value === "__interior__") return "interior";
  return null;
}

function computeShipping(zoneKey, weightKg, subtotal){
  const zone = SHIPPING_ZONES[zoneKey];
  if (!zone) return null;
  if (zoneKey === "almirante_brown" && subtotal >= FREE_SHIPPING_MIN){
    return { cost: 0, free: true, label: zone.label };
  }
  const tier = weightKg <= 1 ? "hasta1" : (weightKg <= 3 ? "hasta3" : "mas3");
  return { cost: zone.rates[tier], free: false, label: zone.label, tier };
}

function populateLocalidadSelect(){
  const sel = document.getElementById("shipLocalidad");
  let html = `<option value="">Elegí tu localidad</option>`;
  html += `<optgroup label="Zona sur — Almirante Brown (envío gratis desde ${money(FREE_SHIPPING_MIN)})">`;
  ALMIRANTE_BROWN_LOCALIDADES.forEach(loc => { html += `<option value="${loc}">${loc}</option>`; });
  html += `</optgroup>`;
  html += `<optgroup label="Otras zonas">`;
  html += `<option value="__caba_gba__">CABA / Gran Buenos Aires (otros partidos)</option>`;
  html += `<option value="__resto_bsas__">Resto de la Provincia de Buenos Aires</option>`;
  html += `<option value="__interior__">Otra provincia / interior del país</option>`;
  html += `</optgroup>`;
  sel.innerHTML = html;
}

function cartItemHTML(c){
  const hasImg = c.img && c.img.trim();
  const thumb = hasImg
    ? `<div class="cart-item-thumb" style="background-image:url('${c.img}')"></div>`
    : `<div class="cart-item-thumb cart-item-thumb-ph" style="background:${SWATCH_COLORS[c.cat] || '#8a7a68'}">${ICONS[c.cat] || ""}</div>`;
  return `
    <div class="cart-item" data-key="${c.key}">
      ${thumb}
      <div class="cart-item-main">
        <div class="cart-item-top">
          <div class="cart-item-info">
            <div class="cart-item-name">${c.name}</div>
            <div class="cart-item-meta">${c.color ? c.color + " · " : ""}Talle ${c.talle} <span class="cart-item-unit">· ${money(c.unitPrice)} c/u</span></div>
          </div>
          <button type="button" class="cart-remove" aria-label="Quitar del carrito" title="Quitar">${TRASH_ICON}</button>
        </div>
        <div class="cart-item-bottom">
          <div class="qty-stepper small">
            <button type="button" class="qty-btn cart-qty-minus" aria-label="Restar">−</button>
            <span class="qty-value">${c.qty}</span>
            <button type="button" class="qty-btn cart-qty-plus" aria-label="Sumar">+</button>
          </div>
          <div class="cart-item-subtotal">${money(c.unitPrice * c.qty)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderCart(){
  const count = CART.reduce((s,c) => s + c.qty, 0);
  const countEl = document.getElementById("cartCount");
  countEl.textContent = count;
  countEl.hidden = count === 0;

  const headerCountEl = document.getElementById("cartHeaderCount");
  if (headerCountEl){
    headerCountEl.textContent = count > 0 ? `(${count})` : "";
    headerCountEl.hidden = count === 0;
  }

  const itemsEl = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmptyMsg");
  const shipSection = document.getElementById("cartShipSection");
  const footer = document.getElementById("cartFooter");

  if (CART.length === 0){
    itemsEl.innerHTML = "";
    emptyEl.hidden = false;
    shipSection.hidden = true;
    footer.hidden = true;
    return;
  }
  emptyEl.hidden = true;
  shipSection.hidden = false;
  footer.hidden = false;
  itemsEl.innerHTML = CART.map(cartItemHTML).join("");
  refreshShippingAndTotals();
}

function refreshShippingAndTotals(){
  const subtotal = cartSubtotal();
  document.getElementById("cartSubtotal").textContent = money(subtotal);
  const zoneVal = document.getElementById("shipLocalidad").value;
  const zoneKey = zoneForLocalidad(zoneVal);
  const weight = cartWeightKg();
  const shipLineEl = document.getElementById("cartShippingLine");
  const shipResultEl = document.getElementById("shipResult");
  let shipCost = 0;

  if (!zoneKey){
    shipLineEl.textContent = "Elegí tu localidad";
    shipResultEl.textContent = "";
  } else {
    const res = computeShipping(zoneKey, weight, subtotal);
    if (res.free){
      shipLineEl.textContent = "Gratis 🎉";
      shipResultEl.textContent = `Envío gratis a zona sur por compra desde ${money(FREE_SHIPPING_MIN)}.`;
      shipCost = 0;
    } else {
      shipLineEl.textContent = money(res.cost);
      shipResultEl.textContent = zoneKey === "almirante_brown"
        ? `Con ${money(FREE_SHIPPING_MIN - subtotal)} más de compra, el envío te sale gratis.`
        : `Tarifa estimada para ${res.label.toLowerCase()} (Correo Argentino desde CP 1847, Rafael Calzada).`;
      shipCost = res.cost;
    }
  }
  document.getElementById("cartTotal").textContent = money(subtotal + shipCost);
  updateCheckoutLink(shipCost);
}

function buildOrderMessage(shipCost){
  const lines = ["🛍️ Nuevo pedido — Far & Co.", ""];
  CART.forEach(c => {
    lines.push(`• ${c.name} (${c.catName}) — Talle ${c.talle}${c.color ? " — " + c.color : ""} — x${c.qty} — ${money(c.unitPrice*c.qty)}`);
  });
  lines.push("");
  const subtotal = cartSubtotal();
  lines.push(`Subtotal: ${money(subtotal)}`);

  const localidadSel = document.getElementById("shipLocalidad");
  const localidadText = localidadSel.selectedOptions[0] ? localidadSel.selectedOptions[0].text : "";
  const zoneKey = zoneForLocalidad(localidadSel.value);
  if (zoneKey){
    lines.push(`Envío (${localidadText}): ${shipCost === 0 ? "GRATIS" : money(shipCost)}`);
    lines.push(`TOTAL: ${money(subtotal + shipCost)}`);
  } else {
    lines.push(`Envío: a confirmar`);
    lines.push(`TOTAL (sin envío): ${money(subtotal)}`);
  }
  lines.push("");
  const nombre = document.getElementById("shipNombre").value.trim();
  const telefono = document.getElementById("shipTelefono").value.trim();
  const direccion = document.getElementById("shipDireccion").value.trim();
  if (nombre) lines.push(`🙋 Nombre: ${nombre}`);
  if (telefono) lines.push(`📞 Tel: ${telefono}`);
  if (direccion || localidadText) lines.push(`📍 Dirección: ${direccion}${direccion && localidadText ? ", " : ""}${localidadText}`);
  return lines.join("\n");
}

function updateCheckoutLink(shipCost){
  const btn = document.getElementById("checkoutBtn");
  if (!btn) return;
  if (CART.length === 0){
    btn.href = "#";
    return;
  }
  const cost = typeof shipCost === "number" ? shipCost : 0;
  const msg = buildOrderMessage(cost);
  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ---- interacción: tarjetas de producto (delegación de eventos) ----
document.getElementById("grid").addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-cart-btn");
  if (addBtn){
    const card = addBtn.closest(".card");
    const select = card.querySelector(".talle-select");
    const qtyVal = card.querySelector(".qty-value");
    const talle = select.value;
    if (!talle){
      select.classList.add("input-error");
      select.focus();
      return;
    }
    select.classList.remove("input-error");
    const qty = Number(qtyVal.textContent) || 1;
    const product = PRODUCTS.find(p => String(p.id) === String(addBtn.dataset.id));
    if (!product) return;
    const ok = addToCart(product, talle, qty);
    if (ok){
      const original = addBtn.textContent;
      addBtn.textContent = "Agregado ✓";
      addBtn.classList.add("added");
      setTimeout(() => { addBtn.textContent = original; addBtn.classList.remove("added"); }, 1200);
      qtyVal.textContent = "1";
    }
    return;
  }
  const qtyBtn = e.target.closest(".qty-btn");
  if (qtyBtn){
    const card = qtyBtn.closest(".card");
    const select = card.querySelector(".talle-select");
    const qtyVal = card.querySelector(".qty-value");
    const product = PRODUCTS.find(p => String(p.id) === String(select.dataset.id));
    
    // Obtener el stock total de ese talle
    const maxStock = (product && select.value)
      ? ((product.sizeStock.find(s => s.size === select.value) || {}).qty || 1)
      : 99;

    // Restar lo que el usuario YA tiene agregado en el carrito
    const inCartQty = select.value 
      ? (CART.find(c => c.key === cartItemKey(product.id, select.value)) || {}).qty || 0
      : 0;

    const stockDisponible = Math.max(0, maxStock - inCartQty);

    let v = Number(qtyVal.textContent) || 1;
    if (qtyBtn.classList.contains("qty-plus")) {
      v = Math.min(v + 1, stockDisponible || 1);
    } else {
      v = Math.max(1, v - 1);
    }
    qtyVal.textContent = v;
  }
});

document.getElementById("grid").addEventListener("change", (e) => {
  if (e.target.classList.contains("talle-select")){
    const card = e.target.closest(".card");
    const hasValue = Boolean(e.target.value);
    
    // Resetear valor a 1
    card.querySelector(".qty-value").textContent = "1";
    e.target.classList.remove("input-error");

    // Habilitar / Deshabilitar botones de cantidad
    card.querySelectorAll(".qty-btn").forEach(btn => {
      btn.disabled = !hasValue;
    });
  }
});

// ---- interacción: ítems del carrito ----
document.getElementById("cartItems").addEventListener("click", (e) => {
  const item = e.target.closest(".cart-item");
  if (!item) return;
  const key = item.dataset.key;
  if (e.target.closest(".cart-qty-plus")) updateCartQty(key, 1);
  else if (e.target.closest(".cart-qty-minus")) updateCartQty(key, -1);
  else if (e.target.closest(".cart-remove")) removeFromCart(key);
});

// ---- abrir / cerrar el panel del carrito ----
function openCart(){
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.classList.add("cart-open-lock");
}
function closeCart(){
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.classList.remove("cart-open-lock");
}
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

// ---- formulario de envío ----
document.getElementById("shipLocalidad").addEventListener("change", refreshShippingAndTotals);
["shipNombre","shipTelefono","shipDireccion"].forEach(id => {
  document.getElementById(id).addEventListener("input", refreshShippingAndTotals);
});

(async function init(){
  loadCart();
  populateLocalidadSelect();
  await loadProducts();
  renderStats();
  renderFilters();
  renderSubmenu();
  renderGrid();
  renderCart();
})();
