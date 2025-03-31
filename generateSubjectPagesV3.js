const fs = require('fs')
const path = require('path')

// Configuración
const BASE_DIR = __dirname
const SUBJECTS_DIR = path.join(BASE_DIR, 'subjects')
const FILES_JSON = path.join(BASE_DIR, 'files.json')

// Función para normalizar nombres de archivos manteniendo legibilidad
const normalizeFilename = (filename) => {
  // Primero decodificar posibles caracteres ya codificados
  let decoded = decodeURIComponent(filename)

  // Normalizar caracteres especiales y espacios
  return decoded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-.]/g, '')
}

// Función para generar nombres legibles para mostrar
const createDisplayName = (filename) => {
  return filename
    .replace(/_/g, ' ')
    .replace(/.pdf$/, '')
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
}

// Función para generar el visor PDF (versión mejorada)
const generatePDFViewerHTML = (originalFilename, safeFilename, depth = 0) => {
  const backPath = '../'.repeat(depth)
  const displayName = createDisplayName(originalFilename.replace(/_/g, ' '))

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayName}</title>
    <link rel="stylesheet" href="${backPath}styles.css">
</head>
<body>
    <header id="header">
        <nav>
            <a href="${backPath}index.html">Inicio</a>
            <a href="${backPath}subjects/index.html">Materias</a>
        </nav>
    </header>
    <main>
        <h1>Visualizando: ${displayName}</h1>
        <iframe src="./${safeFilename}" width="100%" height="600px" style="border: none;"></iframe>
    </main>
    <footer id="footer">
        <p>&copy; ${new Date().getFullYear()} Instituto</p>
    </footer>
    <script src="${backPath}script.js"></script>
</body>
</html>
`
}

// Procesar archivos en una carpeta (versión mejorada)
const processFiles = (folderPath, files, folderType, depth) => {
  let linksHTML = ''
  const subfolder = folderType === 'root' ? '' : `${folderType}/`
  const targetFolder =
    folderType === 'root' ? folderPath : path.join(folderPath, folderType)

  // Crear la carpeta de destino si no existe
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true })
  }

  files.forEach((file) => {
    if (file === 'index.html') return

    const safeName = normalizeFilename(file)
    const displayName = createDisplayName(file)
    const originalPath = path.join(folderPath, file)
    const newPath = path.join(targetFolder, safeName)

    try {
      // Mover/renombrar el archivo si es necesario y existe
      if (fs.existsSync(originalPath) && originalPath !== newPath) {
        fs.renameSync(originalPath, newPath)
      } else if (!fs.existsSync(newPath)) {
        console.warn(`Archivo no encontrado: ${originalPath}`)
        return
      }

      if (file.endsWith('.pdf')) {
        // Generar visor PDF
        const viewerPath = path.join(targetFolder, `${safeName}.html`)
        fs.writeFileSync(
          viewerPath,
          generatePDFViewerHTML(file, safeName, depth + (folderType ? 1 : 0))
        )

        linksHTML += `
          <li>
            <a href="${subfolder}${safeName}.html">${displayName}</a>
          </li>`
      } else {
        // Para otros tipos de archivos
        const action = file.endsWith('.sh') ? 'download' : ''
        const linkText = file.endsWith('.sh') ? 'Descargar' : 'Ver'

        linksHTML += `
          <li>
            <a href="${subfolder}${safeName}" ${action}>
              ${linkText} ${displayName}
            </a>
          </li>`
      }
    } catch (error) {
      console.error(`Error procesando archivo ${file}:`, error.message)
    }
  })

  return linksHTML
}

// Procesar una carpeta/subcarpeta completa
const processFolder = (folderName, folderContent, parentDir, depth = 0) => {
  const currentDir = path.join(parentDir, folderName)

  try {
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir, { recursive: true })
    }

    let dynamicLinks = ''

    // Verificar si es una materia válida (tiene contenido)
    if (!folderContent || typeof folderContent !== 'object') {
      console.warn(`Contenido inválido para ${folderName}, omitiendo...`)
      return false
    }

    Object.keys(folderContent).forEach((key) => {
      if (key === 'files') {
        // Procesar archivos en la raíz de la carpeta
        if (Array.isArray(folderContent[key])) {
          dynamicLinks += processFiles(
            currentDir,
            folderContent[key],
            'root',
            depth
          )
        }
      } else if (['pdfs', 'html', 'images', 'Scripts'].includes(key)) {
        // Procesar subcarpetas especiales
        if (
          folderContent[key]?.files &&
          Array.isArray(folderContent[key].files)
        ) {
          dynamicLinks += `<h2>${key}</h2>`
          dynamicLinks += processFiles(
            currentDir,
            folderContent[key].files,
            key,
            depth
          )
        }
      } else if (key !== '0') {
        // Ignorar la clave '0' que causaba recursión infinita
        // Procesar subcarpetas normales
        dynamicLinks += `
          <li>
            <a href="${key}/index.html">${key}</a>
          </li>`
        processFolder(key, folderContent[key], currentDir, depth + 1)
      }
    })

    // Generar index.html para la carpeta actual
    const indexPath = path.join(currentDir, 'index.html')
    const indexContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folderName}</title>
    <link rel="stylesheet" href="${'../'.repeat(depth)}styles.css">
</head>
<body>
    <header id="header">
        <nav>
            <a href="${'../'.repeat(depth)}index.html">Inicio</a>
            <a href="${'../'.repeat(depth)}subjects/index.html">Materias</a>
        </nav>
    </header>
    <main>
        <h1>${folderName}</h1>
        ${dynamicLinks || '<p>No hay archivos disponibles</p>'}
    </main>
    <footer id="footer">
        <p>&copy; ${new Date().getFullYear()} Instituto</p>
    </footer>
    <script src="${'../'.repeat(depth)}script.js"></script>
</body>
</html>
    `

    fs.writeFileSync(indexPath, indexContent)
    console.log(`✅ Generado: ${currentDir}/index.html`)
    return true
  } catch (error) {
    console.error(`❌ Error procesando ${folderName}:`, error.message)
    return false
  }
}

// Función principal
const generateSubjectPages = () => {
  try {
    // Verificar si files.json existe
    if (!fs.existsSync(FILES_JSON)) {
      throw new Error(
        'files.json no existe. Ejecuta generateFileList.js primero.'
      )
    }

    // Leer el archivo JSON
    const rawData = fs.readFileSync(FILES_JSON, 'utf-8')
    const subjects = JSON.parse(rawData)

    // Filtrar solo las materias principales (Primer_anio, Segundo_anio)
    const validSubjects = {}
    Object.keys(subjects).forEach((key) => {
      if (['Primer_anio', 'Segundo_anio'].includes(key)) {
        validSubjects[key] = subjects[key]
      }
    })

    if (!fs.existsSync(SUBJECTS_DIR)) {
      fs.mkdirSync(SUBJECTS_DIR, { recursive: true })
    }

    // Crear archivo .nojekyll para GitHub Pages
    fs.writeFileSync(path.join(BASE_DIR, '.nojekyll'), '')

    // Generar index principal en subjects
    const subjectsIndexPath = path.join(SUBJECTS_DIR, 'index.html')
    fs.writeFileSync(
      subjectsIndexPath,
      `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Materias</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header id="header"></header>
    <main>
        <h1>Materias</h1>
        <div id="app"></div>
    </main>
    <footer id="footer"></footer>
    <script src="../script.js"></script>
</body>
</html>`
    )

    // Procesar todas las materias válidas
    Object.keys(validSubjects).forEach((subject) => {
      console.log(`📂 Procesando materia: ${subject}`)
      processFolder(subject, validSubjects[subject], SUBJECTS_DIR, 1)
    })

    console.log('\n🎉 Generación completada con éxito!')
    console.log('🔹 Todos los archivos han sido procesados')
    console.log('🔹 Nombres normalizados manteniendo legibilidad')
    console.log('🔹 Estructura compatible con GitHub Pages')
  } catch (error) {
    console.error('\n⚠️ Error durante la generación:', error.message)
    process.exit(1)
  }
}

// Ejecutar el generador
generateSubjectPages()
