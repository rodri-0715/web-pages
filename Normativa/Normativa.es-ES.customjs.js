function loadNormativaViewer(pdfUrl, docName, docDescription, isDownloadable = false) {
  const container = document.getElementById('secure-viewer-container');
  const badge = document.getElementById('doc-title-badge');
  const descBox = document.getElementById('normativa-desc-box');
  const downloadContainer = document.getElementById('download-btn-container');
  
  if (!container || !badge || !descBox) return;

  // Actualizamos título y descripción
  badge.textContent = docName;
  descBox.innerHTML = `<strong>Acerca de este documento:</strong> ${docDescription}`;
  
  let finalUrl = pdfUrl;
  let downloadUrl = pdfUrl;
  let fileId = "";

  // Extracción del ID para Google Drive o Google Sheets
  if (pdfUrl.includes('spreadsheets/d/')) {
    const sheetIdMatch = pdfUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetIdMatch && sheetIdMatch[1]) {
      fileId = sheetIdMatch[1];
      finalUrl = `https://docs.google.com/spreadsheets/d/${fileId}/htmlembed?widget=true&headers=false`;
      downloadUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
    }
  } else if (pdfUrl.includes('drive.google.com') && pdfUrl.includes('/file/d/')) {
    const fileIdMatch = pdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      fileId = fileIdMatch[1];
      finalUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      // ENLACE DE DESCARGA FORZADA: Usa el parámetro de exportación web de Google que baja el archivo directo al PC
      downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    }
  }

  // CONFIGURACIÓN DEL BOTÓN DE DESCARGA DIRECTA (Para documentos celestes)
  if (isDownloadable === true) {
    downloadContainer.style.display = 'block';
    downloadContainer.innerHTML = `
      <a href="${downloadUrl}" download class="download-action-btn" style="display: block; text-align: center; background-color: #003B70; color: #FFFFFF; padding: 10px 14px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <i class="fa fa-download" style="margin-right: 8px;"></i> Descargar formato editable en la computadora
      </a>
    `;
  } else {
    downloadContainer.style.display = 'none';
  }

  // Inserción en el visor de la derecha para previsualización limpia
  container.innerHTML = `
    <iframe src="${finalUrl}" style="width: 100%; height: 100%; border: none;" allow="autoplay" oncontextmenu="return false;"></iframe>
  `;
}