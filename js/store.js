// ═══════════════════════════════════
//  store.js — ALMACÉN DE DATOS GLOBAL
//  Contiene todos los datos de la aplicación y persiste
//  en localStorage bajo la clave 'campusbuild_store'.
// ═══════════════════════════════════

const STORE_KEY = 'campusbuild_store';

// ── Datos por defecto (se usan solo la primera vez) ──
const _defaultStore = {
  proyectos: [
    { id: 1, nombre: 'Campusbuild', desc: 'cualquiera', inicio: '2026-04-10', fin: '2026-04-14' }
  ],
  actividades: [
    { id: 1, nombre: 'Acctividad 1', proyectoId: 1, responsableId: '123456789', inicio: '2026-04-10', duracion: 3, estado: 'Terminada' }
  ],
  hitos: [
    { id: 1, nombre: 'Hito 1', desc: 'Nuevo Hito', proyectoId: 1, estado: 'Cumplido' }
  ],
  recursos: [
    { id: '123456789', nombre: 'Responsable 1', nacimiento: '', sangre: '', arl: 'SURA', genero: '', salario: 3000, rol: 'Ingeniero' }
  ]
};

// ── Carga desde localStorage o usa los datos por defecto ──
(function () {
  const saved = localStorage.getItem(STORE_KEY);
  if (saved) {
    try {
      window._storeData = JSON.parse(saved);
    } catch (e) {
      console.warn('CampusBuild: localStorage corrupto, reiniciando datos.', e);
      window._storeData = JSON.parse(JSON.stringify(_defaultStore));
    }
  } else {
    window._storeData = JSON.parse(JSON.stringify(_defaultStore));
  }
})();

let store = window._storeData;

// ── Estado de la aplicación ──
let currentPage = 'dashboard';
let calYear  = 2026;
let calMonth = 3;
let confirmCallback = null;

// ── IDs auto-incrementales: calculados desde los datos cargados ──
// Así evitamos colisiones de ID al recargar
let nextId = {
  p: store.proyectos.length   ? Math.max(...store.proyectos.map(p => p.id))   + 1 : 1,
  a: store.actividades.length ? Math.max(...store.actividades.map(a => a.id)) + 1 : 1,
  h: store.hitos.length       ? Math.max(...store.hitos.map(h => h.id))       + 1 : 1,
};

// ═══════════════════════════════════
//  saveStore — GUARDAR EN LOCALSTORAGE
//  Llamar después de cada operación que modifique el store.
// ═══════════════════════════════════
function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('CampusBuild: error al guardar en localStorage.', e);
  }
}

// ═══════════════════════════════════
//  resetStore — BORRAR TODOS LOS DATOS
//  Útil para desarrollo/testing. Se puede llamar desde consola.
// ═══════════════════════════════════
function resetStore() {
  localStorage.removeItem(STORE_KEY);
  location.reload();
}

// ═══════════════════════════════════
//  FUNCIONES UTILITARIAS
// ═══════════════════════════════════

function getProyectoNombre(id) {
  const p = store.proyectos.find(p => p.id == id);
  return p ? p.nombre : 'Sin proyecto';
}

function getRecursoNombre(id) {
  const r = store.recursos.find(r => r.id == id);
  return r ? r.nombre : 'Sin responsable';
}

function estadoBadge(estado) {
  const map = {
    'Pendiente':  'badge-yellow',
    'En Proceso': 'badge-blue',
    'Terminada':  'badge-green',
    'Cumplido':   'badge-green'
  };
  return `<span class="badge ${map[estado] || 'badge-orange'}">${estado}</span>`;
}

function resetForm(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
    else if (el.tagName === 'SELECT') el.selectedIndex = 0;
  });
}

function animateCard(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'background 0.4s, transform 0.3s, box-shadow 0.3s';
  el.style.background  = 'rgba(0,212,255,0.08)';
  el.style.transform   = 'scale(1.01)';
  el.style.boxShadow   = '0 0 20px rgba(0,212,255,0.15)';
  setTimeout(() => {
    el.style.background = '';
    el.style.transform  = '';
    el.style.boxShadow  = '';
  }, 600);
}

function populateSelects() {
  const proyOpts = store.proyectos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  const recOpts  = store.recursos.map(r  => `<option value="${r.id}">${r.nombre}</option>`).join('');

  ['a-proyecto', 'h-proyecto'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<option value="">Seleccionar proyecto</option>' + proyOpts;
  });

  const ar = document.getElementById('a-responsable');
  if (ar) ar.innerHTML = '<option value="">Seleccionar recurso</option>' + recOpts;

  const af = document.getElementById('act-filter');
  if (af) af.innerHTML = '<option value="">Todos</option>' + proyOpts;

  const cf = document.getElementById('cal-project-filter');
  if (cf) cf.innerHTML = '<option value="">Todos</option>' + proyOpts;
}