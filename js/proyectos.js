// ═══════════════════════════════════════════════════════════
//  proyectos.js — MÓDULO DE PROYECTOS
//  Gestiona la visualización, creación, edición y eliminación
//  de proyectos. Cada proyecto agrupa actividades e hitos.
//  Validación añadida: la fecha de fin no puede ser anterior
//  a la fecha de inicio del proyecto.
// ═══════════════════════════════════════════════════════════


// renderProyectos — genera y muestra la grid de tarjetas de proyectos.
// Lee los datos del store global y construye el HTML dinámicamente.
function renderProyectos() {

  // Obtiene el contenedor donde se inyectarán las tarjetas de proyectos
  const list = document.getElementById('projects-list');

  // Si no hay proyectos en el store, muestra el estado vacío y sale
  if (!store.proyectos.length) {

    // Inserta el HTML del estado vacío con icono y mensaje descriptivo
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No hay proyectos creados aún.</div></div>';
    return; // Sale de la función porque no hay nada más que renderizar
  }

  // Mapea cada proyecto a su HTML de tarjeta y los une en un solo string
  list.innerHTML = store.proyectos.map(p => {

    // Filtra las actividades que pertenecen a este proyecto específico
    const acts = store.actividades.filter(a => a.proyectoId == p.id);

    // Cuenta cuántas de esas actividades ya están en estado "Terminada"
    const done = acts.filter(a => a.estado === 'Terminada').length;

    // Calcula el porcentaje de completitud (0 si no hay actividades para evitar división por cero)
    const pct = acts.length ? Math.round(done / acts.length * 100) : 0;

    // Retorna el HTML de la tarjeta de este proyecto interpolando sus datos
    return `
    <div class="project-card" id="pcard-${p.id}">

      <!-- Botones de editar y eliminar posicionados en la esquina superior derecha -->
      <div class="project-card-actions">

        <!-- Botón editar: stopPropagation evita que el clic active el onclick de la tarjeta padre -->
        <button class="icon-btn" onclick="editProyecto(${p.id}); event.stopPropagation()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>

        <!-- Botón eliminar: clase 'danger' lo colorea de rojo al hacer hover -->
        <button class="icon-btn danger" onclick="deleteProyecto(${p.id}); event.stopPropagation()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>

      <!-- Nombre del proyecto destacado en negrita -->
      <div class="project-card-title">${p.nombre}</div>

      <!-- Descripción; si está vacía muestra un texto por defecto -->
      <div class="project-card-desc">${p.desc || 'Sin descripción'}</div>

      <!-- Fechas de inicio y fin del proyecto -->
      <div class="project-card-dates">Inicio: ${p.inicio} &nbsp; Fin: ${p.fin}</div>

      <!-- Contador de actividades y porcentaje calculado -->
      <div style="font-size:12px;color:var(--text-muted);margin-top:10px">${acts.length} actividades · ${pct}% completado</div>

      <!-- Barra de progreso cuyo ancho en % refleja el avance del proyecto -->
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;

  }).join(''); // Une todos los HTMLs de tarjetas en un solo string para inyectar de golpe
}


// openNewProyecto — configura el modal en modo creación y lo abre.
function openNewProyecto() {

  // Limpia los cuatro campos del formulario de proyecto
  resetForm('p-nombre', 'p-desc', 'p-inicio', 'p-fin');

  // Elimina el atributo min que pudo quedar de una edición anterior para no limitar el selector
  document.getElementById('p-fin').removeAttribute('min');

  // Vacía el campo oculto de ID: sin valor indica que es una nueva creación
  document.getElementById('p-edit-id').value = '';

  // Cambia el título del modal a "Nuevo Proyecto"
  document.getElementById('modal-proyecto-title').textContent = 'Nuevo Proyecto';

  // Cambia el texto del botón submit a "Crear Proyecto"
  document.getElementById('btn-save-proyecto').textContent = 'Crear Proyecto';

  // Abre el modal añadiendo la clase 'open' que lo hace visible
  openModal('modal-proyecto');
}


// saveProyecto — valida el formulario y guarda el proyecto en el store.
// Detecta si es creación o edición según si p-edit-id tiene valor.
function saveProyecto() {

  // Lee y elimina espacios del nombre (campo obligatorio)
  const nombre = document.getElementById('p-nombre').value.trim();

  // Lee la descripción (campo opcional, puede quedar vacío)
  const desc = document.getElementById('p-desc').value.trim();

  // Lee la fecha de inicio en formato YYYY-MM-DD
  const inicio = document.getElementById('p-inicio').value;

  // Lee la fecha de fin en formato YYYY-MM-DD
  const fin = document.getElementById('p-fin').value;

  // Lee el ID del campo oculto: vacío = crear, con valor = editar
  const editId = document.getElementById('p-edit-id').value;

  // Verifica que los tres campos obligatorios tengan valor
  if (!nombre || !inicio || !fin) {

    // Avisa al usuario con un toast rojo de error
    toast('Completa los campos obligatorios', 'error');
    return; // Detiene la ejecución para que el usuario corrija
  }

  // ── VALIDACIÓN CLAVE: fecha fin debe ser mayor o igual a fecha inicio ──
  // La comparación de strings YYYY-MM-DD funciona igual que comparar fechas
  if (fin < inicio) {

    // Notifica el error con un toast rojo
    toast('La fecha de fin no puede ser anterior a la fecha de inicio.', 'error');

    // Borra la fecha fin inválida para forzar al usuario a elegir una correcta
    document.getElementById('p-fin').value = '';

    // Hace visible el mensaje de ayuda (hint) bajo el campo fecha fin
    document.getElementById('p-fin-hint').style.display = 'block';
    return; // Detiene el guardado
  }

  // Si editId tiene valor: actualizar proyecto existente
  if (editId) {

    // Busca el objeto proyecto en el array del store
    const p = store.proyectos.find(p => p.id == editId);

    // Actualiza las propiedades del proyecto encontrado con los nuevos valores
    if (p) { p.nombre = nombre; p.desc = desc; p.inicio = inicio; p.fin = fin; }

    // Notifica éxito de actualización
    toast('Proyecto actualizado ✓');

    // Dispara la animación de flash en la tarjeta para confirmar visualmente el cambio
    animateCard('pcard-' + editId);

  } else {

    // Agrega un proyecto nuevo al store con el siguiente ID disponible
    store.proyectos.push({ id: nextId.p++, nombre, desc, inicio, fin });

    // Notifica éxito de creación
    toast('Proyecto creado ✓');
  }

  // Cierra el modal tras guardar correctamente
  closeModal('modal-proyecto');

  // Re-renderiza la grid de proyectos con los datos actualizados
  renderProyectos();

  // Actualiza todos los <select> de la app que muestran la lista de proyectos
  populateSelects();
}


// editProyecto — carga los datos del proyecto en el formulario y abre el modal en modo edición.
// @param {number} id - ID del proyecto a editar
function editProyecto(id) {

  // Busca el proyecto en el store por su ID
  const p = store.proyectos.find(p => p.id == id);

  // Si no existe, sale sin hacer nada (protección ante IDs inválidos)
  if (!p) return;

  // Carga el nombre del proyecto en el campo de texto
  document.getElementById('p-nombre').value = p.nombre;

  // Carga la descripción (puede ser vacía si no tenía)
  document.getElementById('p-desc').value = p.desc;

  // Carga la fecha de inicio en el input de tipo date
  document.getElementById('p-inicio').value = p.inicio;

  // Carga la fecha de fin en el input de tipo date
  document.getElementById('p-fin').value = p.fin;

  // Guarda el ID en el campo oculto para que saveProyecto() sepa que debe actualizar
  document.getElementById('p-edit-id').value = p.id;

  // Aplica el mínimo de fecha fin igual al inicio actual para mantener la restricción en edición
  document.getElementById('p-fin').min = p.inicio;

  // Actualiza el título del modal para reflejar que es una edición
  document.getElementById('modal-proyecto-title').textContent = 'Editar Proyecto';

  // Actualiza el texto del botón para que diga "Guardar Cambios"
  document.getElementById('btn-save-proyecto').textContent = 'Guardar Cambios';

  // Abre el modal con los datos ya precargados
  openModal('modal-proyecto');
}


// deleteProyecto — elimina un proyecto y sus actividades e hitos asociados.
// Pide confirmación antes de ejecutar la eliminación.
// @param {number} id - ID del proyecto a eliminar
function deleteProyecto(id) {

  // Muestra el modal de confirmación con un mensaje sobre el impacto de la acción
  confirmDelete('Se eliminará el proyecto y todas sus actividades e hitos asociados.', () => {

    // Elimina el proyecto del array filtrando por ID
    store.proyectos = store.proyectos.filter(p => p.id != id);

    // Elimina todas las actividades vinculadas a este proyecto (integridad referencial)
    store.actividades = store.actividades.filter(a => a.proyectoId != id);

    // Elimina todos los hitos vinculados a este proyecto (integridad referencial)
    store.hitos = store.hitos.filter(h => h.proyectoId != id);

    // Notifica al usuario que la eliminación fue exitosa
    toast('Proyecto eliminado');

    // Actualiza la grid para que la tarjeta eliminada desaparezca
    renderProyectos();

    // Limpia los selects para que el proyecto eliminado no aparezca como opción
    populateSelects();
  });
}