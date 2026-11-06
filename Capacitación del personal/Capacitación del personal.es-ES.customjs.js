/* =========================================================
   CONTROLADOR DE PESTAÑAS (AÑOS Y ÁREAS)
   ========================================================= */

// Función para alternar entre los Años (2025 - 2030)
function openYear(evt, yearId) {
  const yearSections = document.getElementsByClassName("year-content-section");
  for (let i = 0; i < yearSections.length; i++) {
    yearSections[i].classList.remove("active");
  }

  const yearButtons = document.getElementsByClassName("year-tab-btn");
  for (let i = 0; i < yearButtons.length; i++) {
    yearButtons[i].classList.remove("active");
  }

  const targetYear = document.getElementById(yearId);
  if (targetYear) {
    targetYear.classList.add("active");
  }
  evt.currentTarget.classList.add("active");
}

// Función para alternar entre las Áreas dentro de cada año específico
function openArea(evt, areaId, groupClass) {
  const areaContents = document.getElementsByClassName(groupClass);
  for (let i = 0; i < areaContents.length; i++) {
    areaContents[i].classList.remove("active");
  }

  const parentTabsContainer = evt.currentTarget.parentElement;
  const tabButtons = parentTabsContainer.getElementsByClassName("tab-btn");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove("active");
  }

  const targetArea = document.getElementById(areaId);
  if (targetArea) {
    targetArea.classList.add("active");
  }
  evt.currentTarget.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    var urlActual = window.location.href.toLowerCase();

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Detectamos la sección activa según la URL
    if (urlActual.includes("capacitacion") || urlActual.includes("capacitaci")) {
        document.getElementById("menu-capacitacion").classList.add("active");
    } else if (urlActual.includes("enfasis")) {
        document.getElementById("menu-enfasis").classList.add("active");
    } else if (urlActual.includes("tipos")) {
        document.getElementById("menu-tipos").classList.add("active");
    } else if (urlActual.includes("/fui/")) {
        document.getElementById("menu-fui").classList.add("active");
    } else if (urlActual.includes("crnyo")) {
        document.getElementById("menu-crnyo").classList.add("active");
    } else if (urlActual.includes("integracion")) {
        document.getElementById("menu-integracion").classList.add("active");
    }
});
