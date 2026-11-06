document.addEventListener("DOMContentLoaded", function() {
    document.title = "Investigación y Extensión";
});

function mostrarDocumentos(tipo) {
    var etiqueta = document.getElementById("visor-etiqueta");
    var descripcion = document.getElementById("visor-descripcion");
    var contenido = document.getElementById("visor-contenido");
    
    var cardInv = document.getElementById("card-inv");
    var cardExt = document.getElementById("card-ext");

    if (cardInv) cardInv.style.borderColor = "#CBD5E1";
    if (cardExt) cardExt.style.borderColor = "#CBD5E1";

    if (tipo === 'investigacion') {
        if (cardInv) cardInv.style.borderColor = "#0284C7";
        if (etiqueta) etiqueta.innerText = "Investigación";
        if (descripcion) descripcion.innerText = "Acerca de este documento: Proyectos aprobados, actas oficiales y producción científica de la EICS.";
        
        var urlDrive = cardInv.getAttribute("data-url");
        
        if (contenido) {
            contenido.innerHTML = `
              <iframe src="${urlDrive}" style="width: 100%; height: 650px; border: none; border-radius: 4px;" allowfullscreen="true"></iframe>`;
        }
    } else if (tipo === 'extension') {
        if (cardExt) cardExt.style.borderColor = "#0284C7";
        if (etiqueta) etiqueta.innerText = "Extensión";
        if (descripcion) descripcion.innerText = "Acerca de este documento: Programas de vinculación social, cursos de extensión y proyectos comunitarios.";
        
        var urlDrive = cardExt.getAttribute("data-url");
        
        if (contenido) {
            contenido.innerHTML = `
              <iframe src="${urlDrive}" style="width: 100%; height: 500px; border: none; border-radius: 4px;" allowfullscreen="true"></iframe>`;
        }
    }
}