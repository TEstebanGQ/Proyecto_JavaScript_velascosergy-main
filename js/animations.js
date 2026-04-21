/**
 * animations.js
 * ============================================================
 * Animaciones de la página de Sergio Velasco.
 *
 * Responsabilidades:
 *  1. Activar el reveal de la sección .info-section al hacer
 *     scroll, usando Intersection Observer API.
 *  2. Animación de entrada escalonada de los chips de skills.
 *  3. Efecto parallax suave sobre la foto en el hero.
 *  4. Cursor personalizado brillante (solo en desktop).
 * ============================================================
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. SCROLL REVEAL — SECCIÓN INFO
     Cuando la sección "about" entra en el viewport,
     se le agrega la clase .visible que la hace aparecer
     (definida en el CSS con opacity y transform)
  ---------------------------------------------------------- */

  /**
   * observarSeccion
   * Configura un IntersectionObserver sobre el elemento dado.
   * Cuando entra en pantalla, añade la clase 'visible'.
   * @param {Element} el — Elemento DOM a observar
   */
  function observarSeccion(el) {
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Activar animación de entrada
            entry.target.classList.add('visible');

            // Animar chips de skills de forma escalonada
            const chips = entry.target.querySelectorAll('.chip');
            chips.forEach((chip, i) => {
              chip.style.opacity    = '0';
              chip.style.transform  = 'translateY(12px)';
              chip.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;

              // Forzar reflow para que la transición se dispare
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  chip.style.opacity   = '1';
                  chip.style.transform = 'translateY(0)';
                });
              });
            });

            // Dejar de observar una vez que ya se activó
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold:  0.15,    // Activar cuando el 15% del elemento sea visible
        rootMargin: '0px 0px -40px 0px',  // Margen inferior para trigger más natural
      }
    );

    observer.observe(el);
  }

  // Observar la sección de información / about
  const infoSection = document.querySelector('.info-section');
  observarSeccion(infoSection);


  /* ----------------------------------------------------------
     2. PARALLAX SUAVE EN EL HERO
     Al mover el mouse (o el scroll) en el hero, la foto y
     el eyebrow se desplazan ligeramente para dar profundidad
  ---------------------------------------------------------- */
  const photoWrapper = document.querySelector('.photo-wrapper');
  const heroName     = document.querySelector('.hero-name');
  const heroEyebrow  = document.querySelector('.hero-eyebrow');

  // Detectar si es dispositivo táctil (sin parallax de mouse)
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (!isTouchDevice && photoWrapper) {
    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;

      // Desplazamiento proporcional al centro (suavizado)
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      // Mover la foto muy sutilmente
      photoWrapper.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;

      // Contramovimiento en el nombre (efecto de capas)
      if (heroName) {
        heroName.style.transform = `translate(${-dx * 4}px, ${-dy * 3}px)`;
      }
      if (heroEyebrow) {
        heroEyebrow.style.transform = `translateY(0) translate(${-dx * 3}px, ${-dy * 2}px)`;
      }
    });
  }


  /* ----------------------------------------------------------
     3. CURSOR PERSONALIZADO (solo desktop)
     Un punto azul brillante que sigue al cursor
     con un retraso suave para efecto "lag" elegante
  ---------------------------------------------------------- */
  if (!isTouchDevice) {
    // Crear el elemento del cursor
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';

    // Estilo inline del cursor (sin tocar el CSS externo)
    Object.assign(cursor.style, {
      position:     'fixed',
      top:          '0',
      left:         '0',
      width:        '10px',
      height:       '10px',
      borderRadius: '50%',
      background:   'rgba(96, 207, 255, 0.9)',
      boxShadow:    '0 0 10px rgba(96, 207, 255, 0.8), 0 0 20px rgba(26, 111, 255, 0.4)',
      pointerEvents: 'none',
      zIndex:       '9999',
      transform:    'translate(-50%, -50%)',
      transition:   'transform 0.1s ease, width 0.2s ease, height 0.2s ease',
      willChange:   'transform',
    });

    // Elemento de halo exterior del cursor (más grande y opaco)
    const cursorHalo = document.createElement('div');
    cursorHalo.id = 'custom-cursor-halo';
    Object.assign(cursorHalo.style, {
      position:     'fixed',
      top:          '0',
      left:         '0',
      width:        '30px',
      height:       '30px',
      borderRadius: '50%',
      border:       '1px solid rgba(77, 166, 255, 0.35)',
      pointerEvents: 'none',
      zIndex:       '9998',
      transform:    'translate(-50%, -50%)',
      transition:   'all 0.12s ease',
      willChange:   'transform',
    });

    document.body.appendChild(cursorHalo);
    document.body.appendChild(cursor);

    // Ocultar cursor nativo
    document.body.style.cursor = 'none';

    // Posición actual y objetivo del cursor (para interpolación)
    let curX = 0, curY = 0;
    let tarX = 0, tarY = 0;

    // Actualizar posición objetivo con el mouse
    document.addEventListener('mousemove', (e) => {
      tarX = e.clientX;
      tarY = e.clientY;
    });

    // Agrandar el cursor al hacer hover en elementos interactivos
    const interactivos = ['a', 'button', '.chip', '.social-link'];
    interactivos.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.style.width      = '14px';
          cursor.style.height     = '14px';
          cursorHalo.style.width  = '44px';
          cursorHalo.style.height = '44px';
          cursorHalo.style.borderColor = 'rgba(96, 207, 255, 0.6)';
        });
        el.addEventListener('mouseleave', () => {
          cursor.style.width      = '10px';
          cursor.style.height     = '10px';
          cursorHalo.style.width  = '30px';
          cursorHalo.style.height = '30px';
          cursorHalo.style.borderColor = 'rgba(77, 166, 255, 0.35)';
        });
      });
    });

    // Loop de animación del cursor (interpolación suave)
    function moveCursor() {
      // Interpolación lineal para seguimiento con lag
      curX += (tarX - curX) * 0.15;
      curY += (tarY - curY) * 0.15;

      cursor.style.left     = `${tarX}px`;
      cursor.style.top      = `${tarY}px`;
      cursorHalo.style.left = `${curX}px`;
      cursorHalo.style.top  = `${curY}px`;

      requestAnimationFrame(moveCursor);
    }

    moveCursor();
  }


  /* ----------------------------------------------------------
     4. EFECTOS EN SCROLL — FADE OUT DEL HERO
     Al bajar en la página, el texto del hero se desvanece
     progresivamente para dar paso a la sección de info
  ---------------------------------------------------------- */
  const heroSection  = document.querySelector('.hero');
  const heroChildren = heroSection
    ? [...heroSection.querySelectorAll('.hero-eyebrow, .hero-name, .scroll-hint')]
    : [];

  window.addEventListener('scroll', () => {
    const scrollY   = window.scrollY;
    const heroH     = heroSection ? heroSection.offsetHeight : window.innerHeight;
    const progress  = Math.min(scrollY / (heroH * 0.5), 1);   // 0 a 1

    // Desvanecer y mover hacia arriba el texto del hero
    heroChildren.forEach((el) => {
      el.style.opacity   = `${1 - progress}`;
      el.style.transform = `translateY(${-progress * 20}px)`;
    });

    // La foto también se aleja levemente
    if (photoWrapper) {
      const scale = 1 - progress * 0.08;
      photoWrapper.style.transform = `scale(${scale})`;
    }
  }, { passive: true });

})();
