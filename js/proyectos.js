
// ═══════════════════════════════════════════════════════════
//  proyectos.js — MÓDULO DE PROYECTOS (con localStorage)
// ═══════════════════════════════════════════════════════════

function renderProyectos() {
  const list = document.getElementById('projects-list');

  if (!store.proyectos.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No hay proyectos creados aún.</div></div>';
    return;
  }

  list.innerHTML = store.proyectos.map(p => {
    const acts = store.actividades.filter(a => a.proyectoId == p.id);
    const done = acts.filter(a => a.estado === 'Terminada').length;
    const pct  = acts.length ? Math.round(done / acts.length * 100) : 0;

    return `
    <div class="project-card" id="pcard-${p.id}">
      <div class="project-card-actions">
        <button class="icon-btn" onclick="editProyecto(${p.id}); event.stopPropagation()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteProyecto(${p.id}); event.stopPropagation()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div class="project-card-title">${p.nombre}</div>
      <div class="project-card-desc">${p.desc || 'Sin descripción'}</div>
      <div class="project-card-dates">Inicio: ${p.inicio} &nbsp; Fin: ${p.fin}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:10px">${acts.length} actividades · ${pct}% completado</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function openNewProyecto() {
  resetForm('p-nombre', 'p-desc', 'p-inicio', 'p-fin');
  document.getElementById('p-fin').removeAttribute('min');
  document.getElementById('p-edit-id').value = '';
  document.getElementById('modal-proyecto-title').textContent = 'Nuevo Proyecto';
  document.getElementById('btn-save-proyecto').textContent    = 'Crear Proyecto';
  openModal('modal-proyecto');
}

function saveProyecto() {
  const nombre = document.getElementById('p-nombre').value.trim();
  const desc   = document.getElementById('p-desc').value.trim();
  const inicio = document.getElementById('p-inicio').value;
  const fin    = document.getElementById('p-fin').value;
  const editId = document.getElementById('p-edit-id').value;

  if (!nombre || !inicio || !fin) {
    toast('Completa los campos obligatorios', 'error');
    return;
  }

  if (fin < inicio) {
    toast('La fecha de fin no puede ser anterior a la fecha de inicio.', 'error');
    document.getElementById('p-fin').value = '';
    document.getElementById('p-fin-hint').style.display = 'block';
    return;
  }

  if (editId) {
    const p = store.proyectos.find(p => p.id == editId);
    if (p) { p.nombre = nombre; p.desc = desc; p.inicio = inicio; p.fin = fin; }
    toast('Proyecto actualizado ✓');
    animateCard('pcard-' + editId);
  } else {
    store.proyectos.push({ id: nextId.p++, nombre, desc, inicio, fin });
    toast('Proyecto creado ✓');
  }

  saveStore(); // ← persiste en localStorage
  closeModal('modal-proyecto');
  renderProyectos();
  populateSelects();
}

function editProyecto(id) {
  const p = store.proyectos.find(p => p.id == id);
  if (!p) return;

  document.getElementById('p-nombre').value  = p.nombre;
  document.getElementById('p-desc').value    = p.desc;
  document.getElementById('p-inicio').value  = p.inicio;
  document.getElementById('p-fin').value     = p.fin;
  document.getElementById('p-edit-id').value = p.id;
  document.getElementById('p-fin').min       = p.inicio;

  document.getElementById('modal-proyecto-title').textContent = 'Editar Proyecto';
  document.getElementById('btn-save-proyecto').textContent    = 'Guardar Cambios';
  openModal('modal-proyecto');
}

function deleteProyecto(id) {
  confirmDelete('Se eliminará el proyecto y todas sus actividades e hitos asociados.', () => {
    store.proyectos   = store.proyectos.filter(p => p.id != id);
    store.actividades = store.actividades.filter(a => a.proyectoId != id);
    store.hitos       = store.hitos.filter(h => h.proyectoId != id);

    saveStore(); // ← persiste en localStorage
    toast('Proyecto eliminado');
    renderProyectos();
    populateSelects();
  });
}