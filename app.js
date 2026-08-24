// ======================================================================
// CONFIGURACIÓN — lo único que normalmente vas a tocar
// ======================================================================

// Número de WhatsApp del negocio para el botón "Consultar por WhatsApp".
// Formato: código de país + número, SIN "+" y SIN espacios. Ej: 5491122334455
const WHATSAPP_NUMBER = "5491100000000";

// ID de la Google Sheet que funciona como "base de datos" del catálogo.
// Se saca de la URL de la hoja: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
// Dejalo vacío ("") para que la página use solo los datos embebidos en products.fallback.js.
const SHEET_ID = "";

// Nombre de la pestaña (tab) dentro de esa Google Sheet que tiene la tabla de productos.
const SHEET_NAME = "productos";

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

const SWATCH_COLORS = {
  buzos:"#8a6a4f", bermudas:"#5c7a63", camisas:"#4d6a80", remeras:"#a5622f", camperas:"#5b5266", mallas:"#b1483f"
};

let PRODUCTS = [];
let activeCat = "all";
let query = "";

function money(n){ return "$" + Number(n).toLocaleString("es-AR"); }

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
        iName = idx("nombre"), iTalles = idx("talles"), iUnid = idx("unidades"),
        iOrig = idx("precio_original"), iLiq = idx("precio_liquidacion"),
        iImg = idx("imagen_url"), iImg2 = idx("imagen_url_alt");
  const out = [];
  for (let r = 1; r < rows.length; r++){
    const row = rows[r];
    if (!row[iName]) continue;
    const unidades = Number(row[iUnid]) || 0;
    if (unidades <= 0) continue; // vendido / sin stock -> no se muestra
    out.push({
      id: row[iId] || String(r),
      cat: row[iCat] || "otros",
      catName: row[iCatName] || row[iCat] || "Otros",
      name: row[iName],
      talles: (row[iTalles] || "").split("|").map(t => t.trim()).filter(Boolean),
      unidades,
      orig: Number(row[iOrig]) || 0,
      liq: Number(row[iLiq]) || 0,
      img: (iImg > -1 ? row[iImg] : "") || "",
      img2: (iImg2 > -1 ? row[iImg2] : "") || ""
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
    setSyncNote(`Catálogo sincronizado con Google Sheets (${products.length} productos).`);
  } catch (err){
    console.warn("No se pudo leer la Google Sheet, usando datos embebidos:", err);
    PRODUCTS = PRODUCTS_FALLBACK;
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
    btn.addEventListener("click", ()=>{ activeCat = btn.dataset.cat; renderFilters(); renderGrid(); });
  });
}

function waLink(p){
  const talles = p.talles.join(", ");
  const msg = `Hola! Vi en la web de liquidación el ${p.name} (${p.catName}) — talles disponibles: ${talles}. ¿Sigue disponible?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function cardHTML(p){
  const off = p.orig ? Math.round((1 - p.liq/p.orig)*100) : 0;
  const lowStock = p.unidades <= 1;
  const hasImg = p.img && p.img.trim();
  const hasAlt = hasImg && p.img2 && p.img2.trim();
  const primaryLayer = hasImg
    ? `<div class="layer primary${hasAlt ? " has-alt" : ""}" style="background-image:url('${p.img}')"></div>`
    : `<div class="layer primary">${ICONS[p.cat] || ""}<span class="ph-label">Foto próximamente</span></div>`;
  const altLayer = hasAlt ? `<div class="layer alt" style="background-image:url('${p.img2}')"></div>` : "";
  return `
    <div class="card">
      <div class="swatch cat-${p.cat}">
        ${primaryLayer}
        ${altLayer}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.catName}</div>
        <div class="card-name">${p.name}</div>
        <div class="talles">${p.talles.map(t=>`<span class="talle">${t}</span>`).join("")}</div>
        <div class="price-row">
          <span class="price-orig">${money(p.orig)}</span>
          <span class="price-liq">${money(p.liq)}</span>
          <span class="off-badge">-${off}%</span>
        </div>
        <div class="stock-note">${lowStock ? "Última unidad" : p.unidades + " unidades en stock"}</div>
        <a class="wa-btn" href="${waLink(p)}" target="_blank" rel="noopener">${WA_ICON} Consultar por WhatsApp</a>
      </div>
    </div>
  `;
}

function renderGrid(){
  const q = query.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p=>{
    const catOk = activeCat==="all" || p.cat===activeCat;
    const qOk = !q || p.name.toLowerCase().includes(q) || p.catName.toLowerCase().includes(q);
    return catOk && qOk;
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

(async function init(){
  await loadProducts();
  renderStats();
  renderFilters();
  renderGrid();
})();
