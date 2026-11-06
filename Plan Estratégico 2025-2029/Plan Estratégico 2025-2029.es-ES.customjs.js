/* ==========================================================================
   CONFIGURACIÓN (cambia aquí si tus nombres son distintos)
   ========================================================================== */
const TABLA = "cr5f1_actadeescuelas";          // conjunto de entidades (URL de la API)
const COLUMNA_ARCHIVO = "cr5f1_archivopdf";     // columna de tipo Archivo
const CAMPO_SECCION = "cr5f1_seccion";          // columna de texto "Sección"
const SECCION = "PlanEstrategico";              // valor que identifica esta subpágina
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
   1. CARGA DE INFORMES GUARDADOS (se ejecuta al abrir la página)
   ========================================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarInformesDesdeDataverse);
} else {
  cargarInformesDesdeDataverse();
}

function cargarInformesDesdeDataverse() {
  webapi.safeAjax({
    type: "GET",
    url: "/_api/" + TABLA,
    contentType: "application/json",
    success: function (data) {
      (data.value || []).forEach(function (fila) {
        if (fila[CAMPO_SECCION] !== SECCION) return;                 // solo esta subpágina
        const tieneArchivo = fila[COLUMNA_ARCHIVO + "_name"] || fila[COLUMNA_ARCHIVO];
        if (!tieneArchivo) return;                                    // subida incompleta
        renderizarDocEnLista(fila.cr5f1_nombredelacta || fila.cr5f1_name, fila.cr5f1_ano, fila.cr5f1_actadeescuelaid, false);
      });
    },
    error: function (xhr) {
      console.error("Error al cargar informes:", xhr.status, xhr.responseText);
    }
  });
}

function renderizarDocEnLista(docName, year, id, alInicio) {
  const listContainer = document.getElementById('list-' + year);
  if (!listContainer) return;

  const item = document.createElement('div');
  item.className = 'doc-item-link';
  item.onclick = function () { loadDataverseViewer(id, docName); };

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

  if (alInicio) listContainer.insertBefore(item, listContainer.firstChild);
  else listContainer.appendChild(item);
}

/* ==========================================================================
   2. AGREGAR UN INFORME: elegir PDF -> nombre -> crear fila -> subir archivo
   ========================================================================== */
function promptAddStrategicDoc(year, event) {
  if (event) event.stopPropagation();
  const btn = event && event.currentTarget;

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

    const sugerido = "Informe Anual " + year;
    const docName = (prompt("Nombre del documento (Ej: Informe Anual " + year + "):", sugerido) || "").trim();
    if (!docName) return;

    guardarInforme(year, docName, file, btn);
  };

  input.click();
}

function guardarInforme(year, docName, file, btn) {
  if (btn) btn.disabled = true;
  const terminar = function () { if (btn) btn.disabled = false; };

  const cuerpo = {
    "cr5f1_name": docName,
    "cr5f1_nombredelacta": docName,
    "cr5f1_ano": parseInt(year, 10)
  };
  cuerpo[CAMPO_SECCION] = SECCION;

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
          renderizarDocEnLista(docName, year, id, true);
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
   3. ACORDEONES Y VISORES
   ========================================================================== */
function toggleStrategicAccordion(contentId, iconId) {
  const content = document.getElementById(contentId);
  const iconBtn = document.getElementById(iconId);
  if (!content || !iconBtn) return;

  const isVisible = content.style.display === 'block' || content.classList.contains('show');
  if (isVisible) {
    content.style.display = 'none';
    content.classList.remove('show');
    iconBtn.style.transform = 'rotate(0deg)';
  } else {
    content.style.display = 'block';
    content.classList.add('show');
    iconBtn.style.transform = 'rotate(180deg)';
  }
}

let urlBlobActual = null;

// Visor para PDFs guardados en Dataverse
function loadDataverseViewer(id, docName) {
  const wrapperCard = document.getElementById('viewer-wrapper-card');
  const container = document.getElementById('secure-viewer-container');
  const badge = document.getElementById('doc-title-badge');
  if (!wrapperCard || !container || !badge) return;

  wrapperCard.style.display = 'block';
  badge.textContent = docName;
  container.textContent = "Cargando documento...";

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
      iframe.style.cssText = 'width:100%;height:100%;border:none;';

      container.innerHTML = '';
      container.appendChild(iframe);
    })
    .catch(function (e) {
      console.error("Error al abrir el PDF:", e);
      container.textContent = "No se pudo abrir el documento.";
    });
}

// Visor para los documentos que ya estaban escritos en el HTML (se deja igual que antes)
function loadSecureViewer(pdfUrl, docName) {
  const wrapperCard = document.getElementById('viewer-wrapper-card');
  const container = document.getElementById('secure-viewer-container');
  const badge = document.getElementById('doc-title-badge');

  if (!wrapperCard || !container || !badge) return;

  wrapperCard.style.display = 'block';
  badge.textContent = docName;

  let finalUrl = pdfUrl;

  if (pdfUrl.includes('drive.google.com')) {
    if (pdfUrl.includes('/file/d/')) {
      const fileIdMatch = pdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        finalUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
  }

  const secureUrl = finalUrl.includes('preview') ? finalUrl : finalUrl + "#toolbar=0&navpanes=0&scrollbar=0";

  container.innerHTML = `
    <iframe src="${secureUrl}" style="width: 100%; height: 100%; border: none;" allow="autoplay" oncontextmenu="return false;"></iframe>
  `;
}

// Bloqueo de clic derecho en el visor
document.addEventListener('contextmenu', function (e) {
  if (e.target.closest('#secure-viewer-container')) {
    e.preventDefault();
  }
});