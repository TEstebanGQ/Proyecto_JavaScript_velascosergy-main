// ═══════════════════════════════════
//  main.js — INICIALIZACIÓN DE LA APP
//  Este es el último script en cargarse.
//  Espera a que el DOM esté completamente listo
//  para inicializar la aplicación.
// ═══════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Inicializa el cierre de modales al hacer clic en el overlay ──
  initModalOverlayClose();

  // ── 2. Puebla todos los selects con los datos iniciales del store ──
  populateSelects();

  // ── 3. Navega a la página de inicio (Dashboard) ──
  navigate('dashboard');

  // ── 4. Agrega el segundo orb de luz al fondo (violeta, esquina inferior derecha) ──
  // El primer orb está definido en CSS (body::after).
  // Este segundo orb se agrega dinámicamente para separar responsabilidades.
  const orbPurple = document.createElement('div');
  orbPurple.className = 'orb-purple';   // Clase definida en style1.css
  document.body.appendChild(orbPurple);
});

function goInicio() {
  navigate('dashboard');
}

function goCreditos() {
  alert("Desarrollado por Sergio Velasco 🚀");
}