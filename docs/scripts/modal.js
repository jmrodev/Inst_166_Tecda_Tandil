function showFile(fileName) {
  fetch(fileName)
    .then((response) => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo.')
      }
      return response.text()
    })
    .then((text) => {
      document.getElementById('file-content').textContent = text
      document.getElementById('file-viewer').style.display = 'block'
      document.getElementById('overlay').style.display = 'block'
    })
    .catch((error) => {
      alert(error.message)
    })
}

function closeViewer() {
  document.getElementById('file-viewer').style.display = 'none'
  document.getElementById('overlay').style.display = 'none'
  document.getElementById('file-content').textContent = ''
}
