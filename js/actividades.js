// ═══════════════════════════════════════════════════════════
//  actividades.js — MÓDULO DE ACTIVIDADES (con localStorage)
// ═══════════════════════════════════════════════════════════

function renderActividades() {
  const filterP = document.getElementById('act-filter').value;
  const filterS = document.getElementById('act-filter-status').value;

  let acts = store.actividades;
  if (filterP) acts = acts.filter(a => a.proyectoId == filterP);
  if (filterS) acts = acts.filter(a => a.estado === filterS);

  const list = document.getElementById('activities-list');

  if (!acts.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No hay actividades para mostrar.</div></div>';
    return;
  }

  list.innerHTML = acts.map(a => `
    <div class="activity-item" id="aitem-${a.id}">
      <div class="activity-left">
        <div class="activity-name">${a.nombre} ${estadoBadge(a.estado)}</div>
        <div class="activity-meta">
          Proyecto: ${getProyectoNombre(a.proyectoId)} &nbsp;·&nbsp;
          Responsable: ${getRecursoNombre(a.responsableId)} &nbsp;·&nbsp;
          Inicio: ${a.inicio} &nbsp;·&nbsp; Duración: ${a.duracion} día${a.duracion != 1 ? 's' : ''}
        </div>
      </div>
      <div class="activity-actions">
        <button class="icon-btn" onclick="editActividad(${a.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteActividad(${a.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`).join('');
}

function openNewActividad() {
  resetForm('a-nombre', 'a-proyecto', 'a-responsable', 'a-inicio');
  document.getElementById('a-duracion').value = 1;
  document.getElementById('a-estado').selectedIndex = 0;
  document.getElementById('a-edit-id').value = '';
  document.getElementById('a-estado-hint').style.display = 'none';
  document.getElementById('modal-actividad-title').textContent = 'Nueva Actividad';
  document.getElementById('btn-save-actividad').textContent    = 'Crear Actividad';
  openModal('modal-actividad');
}

function saveActividad() {
  const nombre       = document.getElementById('a-nombre').value.trim();
  const proyectoId   = document.getElementById('a-proyecto').value;
  const responsableId = document.getElementById('a-responsable').value;
  const inicio       = document.getElementById('a-inicio').value;
  const duracion     = parseInt(document.getElementById('a-duracion').value) || 1;
  const estado       = document.getElementById('a-estado').value;
  const editId       = document.getElementById('a-edit-id').value;

  if (!nombre || !proyectoId || !inicio) {
    toast('Completa los campos obligatorios', 'error');
    return;
  }

  if (!editId && estado === 'Terminada') {
    toast('No puedes crear una actividad ya como "Terminada". Usa Pendiente o En Proceso.', 'error');
    document.getElementById('a-estado-hint').style.display = 'block';
    return;
  }

  if (editId) {
    const a = store.actividades.find(a => a.id == editId);
    if (a) Object.assign(a, { nombre, proyectoId: +proyectoId, responsableId, inicio, duracion, estado });
    toast('Actividad actualizada ✓');
    animateCard('aitem-' + editId);
  } else {
    store.actividades.push({ id: nextId.a++, nombre, proyectoId: +proyectoId, responsableId, inicio, duracion, estado });
    toast('Actividad creada ✓');
  }

  saveStore(); // ← persiste en localStorage
  closeModal('modal-actividad');
  resetForm('a-nombre', 'a-proyecto', 'a-responsable', 'a-inicio', 'a-duracion', 'a-estado', 'a-edit-id');
  document.getElementById('a-estado-hint').style.display = 'none';
  renderActividades();
}

function editActividad(id) {
  const a = store.actividades.find(a => a.id == id);
  if (!a) return;
  populateSelects();

  document.getElementById('a-nombre').value       = a.nombre;
  document.getElementById('a-proyecto').value     = a.proyectoId;
  document.getElementById('a-responsable').value  = a.responsableId;
  document.getElementById('a-inicio').value       = a.inicio;
  document.getElementById('a-duracion').value     = a.duracion;
  document.getElementById('a-estado').value       = a.estado;
  document.getElementById('a-edit-id').value      = a.id;
  document.getElementById('a-estado-hint').style.display = 'none';

  document.getElementById('modal-actividad-title').textContent = 'Editar Actividad';
  document.getElementById('btn-save-actividad').textContent    = 'Guardar Cambios';
  openModal('modal-actividad');
}

function deleteActividad(id) {
  confirmDelete('¿Seguro que deseas eliminar esta actividad?', () => {
    store.actividades = store.actividades.filter(a => a.id != id);
    saveStore(); // ← persiste en localStorage
    toast('Actividad eliminada');
    renderActividades();
  });
}