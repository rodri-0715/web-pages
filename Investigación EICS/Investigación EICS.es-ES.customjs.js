// Función principal para la navegación entre años (2025 - 2029)
function openYear(evt, yearId) {
    var yearContents = document.getElementsByClassName("year-content");
    for (var i = 0; i < yearContents.length; i++) {
        yearContents[i].classList.remove("active");
    }

    var yearBtns = document.getElementsByClassName("year-btn");
    for (var i = 0; i < yearBtns.length; i++) {
        yearBtns[i].classList.remove("active");
    }

    document.getElementById(yearId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Funciones interactivas para los paneles desplegables de Meta 3.1.1
function toggleDetails(panelId) {
    const targetPanel = document.getElementById(panelId);
    if (!targetPanel) return;

    const isOpen = targetPanel.classList.contains('active');
    const parentCard = targetPanel.closest('.project-card-pill');
    
    if (parentCard) {
      const openPanels = parentCard.querySelectorAll('.project-expandable-panel.active');
      openPanels.forEach(panel => panel.classList.remove('active'));
    }

    if (!isOpen) {
      targetPanel.classList.add('active');
    }
}

// Funciones para globos flotantes de la Meta 3.1.2
function toggleDocentTooltip(event, tooltipId) {
    event.stopPropagation();
    const target = document.getElementById(tooltipId);
    if (!target) return;

    const isOpen = target.classList.contains('active');
    
    document.querySelectorAll('.docent-tooltip.active').forEach(tt => {
      tt.classList.remove('active');
    });

    if (!isOpen) {
      target.classList.add('active');
    }
}

document.addEventListener('click', function() {
    document.querySelectorAll('.docent-tooltip.active').forEach(tt => {
      tt.classList.remove('active');
    });
});

function toggleDocentDesc(descId) {
    const targetDesc = document.getElementById(descId);
    if (!targetDesc) return;

    const isOpen = targetDesc.classList.contains('active');
    
    document.querySelectorAll('.docent-expandable-desc.active').forEach(desc => {
      desc.classList.remove('active');
    });

    if (!isOpen) {
      targetDesc.classList.add('active');
    }
}

// Función para desplegar articulación en Meta 3.1.3
function toggleAllianceDetails(descId) {
    const target = document.getElementById(descId);
    if (!target) return;

    const isOpen = target.classList.contains('active');
    
    document.querySelectorAll('.alliance-expandable-text.active').forEach(panel => {
      panel.classList.remove('active');
    });

    if (!isOpen) {
      target.classList.add('active');
    }
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