// Función para cambiar de año de forma aislada en el Objetivo 4.2
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

document.addEventListener("DOMContentLoaded", function() {
    var urlActual = window.location.href.toLowerCase();

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Detectamos la sección activa de Vinculación según la URL
    if (urlActual.includes("nuevas") || urlActual.includes("vinculaciones")) {
        document.getElementById("menu-nuevas")?.classList.add("active");
    } else if (urlActual.includes("colaborativo") || urlActual.includes("colavorativo") || urlActual.includes("ctusc")) {
        document.getElementById("menu-colaborativo")?.classList.add("active");
    } else if (urlActual.includes("sectores") || urlActual.includes("sociales")) {
        document.getElementById("menu-sectores")?.classList.add("active");
    }
});