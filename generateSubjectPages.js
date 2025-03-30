const fs = require('fs')
const path = require('path')

const baseDir = __dirname
const subjectsDir = path.join(baseDir, 'subjects')
const filesJson = path.join(baseDir, 'files.json')

const generateSubjectPages = () => {
  if (!fs.existsSync(filesJson)) {
    console.error(
      'Error: files.json no existe. Asegúrate de generarlo antes de ejecutar este script.'
    )
    return
  }

  const subjects = JSON.parse(fs.readFileSync(filesJson, 'utf-8'))

  const processFolder = (folderName, folderContent, parentDir) => {
    const currentDir = path.join(parentDir, folderName)
    if (!fs.existsSync(currentDir)) {
      console.log(`Creando carpeta: ${currentDir}`)
      fs.mkdirSync(currentDir, { recursive: true })
    }

    let dynamicLinks = ''

    Object.keys(folderContent).forEach((key) => {
      if (key === 'files') {
        folderContent[key].forEach((file) => {
          if (file !== 'index.html') {
            // Excluir index.html de la lista
            dynamicLinks += `
                            <li>
                                <a href="${file}" ${
              file.endsWith('.sh') ? 'download' : ''
            }>
${
  file.endsWith('.sh') ? 'Descargar' : 'Ver'
}                                     ${file}
                                </a>
                            </li>`
          }
        })
      } else if (
        key === 'pdfs' ||
        key === 'html' ||
        key === 'images' ||
        key === 'Scripts'
      ) {
        const subfolder = path.join(currentDir, key)
        if (!fs.existsSync(subfolder)) {
          console.log(`Creando subcarpeta: ${subfolder}`)
          fs.mkdirSync(subfolder, { recursive: true })
        }

        folderContent[key].files.forEach((file) => {
          if (file.endsWith('.pdf')) {
            // Generar un archivo HTML con un iframe para el PDF
            const pdfViewerPath = path.join(subfolder, `${file}.html`)
            const pdfViewerContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file}</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header id="header">
        <nav>
            <a href="/index.html">Home</a>
        </nav>
    </header>
    <main>
        <h1>Visualizando: ${file}</h1>
        <iframe src="${file}" width="100%" height="600px" style="border: none;"></iframe>
    </main>
    <footer id="footer">
        <p>&copy; 2023 Vanilla JS SPA</p>
    </footer>
</body>
</html>
                        `
            fs.writeFileSync(pdfViewerPath, pdfViewerContent)
            console.log(`Archivo HTML generado para visualizar el PDF: ${file}`)

            // Agregar enlace al archivo HTML del visor
            dynamicLinks += `
                            <li>
                                <a href="${key}/${file}.html">${file}</a>
                            </li>`
          } else {
            dynamicLinks += `
                            <li>
                                <a href="${key}/${file}" ${
              file.endsWith('.sh') ? 'download' : ''
            }>
                                    ${file}
                                </a>
                            </li>`
          }
        })
      } else {
        // Agregar enlace a la subcarpeta
        dynamicLinks += `
                    <li>
                        <a href="${key}/index.html">Abrir carpeta: ${key}</a>
                    </li>`
        // Procesar subcarpetas recursivamente
        processFolder(key, folderContent[key], currentDir)
      }
    })

    // Generar el archivo index.html para la carpeta actual
    const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folderName}</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header id="header">
        <nav>
            <a href="/index.html">Home</a>
        </nav>
    </header>
    <main>
        <h1>${folderName}</h1>
        <ul>
            ${dynamicLinks || '<p>No files available for this folder.</p>'}
        </ul>
    </main>
    <footer id="footer">
        <p>&copy; 2023 Vanilla JS SPA</p>
    </footer>
</body>
</html>
        `

    const indexPath = path.join(currentDir, 'index.html')
    try {
      fs.writeFileSync(indexPath, indexContent)
      console.log(`Archivo index.html generado para la carpeta: ${folderName}`)
    } catch (error) {
      console.error(
        `Error al generar index.html para la carpeta ${folderName}:`,
        error
      )
    }
  }

  Object.keys(subjects).forEach((subject) => {
    console.log(`Procesando: ${subject}`)
    processFolder(subject, subjects[subject], subjectsDir)
  })
}

generateSubjectPages()
