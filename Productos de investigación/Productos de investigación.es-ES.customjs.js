// Función para cambiar de año en el Objetivo 3.3
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

    document.querySelectorAll('.sub-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });

    if (urlActual.includes("investigacion-eics") || (urlActual.includes("investigacion") && !urlActual.includes("estudiantil"))) {
        document.getElementById("menu-inv-eics")?.classList.add("active");
    } else if (urlActual.includes("estudiantil")) {
        document.getElementById("menu-inv-estudiantil")?.classList.add("active");
    } else if (urlActual.includes("productos") || urlActual.includes("investigacion")) {
        document.getElementById("menu-productos")?.classList.add("active");
    }
});