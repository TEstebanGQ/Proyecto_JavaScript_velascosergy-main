// ═══════════════════════════════════════════════════════════
//  actividades.js — MÓDULO DE ACTIVIDADES
//  Maneja la lista de tareas asignadas a proyectos.
//  Cada actividad tiene: nombre, proyecto, responsable,
//  fecha de inicio, duración en días y estado.
//  Validación añadida: al CREAR una actividad no se permite
//  seleccionar "Terminada" como estado inicial porque la tarea
//  aún no ha comenzado.
// ═══════════════════════════════════════════════════════════


// renderActividades — renderiza la lista de actividades aplicando filtros.
// Lee los selects de filtro del encabezado y genera el HTML de cada fila.
function renderActividades() {

  // Lee el ID del proyecto seleccionado en el filtro (vacío = todos los proyectos)
  const filterP = document.getElementById('act-filter').value;

  // Lee el estado seleccionado en el filtro (vacío = todos los estados)
  const filterS = document.getElementById('act-filter-status').value;

  // Toma el array completo de actividades del store como punto de partida
  let acts = store.actividades;

  // Si hay filtro de proyecto, deja solo las actividades de ese proyecto
  if (filterP) acts = acts.filter(a => a.proyectoId == filterP);

  // Si hay filtro de estado, deja solo las actividades con ese estado
  if (filterS) acts = acts.filter(a => a.estado === filterS);

  // Obtiene el contenedor donde se inyecta la lista de actividades
  const list = document.getElementById('activities-list');

  // Si después de filtrar no quedan actividades, muestra el estado vacío y sale
  if (!acts.length) {

    // Inserta el HTML del estado vacío con icono y mensaje
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No hay actividades para mostrar.</div></div>';
    return; // Sale porque no hay filas que generar
  }

  // Mapea cada actividad a su HTML de fila y los une en un string
  list.innerHTML = acts.map(a => `
    <div class="activity-item" id="aitem-${a.id}">

      <!-- Columna izquierda: nombre con badge de estado y metadatos -->
      <div class="activity-left">

        <!-- Nombre de la actividad seguido del badge de color según su estado -->
        <div class="activity-name">${a.nombre} ${estadoBadge(a.estado)}</div>

        <!-- Metadatos: proyecto al que pertenece, responsable, fecha inicio y duración -->
        <div class="activity-meta">
          Proyecto: ${getProyectoNombre(a.proyectoId)} &nbsp;·&nbsp;
          Responsable: ${getRecursoNombre(a.responsableId)} &nbsp;·&nbsp;
          Inicio: ${a.inicio} &nbsp;·&nbsp; Duración: ${a.duracion} día${a.duracion != 1 ? 's' : ''}
        </div>
      </div>

      <!-- Columna derecha: botones de acción editar y eliminar -->
      <div class="activity-actions">

        <!-- Botón editar: abre el modal con los datos de esta actividad precargados -->
        <button class="icon-btn" onclick="editActividad(${a.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>

        <!-- Botón eliminar: abre el diálogo de confirmación antes de borrar -->
        <button class="icon-btn danger" onclick="deleteActividad(${a.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`).join(''); // Une todos los HTMLs de filas en un solo string
}


// openNewActividad — configura el modal en modo creación y lo abre.
// Limpia el formulario, resetea el estado a "Pendiente" y oculta el hint de validación.
function openNewActividad() {

  // Limpia los campos de texto y los selects de proyecto, responsable e inicio
  resetForm('a-nombre', 'a-proyecto', 'a-responsable', 'a-inicio');

  // Establece la duración mínima en 1 día (no tiene sentido una actividad de 0 días)
  document.getElementById('a-duracion').value = 1;

  // Vuelve el select de estado al primer índice: "Pendiente" (estado inicial válido)
  document.getElementById('a-estado').selectedIndex = 0;

  // Vacía el campo oculto de ID para indicar que es una nueva creación
  document.getElementById('a-edit-id').value = '';

  // Oculta el hint de advertencia del estado por si quedó visible de antes
  document.getElementById('a-estado-hint').style.display = 'none';

  // Actualiza el título del modal a "Nueva Actividad"
  document.getElementById('modal-actividad-title').textContent = 'Nueva Actividad';

  // Actualiza el texto del botón submit a "Crear Actividad"
  document.getElementById('btn-save-actividad').textContent = 'Crear Actividad';

  // Abre el modal añadiendo la clase 'open'
  openModal('modal-actividad');
}


// saveActividad — valida el formulario y guarda la actividad en el store.
// Bloquea guardar si es una creación nueva con estado "Terminada".
function saveActividad() {

  // Lee y limpia el nombre de la actividad (campo obligatorio)
  const nombre = document.getElementById('a-nombre').value.trim();

  // Lee el ID del proyecto seleccionado (campo obligatorio)
  const proyectoId = document.getElementById('a-proyecto').value;

  // Lee el ID del responsable asignado (campo opcional)
  const responsableId = document.getElementById('a-responsable').value;

  // Lee la fecha de inicio de la actividad (campo obligatorio)
  const inicio = document.getElementById('a-inicio').value;

  // Lee la duración en días; si no es número válido usa 1 como mínimo
  const duracion = parseInt(document.getElementById('a-duracion').value) || 1;

  // Lee el estado actual seleccionado (Pendiente, En Proceso o Terminada)
  const estado = document.getElementById('a-estado').value;

  // Lee el campo oculto: vacío = crear nueva, con valor = editar existente
  const editId = document.getElementById('a-edit-id').value;

  // Verifica que los campos obligatorios tengan valor
  if (!nombre || !proyectoId || !inicio) {

    // Muestra toast de error y detiene el guardado
    toast('Completa los campos obligatorios', 'error');
    return;
  }

  // ── VALIDACIÓN CLAVE: no se puede crear una actividad ya como "Terminada" ──
  // Solo aplica en creación (editId vacío); en edición sí se permite cambiar a Terminada
  if (!editId && estado === 'Terminada') {

    // Notifica al usuario con un toast explicativo
    toast('No puedes crear una actividad ya como "Terminada". Usa Pendiente o En Proceso.', 'error');

    // Muestra el hint de advertencia bajo el select para orientar al usuario
    document.getElementById('a-estado-hint').style.display = 'block';
    return; // Detiene el guardado hasta que el usuario corrija el estado
  }

  // Si editId tiene valor: actualizar actividad existente
  if (editId) {

    // Busca la actividad en el store por su ID
    const a = store.actividades.find(a => a.id == editId);

    // Actualiza todas las propiedades de la actividad con los nuevos valores
    if (a) Object.assign(a, { nombre, proyectoId: +proyectoId, responsableId, inicio, duracion, estado });

    // Notifica éxito de la actualización
    toast('Actividad actualizada ✓');

    // Aplica animación flash en la fila para dar feedback visual inmediato
    animateCard('aitem-' + editId);

  } else {

    // Agrega la nueva actividad al store con el siguiente ID disponible
    store.actividades.push({ id: nextId.a++, nombre, proyectoId: +proyectoId, responsableId, inicio, duracion, estado });

    // Notifica éxito de creación
    toast('Actividad creada ✓');
  }

  // Cierra el modal tras guardar correctamente
  closeModal('modal-actividad');

  // Limpia todos los campos del formulario para dejarlo limpio para el próximo uso
  resetForm('a-nombre', 'a-proyecto', 'a-responsable', 'a-inicio', 'a-duracion', 'a-estado', 'a-edit-id');

  // Oculta el hint de estado por si quedó visible tras una validación anterior
  document.getElementById('a-estado-hint').style.display = 'none';

  // Re-renderiza la lista de actividades para mostrar el cambio inmediatamente
  renderActividades();
}


// editActividad — carga los datos de la actividad en el formulario y abre el modal en modo edición.
// En edición SÍ se puede cambiar el estado a "Terminada".
// @param {number} id - ID de la actividad a editar
function editActividad(id) {

  // Busca la actividad en el store por su ID
  const a = store.actividades.find(a => a.id == id);

  // Si no existe, sale sin hacer nada (protección ante IDs inválidos)
  if (!a) return;

  // Actualiza los selects con los datos más recientes antes de precargar los valores
  populateSelects();

  // Carga el nombre de la actividad en el campo de texto
  document.getElementById('a-nombre').value = a.nombre;

  // Selecciona el proyecto al que pertenece la actividad en el select
  document.getElementById('a-proyecto').value = a.proyectoId;

  // Selecciona el responsable actual en el select de recursos
  document.getElementById('a-responsable').value = a.responsableId;

  // Carga la fecha de inicio en el input de tipo date
  document.getElementById('a-inicio').value = a.inicio;

  // Carga la duración en días en el input numérico
  document.getElementById('a-duracion').value = a.duracion;

  // Selecciona el estado actual en el select (puede ser Terminada en edición)
  document.getElementById('a-estado').value = a.estado;

  // Guarda el ID en el campo oculto para que saveActividad() sepa que debe actualizar
  document.getElementById('a-edit-id').value = a.id;

  // Oculta el hint de estado: en edición no hay restricción sobre seleccionar "Terminada"
  document.getElementById('a-estado-hint').style.display = 'none';

  // Actualiza el título del modal a "Editar Actividad"
  document.getElementById('modal-actividad-title').textContent = 'Editar Actividad';

  // Actualiza el texto del botón a "Guardar Cambios"
  document.getElementById('btn-save-actividad').textContent = 'Guardar Cambios';

  // Abre el modal con los datos precargados
  openModal('modal-actividad');
}


// deleteActividad — elimina una actividad del store tras confirmación del usuario.
// @param {number} id - ID de la actividad a eliminar
function deleteActividad(id) {

  // Abre el modal de confirmación con el mensaje de advertencia
  confirmDelete('¿Seguro que deseas eliminar esta actividad?', () => {

    // Filtra el array de actividades eliminando la que tiene el ID indicado
    store.actividades = store.actividades.filter(a => a.id != id);

    // Notifica al usuario que la eliminación fue exitosa
    toast('Actividad eliminada');

    // Actualiza la lista para que la fila eliminada desaparezca visualmente
    renderActividades();
  });
}