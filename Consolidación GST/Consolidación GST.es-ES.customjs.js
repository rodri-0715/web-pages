document.addEventListener("DOMContentLoaded", function() {
    // Obtenemos la URL actual y decodificamos los caracteres especiales y tildes
    var urlActual = decodeURIComponent(window.location.href).toLowerCase();

    // Limpiamos cualquier clase activa previa
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Validamos cada enlace según las palabras clave de su ruta (ignorando tildes y formato)
    if (urlActual.includes("consolidacion") || urlActual.includes("gst")) {
        document.getElementById("menu-consolidacion")?.classList.add("active");
    } 
    else if (urlActual.includes("divulgacion")) {
        document.getElementById("menu-divulgacion")?.classList.add("active");
    } 
    else if (urlActual.includes("formacion")) {
        document.getElementById("menu-formacion")?.classList.add("active");
    } 
    else if (urlActual.includes("mantenimineto") || urlActual.includes("renovacion")) {
        document.getElementById("menu-mantenimiento")?.classList.add("active");
    } 
    else if (urlActual.includes("estabilidad") || urlActual.includes("laboral")) {
        document.getElementById("menu-estabilidad")?.classList.add("active");
    } 
    else if (urlActual.includes("gestion") || urlActual.includes("administrativa")) {
        document.getElementById("menu-gestion")?.classList.add("active");
    }
    // Para la sección de Productos de Investigación u otras de investigación
    else if (urlActual.includes("investigacion") || urlActual.includes("productos")) {
        document.getElementById("menu-productos")?.classList.add("active");
        document.getElementById("menu-inv-eics")?.classList.add("active");
    }
    else if (urlActual.includes("estudiantil")) {
        document.getElementById("menu-inv-estudiantil")?.classList.add("active");
    }
});

// Función para cambiar de año de forma interactiva
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