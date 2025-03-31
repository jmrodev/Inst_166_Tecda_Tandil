const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000

// Servir archivos estáticos desde el directorio base
const baseDir = __dirname
app.use(express.static(baseDir))

// Ruta para manejar errores 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(baseDir, '404.html'))
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
