const fs = require('fs')
const path = require('path')

// 1. Configuración mejorada
const CONFIG = {
  sourceRoot: path.join(__dirname, 'documents'), // Directorio raíz del contenido
  outputRoot: path.join(__dirname, 'docs'), // Directorio de salida
  baseHref: '', // Para GitHub Pages: '/tu-repositorio'
  excludes: ['node_modules', '.git', 'dist', '*.md', '.DS_Store'],
  pdfViewerTemplate: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visor de PDF</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    #toolbar {
      padding: 10px;
      background: #2c3e50;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #pdf-frame {
      width: 100%;
      height: calc(100vh - 50px);
      border: none;
    }
    button {
      padding: 8px 15px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      #pdf-frame {
        height: calc(100vh - 60px);
      }
      #toolbar {
        flex-direction: column;
        gap: 8px;
      }
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <button onclick="window.history.back()">← Volver</button>
    <div>
      <button id="download-btn">Descargar PDF</button>
      <button id="fullscreen-btn" style="margin-left: 8px;">Pantalla completa</button>
    </div>
  </div>
  <iframe id="pdf-frame" allowfullscreen></iframe>

  <script>
    const params = new URLSearchParams(window.location.search);
    const pdfFile = decodeURIComponent(params.get('file'));
    const frame = document.getElementById('pdf-frame');
    const downloadBtn = document.getElementById('download-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    if (pdfFile) {
      frame.src = pdfFile.includes('://') ? pdfFile : (pdfFile.startsWith('/') ? pdfFile : '/' + pdfFile);
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = pdfFile;
        link.download = pdfFile.split('/').pop() || 'documento.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      fullscreenBtn.onclick = () => {
        if (frame.requestFullscreen) frame.requestFullscreen();
        else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
        else if (frame.msRequestFullscreen) frame.msRequestFullscreen();
      };
    } else {
      document.body.innerHTML = '<h1 style="padding:20px;color:red;">Error: No se especificó archivo PDF</h1>';
    }
  </script>
</body>
</html>`,
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

  const rootPath =
    currentPath.split('/').filter(Boolean).fill('..').join('/') || '.'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Instituto 166</title>
  <link rel="stylesheet" href="${rootPath}/styles.css">
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
              // Ajustar la ruta del archivo PDF para que sea relativa al visor
              const pdfPath = path.join(currentPath, file.name).replace(/\\/g, '/');
              return `
                <li>
                  <a href="${rootPath}/pdf-viewer.html?file=${encodeURIComponent(
                pdfPath
              )}">
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
      'styles.css': path.join(__dirname, 'styles.css'),
      'favicon.ico': path.join(__dirname, 'favicon.ico'),
      'pdf-viewer.html': null,
    }

    for (const [file, source] of Object.entries(staticFiles)) {
      const dest = path.join(CONFIG.outputRoot, file)
      if (source && fs.existsSync(source)) {
        fs.copyFileSync(source, dest)
      } else if (file === 'pdf-viewer.html') {
        fs.writeFileSync(dest, CONFIG.pdfViewerTemplate)
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
