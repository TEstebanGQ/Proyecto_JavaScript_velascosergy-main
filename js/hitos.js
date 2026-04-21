// ═══════════════════════════════════
//  hitos.js — MÓDULO DE HITOS
//  Maneja los hitos del proyecto: puntos clave de progreso.
//  Cada hito tiene: nombre, descripción, proyecto asociado
//  y estado (Pendiente / Cumplido).
//  Se representan visualmente con un círculo indicador de estado.
// ═══════════════════════════════════

/**
 * Renderiza la lista de todos los hitos del store.
 * Cada hito muestra: círculo de estado, nombre + badge,
 * descripción, proyecto asociado y cantidad de actividades.
 */
function renderHitos() {
  const list = document.getElementById('milestones-list');

  // Estado vacío: ningún hito creado aún
  if (!store.hitos.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🚩</div><div class="empty-state-text">No hay hitos creados aún.</div></div>';
    return;
  }

  list.innerHTML = store.hitos.map(h => {
    const done = h.estado === 'Cumplido';   // Booleano: true si el hito fue cumplido
    // Cuenta las actividades del mismo proyecto (indicador de contexto)
    const acts = store.actividades.filter(a => a.proyectoId == h.proyectoId);

    return `
    <div class="milestone-item" id="hitem-${h.id}">
      <!-- Círculo de estado: gris (pendiente) o verde con check (cumplido) -->
      <div class="milestone-circle ${done ? 'done' : ''}">
        ${done
          ? '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'  /* Check ✓ si cumplido */
          : '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>'        /* Punto si pendiente */
        }
      </div>
      <!-- Información del hito -->
      <div class="milestone-info">
        <!-- Nombre + badge de estado en línea -->
        <div class="milestone-name">${h.nombre} ${estadoBadge(h.estado)}</div>
        <!-- Descripción opcional -->
        <div class="milestone-desc">${h.desc || ''}</div>
        <!-- Proyecto al que pertenece y cantidad de actividades asociadas -->
        <div class="milestone-meta">Proyecto: ${getProyectoNombre(h.proyectoId)} &nbsp;·&nbsp; ${acts.length} actividades asociadas</div>
      </div>
      <!-- Botones de editar y eliminar -->
      <div class="milestone-actions">
        <button class="icon-btn" onclick="editHito(${h.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteHito(${h.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

/**
 * Abre el modal de creación de hito nuevo.
 * Limpia el formulario y configura el modal para creación.
 */
function openNewHito() {
  resetForm('h-nombre', 'h-desc', 'h-proyecto');   // Limpia todos los campos
  document.getElementById('h-estado').selectedIndex = 0;   // Estado inicial: Pendiente
  document.getElementById('h-edit-id').value = '';          // Sin ID → modo creación
  document.getElementById('modal-hito-title').textContent = 'Nuevo Hito';
  document.getElementById('btn-save-hito').textContent    = 'Crear Hito';
  openModal('modal-hito');
}

/**
 * Guarda un hito nuevo o actualiza uno existente.
 * Lee el formulario, valida obligatorios y actualiza el store.
 */
function saveHito() {
  const nombre     = document.getElementById('h-nombre').value.trim();
  const desc       = document.getElementById('h-desc').value.trim();
  const proyectoId = document.getElementById('h-proyecto').value;
  const estado     = document.getElementById('h-estado').value;
  const editId     = document.getElementById('h-edit-id').value;   // Vacío si es nuevo

  // Valida campos obligatorios: nombre y proyecto
  if (!nombre || !proyectoId) { toast('Completa los campos obligatorios', 'error'); return; }

  if (editId) {
    // ── Edición: actualiza el hito existente ──
    const h = store.hitos.find(h => h.id == editId);
    if (h) Object.assign(h, { nombre, desc, proyectoId: +proyectoId, estado });
    toast('Hito actualizado ✓');
    animateCard('hitem-' + editId);   // Flash visual en la fila editada
  } else {
    // ── Creación: agrega nuevo hito al store ──
    store.hitos.push({ id: nextId.h++, nombre, desc, proyectoId: +proyectoId, estado });
    toast('Hito creado ✓');
  }

  closeModal('modal-hito');
  resetForm('h-nombre', 'h-desc', 'h-proyecto', 'h-estado', 'h-edit-id');
  renderHitos();   // Re-renderiza la lista
}

/**
 * Abre el modal en modo edición con los datos del hito precargados.
 * @param {number} id - ID del hito a editar
 */
function editHito(id) {
  const h = store.hitos.find(h => h.id == id);
  if (!h) return;
  populateSelects();   // Actualiza selects antes de precargar

  // Precarga los valores del hito en el formulario
  document.getElementById('h-nombre').value      = h.nombre;
  document.getElementById('h-desc').value        = h.desc;
  document.getElementById('h-proyecto').value    = h.proyectoId;
  document.getElementById('h-estado').value      = h.estado;
  document.getElementById('h-edit-id').value     = h.id;   // Marca el ID para saveHito()

  document.getElementById('modal-hito-title').textContent = 'Editar Hito';
  document.getElementById('btn-save-hito').textContent    = 'Guardar Cambios';
  openModal('modal-hito');
}

/**
 * Elimina un hito del store.
 * Solicita confirmación antes de eliminar.
 * @param {number} id - ID del hito a eliminar
 */
function deleteHito(id) {
  confirmDelete('¿Seguro que deseas eliminar este hito?', () => {
    store.hitos = store.hitos.filter(h => h.id != id);
    toast('Hito eliminado');
    renderHitos();
  });
}