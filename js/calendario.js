// ═══════════════════════════════════
//  calendario.js — MÓDULO DE CALENDARIO
//  Renderiza un calendario mensual con las actividades
//  del store distribuidas en sus días correspondientes.
//  Permite navegar entre meses y filtrar por proyecto.
// ═══════════════════════════════════

// Array de nombres de meses en español (índice 0 = enero)
const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

/**
 * Navega al mes anterior o siguiente.
 * Ajusta automáticamente el año al cruzar enero/diciembre.
 * @param {number} delta - -1 para mes anterior, +1 para mes siguiente
 */
function changeMonth(delta) {
  calMonth += delta;

  // Si pasa de diciembre (11) → enero del año siguiente
  if (calMonth > 11) { calMonth = 0; calYear++; }

  // Si retrocede de enero (0) → diciembre del año anterior
  if (calMonth < 0)  { calMonth = 11; calYear--; }

  renderCalendar();   // Re-renderiza con el nuevo mes/año
}

/**
 * Renderiza el calendario completo del mes actual.
 * Construye un mapa de eventos por día y genera el HTML del grid.
 * Cada celda de día muestra hasta 3 actividades + contador de excedentes.
 */
function renderCalendar() {
  // Actualiza el texto del encabezado del mes (ej: "Abril 2026")
  document.getElementById('cal-month-label').textContent = `${MONTHS_ES[calMonth]} ${calYear}`;

  const filterP = document.getElementById('cal-project-filter').value;   // Filtro de proyecto activo

  // Calcula el día de la semana del 1ro del mes (0=domingo, 6=sábado)
  const firstDay    = new Date(calYear, calMonth, 1).getDay();

  // Cantidad de días en el mes (ej: 30 para abril, 31 para mayo)
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const today = new Date();   // Fecha actual para resaltar el día de hoy

  // Filtra las actividades según el proyecto seleccionado (o todas si no hay filtro)
  let acts = store.actividades;
  if (filterP) acts = acts.filter(a => a.proyectoId == filterP);

  // ── Construye el mapa de eventos por día ──
  // eventMap[día] = [array de actividades que ocurren ese día]
  const eventMap = {};
  acts.forEach(a => {
    const start = new Date(a.inicio + 'T00:00:00');   // Fecha de inicio de la actividad

    // Itera cada día que dura la actividad y la agrega al mapa
    for (let d = 0; d < a.duracion; d++) {
      const day = new Date(start);
      day.setDate(day.getDate() + d);   // Avanza d días desde el inicio

      // Solo incluye si el día cae en el mes/año que se está mostrando
      if (day.getFullYear() === calYear && day.getMonth() === calMonth) {
        const dn = day.getDate();
        if (!eventMap[dn]) eventMap[dn] = [];
        eventMap[dn].push(a);
      }
    }
  });

  let html = '';

  // ── Celdas vacías antes del primer día del mes ──
  // Si el mes empieza en miércoles (3), agrega 3 celdas vacías antes del día 1
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-day" style="background:rgba(3,7,16,0.3);opacity:0.5"></div>';
  }

  // Mapa de clases CSS según estado de la actividad
  const statusClass = {
    'Pendiente':  'pendiente',    // Amarillo
    'En Proceso': 'en-proceso',   // Azul
    'Terminada':  'terminada'     // Verde
  };

  // ── Genera las celdas de cada día del mes ──
  for (let d = 1; d <= daysInMonth; d++) {
    // Determina si este día es el día de hoy
    const isToday = (
      today.getFullYear() === calYear &&
      today.getMonth()    === calMonth &&
      today.getDate()     === d
    );

    const events = eventMap[d] || [];   // Actividades de este día (o array vacío)

    // Genera los chips de eventos del día (máximo 3 visibles)
    let eventsHtml = events.slice(0, 3).map(a =>
      `<div class="cal-event ${statusClass[a.estado] || ''}" title="${a.nombre} — ${a.estado}">${a.nombre}</div>`
    ).join('');

    // Si hay más de 3 eventos, muestra un indicador "+N más"
    if (events.length > 3) {
      eventsHtml += `<div style="font-size:11px;color:var(--text-muted);padding:1px 4px">+${events.length - 3} más</div>`;
    }

    html += `
    <div class="cal-day">
      <!-- Número del día; clase 'today' si es el día actual -->
      <div class="cal-day-num${isToday ? ' today' : ''}">${d}</div>
      ${eventsHtml}
    </div>`;
  }

  // Inyecta todo el HTML generado en el contenedor del grid de días
  document.getElementById('cal-days').innerHTML = html;
}