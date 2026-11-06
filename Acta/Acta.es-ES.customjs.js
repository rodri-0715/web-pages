// ==========================================================================
// CONFIGURACIÓN (cambia aquí si tus nombres son distintos)
// ==========================================================================
const TABLA = "cr5f1_actadeescuelas";          // nombre del conjunto de entidades (URL de la API)
const COLUMNA_ARCHIVO = "cr5f1_archivopdf";     // nombre lógico de la columna de tipo Archivo
const MAX_MB = 20;                              // tamaño máximo permitido por PDF
const SECCION = "actas2";                        // identifica a qué página pertenecen las actas
const INCLUIR_SIN_SECCION = false;              // true: muestra también las actas antiguas sin sección

function filtroSeccion() {
  let f = "cr5f1_seccion eq '" + SECCION + "'";
  if (INCLUIR_SIN_SECCION) f += " or cr5f1_seccion eq null";
  return f;
}

// ==========================================================================
// 0. AJAX SEGURO CON TOKEN PARA POWER PAGES
// ==========================================================================
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

// ==========================================================================
// 1. CARGA DE ACTAS GUARDADAS (se ejecuta al abrir la página)
// ==========================================================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarActasDesdeDataverse);
} else {
  cargarActasDesdeDataverse();
}

function cargarActasDesdeDataverse() {
  webapi.safeAjax({
    type: "GET",
    url: "/_api/" + TABLA + "?$filter=" + encodeURIComponent(filtroSeccion()),
    contentType: "application/json",
    success: function (data) {
      (data.value || []).forEach(function (acta) {
        const id = acta.cr5f1_actadeescuelaid;
        const nombre = acta.cr5f1_nombredelacta || acta.cr5f1_name;
        const tieneArchivo = acta[COLUMNA_ARCHIVO + "_name"] || acta[COLUMNA_ARCHIVO];

        if (tieneArchivo) {
          renderizarActaEnLista(nombre, acta.cr5f1_ano, { id: id });
        } else if (acta.cr5f1_enlacededrive) {
          // Actas antiguas guardadas con enlace de Drive
          renderizarActaEnLista(nombre, acta.cr5f1_ano, { drive: acta.cr5f1_enlacededrive });
        }
        // Filas sin archivo ni enlace (subida incompleta) no se muestran
      });
    },
    error: function (xhr) {
      console.error("Error al cargar actas:", xhr.status, xhr.responseText);
    }
  });
}

function renderizarActaEnLista(actaName, year, origen) {
  const listContainer = document.getElementById('list-' + year);
  if (!listContainer) return;

  const item = document.createElement('div');
  item.className = 'doc-item-link';
  item.onclick = function () {
    if (origen.id) loadDataverseViewer(origen.id, actaName);
    else loadSecureViewer(origen.drive, actaName);
  };

  const left = document.createElement('div');
  left.style.cssText = 'display:flex;align-items:center;gap:10px;';
  left.innerHTML = '<i class="fa fa-file-pdf-o" style="color:#E11D48;font-size:16px;"></i>';
  const label = document.createElement('span');
  label.textContent = actaName; // textContent evita inyección de HTML
  left.appendChild(label);

  const eye = document.createElement('i');
  eye.className = 'fa fa-eye';
  eye.style.cssText = 'color:#64748B;font-size:12px;';

  item.appendChild(left);
  item.appendChild(eye);
  listContainer.appendChild(item);
}

// ==========================================================================
// 2. AGREGAR UN ACTA: elegir PDF -> nombre -> crear fila -> subir archivo
// ==========================================================================
function promptAddActa(year, event) {
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

    const sugerido = file.name.replace(/\.pdf$/i, "");
    const actaName = (prompt("Identificador del acta (Ej: ICSSC-04-" + year + "):", sugerido) || "").trim();
    if (!actaName) return;

    guardarActa(year, actaName, file, btn);
  };

  input.click();
}

function guardarActa(year, actaName, file, btn) {
  if (btn) btn.disabled = true;
  const terminar = function () { if (btn) btn.disabled = false; };

  // Paso 1: crear la fila del acta
  webapi.safeAjax({
    type: "POST",
    url: "/_api/" + TABLA,
    contentType: "application/json",
    data: JSON.stringify({
      "cr5f1_name": actaName,
      "cr5f1_nombredelacta": actaName,
      "cr5f1_ano": parseInt(year, 10),
      "cr5f1_seccion": SECCION
    }),
    success: function (data, status, xhr) {
      const id = obtenerIdCreado(xhr);
      if (!id) {
        terminar();
        alert("El acta se creó pero no se pudo obtener su identificador. Avise al administrador.");
        return;
      }
      // Paso 2: subir el PDF a la columna de archivo
      subirArchivo(id, actaName, file, function (ok) {
        terminar();
        if (ok) {
          renderizarActaEnLista(actaName, year, { id: id });
          alert("¡Acta guardada con éxito!");
        } else {
          alert("Se creó el acta pero falló la subida del PDF. Inténtelo de nuevo o avise al administrador.");
        }
      });
    },
    error: function (xhr) {
      terminar();
      console.error("Error al crear el acta:", xhr.status, xhr.responseText);
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

function subirArchivo(id, actaName, file, done) {
  const nombreSeguro = actaName.replace(/[^\w.-]+/g, "_") + ".pdf";

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

// ==========================================================================
// 3. ACORDEONES Y VISORES
// ==========================================================================
function toggleAccordion(contentId, iconId) {
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
  const container = document.getElementById('secure-viewer-container');
  const badge = document.getElementById('doc-title-badge');
  if (!container || !badge) return;

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

// Visor para actas antiguas con enlace de Google Drive
function loadSecureViewer(pdfUrl, docName) {
  const container = document.getElementById('secure-viewer-container');
  const badge = document.getElementById('doc-title-badge');
  if (!container || !badge) return;

  badge.textContent = docName;

  const m = String(pdfUrl).match(/^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) {
    container.textContent = "Enlace no válido.";
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = "https://drive.google.com/file/d/" + m[1] + "/preview";
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.allow = 'autoplay';

  container.innerHTML = '';
  container.appendChild(iframe);
}

document.addEventListener('contextmenu', function (e) {
  if (e.target.closest('#secure-viewer-container')) {
    e.preventDefault();
  }
});