/**
 * aura.js
 * ============================================================
 * Aura 3D con Three.js alrededor de la foto de perfil.
 * Genera anillos (Torus) y partículas orbitales que giran y
 * reaccionan al movimiento del mouse.
 *
 * Colores: tonos azul eléctrico / cian (en lugar de los rosas
 * del video 2, aquí se usa la paleta del video 1: azules).
 * ============================================================
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     ESPERAR A QUE THREE.JS ESTÉ DISPONIBLE
     Three.js se carga con defer, así que esperamos a que
     el DOM y los scripts estén listos
  ---------------------------------------------------------- */
  function init() {
    if (typeof THREE === 'undefined') {
      // Si Three.js aún no cargó, intentar de nuevo en 100ms
      setTimeout(init, 100);
      return;
    }

    const canvas = document.getElementById('photo-aura-canvas');
    if (!canvas) return;

    /* ----------------------------------------------------------
       CONFIGURACIÓN DEL RENDERER
       Fondo transparente para que se vea sobre la foto
    ---------------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha:     true,     // Fondo transparente
      antialias: true,     // Bordes suavizados
    });

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(320, 320, false);   // false = no cambiar el CSS

    /* ----------------------------------------------------------
       ESCENA Y CÁMARA
    ---------------------------------------------------------- */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    /* ----------------------------------------------------------
       ILUMINACIÓN
       Luz ambiental oscura + punto de luz azul brillante
    ---------------------------------------------------------- */
    // Luz ambiental oscura base
    scene.add(new THREE.AmbientLight(0x081428, 2));

    // Punto de luz azul brillante al frente
    const pointLight = new THREE.PointLight(0x4da6ff, 4, 8);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Segunda luz de acento para más profundidad
    const accentLight = new THREE.PointLight(0x60cfff, 2, 6);
    accentLight.position.set(2, 1, 2);
    scene.add(accentLight);

    /* ----------------------------------------------------------
       DEFINICIÓN DE ANILLOS (Torus)
       Cada anillo tiene: radio, grosor, color, opacidad,
       inclinación inicial en X y Z, y velocidad de giro
    ---------------------------------------------------------- */
    const ringDefs = [
      // Anillo interior — azul core intenso
      { r: 1.4,  tb: 0.016, col: 0x1a6fff, op: 0.65, tX:  0.4, tZ:  0.2, sp:  0.7  },
      // Anillo medio — azul brillante
      { r: 1.7,  tb: 0.010, col: 0x4da6ff, op: 0.40, tX: -0.7, tZ:  0.5, sp: -0.4  },
      // Anillo pequeño — cian
      { r: 1.15, tb: 0.022, col: 0x60cfff, op: 0.45, tX: -0.2, tZ:  0.9, sp: -1.0  },
      // Anillo exterior difuso — azul suave
      { r: 2.0,  tb: 0.008, col: 0xa8d4ff, op: 0.20, tX:  0.9, tZ: -0.4, sp:  0.25 },
      // Anillo extra fino — blanco azulado
      { r: 1.55, tb: 0.005, col: 0xe0f0ff, op: 0.15, tX:  0.5, tZ:  1.2, sp:  0.5  },
    ];

    // Crear y agregar cada anillo a la escena
    const rings = [];

    ringDefs.forEach((def) => {
      const mesh = new THREE.Mesh(
        // Geometría de toro: radio, grosor, segmentos radiales, segmentos tubulares
        new THREE.TorusGeometry(def.r, def.tb, 8, 120),
        new THREE.MeshBasicMaterial({
          color:       def.col,
          transparent: true,
          opacity:     def.op,
          depthWrite:  false,   // No escribir en el depth buffer para transparencias
        })
      );

      // Inclinación inicial
      mesh.rotation.x = def.tX;
      mesh.rotation.z = def.tZ;

      // Guardar metadatos en userData para usarlos en el loop
      mesh.userData = {
        sp:    def.sp,     // Velocidad de giro
        baseX: def.tX,     // Inclinación base en X
        baseZ: def.tZ,     // Inclinación base en Z
      };

      scene.add(mesh);
      rings.push(mesh);
    });

    /* ----------------------------------------------------------
       PARTÍCULAS ORBITALES
       60 puntos distribuidos aleatoriamente alrededor del centro
    ---------------------------------------------------------- */
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(60 * 3);   // x, y, z por partícula

    for (let i = 0; i < 60; i++) {
      const angle  = (i / 60) * Math.PI * 2;
      const radius = 1.1 + Math.random() * 1.0;    // Entre 1.1 y 2.1

      particlePos[i * 3]     = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;   // Altura aleatoria
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color:       0xa8d4ff,   // Azul claro suave
        size:        0.045,
        transparent: true,
        opacity:     0.70,
        depthWrite:  false,
      })
    );

    scene.add(particles);

    /* ----------------------------------------------------------
       SEGUNDO GRUPO DE PARTÍCULAS — más brillantes y pequeñas
       Dan la sensación de chispas/estrellas alrededor del aura
    ---------------------------------------------------------- */
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(30 * 3);

    for (let i = 0; i < 30; i++) {
      const angle  = (i / 30) * Math.PI * 2 + 0.1;
      const radius = 1.5 + Math.random() * 0.6;

      sparkPos[i * 3]     = Math.cos(angle) * radius;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      sparkPos[i * 3 + 2] = Math.sin(angle) * radius;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    const sparks = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        color:       0x60cfff,   // Cian brillante
        size:        0.025,
        transparent: true,
        opacity:     0.85,
        depthWrite:  false,
      })
    );

    scene.add(sparks);

    /* ----------------------------------------------------------
       MOUSE TRACKING
       El movimiento del mouse inclina suavemente los anillos
    ---------------------------------------------------------- */
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / innerHeight - 0.5) * 2;
    });

    // En móvil: soporte para touch
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / innerWidth  - 0.5) * 2;
        mouseY = (e.touches[0].clientY / innerHeight - 0.5) * 2;
      }
    }, { passive: true });

    /* ----------------------------------------------------------
       LOOP DE ANIMACIÓN PRINCIPAL
       Actualiza rotaciones, intensidad de luz y renderiza
    ---------------------------------------------------------- */
    let t = 0;

    (function loop() {
      requestAnimationFrame(loop);
      t += 0.012;   // Velocidad de tiempo global

      /* Actualizar cada anillo */
      rings.forEach((ring) => {
        // Giro constante en Y
        ring.rotation.y += ring.userData.sp * 0.008;

        // Oscilación en X y Z más influencia del mouse
        ring.rotation.x = ring.userData.baseX
          + Math.sin(t * 0.4) * 0.07
          + mouseY * 0.08;

        ring.rotation.z = ring.userData.baseZ
          + Math.cos(t * 0.3) * 0.05
          + mouseX * 0.08;
      });

      /* Partículas orbitales — giran en Y lentamente */
      particles.rotation.y  = t * 0.12;
      sparks.rotation.y     = t * 0.18;   // Más rápido que las principales
      sparks.rotation.x     = Math.sin(t * 0.2) * 0.15;

      /* Pulso de intensidad de luz */
      pointLight.intensity  = 3.5 + Math.sin(t * 2) * 0.8;
      accentLight.intensity = 1.5 + Math.cos(t * 1.5) * 0.5;

      renderer.render(scene, camera);
    })();

  }

  /* ----------------------------------------------------------
     ESPERAR AL DOM + INICIO
     Iniciar cuando el documento esté completamente cargado
  ---------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
  } else {
    setTimeout(init, 200);
  }

})();
