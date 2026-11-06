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