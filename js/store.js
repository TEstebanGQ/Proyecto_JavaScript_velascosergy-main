// ═══════════════════════════════════
//  store.js — ALMACÉN DE DATOS GLOBAL
//  Contiene todos los datos de la aplicación (proyectos,
//  actividades, hitos, recursos) y las funciones utilitarias
//  compartidas por todos los módulos.
//  Es el primer script que se carga porque todos los demás
//  dependen de estas variables y funciones.
// ═══════════════════════════════════

// ── STORE: objeto central de datos ──
// Todos los datos de la app viven aquí.
// Se modifica directamente por las funciones CRUD de cada módulo.
let store = {
  proyectos: [
    // Proyecto de ejemplo inicial para que la app no quede vacía al cargar
    { id: 1, nombre: 'Campusbuild', desc: 'cualquiera', inicio: '2026-04-10', fin: '2026-04-14' }
  ],
  actividades: [
    // Actividad de ejemplo vinculada al proyecto id:1
    { id: 1, nombre: 'Acctividad 1', proyectoId: 1, responsableId: '123456789', inicio: '2026-04-10', duracion: 3, estado: 'Terminada' }
  ],
  hitos: [
    // Hito de ejemplo vinculado al proyecto id:1
    { id: 1, nombre: 'Hito 1', desc: 'Nuevo Hito', proyectoId: 1, estado: 'Cumplido' }
  ],
  recursos: [
    // Recurso de ejemplo (persona asignable como responsable en actividades)
    { id: '123456789', nombre: 'Responsable 1', nacimiento: '', sangre: '', arl: 'SURA', genero: '', salario: 3000, rol: 'Ingeniero' }
  ]
};

// ── Estado de la aplicación ──
let currentPage = 'dashboard';   // Página actualmente visible
let calYear  = 2026;              // Año mostrado en el calendario
let calMonth = 3;                 // Mes mostrado en el calendario (0=enero, 3=abril)
let confirmCallback = null;       // Función a ejecutar si el usuario confirma el diálogo de eliminación

// ── Contadores de IDs auto-incrementales ──
// Garantizan que cada nuevo elemento tenga un ID único.
let nextId = { p: 2, a: 2, h: 2 };  // p=proyectos, a=actividades, h=hitos

// ═══════════════════════════════════
//  FUNCIONES UTILITARIAS
//  Pequeñas helpers usadas por múltiples módulos.
// ═══════════════════════════════════

// Devuelve el nombre del proyecto dado su ID, o 'Sin proyecto' si no existe
function getProyectoNombre(id) {
  const p = store.proyectos.find(p => p.id == id);
  return p ? p.nombre : 'Sin proyecto';
}

// Devuelve el nombre del recurso dado su ID, o 'Sin responsable' si no existe
function getRecursoNombre(id) {
  const r = store.recursos.find(r => r.id == id);
  return r ? r.nombre : 'Sin responsable';
}

// Genera el HTML de un badge de estado coloreado según el valor
// (Pendiente=amarillo, En Proceso=azul, Terminada/Cumplido=verde)
function estadoBadge(estado) {
  const map = {
    'Pendiente':  'badge-yellow',
    'En Proceso': 'badge-blue',
    'Terminada':  'badge-green',
    'Cumplido':   'badge-green'
  };
  return `<span class="badge ${map[estado] || 'badge-orange'}">${estado}</span>`;
}

// Limpia los campos de un formulario dado sus IDs.
// Para inputs y textareas: pone value=''.
// Para selects: vuelve al índice 0 (primera opción).
function resetForm(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
    else if (el.tagName === 'SELECT') el.selectedIndex = 0;
  });
}

// Aplica una animación de "flash" (destello) a una tarjeta o fila
// tras editarla, para dar feedback visual al usuario.
function animateCard(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'background 0.4s, transform 0.3s, box-shadow 0.3s';
  el.style.background  = 'rgba(0,212,255,0.08)';   // Flash de acento cian
  el.style.transform   = 'scale(1.01)';
  el.style.boxShadow   = '0 0 20px rgba(0,212,255,0.15)';
  setTimeout(() => {
    // Vuelve al estado normal después del flash
    el.style.background = '';
    el.style.transform  = '';
    el.style.boxShadow  = '';
  }, 600);
}

// ═══════════════════════════════════
//  POBLAR SELECTS DE PROYECTOS Y RECURSOS
//  Actualiza todas las listas desplegables de la app
//  con los datos actuales del store.
//  Se llama al iniciar y cada vez que cambian los datos.
// ═══════════════════════════════════
function populateSelects() {
  // Opciones HTML para proyectos (usadas en actividades, hitos y filtros)
  const proyOpts = store.proyectos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  // Opciones HTML para recursos (usadas en responsable de actividades)
  const recOpts  = store.recursos.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');

  // Selects de proyecto en formularios de actividad e hito
  ['a-proyecto', 'h-proyecto'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<option value="">Seleccionar proyecto</option>' + proyOpts;
  });

  // Select de responsable en formulario de actividad
  const ar = document.getElementById('a-responsable');
  if (ar) ar.innerHTML = '<option value="">Seleccionar recurso</option>' + recOpts;

  // Filtro de proyecto en la lista de actividades
  const af = document.getElementById('act-filter');
  if (af) af.innerHTML = '<option value="">Todos</option>' + proyOpts;

  // Filtro de proyecto en el calendario
  const cf = document.getElementById('cal-project-filter');
  if (cf) cf.innerHTML = '<option value="">Todos</option>' + proyOpts;
}