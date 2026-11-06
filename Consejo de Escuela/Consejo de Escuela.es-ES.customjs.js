function toggleAccordion(contentId, iconId) {
  const content = document.getElementById(contentId);
  const iconBtn = document.getElementById(iconId);
  if (!content || !iconBtn) return;

  const isVisible = content.style.display === 'block' || content.classList.contains('show');
  if (isVisible) {
    content.style.display = 'none';
    content.classList.remove('show');
    iconBtn.style.transform = 'rotate(0deg)';
  } else {
    content.style.display = 'block';
    content.classList.add('show');
    iconBtn.style.transform = 'rotate(180deg)';
  }
}

// Función para cargar el documento de manera protegida en el visor sin permitir descargas directas
function loadSecureViewer(pdfUrl, docName) {
  const container = document.getElementById('secure-viewer-container');
  const badge = document.getElementById('doc-title-badge');
  
  if (!container || !badge) return;

  // Actualizar etiqueta superior del visor
  badge.textContent = docName;

  // Añadimos los parámetros de seguridad en la URL del PDF: #toolbar=0&navpanes=0&scrollbar=0
  // Esto oculta las barras de herramientas nativas del navegador para impedir la descarga fácil e impresión
  const secureUrl = pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0";

  container.innerHTML = `
    <iframe src="${secureUrl}" style="width: 100%; height: 100%; border: none;" oncontextmenu="return false;"></iframe>
  `;
}

// Bloqueo de clic derecho general en los visores para evitar inspeccionar o descargar
document.addEventListener('contextmenu', function(e) {
  if (e.target.closest('#secure-viewer-container')) {
    e.preventDefault();
  }
});