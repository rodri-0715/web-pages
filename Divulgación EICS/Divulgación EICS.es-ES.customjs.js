document.addEventListener("DOMContentLoaded", function() {
    // 1. Obtenemos la URL traducida y la normalizamos quitando acentos y convirtiendo a minúsculas
    var urlActual = decodeURIComponent(window.location.href)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // 2. Limpiamos clases activas previas
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // 3. Verificación flexible sin importar acentos
    if (urlActual.includes("consolidacion") || urlActual.includes("gst")) {
        document.getElementById("menu-consolidacion")?.classList.add("active");
    } 
    else if (urlActual.includes("divulgacion")) {
        document.getElementById("menu-divulgacion")?.classList.add("active");
    } 
    else if (urlActual.includes("formacion")) {
        document.getElementById("menu-formacion")?.classList.add("active");
    } 
    else if (urlActual.includes("mantenimiento") || urlActual.includes("mantenimineto") || urlActual.includes("renovacion")) {
        document.getElementById("menu-mantenimiento")?.classList.add("active");
    } 
    else if (urlActual.includes("estabilidad") || urlActual.includes("laboral")) {
        document.getElementById("menu-estabilidad")?.classList.add("active");
    } 
    else if (urlActual.includes("gestion") || urlActual.includes("administrativa")) {
        document.getElementById("menu-gestion")?.classList.add("active");
    }
    else if (urlActual.includes("productos")) {
        document.getElementById("menu-productos")?.classList.add("active");
    }
    else if (urlActual.includes("estudiantil")) {
        document.getElementById("menu-inv-estudiantil")?.classList.add("active");
    }
    else if (urlActual.includes("investigacion")) {
        document.getElementById("menu-inv-eics")?.classList.add("active");
    }
});

function openYear(evt, yearId) {
    var yearContents = document.querySelectorAll('.objective-container .year-content');
    for (var i = 0; i < yearContents.length; i++) {
        yearContents[i].classList.remove("active");
    }

    var yearBtns = document.querySelectorAll('.objective-container .year-btn');
    for (var i = 0; i < yearBtns.length; i++) {
        yearBtns[i].classList.remove("active");
    }

    var targetYear = document.getElementById(yearId);
    if (targetYear) {
        targetYear.classList.add("active");
    }
    evt.currentTarget.classList.add("active");
}

   function togglePlanDesc(elementId) {
      const target = document.getElementById(elementId);
      if (!target) return;

      const isOpen = target.style.display === 'block';

      // Cierra todos los paneles de la página para no saturar la vista
      document.querySelectorAll('.plan-toggle-box').forEach(box => {
        box.style.display = 'none';
      });

      // Muestra el panel seleccionado si no estaba abierto
      if (!isOpen) {
        target.style.display = 'block';
      }
    }
