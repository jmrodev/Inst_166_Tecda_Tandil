const fs = require('fs')
const path = require('path')

// 1. Configuración mejorada
const CONFIG = {
  sourceRoot: path.join(__dirname, 'documents'), // Directorio raíz del contenido
  outputRoot: path.join(__dirname, 'docs'), // Directorio de salida
  baseHref: '/Inst_166_Tecda_Tandil', // Subdirectorio para GitHub Pages
  excludes: ['node_modules', '.git', 'dist', '*.md', '.DS_Store'],
}

// 2. Función para verificar exclusiones
function isExcluded(name) {
  return CONFIG.excludes.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
    return regex.test(name)
  })
}

// 3. Generador de HTML con soporte para PDFs
function generateHTML(title, items = { dirs: [], files: [] }, currentPath) {
  // Asegurarse de que items.dirs y items.files sean arreglos
  const dirs = items.dirs || []
  const files = items.files || []

  // Calcular ruta relativa a la raíz del sitio
  const rootPath =
    currentPath.split('/').filter(Boolean).fill('..').join('/') || '.'

  // Verificar si el archivo está en una carpeta llamada "html"
  const isInHtmlFolder = currentPath.includes('/html')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Instituto 166</title>
  <link rel="stylesheet" href="${rootPath}/css/styles.css">
  <script src="${rootPath}/scripts/modal.js" defer></script>
</head>
<body>

  <header>
    <h1>${title}</h1>
    <nav class="breadcrumb">
      <a href="${rootPath}/index.html">Inicio</a> /
      ${currentPath
        .split('/')
        .filter(Boolean)
        .map((dir, i, arr) => {
          const path = arr.slice(0, i + 1).join('/')
          return `<a href="${rootPath}/${path}/index.html">${dir}</a>`
        })
        .join(' / ')}
    </nav>
  </header>
 

  <main>
    ${
      dirs.length > 0
        ? `
    <section class="directories">
      <h2>Directorios</h2>
      <ul>
        ${dirs
          .map(
            (dir) =>
              `<li><a href="${dir.name}/index.html">📁 ${dir.name}</a></li>`
          )
          .join('')}
      </ul>
    </section>`
        : ''
    }

    ${
      files.length > 0
        ? `
    <section class="files">
      <h2>Archivos</h2>
      <ul>
        ${files
          .map((file) => {
            if (file.ext === '.pdf') {
              // Enlace directo al archivo PDF
              return `
                <li>
                  <a href="${file.name}" target="_blank">
                    📄 ${file.name}
                  </a>
                </li>`
            }
            if (file.ext === '.sh') {
              return `
                <li>
                  <a href="#" onclick="showFile('${file.name}')">
                    📄 ${file.name}
                  </a>
                </li>`
            }
            return `<li><a href="${file.name}" target="_blank">📁 ${file.name}</a></li>`
          })
          .join('')}
      </ul>
    </section>`
        : ''
    }
  </main>

  <div id="file-viewer">
    <button onclick="closeViewer()">Cerrar</button>
    <pre id="file-content"></pre>
  </div>
  <div id="overlay" onclick="closeViewer()"></div>
</body>
</html>`
}

// 4. Procesador de directorios
async function processDirectory(srcPath, destPath, relativePath = '') {
  const items = fs.readdirSync(srcPath, { withFileTypes: true })
  const contents = { dirs: [], files: [] }

  fs.mkdirSync(destPath, { recursive: true })

  for (const item of items) {
    if (isExcluded(item.name)) continue

    const itemRelPath = path.join(relativePath, item.name)
    const itemSrc = path.join(srcPath, item.name)
    const itemDest = path.join(destPath, item.name)

    if (item.isDirectory()) {
      contents.dirs.push({ name: item.name, path: itemRelPath })
      await processDirectory(itemSrc, itemDest, itemRelPath)
    } else {
      const ext = path.extname(item.name)
      contents.files.push({ name: item.name, ext })
      fs.copyFileSync(itemSrc, itemDest)
    }
  }

  if (contents.dirs.length > 0 || contents.files.length > 0) {
    fs.writeFileSync(
      path.join(destPath, 'index.html'),
      generateHTML(path.basename(srcPath) || 'Inicio', contents, relativePath)
    )
  }
}

// 5. Función principal
async function buildSite() {
  console.log('🏗 Construyendo sitio...')

  try {
    if (fs.existsSync(CONFIG.outputRoot)) {
      fs.rmSync(CONFIG.outputRoot, { recursive: true })
    }
    fs.mkdirSync(CONFIG.outputRoot, { recursive: true })

    const staticFiles = {
      'css/styles.css': path.join(__dirname, 'css/styles.css'),
      'scripts/modal.js': path.join(__dirname, 'scripts/modal.js'),
      'favicon.ico': path.join(__dirname, 'favicon.ico'),
    }

    for (const [file, source] of Object.entries(staticFiles)) {
      const dest = path.join(CONFIG.outputRoot, file)
      const destDir = path.dirname(dest)
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      if (source && fs.existsSync(source)) {
        fs.copyFileSync(source, dest)
      }
    }

    await processDirectory(
      CONFIG.sourceRoot,
      path.join(CONFIG.outputRoot, 'content'),
      'content'
    )
    fs.writeFileSync(
      path.join(CONFIG.outputRoot, 'index.html'),
      generateHTML(
        'Instituto 166 - Tecda Tandil',
        { dirs: [{ name: 'content' }] },
        ''
      )
    )

    console.log('✅ Sitio generado correctamente.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

buildSite()
