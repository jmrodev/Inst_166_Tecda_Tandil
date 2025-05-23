document.addEventListener('DOMContentLoaded', function() {
  // Obtener el parámetro del archivo de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const filePath = urlParams.get('file');
  
  if (!filePath) {
    showError('No se especificó un archivo para visualizar');
    return;
  }
  
  // Mostrar información del archivo
  const fileInfo = document.getElementById('file-info');
  const fileName = filePath.split('/').pop();
  fileInfo.textContent = `📊 ${fileName}`;
  
  // Configurar el botón de descarga
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', function() {
    window.location.href = filePath;
  });
  
  // Cargar la presentación
  loadPresentation(filePath);
});

function loadPresentation(filePath) {
  const presentationContainer = document.getElementById('presentation-content');
  const fileExtension = filePath.split('.').pop().toLowerCase();
  
  if (fileExtension === 'pptx' || fileExtension === 'ppt') {
    // Para archivos PowerPoint, mostrar un mensaje indicando que no se puede visualizar
    presentationContainer.innerHTML = `
      <div class="error">
        <p>Lo sentimos, las presentaciones de PowerPoint no se pueden previsualizar en el navegador.</p>
        <p>Por favor, descarga el archivo usando el botón "Descargar Original" para abrirlo en Microsoft PowerPoint u otro programa compatible.</p>
      </div>
    `;
  } else {
    showError('Formato de archivo no soportado');
  }
}

function showError(message) {
  const presentationContainer = document.getElementById('presentation-content');
  presentationContainer.innerHTML = `<div class="error">${message}</div>`;
}
