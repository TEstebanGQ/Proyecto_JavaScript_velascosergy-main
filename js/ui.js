// ═══════════════════════════════════
//  ui.js — INTERFAZ DE USUARIO GLOBAL
//  Maneja la navegación entre páginas, apertura/cierre
//  de modales, notificaciones toast y diálogo de confirmación.
//  Debe cargarse DESPUÉS de store.js y ANTES de los módulos
//  de páginas (dashboard, proyectos, etc.).
// ═══════════════════════════════════

// ═══════════════════════════════════
//  NAVEGACIÓN ENTRE PÁGINAS
//  Cambia la página visible del SPA (Single Page App).
//  Actualiza el nav-item activo, la página activa y el título del topbar.
// ═══════════════════════════════════
function navigate(page) {
  // Desactiva todos los ítems del menú de navegación
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  // Oculta todas las páginas (quita la clase 'active')
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

  // Activa el nav-item correspondiente según la posición en el menú
  const navItems = document.querySelectorAll('.nav-item');
  const pages    = ['dashboard','proyectos','actividades','hitos','recursos','calendario'];
  const idx      = pages.indexOf(page);
  if (idx >= 0) navItems[idx].classList.add('active');

  // Muestra la página con el id 'page-{nombre}'
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  // Mapa de nombres de página a etiquetas legibles para el topbar
  const labels = {
    dashboard:   'Dashboard',
    proyectos:   'Proyectos',
    actividades: 'Actividades',
    hitos:       'Hitos',
    recursos:    'Recursos',
    calendario:  'Calendario'
  };

  // Actualiza el texto del topbar con el nombre de la página actual
  document.getElementById('topbar').textContent = labels[page] || page;
  currentPage = page;

  // Llama a la función de renderizado correspondiente a la página
  if (page === 'dashboard')        renderDashboard();
  else if (page === 'proyectos')   renderProyectos();
  else if (page === 'actividades') renderActividades();
  else if (page === 'hitos')       renderHitos();
  else if (page === 'recursos')    renderRecursos();
  else if (page === 'calendario')  renderCalendar();
}

// ═══════════════════════════════════
//  MODAL — ABRIR / CERRAR
//  Los modales son overlays de pantalla completa.
//  Se muestran añadiendo la clase 'open' al overlay.
// ═══════════════════════════════════

// Abre el modal con el ID dado y actualiza los selects
function openModal(id) {
  populateSelects();   // Asegura que los selects tengan datos frescos
  document.getElementById(id).classList.add('open');
}

// Cierra el modal con el ID dado
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Cierra cualquier modal si el usuario hace clic en el overlay
// (fuera del cuadro del modal). Se configura una sola vez al cargar la app.
function initModalOverlayClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      // Solo cierra si el clic fue directamente en el overlay, no en el contenido del modal
      if (e.target === this) closeModal(this.id);
    });
  });
}

// ═══════════════════════════════════
//  TOAST — NOTIFICACIONES FLOTANTES
//  Crea mensajes de notificación temporales que aparecen
//  en la esquina superior derecha y desaparecen solos.
// ═══════════════════════════════════

/**
 * Muestra una notificación toast.
 * @param {string} msg   - Texto del mensaje
 * @param {string} type  - 'success' (verde) o 'error' (rojo)
 */
function toast(msg, type = 'success') {
  const tc = document.getElementById('toast-container');

  // Crea el elemento del toast
  const t  = document.createElement('div');
  t.className = 'toast ' + type;

  // Ícono según el tipo: ✓ para éxito, ✕ para error
  t.innerHTML = (type === 'success' ? '✓ ' : '✕ ') + msg;
  tc.appendChild(t);

  // Después de 3 segundos, reproduce la animación de salida y elimina el toast
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);   // Espera a que termine la animación antes de borrar del DOM
  }, 3000);
}

// ═══════════════════════════════════
//  CONFIRM DELETE — DIÁLOGO DE CONFIRMACIÓN
//  Antes de eliminar un elemento, muestra un modal
//  de confirmación para evitar eliminaciones accidentales.
// ═══════════════════════════════════

/**
 * Abre el diálogo de confirmación de eliminación.
 * @param {string}   msg  - Mensaje descriptivo del peligro de la acción
 * @param {Function} cb   - Función a ejecutar si el usuario confirma
 */
function confirmDelete(msg, cb) {
  // Coloca el mensaje personalizado en el diálogo
  document.getElementById('confirm-msg').textContent = msg;

  // Guarda el callback para ejecutarlo si el usuario confirma
  confirmCallback = cb;

  // Asigna la acción al botón "Eliminar": ejecuta el callback y cierra el modal
  document.getElementById('confirm-ok-btn').onclick = () => {
    cb();
    closeModal('modal-confirm');
  };

  // Abre el modal de confirmación
  openModal('modal-confirm');
}

function goInicio() {
  navigate('dashboard');
}

function goCreditos() {
  alert("Desarrollado por Sergio Velasco 🚀");
}