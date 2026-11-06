/**
 * Función para cambiar la vista por Año (2025 - 2029)
 */
function openYear(evt, yearId) {
    var yearContents = document.getElementsByClassName("year-content");
    for (var i = 0; i < yearContents.length; i++) {
        yearContents[i].classList.remove("active");
    }

    var yearBtns = document.getElementsByClassName("year-btn");
    for (var i = 0; i < yearBtns.length; i++) {
        yearBtns[i].classList.remove("active");
    }

    var selectedYearContent = document.getElementById(yearId);
    if (selectedYearContent) {
        selectedYearContent.classList.add("active");
    }
    
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
}

/**
 * Función para cambiar las pestañas de áreas (Inglés, Ciencias Sociales, Comunicación, Turismo)
 * dentro del año que el usuario tiene activo.
 */
function switchTab(evt, tabId) {
    var currentYearContainer = evt.currentTarget.closest('.year-content');
    
    if (currentYearContainer) {
        var tabContent = currentYearContainer.getElementsByClassName("tab-content");
        for (var i = 0; i < tabContent.length; i++) {
            tabContent[i].classList.remove("active");
        }
        
        var tabBtns = currentYearContainer.getElementsByClassName("tab-btn");
        for (var i = 0; i < tabBtns.length; i++) {
            tabBtns[i].classList.remove("active");
        }
    }
    
    var selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add("active");
    }
    
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
}

/**
 * Detección dinámica e insensible a acentos de la subpágina activa en el menú Píldoras
 */
document.addEventListener("DOMContentLoaded", function() {
    function normalizarTexto(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    var urlActual = normalizarTexto(window.location.href);

    // Limpia estados previos del submenú
    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    // Marca la opción activa en azul según la URL
    if (urlActual.includes("autoevaluacion") || urlActual.includes("gst")) {
        document.getElementById("menu-gst")?.classList.add("active");
    } else if (urlActual.includes("actualizacion") || urlActual.includes("programas")) {
        document.getElementById("menu-actualizacion")?.classList.add("active");
    } else if (urlActual.includes("produccion") || urlActual.includes("academica")) {
        document.getElementById("menu-produccion")?.classList.add("active");
    }
});