/* ═══════════════════════════════════════════════
   CampusBuild — aura.js
   Anillos animados en Canvas 2D (sin Three.js)
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('photo-aura-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* Tamaño interno del canvas en píxeles reales */
  const SIZE = 320;
  canvas.width  = SIZE;
  canvas.height = SIZE;

  const CX = SIZE / 2;
  const CY = SIZE / 2;

  /* Seguimiento del mouse para inclinar visualmente */
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* Definición de los anillos */
  const RINGS = [
    { radiusX: 90,  radiusY: 26, color: '#0d0551', lineW: 2.2, opacity: 0.55, speed:  0.007, angle: 0.4  },
    { radiusX: 108, radiusY: 32, color: '#157de6', lineW: 1.4, opacity: 0.35, speed: -0.004, angle: -0.7 },
    { radiusX: 74,  radiusY: 20, color: '#3872f9', lineW: 2.8, opacity: 0.40, speed: -0.010, angle: -0.2 },
    { radiusX: 126, radiusY: 38, color: '#ffffff', lineW: 1.0, opacity: 0.18, speed:  0.0025, angle: 0.9 },
  ];

  /* Partículas orbitales */
  const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
    angle:  (i / 55) * Math.PI * 2,
    radius: 72 + Math.random() * 56,
    speed:  0.004 + Math.random() * 0.006,
    size:   Math.random() * 2 + 0.8,
    alpha:  Math.random() * 0.5 + 0.3,
  }));

  let t = 0;

  function drawRing(ring, tilt) {
    ctx.save();
    ctx.translate(CX, CY);

    /* Inclinar el anillo según mouse y tiempo */
    const scaleY = Math.abs(Math.sin(ring.angle + tilt * 0.5 + mouseY * 0.4));
    const clampedScaleY = Math.max(0.12, Math.min(0.7, scaleY));

    ctx.globalAlpha = ring.opacity;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth   = ring.lineW;

    ctx.beginPath();
    ctx.ellipse(0, 0, ring.radiusX, ring.radiusX * clampedScaleY, ring.angle + mouseX * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles() {
    for (const p of PARTICLES) {
      p.angle += p.speed;

      const scaleY = 0.28 + Math.abs(Math.sin(p.angle * 0.3 + t * 0.1)) * 0.2;
      const px = CX + Math.cos(p.angle) * p.radius;
      const py = CY + Math.sin(p.angle) * p.radius * scaleY;

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,214,231,${p.alpha})`;
      ctx.fill();
    }
  }

  function drawGlow() {
    /* Halo central suave alrededor de la imagen */
    const grad = ctx.createRadialGradient(CX, CY, 40, CX, CY, 120);
    grad.addColorStop(0,   'rgba(232,115,154,0.18)');
    grad.addColorStop(0.5, 'rgba(204,34,85,0.07)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CX, CY, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    requestAnimationFrame(loop);
    t += 0.012;

    ctx.clearRect(0, 0, SIZE, SIZE);

    drawGlow();

    /* Anillos detrás (los que tienen eje Y pequeño van detrás) */
    const sorted = [...RINGS].sort((a, b) => {
      const sA = Math.abs(Math.sin(a.angle + t * a.speed * 40 + mouseY * 0.4));
      const sB = Math.abs(Math.sin(b.angle + t * b.speed * 40 + mouseY * 0.4));
      return sA - sB;
    });

    /* Avanzar ángulos */
    for (const ring of RINGS) {
      ring.angle += ring.speed;
    }

    for (const ring of sorted) {
      drawRing(ring, t);
    }

    drawParticles();
  }

  loop();
})();