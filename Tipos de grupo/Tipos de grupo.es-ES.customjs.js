/* =========================================================
   CONTROLADORES DE PESTAÑAS (AÑOS Y ÁREAS)
   ========================================================= */

function openYear(evt, yearID) {
  // 1. Ocultar todos los bloques de años
  var yearContents = document.getElementsByClassName("year-content");
  for (var i = 0; i < yearContents.length; i++) {
    yearContents[i].classList.remove("active");
  }

  // 2. Remover la clase activa de los botones de años
  var yearBtns = document.getElementsByClassName("year-btn");
  for (var i = 0; i < yearBtns.length; i++) {
    yearBtns[i].classList.remove("active");
  }

  // 3. Mostrar el año seleccionado y activar su botón
  document.getElementById(yearID).classList.add("active");
  evt.currentTarget.classList.add("active");
}

function openArea(evt, areaName) {
  // Obtener el contenedor del año actual que está visible
  var activeYearContainer = document.querySelector(".year-content.active");
  
  if (!activeYearContainer) return;

  // 1. Ocultar solo las pestañas internas de ese año
  var tabcontent = activeYearContainer.getElementsByClassName("tab-content");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove("active");
  }

  // 2. Quitar el estado activo de los botones de áreas dentro de ese año
  var tablinks = activeYearContainer.getElementsByClassName("tab-btn");
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  // 3. Mostrar la tabla seleccionada y marcar el botón como activo
  var selectedTab = activeYearContainer.querySelector("#" + areaName);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  evt.currentTarget.classList.add("active");
}
document.addEventListener("DOMContentLoaded", function() {
    var urlActual = window.location.href.toLowerCase();

    // Limpiamos cualquier activo previo
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Verificamos en qué URL estamos y activamos el botón correspondiente
    if (urlActual.includes("capacitacion")) {
        document.getElementById("menu-capacitacion").classList.add("active");
    } else if (urlActual.includes("enfasis")) {
        document.getElementById("menu-enfasis").classList.add("active");
    } else if (urlActual.includes("tipos-de-grupo") || urlActual.includes("tipos")) {
        document.getElementById("menu-tipos").classList.add("active");
    } else if (urlActual.includes("/fui/")) {
        document.getElementById("menu-fui").classList.add("active");
    } else if (urlActual.includes("crnyo")) {
        document.getElementById("menu-crnyo").classList.add("active");
    } else if (urlActual.includes("integracion")) {
        document.getElementById("menu-integracion").classList.add("active");
    }
});