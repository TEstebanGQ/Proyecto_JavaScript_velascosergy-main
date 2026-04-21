// ══════════════════════════════════════════════════════════════════
//  FONDO ANIMADO — Canvas 2D con orbes, partículas y constelaciones
// ══════════════════════════════════════════════════════════════════

(function initBackground() {
  const canvas = document.getElementById('galaxy-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Estrellas ──────────────────────────────────────────────────
  const STAR_COUNT = 220;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + 0.3,
    alpha: Math.random() * 0.7 + 0.3,
    phase: Math.random() * Math.PI * 2,
  }));

  // ── Orbes de luz ───────────────────────────────────────────────
  const orbs = [
    { cx: 0.12, cy: 0.25, rx: 380, ry: 260, color: '26,111,255',  alpha: 0.20 },
    { cx: 0.78, cy: 0.65, rx: 420, ry: 300, color: '0,170,255',   alpha: 0.16 },
    { cx: 0.50, cy: 0.88, rx: 500, ry: 220, color: '45,138,255',  alpha: 0.15 },
    { cx: 0.88, cy: 0.12, rx: 300, ry: 300, color: '77,166,255',  alpha: 0.17 },
    { cx: 0.35, cy: 0.48, rx: 280, ry: 180, color: '10,61,204',   alpha: 0.19 },
    { cx: 0.62, cy: 0.30, rx: 240, ry: 200, color: '110,198,255', alpha: 0.11 },
  ];

  // ── Partículas flotantes ───────────────────────────────────────
  const PART_COUNT = 60;
  const particles = Array.from({ length: PART_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vy: -(Math.random() * 0.4 + 0.1),
    vx: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.8 + 0.5,
    alpha: Math.random() * 0.6 + 0.2,
    life: Math.random(),
  }));

  // ── Nodos de constelación ──────────────────────────────────────
  const NODE_COUNT = 40;
  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
  }));
  const MAX_DIST = 160;

  // ── Mouse parallax ─────────────────────────────────────────────
  let mx = 0.5, my = 0.5;
  document.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
  });

  let t = 0;

  function draw() {
    t += 0.012;
    const W = canvas.width;
    const H = canvas.height;

    // ── Fondo base oscuro ──────────────────────────────────────
    ctx.fillStyle = '#010a16';
    ctx.fillRect(0, 0, W, H);

    // ── Orbes de luz pulsantes ─────────────────────────────────
    orbs.forEach((o, i) => {
      const pulse = 1 + 0.09 * Math.sin(t * 0.65 + i * 1.4);
      const px = (o.cx + (mx - 0.5) * 0.05) * W;
      const py = (o.cy + (my - 0.5) * 0.04) * H;
      const rx = o.rx * pulse;
      const ry = o.ry * pulse;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, ry / rx);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0,   `rgba(${o.color},${o.alpha})`);
      grad.addColorStop(0.45,`rgba(${o.color},${(o.alpha * 0.35).toFixed(3)})`);
      grad.addColorStop(1,   `rgba(${o.color},0)`);
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    // ── Líneas de constelación ─────────────────────────────────
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          const a = (1 - dist / MAX_DIST) * 0.28;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(74,166,255,${a})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(110,198,255,0.6)';
      ctx.fill();
    });

    // ── Estrellas titilantes ────────────────────────────────────
    stars.forEach(s => {
      const a = s.alpha * (0.55 + 0.45 * Math.sin(t * 1.2 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,225,255,${a})`;
      ctx.fill();
    });

    // ── Partículas flotantes ────────────────────────────────────
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.0035;
      if (p.y < -10 || p.life > 1) {
        p.x = Math.random() * W;
        p.y = H + 5;
        p.life = 0;
        p.alpha = Math.random() * 0.6 + 0.2;
      }
      const a = p.alpha * Math.sin(p.life * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100,190,255,${a.toFixed(3)})`;
      ctx.fill();
    });

    // ── Barridos de luz horizontal ─────────────────────────────
    const scanY1 = H * 0.28 + Math.sin(t * 0.38) * H * 0.05;
    const scanY2 = H * 0.65 + Math.sin(t * 0.28 + 1) * H * 0.04;
    [scanY1, scanY2].forEach(sy => {
      const sg = ctx.createLinearGradient(0, 0, W, 0);
      sg.addColorStop(0,    'rgba(74,166,255,0)');
      sg.addColorStop(0.35, 'rgba(74,166,255,0)');
      sg.addColorStop(0.5,  'rgba(74,166,255,0.13)');
      sg.addColorStop(0.65, 'rgba(74,166,255,0)');
      sg.addColorStop(1,    'rgba(74,166,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 1, W, 2);
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

// ══════════════════════════════════════════════════════════════════
//  OCULTAR BADGE "Built with Spline" — método agresivo
// ══════════════════════════════════════════════════════════════════

(function hideSplineBadge() {

  function applyHide() {
    // 1. Shadow DOM del viewer
    const viewer = document.querySelector('spline-viewer');
    if (viewer && viewer.shadowRoot) {
      const sr = viewer.shadowRoot;
      if (!sr.querySelector('#cb-hide')) {
        const st = document.createElement('style');
        st.id = 'cb-hide';
        st.textContent = `
          #logo, [id*="logo"], [class*="logo"],
          [id*="badge"], [class*="badge"],
          [id*="built"], [class*="built"],
          [id*="watermark"], [class*="watermark"],
          a[href*="spline"] { display:none!important; opacity:0!important; }
        `;
        sr.appendChild(st);
      }
    }

    // 2. Overlay físico de color sólido en esquina inferior derecha
    const container = document.querySelector('.hero-spline');
    if (container && !container.querySelector('.cb-kill')) {
      container.style.position = 'relative';
      container.style.overflow = 'hidden';

      const kill = document.createElement('div');
      kill.className = 'cb-kill';
      // Color exacto del fondo de la página para que sea invisible
      kill.style.cssText = [
        'position:absolute',
        'bottom:0',
        'right:0',
        'width:230px',
        'height:56px',
        'background:#010a16',
        'z-index:99999',
        'pointer-events:none',
      ].join(';');
      container.appendChild(kill);
    }
  }

  // Ejecutar muchas veces mientras Spline carga
  applyHide();
  [200, 500, 900, 1500, 2500, 4000, 6000].forEach(ms =>
    setTimeout(applyHide, ms)
  );

  // MutationObserver por si el viewer se actualiza tarde
  const obs = new MutationObserver(applyHide);
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => obs.disconnect(), 20000);
})();

// ══════════════════════════════════════════════════════════════════
//  DOTS DE NAVEGACIÓN
// ══════════════════════════════════════════════════════════════════

document.querySelectorAll('.dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// ══════════════════════════════════════════════════════════════════
//  BOTONES FEEDBACK
// ══════════════════════════════════════════════════════════════════

document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('click', function () {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => { this.style.transform = ''; }, 150);
  });
});