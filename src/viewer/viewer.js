const CONFIG = require('../config/config')

function generateViewerHTML(fileType, filePath) {
  const baseHref = CONFIG.getBaseHrefForTag()
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="${baseHref}">
  <title>Visor de ${fileType}</title>
</head>
<body>
  <h1>Visor de ${fileType}</h1>
  <iframe src="${filePath}" width="100%" height="600px"></iframe>
</body>
</html>`
}

module.exports = {
  generateViewerHTML,
}
