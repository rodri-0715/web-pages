// Función para cambiar de año en el Objetivo 3.2
function openYear(evt, yearId) {
    // Ocultar todos los contenidos de los años del objetivo 2
    var yearContents = document.querySelectorAll('.objective-container .year-content');
    for (var i = 0; i < yearContents.length; i++) {
        yearContents[i].classList.remove("active");
    }

    // Desactivar todos los botones del selector del objetivo 2
    var yearBtns = document.querySelectorAll('.objective-container .year-btn');
    for (var i = 0; i < yearBtns.length; i++) {
        yearBtns[i].classList.remove("active");
    }

    // Mostrar el contenedor del año seleccionado y activar su botón
    var targetYear = document.getElementById(yearId);
    if (targetYear) {
        targetYear.classList.add("active");
    }
    evt.currentTarget.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    var urlActual = window.location.href.toLowerCase();

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Detectamos la sección activa de Investigación y Extensión según la URL
    if (urlActual.includes("investigacion-eics") || (urlActual.includes("investigacion") && !urlActual.includes("estudiantil"))) {
        document.getElementById("menu-inv-eics")?.classList.add("active");
    } else if (urlActual.includes("estudiantil")) {
        document.getElementById("menu-inv-estudiantil")?.classList.add("active");
    } else if (urlActual.includes("productos") || urlActual.includes("investigacion")) {
        document.getElementById("menu-productos")?.classList.add("active");
    }
});