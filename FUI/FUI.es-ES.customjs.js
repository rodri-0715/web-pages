/* =========================================================
   CONTROLADORES DE PESTAÑAS (AÑOS Y ÁREAS - FUI)
   ========================================================= */

function openYear(evt, yearID) {
  var yearContents = document.getElementsByClassName("year-content");
  for (var i = 0; i < yearContents.length; i++) {
    yearContents[i].classList.remove("active");
  }

  var yearBtns = document.getElementsByClassName("year-btn");
  for (var i = 0; i < yearBtns.length; i++) {
    yearBtns[i].classList.remove("active");
  }

  document.getElementById(yearID).classList.add("active");
  evt.currentTarget.classList.add("active");
}

function openArea(evt, areaName) {
  var activeYearContainer = document.querySelector(".year-content.active");
  
  if (!activeYearContainer) return;

  var tabcontent = activeYearContainer.getElementsByClassName("tab-content");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove("active");
  }

  var tablinks = activeYearContainer.getElementsByClassName("tab-btn");
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  var selectedTab = activeYearContainer.querySelector("#" + areaName);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  evt.currentTarget.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    var urlActual = window.location.href.toLowerCase();

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Detectamos la sección activa con mayor precisión
    if (urlActual.includes("capacitacion")) {
        document.getElementById("menu-capacitacion").classList.add("active");
    } else if (urlActual.includes("enfasis")) {
        document.getElementById("menu-enfasis").classList.add("active");
    } else if (urlActual.includes("tipos")) {
        document.getElementById("menu-tipos").classList.add("active");
    } else if (urlActual.includes("fui")) {
        document.getElementById("menu-fui").classList.add("active");
    } else if (urlActual.includes("crnyo")) {
        document.getElementById("menu-crnyo").classList.add("active");
    } else if (urlActual.includes("integracion")) {
        document.getElementById("menu-integracion").classList.add("active");
    }
});
