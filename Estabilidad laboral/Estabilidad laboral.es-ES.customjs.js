// Función para alternar los años de forma independiente en el Objetivo 5.5
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
    // Función auxiliar para quitar tildes y pasar a minúsculas
    function normalizarTexto(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    var urlActual = normalizarTexto(window.location.href);

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Detectamos la sección activa sin importar tildes (puedes usarlo para cualquier sección)
    if (urlActual.includes("consolidacion") || urlActual.includes("gst")) {
        document.getElementById("menu-consolidacion")?.classList.add("active");
    } else if (urlActual.includes("divulgacion")) {
        document.getElementById("menu-divulgacion")?.classList.add("active");
    } else if (urlActual.includes("formacion")) {
        document.getElementById("menu-formacion")?.classList.add("active");
    } else if (urlActual.includes("mantenimiento") || urlActual.includes("renovacion")) {
        document.getElementById("menu-mantenimiento")?.classList.add("active");
    } else if (urlActual.includes("estabilidad")) {
        document.getElementById("menu-estabilidad")?.classList.add("active");
    } else if (urlActual.includes("gestion") || urlActual.includes("administrativa")) {
        document.getElementById("menu-gestion")?.classList.add("active");
    }
    // Si estás en otras secciones como Calidad, Vinculación, etc., puedes agregar sus ifs aquí abajo:
    else if (urlActual.includes("autoevaluacion")) {
        document.getElementById("menu-gst")?.classList.add("active");
    } else if (urlActual.includes("actualizacion") || urlActual.includes("programas")) {
        document.getElementById("menu-actualizacion")?.classList.add("active");
    } else if (urlActual.includes("produccion") || urlActual.includes("academica")) {
        document.getElementById("menu-produccion")?.classList.add("active");
    }
});