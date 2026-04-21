// ═══════════════════════════════════════════════════════════
//  validaciones.js
//  Contiene las funciones de validación de formularios y
//  el control del sidebar en modo móvil (hamburger).
//  Se carga DESPUÉS de main.js porque usa toast() de ui.js
//  y necesita que el DOM ya esté inicializado.
// ═══════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────
//  SIDEBAR MÓVIL
//  En pantallas pequeñas el sidebar está oculto fuera de
//  la pantalla. Estas funciones lo muestran y lo ocultan
//  animándolo con la clase CSS 'sidebar-open'.
// ───────────────────────────────────────────────────────────

// toggleSidebar — alterna el estado abierto/cerrado del sidebar.
// Se llama desde el botón hamburguesa (☰) en el topbar.
function toggleSidebar() {

  // Obtiene el elemento del sidebar por su id definido en el HTML
  const sidebar = document.getElementById('sidebar');

  // Obtiene el overlay oscuro que cubre el contenido cuando el sidebar está abierto
  const overlay = document.getElementById('sidebar-overlay');

  // Verifica si el sidebar ya está abierto buscando la clase 'sidebar-open'
  const isOpen = sidebar.classList.contains('sidebar-open');

  // Alterna la clase 'sidebar-open': si estaba abierto la quita, si estaba cerrado la pone
  sidebar.classList.toggle('sidebar-open', !isOpen);

  // Alterna la clase 'active' del overlay para mostrarlo u ocultarlo junto al sidebar
  overlay.classList.toggle('active', !isOpen);

  // Alterna 'sidebar-locked' en el body para bloquear el scroll vertical mientras el sidebar está abierto
  document.body.classList.toggle('sidebar-locked', !isOpen);
}

// closeSidebar — cierra el sidebar y restaura el scroll del body.
// Se llama al hacer clic en el overlay oscuro o al navegar a una página.
function closeSidebar() {

  // Elimina la clase que muestra el sidebar, lo devuelve a su posición oculta
  document.getElementById('sidebar').classList.remove('sidebar-open');

  // Oculta el overlay oscuro que cubría el contenido
  document.getElementById('sidebar-overlay').classList.remove('active');

  // Elimina el bloqueo de scroll del body que se puso al abrir el sidebar
  document.body.classList.remove('sidebar-locked');
}


// ───────────────────────────────────────────────────────────
//  VALIDACIÓN DE PROYECTOS — FECHA FIN ≥ FECHA INICIO
//  Cuando el usuario elige la fecha de inicio, el campo de
//  fecha fin recibe un atributo `min` igual a esa fecha para
//  que el selector del navegador no permita elegir un día
//  anterior. Si había una fecha fin inválida, se borra.
// ───────────────────────────────────────────────────────────

// actualizarMinFechaFin — se ejecuta cada vez que cambia el input p-inicio.
// Ajusta el atributo min del campo p-fin para reflejar la nueva restricción.
function actualizarMinFechaFin() {

  // Lee el valor actual del campo de fecha de inicio del proyecto
  const inicio = document.getElementById('p-inicio').value;

  // Referencia al input de fecha de fin para poder modificar su atributo min
  const finEl = document.getElementById('p-fin');

  // Referencia al mensaje de ayuda (hint) que aparece bajo el campo de fecha fin
  const hint = document.getElementById('p-fin-hint');

  // Solo actúa si el campo de inicio tiene un valor seleccionado
  if (inicio) {

    // Asigna el mínimo del selector de fecha fin igual a la fecha de inicio
    // Esto hace que el navegador deshabilite visualmente los días anteriores
    finEl.min = inicio;

    // Si el campo de fin ya tenía una fecha seleccionada Y esa fecha es anterior al nuevo inicio...
    if (finEl.value && finEl.value < inicio) {

      // Borra la fecha fin inválida para obligar al usuario a elegir una nueva
      finEl.value = '';

      // Muestra el mensaje de advertencia bajo el campo
      hint.style.display = 'block';
    } else {

      // Si la fecha fin es válida (o está vacía), oculta el hint
      hint.style.display = 'none';
    }
  }
}


// ───────────────────────────────────────────────────────────
//  INICIALIZACIÓN AL CARGAR EL DOM
//  Se usa DOMContentLoaded para garantizar que todos los
//  elementos del HTML ya existen antes de añadir listeners.
// ───────────────────────────────────────────────────────────

// Espera a que el navegador termine de parsear el HTML completo
document.addEventListener('DOMContentLoaded', () => {

  // ── Listener: validación en tiempo real del campo fecha fin de proyecto ──

  // Obtiene el input de fecha fin del formulario de proyecto
  document.getElementById('p-fin').addEventListener('change', function () {

    // Lee la fecha de inicio actual para comparar
    const inicio = document.getElementById('p-inicio').value;

    // Referencia al mensaje de advertencia del campo fecha fin
    const hint = document.getElementById('p-fin-hint');

    // Si hay fecha de inicio Y la fecha fin elegida es anterior...
    if (inicio && this.value < inicio) {

      // Muestra un toast de error visible en la esquina superior derecha
      toast('La fecha de fin no puede ser anterior a la fecha de inicio.', 'error');

      // Limpia el valor inválido del campo
      this.value = '';

      // Muestra el mensaje de ayuda bajo el campo para orientar al usuario
      hint.style.display = 'block';
    } else {

      // Si la fecha es válida, oculta el hint por si estaba visible antes
      hint.style.display = 'none';
    }
  });


  // ── Listener: validación del estado en el formulario de actividades ──
  // Solo aplica al CREAR (editId vacío). Al editar sí se puede poner Terminada.

  // Obtiene el select de estado de la actividad
  document.getElementById('a-estado').addEventListener('change', function () {

    // Lee el campo oculto que contiene el ID si estamos editando (vacío si es nueva)
    const editId = document.getElementById('a-edit-id').value;

    // Referencia al hint de advertencia bajo el select de estado
    const hint = document.getElementById('a-estado-hint');

    // Si NO es una edición (editId vacío) Y el estado elegido es "Terminada"...
    if (!editId && this.value === 'Terminada') {

      // Muestra el mensaje de advertencia explicando por qué no está permitido
      hint.style.display = 'block';
    } else {

      // En cualquier otro caso (edición, o estado válido), oculta el hint
      hint.style.display = 'none';
    }
  });


  // ── Configuración inicial del input de fecha de nacimiento en Recursos ──
  // Se hace aquí y no en el HTML porque el atributo max debe ser dinámico.

  // Obtiene el input de fecha de nacimiento del formulario de recurso
  const nacEl = document.getElementById('r-nacimiento');

  // Establece la fecha máxima permitida: 31 de diciembre de 2010
  // Esto hace que el selector del navegador deshabilite fechas posteriores
  nacEl.max = '2008-12-31';

  // Establece la fecha mínima razonable para evitar entradas absurdas
  nacEl.min = '1900-01-01';
});


// ───────────────────────────────────────────────────────────
//  VALIDACIÓN DE FECHA DE NACIMIENTO (RECURSOS)
//  Se llama con el evento onchange del input r-nacimiento.
//  Verifica que el año no sea posterior a 2010 y da feedback.
// ───────────────────────────────────────────────────────────

// validarNacimiento — valida el año de la fecha de nacimiento en tiempo real.
function validarNacimiento() {

  // Obtiene el input de fecha de nacimiento
  const el = document.getElementById('r-nacimiento');

  // Obtiene el hint de advertencia bajo el campo
  const hint = document.getElementById('r-nac-hint');

  // Si el campo está vacío, no hay nada que validar: oculta el hint y sale
  if (!el.value) {
    hint.style.display = 'none';
    return;
  }

  // Convierte el valor del input (string YYYY-MM-DD) a objeto Date y extrae el año
  const anio = new Date(el.value).getFullYear();

  // Si el año es mayor a 2010, la fecha es inválida según las reglas del sistema
  if (anio > 2008) {

    // Informa al usuario con un toast rojo visible
    toast('La fecha de nacimiento debe ser hasta el año 2008 como máximo.', 'error');

    // Borra la fecha inválida del campo para obligar al usuario a corregirla
    el.value = '';

    // Muestra el mensaje de ayuda permanente bajo el campo
    hint.style.display = 'block';
  } else {

    // Si el año es válido (≤ 2010), oculta el hint por si estaba visible
    hint.style.display = 'none';
  }
}
