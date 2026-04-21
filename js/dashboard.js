// ═══════════════════════════════════
//  dashboard.js — PÁGINA DE INICIO (DASHBOARD)
//  Renderiza las tarjetas de estadísticas globales
//  y las listas de proyectos y actividades recientes.
//  Se llama cada vez que el usuario navega al Dashboard.
// ═══════════════════════════════════

/**
 * Renderiza el Dashboard completo:
 * - 4 stat cards (proyectos, actividades, hitos, recursos)
 * - Lista de proyectos recientes con % de progreso
 * - Lista de actividades más recientes con su estado
 */
function renderDashboard() {
  // ── Cálculos de estadísticas globales ──
  const totalP = store.proyectos.length;                                             // Total de proyectos
  const totalA = store.actividades.length;                                           // Total de actividades
  const doneA  = store.actividades.filter(a => a.estado === 'Terminada').length;    // Actividades terminadas
  const totalH = store.hitos.length;                                                 // Total de hitos
  const doneH  = store.hitos.filter(h => h.estado === 'Cumplido').length;           // Hitos cumplidos
  const totalR = store.recursos.length;                                              // Total de recursos humanos

  // ── Renderiza las 4 tarjetas de estadísticas ──
  // Cada tarjeta muestra: ícono, número grande y subtexto.
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(0,212,255,0.12)">📋</div>
      <div class="stat-label">Proyectos</div>
      <div class="stat-value">${totalP}</div>
      <div class="stat-sub">activos</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(34,197,94,0.12)">✅</div>
      <div class="stat-label">Actividades</div>
      <div class="stat-value">${totalA}</div>
      <div class="stat-sub">${doneA} terminadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(245,158,11,0.12)">🚩</div>
      <div class="stat-label">Hitos</div>
      <div class="stat-value">${totalH}</div>
      <div class="stat-sub">${doneH} cumplidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(129,140,248,0.12)">👤</div>
      <div class="stat-label">Recursos</div>
      <div class="stat-value">${totalR}</div>
      <div class="stat-sub">disponibles</div>
    </div>`;

  // ── Lista de proyectos recientes (máximo 5) ──
  // Para cada proyecto calcula el % de actividades terminadas.
  document.getElementById('dash-projects').innerHTML = store.proyectos.slice(0, 5).map(p => {
    const acts = store.actividades.filter(a => a.proyectoId == p.id);   // Actividades de este proyecto
    const pct  = acts.length
      ? Math.round(acts.filter(a => a.estado === 'Terminada').length / acts.length * 100)
      : 0;   // % de completitud (0 si no tiene actividades)

    return `<div class="dash-item">
      <span>${p.nombre}</span>
      <span style="color:var(--accent-1);font-weight:600">${pct}%</span>
    </div>`;
  }).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:8px 0">Sin proyectos aún</div>';

  // ── Lista de actividades recientes (últimas 5, en orden inverso) ──
  // Muestra el nombre de cada actividad y su badge de estado.
  document.getElementById('dash-activities').innerHTML = store.actividades.slice(-5).reverse().map(a =>
    `<div class="dash-item"><span>${a.nombre}</span>${estadoBadge(a.estado)}</div>`
  ).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:8px 0">Sin actividades aún</div>';
}