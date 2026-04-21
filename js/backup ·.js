// ═══════════════════════════════════════════════════════════
//  backup.js — MÓDULO DE EXPORTAR / IMPORTAR
//  Requerimientos cubiertos:
//  ✔ Exportar todos los datos a un archivo JSON
//  ✔ Importar datos desde un archivo JSON
//  ✔ Validar la estructura del archivo antes de cargarlo
//  ✔ Evitar duplicados al importar
//  ✔ Mostrar mensajes de éxito o error
// ═══════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────
//  EXPORTAR
//  Serializa el store completo y lo descarga como .json
//  con timestamp en el nombre para identificar el respaldo.
// ───────────────────────────────────────────────────────────
function exportarDatos() {
  try {
    // Construye el objeto de exportación con metadatos de versión y fecha
    const exportObj = {
      version:    '1.0',
      exportadoEn: new Date().toISOString(),
      proyectos:  store.proyectos,
      actividades: store.actividades,
      hitos:      store.hitos,
      recursos:   store.recursos
    };

    const json  = JSON.stringify(exportObj, null, 2);
    const blob  = new Blob([json], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const link  = document.createElement('a');
    const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    link.href     = url;
    link.download = `campusbuild_backup_${fecha}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`Exportación exitosa — ${store.proyectos.length} proyectos, ${store.actividades.length} actividades, ${store.hitos.length} hitos, ${store.recursos.length} recursos`, 'success');
  } catch (e) {
    toast('Error al exportar: ' + e.message, 'error');
  }
}


// ───────────────────────────────────────────────────────────
//  VALIDAR ESTRUCTURA
//  Verifica que el JSON cargado tenga las claves esperadas
//  y que cada elemento tenga los campos mínimos requeridos.
//  Retorna { ok: true } o { ok: false, errores: [...] }
// ───────────────────────────────────────────────────────────
function validarEstructura(data) {
  const errores = [];

  // ── 1. Verificar que sea un objeto y no un array u otro tipo ──
  if (typeof data !== 'object' || Array.isArray(data) || data === null) {
    return { ok: false, errores: ['El archivo no contiene un objeto JSON válido.'] };
  }

  // ── 2. Verificar que existan las 4 secciones requeridas ──
  const seccionesRequeridas = ['proyectos', 'actividades', 'hitos', 'recursos'];
  seccionesRequeridas.forEach(s => {
    if (!Array.isArray(data[s])) {
      errores.push(`Falta la sección "${s}" o no es un array.`);
    }
  });

  // Si faltan secciones no tiene sentido seguir validando
  if (errores.length) return { ok: false, errores };

  // ── 3. Validar campos mínimos de cada proyecto ──
  data.proyectos.forEach((p, i) => {
    if (!p.id)     errores.push(`Proyecto [${i}]: falta "id".`);
    if (!p.nombre) errores.push(`Proyecto [${i}]: falta "nombre".`);
    if (!p.inicio) errores.push(`Proyecto [${i}]: falta "inicio".`);
    if (!p.fin)    errores.push(`Proyecto [${i}]: falta "fin".`);
  });

  // ── 4. Validar campos mínimos de cada actividad ──
  data.actividades.forEach((a, i) => {
    if (!a.id)         errores.push(`Actividad [${i}]: falta "id".`);
    if (!a.nombre)     errores.push(`Actividad [${i}]: falta "nombre".`);
    if (!a.proyectoId) errores.push(`Actividad [${i}]: falta "proyectoId".`);
    if (!a.estado)     errores.push(`Actividad [${i}]: falta "estado".`);
    const estadosValidos = ['Pendiente', 'En Proceso', 'Terminada'];
    if (a.estado && !estadosValidos.includes(a.estado)) {
      errores.push(`Actividad [${i}]: estado "${a.estado}" no es válido. Valores permitidos: ${estadosValidos.join(', ')}.`);
    }
  });

  // ── 5. Validar campos mínimos de cada hito ──
  data.hitos.forEach((h, i) => {
    if (!h.id)         errores.push(`Hito [${i}]: falta "id".`);
    if (!h.nombre)     errores.push(`Hito [${i}]: falta "nombre".`);
    if (!h.proyectoId) errores.push(`Hito [${i}]: falta "proyectoId".`);
    const estadosValidos = ['Pendiente', 'Cumplido'];
    if (h.estado && !estadosValidos.includes(h.estado)) {
      errores.push(`Hito [${i}]: estado "${h.estado}" no es válido. Valores permitidos: ${estadosValidos.join(', ')}.`);
    }
  });

  // ── 6. Validar campos mínimos de cada recurso ──
  data.recursos.forEach((r, i) => {
    if (!r.id)     errores.push(`Recurso [${i}]: falta "id".`);
    if (!r.nombre) errores.push(`Recurso [${i}]: falta "nombre".`);
    if (!r.rol)    errores.push(`Recurso [${i}]: falta "rol".`);
  });

  return errores.length
    ? { ok: false, errores }
    : { ok: true, errores: [] };
}


// ───────────────────────────────────────────────────────────
//  IMPORTAR
//  Lee el archivo seleccionado, valida la estructura,
//  detecta duplicados e incorpora solo los elementos nuevos.
// ───────────────────────────────────────────────────────────
function importarDatos(file) {
  if (!file) return;

  // Verificar que sea un archivo .json por extensión y tipo MIME
  const esJson = file.name.endsWith('.json') || file.type === 'application/json';
  if (!esJson) {
    mostrarResultadoImport('error', ['El archivo debe tener extensión .json.']);
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    let data;

    // ── Paso 1: parsear el JSON ──
    try {
      data = JSON.parse(e.target.result);
    } catch (parseErr) {
      mostrarResultadoImport('error', ['El archivo no es un JSON válido: ' + parseErr.message]);
      return;
    }

    // ── Paso 2: validar estructura ──
    const validacion = validarEstructura(data);
    if (!validacion.ok) {
      mostrarResultadoImport('error', validacion.errores);
      return;
    }

    // ── Paso 3: detectar y evitar duplicados ──
    const resumen = { proyectos: 0, actividades: 0, hitos: 0, recursos: 0 };
    const duplicados = { proyectos: 0, actividades: 0, hitos: 0, recursos: 0 };

    // Proyectos: duplicado si ya existe el mismo id
    data.proyectos.forEach(p => {
      if (store.proyectos.find(e => e.id == p.id)) {
        duplicados.proyectos++;
      } else {
        store.proyectos.push(p);
        resumen.proyectos++;
      }
    });

    // Actividades: duplicado si ya existe el mismo id
    data.actividades.forEach(a => {
      if (store.actividades.find(e => e.id == a.id)) {
        duplicados.actividades++;
      } else {
        store.actividades.push(a);
        resumen.actividades++;
      }
    });

    // Hitos: duplicado si ya existe el mismo id
    data.hitos.forEach(h => {
      if (store.hitos.find(e => e.id == h.id)) {
        duplicados.hitos++;
      } else {
        store.hitos.push(h);
        resumen.hitos++;
      }
    });

    // Recursos: duplicado si ya existe el mismo id (cédula)
    data.recursos.forEach(r => {
      if (store.recursos.find(e => e.id == r.id)) {
        duplicados.recursos++;
      } else {
        store.recursos.push(r);
        resumen.recursos++;
      }
    });

    // ── Paso 4: recalcular nextId para evitar colisiones ──
    nextId.p = store.proyectos.length   ? Math.max(...store.proyectos.map(p => p.id))   + 1 : 1;
    nextId.a = store.actividades.length ? Math.max(...store.actividades.map(a => a.id)) + 1 : 1;
    nextId.h = store.hitos.length       ? Math.max(...store.hitos.map(h => h.id))       + 1 : 1;

    // ── Paso 5: persistir y re-renderizar ──
    saveStore();
    populateSelects();

    // Re-renderiza la página activa para reflejar los datos importados
    if (currentPage === 'dashboard')        renderDashboard();
    else if (currentPage === 'proyectos')   renderProyectos();
    else if (currentPage === 'actividades') renderActividades();
    else if (currentPage === 'hitos')       renderHitos();
    else if (currentPage === 'recursos')    renderRecursos();
    else if (currentPage === 'calendario')  renderCalendar();

    // ── Paso 6: construir mensaje de resultado ──
    const importados = resumen.proyectos + resumen.actividades + resumen.hitos + resumen.recursos;
    const dupTotal   = duplicados.proyectos + duplicados.actividades + duplicados.hitos + duplicados.recursos;

    if (importados === 0 && dupTotal > 0) {
      // Todo era duplicado
      mostrarResultadoImport('warning', [
        `⚠ Todos los registros del archivo ya existen (${dupTotal} duplicados omitidos). No se importó nada nuevo.`
      ]);
    } else {
      // Importación exitosa (con o sin duplicados omitidos)
      const lineas = [
        `✔ Importación completada:`,
        `  • ${resumen.proyectos} proyecto(s) nuevos`,
        `  • ${resumen.actividades} actividad(es) nuevas`,
        `  • ${resumen.hitos} hito(s) nuevos`,
        `  • ${resumen.recursos} recurso(s) nuevos`,
      ];
      if (dupTotal > 0) {
        lineas.push(`  • ${dupTotal} registro(s) duplicado(s) omitidos`);
      }
      mostrarResultadoImport('success', lineas);
    }

    // Cerrar el modal tras la importación
    closeModal('modal-backup');
  };

  reader.onerror = function () {
    mostrarResultadoImport('error', ['No se pudo leer el archivo. Intenta de nuevo.']);
  };

  reader.readAsText(file);
}


// ───────────────────────────────────────────────────────────
//  mostrarResultadoImport
//  Muestra el resultado en el área del modal Y lanza un toast.
//  type: 'success' | 'error' | 'warning'
// ───────────────────────────────────────────────────────────
function mostrarResultadoImport(type, lineas) {
  const area = document.getElementById('import-result');
  if (!area) return;

  const colores = {
    success: { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.4)',   text: '#22c55e' },
    error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.4)',  text: '#f59e0b' }
  };
  const c = colores[type] || colores.error;

  area.style.display    = 'block';
  area.style.background = c.bg;
  area.style.border     = `1px solid ${c.border}`;
  area.style.borderRadius = '8px';
  area.style.padding    = '12px 14px';
  area.style.marginTop  = '12px';
  area.style.fontSize   = '0.82rem';
  area.style.color      = c.text;
  area.style.lineHeight = '1.7';
  area.innerHTML        = lineas.map(l => `<div>${l}</div>`).join('');

  // Toast resumen
  const toastType = type === 'warning' ? 'success' : type;
  toast(lineas[0], toastType);
}


// ───────────────────────────────────────────────────────────
//  openModalBackup — abre el modal de backup y lo resetea
// ───────────────────────────────────────────────────────────
function openModalBackup() {
  // Limpiar estado previo
  const fileInput  = document.getElementById('import-file-input');
  const resultArea = document.getElementById('import-result');
  const fileName   = document.getElementById('import-file-name');

  if (fileInput)  fileInput.value  = '';
  if (resultArea) { resultArea.style.display = 'none'; resultArea.innerHTML = ''; }
  if (fileName)   fileName.textContent = 'Ningún archivo seleccionado';

  // Actualizar el resumen de datos actuales en el modal
  actualizarResumenBackup();

  openModal('modal-backup');
}


// ───────────────────────────────────────────────────────────
//  actualizarResumenBackup — muestra conteos en el modal
// ───────────────────────────────────────────────────────────
function actualizarResumenBackup() {
  const el = document.getElementById('backup-summary');
  if (!el) return;
  el.innerHTML = `
    <span>📋 ${store.proyectos.length} proyectos</span>
    <span>✅ ${store.actividades.length} actividades</span>
    <span>🚩 ${store.hitos.length} hitos</span>
    <span>👤 ${store.recursos.length} recursos</span>
  `;
}