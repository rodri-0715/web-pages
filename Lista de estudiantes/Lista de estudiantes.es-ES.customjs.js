/* ==========================================================================
   CONFIGURACIÓN (cambia aquí si tus nombres son distintos)
   ========================================================================== */
const TABLA = "cr5f1_documentoacademicos";     // conjunto de entidades de la tabla nueva (URL de la API)
const CAMPO_ID = "cr5f1_documentoacademicoid";  // columna de identificador de la fila
const COLUMNA_ARCHIVO = "cr5f1_archivopdf";     // columna de tipo Archivo
const CAMPO_SECCION = "cr5f1_seccion";          // columna de texto "Sección"
const SECCION = "ListaEstudiantes";                  // identifica esta subpágina (se guarda como ListaEstudiantes-I o ListaEstudiantes-II)
const ETIQUETA = "Lista de estudiantes";                // texto sugerido al poner el nombre
const MAX_MB = 30;                              // máximo por PDF (la columna también debe permitirlo)

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
   1. AYUDAS PARA ENCONTRAR EL AÑO Y EL SEMESTRE EN LA PÁGINA
   ========================================================================== */
function semestreDeTexto(texto) {
  const m = /(^|\s)(II|I)\s+Semestre/i.exec(texto || "");
  return m ? m[2].toUpperCase() : null;
}

function anioDeTexto(texto) {
  const m = /(20\d{2})/.exec(texto || "");
  return m ? m[1] : null;
}

function encabezadoDe(elemento) {
  return elemento.querySelector('.year-accordion-header, .semester-card-header') || elemento.firstElementChild;
}

// Devuelve el cuerpo del semestre (donde va la lista) para un año y semestre dados
function obtenerCuerpoSemestre(year, sem) {
  const items = document.querySelectorAll('.year-accordion-item');
  for (const item of items) {
    const cabeceraAnio = item.firstElementChild;
    if (!cabeceraAnio || anioDeTexto(cabeceraAnio.textContent) !== String(year)) continue;

    const tarjetas = item.querySelectorAll('.semester-card');
    for (const card of tarjetas) {
      const cab = card.firstElementChild;
      if (cab && semestreDeTexto(cab.textContent) === sem) {
        return card.querySelector('.semester-card-body');
      }
    }
  }
  return null;
}

function obtenerListaSemestre(year, sem) {
  const cuerpo = obtenerCuerpoSemestre(year, sem);
  if (!cuerpo) return null;
  let lista = cuerpo.querySelector('.lista-dataverse');
  if (!lista) {
    lista = document.createElement('div');
    lista.className = 'lista-dataverse';
    lista.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:8px;';
    cuerpo.appendChild(lista);
  }
  return lista;
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
        if (sec.indexOf(SECCION + "-") !== 0) return;                  // solo esta subpágina
        const sem = sec.substring(SECCION.length + 1).toUpperCase();   // "I" o "II"
        const tieneArchivo = fila[COLUMNA_ARCHIVO + "_name"] || fila[COLUMNA_ARCHIVO];
        if (!tieneArchivo) return;                                      // subida incompleta
        renderizarDocEnLista(fila.cr5f1_name, fila.cr5f1_ano, sem, fila[CAMPO_ID], false);
      });
    },
    error: function (xhr) {
      console.error("Error al cargar documentos:", xhr.status, xhr.responseText);
    }
  });
}

function renderizarDocEnLista(docName, year, sem, id, alInicio) {
  const lista = obtenerListaSemestre(year, sem);
  if (!lista) {
    console.warn("No se encontró el lugar para", year, sem);
    return;
  }

  const item = document.createElement('div');
  item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;' +
    'padding:10px 14px;border:1px solid #E2E8F0;border-radius:8px;background:#FFFFFF;' +
    'cursor:pointer;font-size:14px;font-weight:600;color:#1E293B;';
  item.onclick = function (e) {
    e.stopPropagation();           // evita que se cierre el semestre al hacer clic
    loadDataverseViewer(id, docName);
  };

  const left = document.createElement('div');
  left.style.cssText = 'display:flex;align-items:center;gap:10px;';
  left.innerHTML = '<i class="fa fa-file-pdf-o" style="color:#E11D48;font-size:16px;"></i>';
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
function addRecord(event, targetPeriod) {
  event.stopPropagation(); // evita abrir/cerrar el semestre al presionar Agregar
  const btn = event.currentTarget;

  // Año y semestre se leen de la propia página (con respaldo en el texto recibido)
  const item = btn.closest('.year-accordion-item');
  const card = btn.closest('.semester-card');
  const year = (item && anioDeTexto(item.firstElementChild.textContent)) || anioDeTexto(targetPeriod);
  const sem = (card && semestreDeTexto(card.firstElementChild.textContent)) || semestreDeTexto(targetPeriod);

  if (!year || !sem) {
    alert("No se pudo identificar el año o el semestre. Avise al administrador.");
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

    const sugerido = ETIQUETA + " " + sem + " Semestre " + year;
    const docName = (prompt("Nombre del documento:", sugerido) || "").trim();
    if (!docName) return;

    guardarDocumento(year, sem, docName, file, btn);
  };

  input.click();
}

function guardarDocumento(year, sem, docName, file, btn) {
  if (btn) btn.disabled = true;
  const terminar = function () { if (btn) btn.disabled = false; };

  const cuerpo = {
    "cr5f1_name": docName,
    "cr5f1_ano": parseInt(year, 10)
  };
  cuerpo[CAMPO_SECCION] = SECCION + "-" + sem;

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
          renderizarDocEnLista(docName, year, sem, id, true);
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
          <i class="fa fa-users" style="font-size: 40px; color: #003B70; margin-bottom: 10px;"></i>
          <p style="font-weight: 600; margin: 0 0 5px 0;">Vista previa de la Lista de Estudiantes</p>
          <p style="font-size: 12px; color: #64748B; margin: 0;">(Documento protegido oficial)</p>
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