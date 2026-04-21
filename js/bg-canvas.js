/**
 * bg-canvas.js
 * ============================================================
 * Canvas de fondo global del sitio.
 * Dibuja partículas de puntos azules flotantes que se mueven
 * lentamente en toda la pantalla, creando profundidad atmosférica.
 * También traza líneas tenues entre partículas cercanas.
 * ============================================================
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     REFERENCIAS AL DOM
     Obtenemos el canvas y el contexto 2D para dibujar
  ---------------------------------------------------------- */
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* ----------------------------------------------------------
     CONFIGURACIÓN DE PARTÍCULAS
     Parámetros ajustables del sistema de partículas
  ---------------------------------------------------------- */
  const CONFIG = {
    count:          120,    // Número total de partículas
    minRadius:      0.8,    // Radio mínimo de cada punto
    maxRadius:      2.2,    // Radio máximo de cada punto
    minSpeed:       0.12,   // Velocidad mínima de desplazamiento
    maxSpeed:       0.4,    // Velocidad máxima de desplazamiento
    connectDist:    130,    // Distancia máxima para trazar líneas entre partículas
    lineOpacity:    0.12,   // Opacidad de las líneas de conexión
    colors: [               // Paleta de colores azul
      'rgba(96, 207, 255,',   // Azul cian brillante
      'rgba(77, 166, 255,',   // Azul medio
      'rgba(26, 111, 255,',   // Azul core
      'rgba(168, 212, 255,',  // Azul muy suave
    ],
  };

  /* ----------------------------------------------------------
     ESTADO
     Array de partículas activas y dimensiones del viewport
  ---------------------------------------------------------- */
  let particles = [];
  let W = 0;
  let H = 0;

  /* ----------------------------------------------------------
     FUNCIÓN: crearParticula
     Genera un objeto partícula con posición, velocidad,
     radio y color aleatorios dentro del canvas
  ---------------------------------------------------------- */
  function crearParticula() {
    const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    const speed = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
    const angle = Math.random() * Math.PI * 2;

    return {
      x:      Math.random() * W,
      y:      Math.random() * H,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed,
      r:      CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      color,
      alpha:  0.15 + Math.random() * 0.55,    // Opacidad aleatoria
      pulse:  Math.random() * Math.PI * 2,     // Fase para animación de pulso
    };
  }

  /* ----------------------------------------------------------
     FUNCIÓN: resize
     Ajusta el canvas al tamaño exacto de la ventana
     y regenera las partículas para la nueva dimensión
  ---------------------------------------------------------- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    // Regenerar partículas para el nuevo tamaño
    particles = Array.from({ length: CONFIG.count }, crearParticula);
  }

  /* ----------------------------------------------------------
     FUNCIÓN: dibujarConexiones
     Por cada par de partículas que estén dentro del
     radio CONFIG.connectDist, traza una línea tenue entre ellas
  ---------------------------------------------------------- */
  function dibujarConexiones() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDist) {
          // Más opaco cuanto más cerca estén
          const opacity = (1 - dist / CONFIG.connectDist) * CONFIG.lineOpacity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(77, 166, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* ----------------------------------------------------------
     FUNCIÓN: loop
     Loop de animación principal.
     Limpia el frame, actualiza posiciones, dibuja puntos
     y líneas de conexión.
  ---------------------------------------------------------- */
  let t = 0;

  function loop() {
    requestAnimationFrame(loop);

    // Limpiar canvas con fondo oscuro semi-transparente
    // (efecto de estela leve)
    ctx.clearRect(0, 0, W, H);

    t += 0.008;

    // Actualizar y dibujar cada partícula
    particles.forEach((p) => {
      // Mover partícula
      p.x += p.vx;
      p.y += p.vy;

      // Rebotar en los bordes del canvas
      if (p.x < -10)  p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10)  p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Pulso de opacidad suave
      p.pulse += 0.02;
      const alphaActual = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      // Dibujar punto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${alphaActual})`;
      ctx.fill();
    });

    // Trazar líneas de conexión entre partículas cercanas
    dibujarConexiones();
  }

  /* ----------------------------------------------------------
     INICIALIZACIÓN
     Se escucha el resize para mantener el canvas actualizado
  ---------------------------------------------------------- */
  window.addEventListener('resize', resize);
  resize();   // Primera llamada para configurar dimensiones
  loop();     // Arrancar el loop de animación

})();
