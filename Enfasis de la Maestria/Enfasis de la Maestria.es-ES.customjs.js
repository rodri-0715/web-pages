
/* ==========================================================================
   CONFIGURACIÓN (copie estos nombres desde la tabla de Dataverse; ver instrucciones)
   ========================================================================== */
const TABLA = "cr5f1_sesionenfasises";            // "Nombre del conjunto de entidades" de la tabla
const CAMPO_ID = "cr5f1_sesionenfasisid";         // columna de identificador de la fila
const CAMPO_FECHA = "cr5f1_fecha";                // columna Fecha (tipo "Solo fecha")
const CAMPO_PARTICIPANTES = "cr5f1_participantes";// columna de texto de varias líneas
const CAMPO_ALCANCE = "cr5f1_alcance";            // columna de texto de varias líneas
const CAMPO_SECCION = "cr5f1_seccion";            // columna de texto "Seccion"
const SECCION = "Enfasis";                        // identifica las sesiones de ESTA página
const ANIOS_SOLO_LECTURA = ['2025'];              // años donde NO aparece "Nueva sesión"
 
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
let currentSelectedYear = '2025';
 
/* ==========================================================================
   0. AJAX SEGURO CON TOKEN PARA POWER PAGES
   ========================================================================== */
(function (webapi, $) {
  function safeAjax(ajaxOptions) {
    var deferred = $.Deferred();
    shell.getTokenDeferred().done(function (token) {
      ajaxOptions.headers = ajaxOptions.headers || {};
      ajaxOptions.headers["__RequestVerificationToken"] = token;
      $.ajax(ajaxOptions)
        .done(function () { deferred.resolve.apply(deferred, arguments); })
        .fail(function () { deferred.reject.apply(deferred, arguments); });
    }).fail(function () {
      deferred.reject.apply(deferred, arguments);
    });
    return deferred.promise();
  }
  webapi.safeAjax = safeAjax;
})(window.webapi = window.webapi || {}, jQuery);
 
/* ==========================================================================
   1. ARRANQUE
   ========================================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarPagina);
} else {
  iniciarPagina();
}
 
function iniciarPagina() {
  // Detección automática de subpágina activa (menú píldora)
  var urlActual = window.location.href.toLowerCase();
  document.querySelectorAll('.sub-nav-item').forEach(function (el) { el.classList.remove('active'); });
 
  if (urlActual.includes("capacitacion")) {
    document.getElementById("menu-capacitacion")?.classList.add("active");
  } else if (urlActual.includes("enfasis")) {
    document.getElementById("menu-enfasis")?.classList.add("active");
  } else if (urlActual.includes("tipos")) {
    document.getElementById("menu-tipos")?.classList.add("active");
  } else if (urlActual.includes("fui")) {
    document.getElementById("menu-fui")?.classList.add("active");
  } else if (urlActual.includes("crnyo")) {
    document.getElementById("menu-crnyo")?.classList.add("active");
  } else if (urlActual.includes("integracion")) {
    document.getElementById("menu-integracion")?.classList.add("active");
  }
 
  // Las sesiones que ya están escritas en la página (2025): se les asigna su año
  // y se les quita el botón de eliminar, porque no están guardadas en la tabla
  document.querySelectorAll('#sessionsList > details').forEach(function (card) {
    const m = /(20\d{2})/.exec(card.querySelector('.obj-number')?.textContent || '');
    if (m) card.dataset.year = m[1];
    card.querySelector('.btn-delete-session')?.remove();
  });
 
  currentSelectedYear = '2025';
  actualizarVisibilidadBoton(currentSelectedYear);
  aplicarFiltro(currentSelectedYear);
  cargarSesionesGuardadas();
}
 
/* ==========================================================================
   2. FILTRO POR AÑO (usa el año guardado en la tarjeta, no el texto de la fecha)
   ========================================================================== */
function filterByYear(year, buttonElement) {
  currentSelectedYear = year;
 
  document.querySelectorAll('.year-btn').forEach(function (btn) {
    btn.classList.remove('active');
    btn.style.backgroundColor = '#FFFFFF';
    btn.style.color = '#334155';
    btn.style.borderColor = '#CBD5E1';
  });
 
  buttonElement.classList.add('active');
  buttonElement.style.backgroundColor = '#003B70';
  buttonElement.style.color = '#FFFFFF';
  buttonElement.style.borderColor = '#003B70';
 
  const sessionsTitle = document.getElementById('sessionsHeaderTitle');
  if (sessionsTitle) sessionsTitle.textContent = `Sesiones y alcances (${year})`;
 
  actualizarVisibilidadBoton(year);
  aplicarFiltro(year);
}
 
function aplicarFiltro(year) {
  const sessionsList = document.getElementById('sessionsList');
  if (!sessionsList) return;
 
  let hasSessions = false;
  sessionsList.querySelectorAll(':scope > details').forEach(function (session) {
    if (session.dataset.year === String(year)) {
      session.style.display = 'block';
      hasSessions = true;
    } else {
      session.style.display = 'none';
    }
  });
 
  let noDataMsg = document.getElementById('noSessionsMsg');
  if (!hasSessions) {
    if (!noDataMsg) {
      noDataMsg = document.createElement('div');
      noDataMsg.id = 'noSessionsMsg';
      noDataMsg.style.cssText = 'padding: 25px; text-align: center; color: #64748B; font-size: 13.5px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; margin-top: 15px;';
      sessionsList.appendChild(noDataMsg);
    }
    noDataMsg.innerHTML = `<i class="fa fa-info-circle"></i> No hay sesiones registradas para el año <strong>${year}</strong>.`;
    noDataMsg.style.display = 'block';
  } else if (noDataMsg) {
    noDataMsg.style.display = 'none';
  }
}
 
function actualizarVisibilidadBoton(year) {
  const btnNueva = document.getElementById('btnNuevaSesion');
  if (btnNueva) {
    btnNueva.style.display = ANIOS_SOLO_LECTURA.includes(String(year)) ? 'none' : 'flex';
  }
}
 
/* ==========================================================================
   3. TARJETAS DE SESIÓN (se construyen con textContent: no se inyecta HTML)
   ========================================================================== */
function etiquetaDeFecha(iso) {          // "2026-12-10" -> "10 dic 2026"
  const p = iso.split('-');
  return parseInt(p[2], 10) + ' ' + MESES_CORTOS[parseInt(p[1], 10) - 1] + ' ' + p[0];
}
 
function crearElemento(tag, clase) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  return e;
}
 
function crearTarjeta(s) {                // s = { id, fecha (YYYY-MM-DD), participantes, alcance }
  const card = crearElemento('details', 'objective-card-interactive');
  card.dataset.year = s.fecha.substring(0, 4);
  card.dataset.fecha = s.fecha;
  if (s.id) card.dataset.id = s.id;
  card.style.display = 'none';
 
  const summary = crearElemento('summary', 'objective-card-header');
 
  const num = crearElemento('span', 'obj-number');
  num.textContent = etiquetaDeFecha(s.fecha);
 
  const resumen = crearElemento('div', 'obj-summary-text');
  const negrita = document.createElement('strong');
  negrita.textContent = 'Participantes:';
  resumen.appendChild(negrita);
  resumen.appendChild(document.createTextNode(' ' + s.participantes));
 
  const borrar = crearElemento('button', 'btn-delete-session');
  borrar.type = 'button';
  borrar.title = 'Eliminar sesión';
  borrar.innerHTML = '<i class="fa fa-trash"></i>';
  borrar.onclick = function (e) { deleteSession(e, borrar); };
 
  const icono = crearElemento('span', 'interactive-icon');
  icono.innerHTML = '<i class="fa fa-chevron-down"></i>';
 
  summary.appendChild(num);
  summary.appendChild(resumen);
  summary.appendChild(borrar);
  summary.appendChild(icono);
 
  const cuerpo = crearElemento('div', 'objective-card-body');
  const titulo = document.createElement('p');
  const tituloNegrita = document.createElement('strong');
  tituloNegrita.textContent = 'Alcance / Detalles de la sesión';
  titulo.appendChild(tituloNegrita);
  const ul = document.createElement('ul');
  String(s.alcance || '').split(/\r?\n/).forEach(function (linea) {
    if (linea.trim() === '') return;
    const li = document.createElement('li');
    li.textContent = linea.trim();
    ul.appendChild(li);
  });
  cuerpo.appendChild(titulo);
  cuerpo.appendChild(ul);
 
  card.appendChild(summary);
  card.appendChild(cuerpo);
  return card;
}
 
// Coloca la tarjeta en orden cronológico dentro de su año
function insertarEnOrden(card) {
  const lista = document.getElementById('sessionsList');
  const delMismoAnio = Array.from(lista.querySelectorAll(':scope > details')).filter(function (d) {
    return d.dataset.year === card.dataset.year && d.dataset.fecha;
  });
  const siguiente = delMismoAnio.find(function (d) { return d.dataset.fecha > card.dataset.fecha; });
  if (siguiente) lista.insertBefore(card, siguiente);
  else lista.appendChild(card);
}
 
/* ==========================================================================
   4. CARGAR LAS SESIONES GUARDADAS EN DATAVERSE
   ========================================================================== */
function cargarSesionesGuardadas() {
  const campos = [CAMPO_ID, CAMPO_FECHA, CAMPO_PARTICIPANTES, CAMPO_ALCANCE].join(',');
  const url = encodeURI("/_api/" + TABLA + "?$select=" + campos +
    "&$filter=" + CAMPO_SECCION + " eq '" + SECCION + "'&$orderby=" + CAMPO_FECHA + " asc");
 
  webapi.safeAjax({
    type: "GET",
    url: url,
    contentType: "application/json",
    success: function (data) {
      (data.value || []).forEach(function (fila) {
        const fecha = String(fila[CAMPO_FECHA] || '').substring(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return;
        insertarEnOrden(crearTarjeta({
          id: fila[CAMPO_ID],
          fecha: fecha,
          participantes: fila[CAMPO_PARTICIPANTES] || '',
          alcance: fila[CAMPO_ALCANCE] || ''
        }));
      });
      aplicarFiltro(currentSelectedYear);
    },
    error: function (xhr) {
      console.error("Error al cargar las sesiones:", xhr.status, xhr.responseText);
    }
  });
}
 
/* ==========================================================================
   5. MODAL: AGREGAR UNA SESIÓN (solo en el año que está seleccionado)
   ========================================================================== */
function openSessionModal() {
  const dateInput = document.getElementById('sessionDate');
  if (dateInput) {
    dateInput.value = '';
    dateInput.min = currentSelectedYear + '-01-01';   // el calendario solo deja elegir
    dateInput.max = currentSelectedYear + '-12-31';   // fechas del año activo
  }
  document.getElementById('sessionModal').style.display = 'flex';
}
 
function closeSessionModal() {
  document.getElementById('sessionModal').style.display = 'none';
  document.getElementById('addSessionForm').reset();
}
 
function obtenerIdCreado(xhr) {
  let id = xhr.getResponseHeader("entityid");
  if (id) return id.replace(/[{}]/g, "");
  const uri = xhr.getResponseHeader("OData-EntityId") || "";
  const m = uri.match(/\(([0-9a-fA-F-]{36})\)/);
  return m ? m[1] : null;
}
 
function addSession(event) {
  event.preventDefault();
 
  const fecha = document.getElementById('sessionDate').value;            // YYYY-MM-DD
  const participantes = document.getElementById('sessionParticipants').value.trim();
  const alcance = document.getElementById('sessionDetails').value.trim();
 
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    alert('Seleccione una fecha válida.');
    return;
  }
  if (fecha.substring(0, 4) !== currentSelectedYear) {
    alert('La fecha debe ser del año ' + currentSelectedYear + ', que es el año seleccionado.');
    return;
  }
 
  const btnGuardar = document.querySelector('#addSessionForm .btn-save');
  if (btnGuardar) btnGuardar.disabled = true;
  const terminar = function () { if (btnGuardar) btnGuardar.disabled = false; };
 
  const cuerpo = { "cr5f1_name": etiquetaDeFecha(fecha) };
  cuerpo[CAMPO_FECHA] = fecha;
  cuerpo[CAMPO_PARTICIPANTES] = participantes;
  cuerpo[CAMPO_ALCANCE] = alcance;
  cuerpo[CAMPO_SECCION] = SECCION;
 
  webapi.safeAjax({
    type: "POST",
    url: "/_api/" + TABLA,
    contentType: "application/json",
    data: JSON.stringify(cuerpo),
    success: function (data, status, xhr) {
      const id = obtenerIdCreado(xhr);
      const card = crearTarjeta({ id: id, fecha: fecha, participantes: participantes, alcance: alcance });
      insertarEnOrden(card);
      aplicarFiltro(currentSelectedYear);
      terminar();
      closeSessionModal();
      if (!id) alert("La sesión se guardó, pero recargue la página para poder eliminarla desde aquí.");
    },
    error: function (xhr) {
      terminar();
      console.error("Error al guardar la sesión:", xhr.status, xhr.responseText);
      alert("No se pudo guardar (código " + xhr.status + "). Revise permisos y configuración.");
    }
  });
}
 
/* ==========================================================================
   6. ELIMINAR UNA SESIÓN (también se borra de la tabla)
   ========================================================================== */
function deleteSession(event, element) {
  event.stopPropagation();
  event.preventDefault();
 
  const card = element.closest('details');
  if (!card) return;
  if (!card.dataset.id) {
    alert('Esta sesión no se puede eliminar desde aquí.');
    return;
  }
  if (!confirm('¿Estás seguro de que deseas eliminar esta sesión?')) return;
 
  element.disabled = true;
  webapi.safeAjax({
    type: "DELETE",
    url: "/_api/" + TABLA + "(" + card.dataset.id + ")",
    success: function () {
      card.remove();
      aplicarFiltro(currentSelectedYear);
    },
    error: function (xhr) {
      element.disabled = false;
      console.error("Error al eliminar la sesión:", xhr.status, xhr.responseText);
      alert("No se pudo eliminar (código " + xhr.status + "). Revise los permisos de la tabla.");
    }
  });
}   