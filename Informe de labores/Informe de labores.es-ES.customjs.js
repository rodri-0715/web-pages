/* ==========================================================================
   CONFIGURACIÓN (cambia aquí si tus nombres son distintos)
   ========================================================================== */
const TABLA = "cr5f1_documentoacademicos";          // conjunto de entidades de la tabla "Documento Academico"
const CAMPO_ID = "cr5f1_documentoacademicoid";       // columna de identificador de la fila
const COLUMNA_ARCHIVO = "cr5f1_archivopdf";          // columna de tipo Archivo (acepta cualquier archivo)
const CAMPO_SECCION = "cr5f1_seccion";               // columna de texto "Seccion"
const CAMPO_PROFESOR = "cr5f1_profesor";             // columna de texto "Profesor"
const SECCION = "InformeLabores";                    // se guarda como InformeLabores-I o InformeLabores-II
const MAX_MB = 30;                                   // máximo por archivo (la columna también debe permitirlo)

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
   1. AYUDAS PARA ENCONTRAR AÑO, SEMESTRE Y PROFESOR EN LA PÁGINA
   ========================================================================== */
function semestreDeTexto(texto) {
  const m = /(^|\s)(II|I)\s+Semestre/i.exec(texto || "");
  return m ? m[2].toUpperCase() : null;
}

function anioDeTexto(texto) {
  const m = /(20\d{2})/.exec(texto || "");
  return m ? m[1] : null;
}

// Compara nombres sin importar tildes, mayúsculas ni espacios de más
function normaliza(txt) {
  return String(txt || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\s+/g, " ").trim();
}

// Cuerpo del semestre (donde están los profesores) para un año y semestre dados
function obtenerCuerpoSemestre(year, sem) {
  const items = document.querySelectorAll('.year-accordion-item');
  for (const item of items) {
    const cabeceraAnio = item.firstElementChild;
    if (!cabeceraAnio || anioDeTexto(cabeceraAnio.textContent) !== String(year)) continue;

    for (const card of item.querySelectorAll('.semester-card')) {
      const cab = card.firstElementChild;
      if (cab && semestreDeTexto(cab.textContent) === sem) {
        return card.querySelector('.semester-card-body');
      }
    }
  }
  return null;
}

// A partir del botón "Agregar", encuentra la fila del profesor y su nombre
function filaDelProfesor(btn) {
  let el = btn;
  while (el.parentElement) {
    el = el.parentElement;
    const resto = (el.textContent || "").replace(btn.textContent, "").replace(/\s+/g, " ").trim();
    if (resto) return { fila: el, nombre: resto };
    if (el.classList && el.classList.contains('semester-card-body')) break;
  }
  return null;
}

// Busca la fila de un profesor por su nombre dentro de un año y semestre
function encontrarFilaProfesor(year, sem, profesor) {
  const cuerpo = obtenerCuerpoSemestre(year, sem);
  if (!cuerpo) return null;
  const buscado = normaliza(profesor);

  for (const b of cuerpo.querySelectorAll('button')) {
    if (!/agregar/i.test(b.textContent)) continue;
    const info = filaDelProfesor(b);
    if (info && normaliza(info.nombre) === buscado) return info.fila;
  }
  return null;
}

// Contenedor de documentos justo debajo de la fila del profesor
function contenedorDocs(fila) {
  let c = fila.nextElementSibling;
  if (!c || !c.classList.contains('docs-profesor')) {
    c = document.createElement('div');
    c.className = 'docs-profesor';
    c.style.cssText = 'margin:6px 0 10px 12px;display:flex;flex-direction:column;gap:6px;';
    fila.insertAdjacentElement('afterend', c);
  }
  return c;
}

/* ==========================================================================
   2. CARGA DE DOCUMENTOS GUARDADOS (se ejecuta al abrir la página)
   ========================================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarDocumentosDesdeDataverse);
} else {
  cargarDocumentosDesdeDataverse();
}

function cargarDocumentosDesdeDataverse() {
  webapi.safeAjax({
    type: "GET",
    url: "/_api/" + TABLA,
    contentType: "application/json",
    success: function (data) {
      (data.value || []).forEach(function (fila) {
        const sec = fila[CAMPO_SECCION] || "";
        if (sec.indexOf(SECCION + "-") !== 0) return;                  // solo informes de labores
        const sem = sec.substring(SECCION.length + 1).toUpperCase();   // "I" o "II"
        const tieneArchivo = fila[COLUMNA_ARCHIVO + "_name"] || fila[COLUMNA_ARCHIVO];
        if (!tieneArchivo) return;                                      // subida incompleta
        renderizarDoc(fila.cr5f1_name, fila.cr5f1_ano, sem, fila[CAMPO_PROFESOR], fila[CAMPO_ID], false);
      });
    },
    error: function (xhr) {
      console.error("Error al cargar documentos:", xhr.status, xhr.responseText);
    }
  });
}

function renderizarDoc(docName, year, sem, profesor, id, alInicio) {
  const filaProf = encontrarFilaProfesor(year, sem, profesor);
  if (!filaProf) {
    console.warn("No se encontró al profesor en la página:", profesor, year, sem);
    return;
  }
  const lista = contenedorDocs(filaProf);

  const item = document.createElement('div');
  item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;' +
    'padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;background:#F8FAFC;' +
    'cursor:pointer;font-size:13px;font-weight:600;color:#1E293B;';
  item.onclick = function (e) {
    e.stopPropagation();           // evita que se cierre el semestre al hacer clic
    loadDataverseViewer(id, docName);
  };

  const left = document.createElement('div');
  left.style.cssText = 'display:flex;align-items:center;gap:8px;';
  left.innerHTML = '<i class="fa fa-file-text-o" style="color:#003B70;font-size:15px;"></i>';
  const label = document.createElement('span');
  label.textContent = docName; // textContent evita inyección de HTML
  left.appendChild(label);

  const eye = document.createElement('i');
  eye.className = 'fa fa-eye';
  eye.style.cssText = 'color:#64748B;font-size:12px;';

  item.appendChild(left);
  item.appendChild(eye);

  if (alInicio) lista.insertBefore(item, lista.firstChild);
  else lista.appendChild(item);
}

/* ==========================================================================
   3. AGREGAR UN INFORME: elegir Excel o PDF -> nombre -> crear fila -> subir archivo
   ========================================================================== */
function addRecord(event, targetContext) {
  event.stopPropagation(); // evita abrir/cerrar el semestre al presionar Agregar
  const btn = event.currentTarget;

  // Año, semestre y profesor se leen de la propia página
  const item = btn.closest('.year-accordion-item');
  const card = btn.closest('.semester-card');
  const year = (item && anioDeTexto(item.firstElementChild.textContent)) || anioDeTexto(targetContext);
  const sem = (card && semestreDeTexto(card.firstElementChild.textContent)) || semestreDeTexto(targetContext);
  const info = filaDelProfesor(btn);
  const profesor = ((info && info.nombre) || "").trim();

  if (!year || !sem || !profesor) {
    alert("No se pudo identificar el año, el semestre o el profesor. Avise al administrador.");
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.pdf';

  input.onchange = function () {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!/\.(xlsx|xls|pdf)$/i.test(file.name)) {
      alert("Solo se permiten archivos de Excel (.xlsx, .xls) o PDF.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert("El archivo supera el máximo de " + MAX_MB + " MB.");
      return;
    }

    const sugerido = "Informe de labores " + sem + " Semestre " + year + " - " + profesor;
    const docName = (prompt("Nombre del documento:", sugerido) || "").trim();
    if (!docName) return;

    guardarDocumento(year, sem, profesor, docName, file, btn);
  };

  input.click();
}

function guardarDocumento(year, sem, profesor, docName, file, btn) {
  if (btn) btn.disabled = true;
  const terminar = function () { if (btn) btn.disabled = false; };

  const cuerpo = {
    "cr5f1_name": docName,
    "cr5f1_ano": parseInt(year, 10)
  };
  cuerpo[CAMPO_SECCION] = SECCION + "-" + sem;
  cuerpo[CAMPO_PROFESOR] = profesor;

  // Paso 1: crear la fila
  webapi.safeAjax({
    type: "POST",
    url: "/_api/" + TABLA,
    contentType: "application/json",
    data: JSON.stringify(cuerpo),
    success: function (data, status, xhr) {
      const id = obtenerIdCreado(xhr);
      if (!id) {
        terminar();
        alert("El documento se creó pero no se pudo obtener su identificador. Avise al administrador.");
        return;
      }
      // Paso 2: subir el archivo
      subirArchivo(id, docName, file, function (ok) {
        terminar();
        if (ok) {
          renderizarDoc(docName, year, sem, profesor, id, true);
          alert("¡Documento guardado con éxito!");
        } else {
          alert("Se creó el registro pero falló la subida del archivo. Inténtelo de nuevo o avise al administrador.");
        }
      });
    },
    error: function (xhr) {
      terminar();
      console.error("Error al crear el registro:", xhr.status, xhr.responseText);
      alert("No se pudo guardar (código " + xhr.status + "). Revise permisos y configuración.");
    }
  });
}

function obtenerIdCreado(xhr) {
  let id = xhr.getResponseHeader("entityid");
  if (id) return id.replace(/[{}]/g, "");
  const uri = xhr.getResponseHeader("OData-EntityId") || "";
  const m = uri.match(/\(([0-9a-fA-F-]{36})\)/);
  return m ? m[1] : null;
}

function subirArchivo(id, docName, file, done) {
  // Se conserva la extensión real del archivo (.xlsx, .xls o .pdf)
  const ext = (/\.(xlsx|xls|pdf)$/i.exec(file.name) || [".xlsx"])[0].toLowerCase();
  const nombreSeguro = docName.replace(/[^\w.-]+/g, "_") + ext;

  file.arrayBuffer().then(function (buffer) {
    webapi.safeAjax({
      type: "PUT",
      url: "/_api/" + TABLA + "(" + id + ")/" + COLUMNA_ARCHIVO,
      data: buffer,
      processData: false,
      contentType: "application/octet-stream",
      headers: { "x-ms-file-name": nombreSeguro },
      success: function () { done(true); },
      error: function (xhr) {
        console.error("Error al subir el archivo:", xhr.status, xhr.responseText);
        done(false);
      }
    });
  }).catch(function (e) {
    console.error("No se pudo leer el archivo:", e);
    done(false);
  });
}

/* ==========================================================================
   4. ACORDEONES (igual que antes)
   ========================================================================== */
function toggleYearAccordion(headerElement) {
  const item = headerElement.parentElement;
  const isOpen = item.classList.contains("active");

  const allItems = document.querySelectorAll(".year-accordion-item");
  allItems.forEach(accordion => {
    accordion.classList.remove("active");
    const content = accordion.querySelector(".year-accordion-content");
    if (content) content.style.display = "none";
  });

  if (!isOpen) {
    item.classList.add("active");
    const content = item.querySelector(".year-accordion-content");
    if (content) content.style.display = "block";
  }
}

function toggleSemester(semesterCard, event) {
  event.stopPropagation();
  const isOpen = semesterCard.classList.contains("active");

  const parentStack = semesterCard.parentElement;
  const allSemesters = parentStack.querySelectorAll(".semester-card");
  allSemesters.forEach(card => {
    card.classList.remove("active");
    const body = card.querySelector(".semester-card-body");
    if (body) body.style.display = "none";
  });

  if (!isOpen) {
    semesterCard.classList.add("active");
    const body = semesterCard.querySelector(".semester-card-body");
    if (body) body.style.display = "block";
  }
}

/* ==========================================================================
   5. VISOR: PDF en iframe; Excel solo se descarga (se abre en Excel real)
   ========================================================================== */
let urlBlobActual = null;
let ultimoArchivo = null; // { buffer, nombre, esPdf }

function errorVisor(codigo, detalle) {
  const e = new Error(detalle || codigo);
  e.codigo = codigo;
  return e;
}

// Mensaje que se muestra en el visor cuando algo falla (dice la causa)
function mensajeDeError(e) {
  if (e && e.codigo === 'HTTP') {
    return "No se pudo descargar el archivo (" + e.message + "). Revise los permisos de la tabla.";
  }
  return "No se pudo leer el archivo. Verifique que sea un Excel (.xlsx, .xls) o un PDF válido.";
}

function esPDF(buffer) {
  if (!buffer || buffer.byteLength < 4) return false;
  const b = new Uint8Array(buffer, 0, 4);
  return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46; // "%PDF"
}

function nombreDescarga(nombre, esPdf) {
  const base = String(nombre || "documento").replace(/[^\w.-]+/g, "_");
  if (/\.(xlsx|xls|pdf)$/i.test(base)) return base;
  return base + (esPdf ? ".pdf" : ".xlsx");
}

function descargarArchivoActual() {
  if (!ultimoArchivo || !ultimoArchivo.buffer) return;
  if (urlBlobActual) URL.revokeObjectURL(urlBlobActual);
  const tipo = ultimoArchivo.esPdf
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  urlBlobActual = URL.createObjectURL(new Blob([ultimoArchivo.buffer], { type: tipo }));
  const a = document.createElement("a");
  a.href = urlBlobActual;
  a.download = nombreDescarga(ultimoArchivo.nombre, ultimoArchivo.esPdf);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function botonDescargar(texto) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = texto;
  btn.style.cssText = "border:none;border-radius:8px;padding:10px 18px;font-size:14px;font-weight:700;" +
    "cursor:pointer;background:#003B70;color:#FFFFFF;";
  btn.onclick = function (e) { e.stopPropagation(); descargarArchivoActual(); };
  return btn;
}

function mostrarPDF(contenedor, buffer, docTitle) {
  ultimoArchivo = { buffer: buffer, nombre: docTitle, esPdf: true };
  if (urlBlobActual) URL.revokeObjectURL(urlBlobActual);
  urlBlobActual = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));

  const iframe = document.createElement("iframe");
  iframe.src = urlBlobActual + "#toolbar=0&navpanes=0&scrollbar=0";
  iframe.style.cssText = "width:100%;height:70vh;min-height:520px;border:none;";

  contenedor.innerHTML = "";
  const barra = document.createElement("div");
  barra.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:8px;";
  barra.appendChild(botonDescargar("Descargar PDF"));
  contenedor.appendChild(barra);
  contenedor.appendChild(iframe);
}

function mostrarExcel(contenedor, buffer, docTitle) {
  ultimoArchivo = { buffer: buffer, nombre: docTitle, esPdf: false };

  const caja = document.createElement("div");
  caja.style.cssText = "width:100%;min-height:420px;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;";

  const card = document.createElement("div");
  card.style.cssText = "max-width:560px;width:100%;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:40px 28px;";

  const icono = document.createElement("div");
  icono.innerHTML = '<i class="fa fa-file-excel-o" style="font-size:42px;color:#003B70;"></i>';
  icono.style.cssText = "margin-bottom:14px;";

  const titulo = document.createElement("h4");
  titulo.textContent = docTitle || "Informe de labores";
  titulo.style.cssText = "margin:0 0 8px 0;color:#003B70;font-size:18px;font-weight:800;line-height:1.35;";

  const ayuda = document.createElement("p");
  ayuda.textContent = "Descargue el archivo para abrirlo en Excel y ver su formato original.";
  ayuda.style.cssText = "margin:0 0 22px 0;color:#64748B;font-size:13px;";

  card.appendChild(icono);
  card.appendChild(titulo);
  card.appendChild(ayuda);
  card.appendChild(botonDescargar("Descargar Excel"));
  caja.appendChild(card);

  contenedor.innerHTML = "";
  contenedor.appendChild(caja);
}

// Visor para los archivos guardados en Dataverse (PDF o Excel, se detecta por el contenido)
function loadDataverseViewer(id, docTitle) {
  const badge = document.getElementById("viewer-status-badge");
  if (badge) {
    badge.style.backgroundColor = "#003B70";
    badge.style.color = "#FFFFFF";
    badge.textContent = docTitle;
  }

  const viewerArea = document.getElementById("viewer-content-area");
  if (!viewerArea) return;
  viewerArea.textContent = "Cargando documento...";

  fetch("/_api/" + TABLA + "(" + id + ")/" + COLUMNA_ARCHIVO + "/$value", { credentials: "same-origin" })
    .then(function (r) {
      if (!r.ok) throw errorVisor('HTTP', 'código ' + r.status);
      return r.arrayBuffer();
    })
    .then(function (buffer) {
      if (esPDF(buffer)) {
        mostrarPDF(viewerArea, buffer, docTitle);
        return;
      }
      mostrarExcel(viewerArea, buffer, docTitle);
    })
    .catch(function (e) {
      console.error("Error al abrir el documento:", e);
      viewerArea.textContent = mensajeDeError(e);
    });
}

// Al hacer clic en el profesor: si ya tiene un informe, se abre; si no, se muestra el aviso
function loadDocumentInViewer(event, docTitle, docDescription) {
  event.preventDefault();
  event.stopPropagation();

  const fila = event.currentTarget;
  const docs = fila && fila.nextElementSibling;
  if (docs && docs.classList.contains('docs-profesor') && docs.firstElementChild) {
    docs.firstElementChild.click();
    return;
  }

  const badge = document.getElementById("viewer-status-badge");
  if (badge) {
    badge.style.backgroundColor = "#003B70";
    badge.style.color = "#FFFFFF";
    badge.textContent = docTitle;
  }

  const viewerArea = document.getElementById("viewer-content-area");
  if (viewerArea) {
    viewerArea.innerHTML = `
      <div style="width: 100%; text-align: left;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 5px 0; color: #003B70; font-size: 16px; font-weight: 800;">${docTitle}</h4>
          <p style="margin: 0; color: #64748B; font-size: 13px;">${docDescription}</p>
        </div>
        <div style="background: #F1F5F9; border: 2px dashed #CBD5E1; border-radius: 8px; padding: 40px; text-align: center; color: #475569;">
          <i class="fa fa-file-text-o" style="font-size: 40px; color: #003B70; margin-bottom: 10px;"></i>
          <p style="font-weight: 600; margin: 0 0 5px 0;">Aún no hay un informe cargado</p>
          <p style="font-size: 12px; color: #64748B; margin: 0;">Use el botón Agregar para subir el informe de labores (Excel o PDF).</p>
        </div>
      </div>
    `;
  }
}

// Bloqueo de clic derecho en el visor
document.addEventListener('contextmenu', function (e) {
  if (e.target.closest('#viewer-content-area')) {
    e.preventDefault();
  }
});