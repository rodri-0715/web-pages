/* ==========================================================================
   CONFIGURACIÓN (cambia aquí si tus nombres son distintos)
   ========================================================================== */
const TABLA = "cr5f1_documentoacademicos";          // conjunto de entidades de la tabla "Documento Academico"
const CAMPO_ID = "cr5f1_documentoacademicoid";       // columna de identificador de la fila
const COLUMNA_ARCHIVO = "cr5f1_archivopdf";          // columna de tipo Archivo
const CAMPO_SECCION = "cr5f1_seccion";               // columna de texto "Seccion"
const CAMPO_PROFESOR = "cr5f1_profesor";             // columna de texto "Profesor"
const SECCION = "PlanTrabajo";                       // se guarda como PlanTrabajo-I o PlanTrabajo-II
const MAX_MB = 30;                                   // máximo por PDF (la columna también debe permitirlo)

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
        if (sec.indexOf(SECCION + "-") !== 0) return;                  // solo planes de trabajo
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
  left.innerHTML = '<i class="fa fa-file-pdf-o" style="color:#E11D48;font-size:15px;"></i>';
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
   3. AGREGAR UN DOCUMENTO: elegir PDF -> nombre -> crear fila -> subir archivo
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
  input.accept = 'application/pdf,.pdf';

  input.onchange = function () {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
      alert("Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert("El archivo supera el máximo de " + MAX_MB + " MB.");
      return;
    }

    const sugerido = "Plan de trabajo " + sem + " Semestre " + year + " - " + profesor;
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
      // Paso 2: subir el PDF
      subirArchivo(id, docName, file, function (ok) {
        terminar();
        if (ok) {
          renderizarDoc(docName, year, sem, profesor, id, true);
          alert("¡Documento guardado con éxito!");
        } else {
          alert("Se creó el registro pero falló la subida del PDF. Inténtelo de nuevo o avise al administrador.");
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
  const nombreSeguro = docName.replace(/[^\w.-]+/g, "_") + ".pdf";

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
        console.error("Error al subir el PDF:", xhr.status, xhr.responseText);
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
   5. VISORES
   ========================================================================== */
let urlBlobActual = null;

// Visor para PDFs guardados en Dataverse
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
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.blob();
    })
    .then(function (blob) {
      if (urlBlobActual) URL.revokeObjectURL(urlBlobActual);
      urlBlobActual = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));

      const iframe = document.createElement('iframe');
      iframe.src = urlBlobActual + "#toolbar=0&navpanes=0&scrollbar=0";
      iframe.style.cssText = 'width:100%;height:70vh;min-height:520px;border:none;';

      viewerArea.innerHTML = '';
      viewerArea.appendChild(iframe);
    })
    .catch(function (e) {
      console.error("Error al abrir el PDF:", e);
      viewerArea.textContent = "No se pudo abrir el documento.";
    });
}

// Visor para los elementos que ya estaban escritos en el HTML (se deja igual que antes)
function loadDocumentInViewer(event, docTitle, docDescription) {
  event.preventDefault();
  event.stopPropagation();

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
          <i class="fa fa-file-pdf-o" style="font-size: 40px; color: #003B70; margin-bottom: 10px;"></i>
          <p style="font-weight: 600; margin: 0 0 5px 0;">Vista previa del documento oficial</p>
          <p style="font-size: 12px; color: #64748B; margin: 0;">(Registro protegido del funcionario)</p>
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