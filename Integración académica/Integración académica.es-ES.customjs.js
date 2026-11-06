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
    // Decodificamos la URL para que lea las tildes correctamente (ej. 'capacitación')
    var urlActual = decodeURIComponent(window.location.href.toLowerCase());

    // Limpiamos cualquier activo previo
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Verificamos en qué URL estamos permitiendo tildes
    if (urlActual.includes("capacitacion") || urlActual.includes("capacitación")) {
        var elCapacitacion = document.getElementById("menu-capacitacion");
        if (elCapacitacion) elCapacitacion.classList.add("active");
        
    } else if (urlActual.includes("enfasis") || urlActual.includes("énfasis")) {
        var elEnfasis = document.getElementById("menu-enfasis");
        if (elEnfasis) elEnfasis.classList.add("active");
        
    } else if (urlActual.includes("tipos-de-grupo") || urlActual.includes("tipos")) {
        var elTipos = document.getElementById("menu-tipos");
        if (elTipos) elTipos.classList.add("active");
        
    } else if (urlActual.includes("/fui/")) {
        var elFui = document.getElementById("menu-fui");
        if (elFui) elFui.classList.add("active");
        
    } else if (urlActual.includes("crnyo")) {
        var elCrnyo = document.getElementById("menu-crnyo");
        if (elCrnyo) elCrnyo.classList.add("active");
        
    } else if (urlActual.includes("integracion") || urlActual.includes("integración")) {
        var elIntegracion = document.getElementById("menu-integracion");
        if (elIntegracion) elIntegracion.classList.add("active");
    }
});