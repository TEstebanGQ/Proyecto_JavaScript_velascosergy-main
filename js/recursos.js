// ═══════════════════════════════════════════════════════════
//  recursos.js — MÓDULO DE RECURSOS HUMANOS
//  Gestiona el personal disponible para asignar como
//  responsables en actividades.
//  Cada recurso tiene: ID (cédula), nombre, fecha de nacimiento,
//  tipo de sangre, ARL, género, salario y rol.
//  Validación añadida: la fecha de nacimiento no puede ser
//  posterior al 31 de diciembre de 2010 porque el sistema
//  maneja personal con al menos cierta experiencia laboral mínima.
// ═══════════════════════════════════════════════════════════


// renderRecursos — genera y muestra la tabla de recursos humanos.
// Lee el store y construye las filas <tr> dinámicamente.
function renderRecursos() {

  // Obtiene el <tbody> de la tabla donde se insertarán las filas
  const tbody = document.getElementById('resources-table');

  // Si no hay recursos en el store, muestra el estado vacío dentro de la tabla y sale
  if (!store.recursos.length) {

    // colspan="6" hace que el mensaje ocupe todas las columnas de la tabla
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">👤</div><div class="empty-state-text">No hay recursos creados aún.</div></div></td></tr>';
    return; // Sale porque no hay filas que generar
  }

  // Mapea cada recurso a su fila HTML <tr> y las une en un string
  tbody.innerHTML = store.recursos.map(r => `
    <tr id="rrow-${r.id}">

      <!-- Celda del ID (cédula) en fuente monospace para mejor legibilidad de números -->
      <td><span style="font-family:monospace;font-size:12px">${r.id}</span></td>

      <!-- Celda del nombre con peso de fuente mayor para destacarlo -->
      <td style="font-weight:500">${r.nombre}</td>

      <!-- Celda del rol laboral del recurso -->
      <td>${r.rol}</td>

      <!-- Celda de la ARL; muestra '—' si no tiene ARL registrada -->
      <td>${r.arl || '—'}</td>

      <!-- Celda del salario formateado con separador de miles según la localización -->
      <td>$${Number(r.salario).toLocaleString()}</td>

      <!-- Celda de acciones: botones de editar y eliminar alineados en fila -->
      <td style="display:flex;gap:6px">

        <!-- Botón editar: pasa el ID como string porque puede tener caracteres especiales -->
        <button class="icon-btn" onclick="editRecurso('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>

        <!-- Botón eliminar: clase 'danger' lo colorea de rojo al hacer hover -->
        <button class="icon-btn danger" onclick="deleteRecurso('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </td>
    </tr>`).join(''); // Une todas las filas en un solo string para insertar de una vez
}


// openNewRecurso — configura el modal en modo creación y lo abre.
// Desbloquea el campo ID (editable solo al crear) y aplica las restricciones de fecha.
function openNewRecurso() {

  // Obtiene el input de identificación del recurso
  const idEl = document.getElementById('r-id');

  // En creación el ID es editable porque el usuario ingresa la cédula
  if (idEl) idEl.readOnly = false;

  // Limpia todos los campos de texto y selects del formulario
  resetForm('r-id', 'r-nombre', 'r-nacimiento', 'r-sangre', 'r-arl', 'r-genero', 'r-rol');

  // Establece el salario inicial en 0 (campo numérico, no se limpia con resetForm)
  document.getElementById('r-salario').value = 0;

  // Vacía el campo oculto de ID para indicar que es una nueva creación
  document.getElementById('r-edit-id').value = '';

  // ── Aplica restricciones de fecha de nacimiento ──
  // Obtiene el input de fecha de nacimiento del formulario
  const nacEl = document.getElementById('r-nacimiento');

  // Establece la fecha máxima permitida: 31 dic 2010 (personas mayores de cierta edad)
  nacEl.max = '2010-12-31';

  // Establece la fecha mínima razonable para evitar entradas absurdas (año 1900)
  nacEl.min = '1900-01-01';

  // Oculta el mensaje de advertencia de nacimiento por si quedó visible antes
  document.getElementById('r-nac-hint').style.display = 'none';

  // Actualiza el título del modal a "Nuevo Recurso"
  document.getElementById('modal-recurso-title').textContent = 'Nuevo Recurso';

  // Actualiza el texto del botón submit a "Crear Recurso"
  document.getElementById('btn-save-recurso').textContent = 'Crear Recurso';

  // Abre el modal añadiendo la clase 'open'
  openModal('modal-recurso');
}


// saveRecurso — valida el formulario y guarda el recurso en el store.
// En creación verifica que el ID no esté duplicado y que la fecha sea válida.
function saveRecurso() {

  // Lee y limpia el ID (cédula) del recurso (campo obligatorio)
  const id = document.getElementById('r-id').value.trim();

  // Lee y limpia el nombre completo del recurso (campo obligatorio)
  const nombre = document.getElementById('r-nombre').value.trim();

  // Lee la fecha de nacimiento en formato YYYY-MM-DD (campo opcional)
  const nacimiento = document.getElementById('r-nacimiento').value;

  // Lee el tipo de sangre seleccionado (campo opcional)
  const sangre = document.getElementById('r-sangre').value;

  // Lee y limpia el nombre de la ARL (campo opcional)
  const arl = document.getElementById('r-arl').value.trim();

  // Lee el género seleccionado (campo opcional)
  const genero = document.getElementById('r-genero').value;

  // Lee el salario; si no es un número válido usa 0 como fallback
  const salario = parseFloat(document.getElementById('r-salario').value) || 0;

  // Lee el rol seleccionado (campo obligatorio)
  const rol = document.getElementById('r-rol').value;

  // Lee el campo oculto: vacío = crear, con valor = editar
  const editId = document.getElementById('r-edit-id').value;

  // Verifica que los tres campos obligatorios tengan valor
  if (!id || !nombre || !rol) {

    // Avisa al usuario con toast de error
    toast('Completa los campos obligatorios', 'error');
    return; // Detiene el guardado
  }

  // ── VALIDACIÓN CLAVE: fecha de nacimiento no posterior al año 2010 ──
  // Solo valida si el usuario ingresó una fecha (el campo es opcional)
  if (nacimiento) {

    // Convierte el string YYYY-MM-DD a objeto Date y extrae el año
    const anioNac = new Date(nacimiento).getFullYear();

    // Si el año supera el límite de 2010, la fecha no es válida para el sistema
    if (anioNac > 2010) {

      // Notifica el error con toast rojo
      toast('La fecha de nacimiento no puede ser posterior al año 2010.', 'error');

      // Borra la fecha inválida del input para que el usuario corrija
      document.getElementById('r-nacimiento').value = '';

      // Muestra el hint de advertencia bajo el campo
      document.getElementById('r-nac-hint').style.display = 'block';
      return; // Detiene el guardado
    }
  }

  // Si editId tiene valor: actualizar recurso existente
  if (editId) {

    // Busca el recurso en el store por su ID
    const r = store.recursos.find(r => r.id == editId);

    // Actualiza todas las propiedades del recurso (sin cambiar el ID, que es la cédula)
    if (r) Object.assign(r, { nombre, nacimiento, sangre, arl, genero, salario, rol });

    // Notifica éxito de actualización
    toast('Recurso actualizado ✓');

  } else {

    // En creación: verifica que el ID (cédula) no esté ya registrado en el store
    if (store.recursos.find(r => r.id === id)) {

      // Si ya existe, notifica el duplicado y detiene el guardado
      toast('Ya existe un recurso con esa ID', 'error');
      return;
    }

    // Agrega el nuevo recurso al store con todos sus datos
    store.recursos.push({ id, nombre, nacimiento, sangre, arl, genero, salario, rol });

    // Notifica éxito de creación
    toast('Recurso creado ✓');
  }

  // Cierra el modal tras guardar correctamente
  closeModal('modal-recurso');

  // Limpia todos los campos del formulario para dejarlo listo para el próximo uso
  resetForm('r-id', 'r-nombre', 'r-nacimiento', 'r-sangre', 'r-arl', 'r-genero', 'r-salario', 'r-rol', 'r-edit-id');

  // Actualiza la tabla de recursos con los datos más recientes
  renderRecursos();

  // Actualiza el select de responsables en el formulario de actividades
  populateSelects();
}


// editRecurso — carga los datos del recurso en el formulario y abre el modal en modo edición.
// Bloquea el campo ID porque la cédula no se puede cambiar una vez registrada.
// @param {string} id - ID (cédula) del recurso a editar
function editRecurso(id) {

  // Busca el recurso en el store por su ID
  const r = store.recursos.find(r => r.id == id);

  // Si no existe, sale sin hacer nada
  if (!r) return;

  // Bloquea el input de ID para que no pueda modificarse la cédula en edición
  const idEl = document.getElementById('r-id');
  if (idEl) idEl.readOnly = true;

  // Carga el ID (cédula) en el campo de texto (visible pero no editable)
  document.getElementById('r-id').value = r.id;

  // Carga el nombre completo del recurso
  document.getElementById('r-nombre').value = r.nombre;

  // Carga la fecha de nacimiento registrada
  document.getElementById('r-nacimiento').value = r.nacimiento;

  // Selecciona el tipo de sangre en el select
  document.getElementById('r-sangre').value = r.sangre;

  // Carga el nombre de la ARL registrada
  document.getElementById('r-arl').value = r.arl;

  // Selecciona el género registrado en el select
  document.getElementById('r-genero').value = r.genero;

  // Carga el salario en el input numérico
  document.getElementById('r-salario').value = r.salario;

  // Selecciona el rol en el select
  document.getElementById('r-rol').value = r.rol;

  // Guarda el ID en el campo oculto para que saveRecurso() sepa que debe actualizar
  document.getElementById('r-edit-id').value = r.id;

  // ── Mantiene la restricción de fecha también en modo edición ──
  const nacEl = document.getElementById('r-nacimiento');

  // Re-aplica la fecha máxima para que la restricción siga activa en edición
  nacEl.max = '2010-12-31';

  // Re-aplica la fecha mínima
  nacEl.min = '1900-01-01';

  // Oculta el hint de fecha por si estaba visible de una operación anterior
  document.getElementById('r-nac-hint').style.display = 'none';

  // Actualiza el título del modal a "Editar Recurso"
  document.getElementById('modal-recurso-title').textContent = 'Editar Recurso';

  // Actualiza el texto del botón a "Guardar Cambios"
  document.getElementById('btn-save-recurso').textContent = 'Guardar Cambios';

  // Abre el modal con los datos ya precargados
  openModal('modal-recurso');
}


// deleteRecurso — elimina un recurso del store y limpia sus referencias en actividades.
// @param {string} id - ID (cédula) del recurso a eliminar
function deleteRecurso(id) {

  // Abre el diálogo de confirmación antes de ejecutar la eliminación
  confirmDelete('¿Seguro que deseas eliminar este recurso?', () => {

    // Filtra el array de recursos eliminando el que tiene el ID indicado
    store.recursos = store.recursos.filter(r => r.id != id);

    // Recorre todas las actividades que tenían a este recurso como responsable
    // y limpia el campo responsableId para evitar referencias rotas
    store.actividades.forEach(a => { if (a.responsableId == id) a.responsableId = ''; });

    // Notifica al usuario que la eliminación fue exitosa
    toast('Recurso eliminado');

    // Actualiza la tabla para que la fila eliminada desaparezca
    renderRecursos();

    // Actualiza los selects de responsable en toda la app
    populateSelects();
  });
}