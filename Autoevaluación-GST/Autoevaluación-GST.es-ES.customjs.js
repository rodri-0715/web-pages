function openYear(evt, yearId) {
    // Ocultar todos los contenedores de años
    var yearContents = document.getElementsByClassName("year-content");
    for (var i = 0; i < yearContents.length; i++) {
        yearContents[i].classList.remove("active");
    }

    // Quitar la clase 'active' de todos los botones de años
    var yearBtns = document.getElementsByClassName("year-btn");
    for (var i = 0; i < yearBtns.length; i++) {
        yearBtns[i].classList.remove("active");
    }

    // Mostrar el año seleccionado y marcar el botón como activo
    document.getElementById(yearId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    var urlActual = window.location.href.toLowerCase();

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Detectamos la sección activa de Calidad según la URL
    if (urlActual.includes("autoevaluacion") || urlActual.includes("gst")) {
        document.getElementById("menu-gst")?.classList.add("active");
    } else if (urlActual.includes("actualizacion")) {
        document.getElementById("menu-actualizacion")?.classList.add("active");
    } else if (urlActual.includes("produccion") || urlActual.includes("academica")) {
        document.getElementById("menu-produccion")?.classList.add("active");
    }
});