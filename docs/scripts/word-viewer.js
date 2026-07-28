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
  fileInfo.textContent = `📄 ${fileName}`;
  
  // Configurar el botón de descarga
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', function() {
    window.location.href = filePath;
  });
  
  // Cargar el documento
  loadDocument(filePath);
});

function loadDocument(filePath) {
  const docContainer = document.getElementById('doc-content');
  const fileExtension = filePath.split('.').pop().toLowerCase();
  
  if (fileExtension === 'docx') {
    // Usar Mammoth.js para convertir DOCX a HTML
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el documento');
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        return mammoth.convertToHtml({arrayBuffer: arrayBuffer});
      })
      .then(result => {
        docContainer.innerHTML = result.value;
        
        // Mostrar advertencias si las hay
        if (result.messages.length > 0) {
          console.warn('Advertencias al convertir el documento:', result.messages);
        }
      })
      .catch(error => {
        showError('Error al cargar el documento: ' + error.message);
      });
  } else if (fileExtension === 'doc') {
    // Para archivos .doc (formato antiguo), mostrar un mensaje indicando que no se puede visualizar
    docContainer.innerHTML = `
      <div class="error">
        <p>This file format (.doc) is not supported by the browser viewer. Please download the file to view it.</p>
      </div>
    `;
  } else {
    showError('Formato de archivo no soportado');
  }
}

function showError(message) {
  const docContainer = document.getElementById('doc-content');
  docContainer.innerHTML = `<div class="error">${message}</div>`;
}
