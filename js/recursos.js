// ═══════════════════════════════════════════════════════════
//  recursos.js — MÓDULO DE RECURSOS HUMANOS (con localStorage)
// ═══════════════════════════════════════════════════════════

function renderRecursos() {
  const tbody = document.getElementById('resources-table');

  if (!store.recursos.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">👤</div><div class="empty-state-text">No hay recursos creados aún.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = store.recursos.map(r => `
    <tr id="rrow-${r.id}">
      <td><span style="font-family:monospace;font-size:12px">${r.id}</span></td>
      <td style="font-weight:500">${r.nombre}</td>
      <td>${r.rol}</td>
      <td>${r.arl || '—'}</td>
      <td>$${Number(r.salario).toLocaleString()}</td>
      <td style="display:flex;gap:6px">
        <button class="icon-btn" onclick="editRecurso('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" onclick="deleteRecurso('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

function openNewRecurso() {
  const idEl = document.getElementById('r-id');
  if (idEl) idEl.readOnly = false;

  resetForm('r-id', 'r-nombre', 'r-nacimiento', 'r-sangre', 'r-arl', 'r-genero', 'r-rol');
  document.getElementById('r-salario').value = 0;
  document.getElementById('r-edit-id').value = '';

  const nacEl = document.getElementById('r-nacimiento');
  nacEl.max = '2010-12-31';
  nacEl.min = '1900-01-01';
  document.getElementById('r-nac-hint').style.display = 'none';

  document.getElementById('modal-recurso-title').textContent = 'Nuevo Recurso';
  document.getElementById('btn-save-recurso').textContent    = 'Crear Recurso';
  openModal('modal-recurso');
}

function saveRecurso() {
  const id         = document.getElementById('r-id').value.trim();
  const nombre     = document.getElementById('r-nombre').value.trim();
  const nacimiento = document.getElementById('r-nacimiento').value;
  const sangre     = document.getElementById('r-sangre').value;
  const arl        = document.getElementById('r-arl').value.trim();
  const genero     = document.getElementById('r-genero').value;
  const salario    = parseFloat(document.getElementById('r-salario').value) || 0;
  const rol        = document.getElementById('r-rol').value;
  const editId     = document.getElementById('r-edit-id').value;

  if (!id || !nombre || !rol) {
    toast('Completa los campos obligatorios', 'error');
    return;
  }

  if (nacimiento) {
    const anioNac = new Date(nacimiento).getFullYear();
    if (anioNac > 2010) {
      toast('La fecha de nacimiento no puede ser posterior al año 2010.', 'error');
      document.getElementById('r-nacimiento').value = '';
      document.getElementById('r-nac-hint').style.display = 'block';
      return;
    }
  }

  if (editId) {
    const r = store.recursos.find(r => r.id == editId);
    if (r) Object.assign(r, { nombre, nacimiento, sangre, arl, genero, salario, rol });
    toast('Recurso actualizado ✓');
  } else {
    if (store.recursos.find(r => r.id === id)) {
      toast('Ya existe un recurso con esa ID', 'error');
      return;
    }
    store.recursos.push({ id, nombre, nacimiento, sangre, arl, genero, salario, rol });
    toast('Recurso creado ✓');
  }

  saveStore(); // ← persiste en localStorage
  closeModal('modal-recurso');
  resetForm('r-id', 'r-nombre', 'r-nacimiento', 'r-sangre', 'r-arl', 'r-genero', 'r-salario', 'r-rol', 'r-edit-id');
  renderRecursos();
  populateSelects();
}

function editRecurso(id) {
  const r = store.recursos.find(r => r.id == id);
  if (!r) return;

  const idEl = document.getElementById('r-id');
  if (idEl) idEl.readOnly = true;

  document.getElementById('r-id').value        = r.id;
  document.getElementById('r-nombre').value    = r.nombre;
  document.getElementById('r-nacimiento').value = r.nacimiento;
  document.getElementById('r-sangre').value    = r.sangre;
  document.getElementById('r-arl').value       = r.arl;
  document.getElementById('r-genero').value    = r.genero;
  document.getElementById('r-salario').value   = r.salario;
  document.getElementById('r-rol').value       = r.rol;
  document.getElementById('r-edit-id').value   = r.id;

  const nacEl = document.getElementById('r-nacimiento');
  nacEl.max = '2010-12-31';
  nacEl.min = '1900-01-01';
  document.getElementById('r-nac-hint').style.display = 'none';

  document.getElementById('modal-recurso-title').textContent = 'Editar Recurso';
  document.getElementById('btn-save-recurso').textContent    = 'Guardar Cambios';
  openModal('modal-recurso');
}

function deleteRecurso(id) {
  confirmDelete('¿Seguro que deseas eliminar este recurso?', () => {
    store.recursos = store.recursos.filter(r => r.id != id);
    store.actividades.forEach(a => { if (a.responsableId == id) a.responsableId = ''; });

    saveStore(); // ← persiste en localStorage
    toast('Recurso eliminado');
    renderRecursos();
    populateSelects();
  });
}