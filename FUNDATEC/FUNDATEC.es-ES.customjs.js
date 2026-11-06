function loadFundatecDoc(driveUrl, docTitle, docDescription, cardElement) {
  const iframe = document.getElementById('pdf-iframe-view');
  const instructionBar = document.getElementById('viewer-instruction-bar');
  
  if (!iframe || !instructionBar) return;

  // Actualizar texto descriptivo superior del visor
  instructionBar.innerHTML = `<strong>${docTitle}</strong><br><span style="color: #475569; font-size: 13px;">${docDescription}</span>`;

  // Extraer el ID del enlace de Google Drive y pasarlo a formato de vista previa limpia
  let previewUrl = driveUrl;
  if (driveUrl.includes('drive.google.com') && driveUrl.includes('/file/d/')) {
    const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      previewUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }

  // Cargar el documento en el iframe sin pedir inicios de sesión
  iframe.src = previewUrl;

  // Gestionar la tarjeta seleccionada (clase activa)
  document.querySelectorAll('.institutional-card').forEach(card => {
    card.classList.remove('active-card');
  });

  if (cardElement) {
    cardElement.classList.add('active-card');
  }
}