// ==========================================================================
// AGENDAS DEL CONSEJO - Power Pages + Dataverse
// Todo el código va dentro de una función autoejecutable (IIFE) para que:
//  - las constantes siempre estén inicializadas antes de usarse
//  - no choque con otra copia del script que exista en la página
// ==========================================================================
(function () {
  "use strict";

  // ========================================================================
  // CONFIGURACIÓN DE DATAVERSE (verifique estos 3 valores)
  // ========================================================================
  const TABLA_AGENDAS = "cr5f1_agendases";         // Conjunto de entidades (nombre en la URL /_api/)
  const COLUMNA_ARCHIVO_AGENDA = "cr5f1_archivopdf";  // Nombre lógico de la columna de tipo Archivo
  const CLAVE_PRIMARIA = "cr5f1_agendasid";        // <nombre lógico de la tabla> + "id"
  const MAX_MB = 20;                               // Tamaño máximo del PDF

  // ========================================================================
  // 0. AJAX SEGURO CON TOKEN DE POWER PAGES
  // ========================================================================
  function safeAjax(ajaxOptions) {
    const $ = window.jQuery;
    if (!$ || !window.shell || !window.shell.getTokenDeferred) {
      console.error("jQuery o shell de Power Pages no están disponibles.");
      if (typeof ajaxOptions.error === "function") {
        ajaxOptions.error({ status: 0, responseText: "jQuery/shell no disponibles" });
      }
      return;
    }

    const deferred = $.Deferred();
    window.shell.getTokenDeferred().done(function (token) {
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

  // Se conserva por compatibilidad con otros scripts de la página
  window.webapi = window.webapi || {};
  window.webapi.safeAjax = safeAjax;

  // ========================================================================
  // 1. CARGA AUTOMÁTICA DE AGENDAS GUARDADAS
  // ========================================================================
  function cargarAgendasDesdeDataverse() {
    safeAjax({
      type: "GET",
      url: "/_api/" + TABLA_AGENDAS + "?$select=cr5f1_name,cr5f1_ano&$orderby=cr5f1_name asc",
      contentType: "application/json",
      success: function (data) {
        (data.value || []).forEach(function (agenda) {
          const id = agenda[CLAVE_PRIMARIA];
          const nombre = agenda.cr5f1_name;
          const ano = agenda.cr5f1_ano;
          if (id && nombre && ano) {
            renderizarAgendaEnLista(nombre, ano, id);
          }
        });
      },
      error: function (xhr) {
        console.error("Error al cargar agendas:", xhr.status, xhr.responseText);
      }
    });
  }

  function renderizarAgendaEnLista(agendaName, year, id) {
    const listContainer = document.getElementById("list-" + year);
    if (!listContainer) {
      console.warn("No existe el contenedor list-" + year + " para la agenda " + agendaName);
      return;
    }

    const item = document.createElement("div");
    item.className = "doc-item-link";
    item.onclick = function () { loadAgendaDataverseViewer(id, agendaName); };

    const left = document.createElement("div");
    left.style.cssText = "display:flex;align-items:center;gap:10px;";
    left.innerHTML = '<i class="fa fa-file-pdf-o" style="color: #E11D48; font-size: 16px;"></i>';
    const label = document.createElement("span");
    label.textContent = agendaName;
    left.appendChild(label);

    const eye = document.createElement("i");
    eye.className = "fa fa-eye";
    eye.style.cssText = "color: #64748B; font-size: 12px;";

    item.appendChild(left);
    item.appendChild(eye);
    listContainer.appendChild(item);
  }

  // ========================================================================
  // 2. ADICIÓN DE NUEVA AGENDA (CREAR REGISTRO Y SUBIR PDF)
  // ========================================================================
  function promptAddAgenda(year, event) {
    if (event) event.stopPropagation();
    const btn = event && event.currentTarget;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,.pdf";

    input.onchange = function () {
      const file = input.files && input.files[0];
      if (!file) return;

      if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
        alert("Solo se permiten archivos PDF.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        alert("El archivo supera el máximo de " + MAX_MB + " MB.");
        return;
      }

      const sugerido = file.name.replace(/\.pdf$/i, "");
      const agendaName = (prompt("Identificador de la agenda (Ej: AG-01-" + year + "):", sugerido) || "").trim();
      if (!agendaName) return;

      guardarAgenda(year, agendaName, file, btn);
    };

    input.click();
  }

  function guardarAgenda(year, agendaName, file, btn) {
    if (btn) btn.disabled = true;
    const terminar = function () { if (btn) btn.disabled = false; };

    safeAjax({
      type: "POST",
      url: "/_api/" + TABLA_AGENDAS,
      contentType: "application/json",
      data: JSON.stringify({
        "cr5f1_name": agendaName,
        "cr5f1_ano": parseInt(year, 10)
      }),
      success: function (data, status, xhr) {
        const id = obtenerIdCreado(xhr);
        if (!id) {
          terminar();
          alert("La agenda se creó pero no se pudo obtener su identificador.");
          return;
        }
        subirArchivoAgenda(id, agendaName, file, function (ok) {
          terminar();
          if (ok) {
            renderizarAgendaEnLista(agendaName, year, id);
            alert("¡Agenda guardada con éxito!");
          } else {
            // Evita dejar un registro sin PDF
            borrarAgenda(id);
            alert("No se pudo subir el PDF, la agenda no se guardó. Intente de nuevo.");
          }
        });
      },
      error: function (xhr) {
        terminar();
        console.error("Error al crear la agenda:", xhr.status, xhr.responseText);
        alert("No se pudo guardar (código " + xhr.status + ").");
      }
    });
  }

  function obtenerIdCreado(xhr) {
    const id = xhr.getResponseHeader("entityid");
    if (id) return id.replace(/[{}]/g, "");
    const uri = xhr.getResponseHeader("OData-EntityId") || "";
    const m = uri.match(/\(([0-9a-fA-F-]{36})\)/);
    return m ? m[1] : null;
  }

  function subirArchivoAgenda(id, agendaName, file, done) {
    const nombreSeguro = agendaName.replace(/[^\w.-]+/g, "_") + ".pdf";

    file.arrayBuffer().then(function (buffer) {
      safeAjax({
        type: "PUT",
        url: "/_api/" + TABLA_AGENDAS + "(" + id + ")/" + COLUMNA_ARCHIVO_AGENDA,
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

  function borrarAgenda(id) {
    safeAjax({
      type: "DELETE",
      url: "/_api/" + TABLA_AGENDAS + "(" + id + ")",
      error: function (xhr) {
        console.warn("No se pudo eliminar el registro incompleto:", xhr.status, xhr.responseText);
      }
    });
  }

  // ========================================================================
  // 3. CONTROL DE ACORDEONES Y VISOR
  // ========================================================================
  function toggleAccordion(contentId, iconId) {
    const content = document.getElementById(contentId);
    const iconBtn = document.getElementById(iconId);
    if (!content || !iconBtn) return;

    const isVisible = content.style.display === "block" || content.classList.contains("show");
    if (isVisible) {
      content.style.display = "none";
      content.classList.remove("show");
      iconBtn.style.transform = "rotate(0deg)";
    } else {
      content.style.display = "block";
      content.classList.add("show");
      iconBtn.style.transform = "rotate(180deg)";
    }
  }

  let urlBlobActualAgenda = null;

  function loadAgendaDataverseViewer(id, docName) {
    const container = document.getElementById("secure-viewer-container");
    const badge = document.getElementById("doc-title-badge");
    if (!container || !badge) return;

    badge.textContent = docName;
    container.textContent = "Cargando documento...";

    fetch("/_api/" + TABLA_AGENDAS + "(" + id + ")/" + COLUMNA_ARCHIVO_AGENDA + "/$value", { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then(function (blob) {
        if (urlBlobActualAgenda) URL.revokeObjectURL(urlBlobActualAgenda);
        urlBlobActualAgenda = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));

        const iframe = document.createElement("iframe");
        iframe.src = urlBlobActualAgenda + "#toolbar=0&navpanes=0&scrollbar=0";
        iframe.style.cssText = "width:100%;height:100%;border:none;";

        container.innerHTML = "";
        container.appendChild(iframe);
      })
      .catch(function (e) {
        console.error("Error al abrir el PDF:", e);
        container.textContent = "No se pudo abrir el documento.";
      });
  }

  document.addEventListener("contextmenu", function (e) {
    if (e.target.closest("#secure-viewer-container")) {
      e.preventDefault();
    }
  });

  // ========================================================================
  // 4. INICIO
  // ========================================================================
  // Los onclick del HTML necesitan estas funciones en el ámbito global
  window.promptAddAgenda = promptAddAgenda;
  window.toggleAccordion = toggleAccordion;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarAgendasDesdeDataverse);
  } else {
    cargarAgendasDesdeDataverse();
  }
})(); 