const fs = require('fs')
const path = require('path')

// 1. Configuración corregida
const CONFIG = {
  sourceRoot: path.join(__dirname, 'documents'), // Directorio raíz del contenido
  outputRoot: path.join(__dirname, 'docs'), // Directorio de salida
  baseHref: '', // Para GitHub Pages: '/tu-repositorio'
  excludes: ['node_modules', '.git', 'dist', '*.md', '.DS_Store'],
}

// 2. Función mejorada para verificar exclusiones
function isExcluded(name) {
  return CONFIG.excludes.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
    return regex.test(name)
  })
}

// 3. Generador de HTML con soporte para enlaces a archivos HTML
function generateHTML(title, items, currentPath) {
  // Calcular ruta relativa a la raíz del sitio
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
      items.dirs.length > 0
        ? `
    <section class="directories">
      <h2>Directorios</h2>
      <ul>
        ${items.dirs
          .map(
            (dir) => `
          <li><a href="${dir.name}/index.html">📁 ${dir.name}</a></li>
        `
          )
          .join('')}
      </ul>
    </section>`
        : ''
    }

    ${
      items.files.length > 0
        ? `
    <section class="files">
      <h2>Archivos</h2>
      <ul>
        ${items.files
          .map((file) => {
            if (file.ext === '.html') {
              return `
                <li>
                  <a href="${file.name}">
                    📝 ${file.name}
                  </a>
                </li>`
            } else if (file.ext === '.pdf') {
              return `
                <li>
                  <a href="#" onclick="loadPDF('${file.name}')">
                    📄 ${file.name}
                  </a>
                </li>`
            } else {
              return `
                <li>
                  <a href="${file.name}" target="_blank">
                    📁 ${file.name}
                  </a>
                </li>`
            }
          })
          .join('')}
      </ul>
    </section>`
        : ''
    }

    <section id="pdf-viewer" style="margin-top: 2rem; display: none;">
      <h2>Visor de PDF</h2>
      <iframe id="pdf-frame" src="" width="100%" height="600px" style="border: 1px solid var(--border-color);"></iframe>
      <button id="open-pdf-btn" style="margin-top: 1rem; display: none;" onclick="openPDF()">Abrir en nueva pestaña</button>
    </section>
  </main>

  <footer>
    <p>Instituto 166 - Tecda Tandil • ${new Date().toLocaleDateString()}</p>
  </footer>

  <script>
    function loadPDF(pdfPath) {
      const viewer = document.getElementById('pdf-viewer');
      const frame = document.getElementById('pdf-frame');
      const openBtn = document.getElementById('open-pdf-btn');
      frame.src = pdfPath;
      openBtn.setAttribute('data-pdf', pdfPath);
      viewer.style.display = 'block';

      // Mostrar el botón "Abrir en nueva pestaña" solo si el iframe no se carga correctamente
      frame.onload = () => {
        openBtn.style.display = 'none';
      };
      frame.onerror = () => {
        openBtn.style.display = 'block';
      };
    }

    function openPDF() {
      const openBtn = document.getElementById('open-pdf-btn');
      const pdfPath = openBtn.getAttribute('data-pdf');
      if (pdfPath) {
        window.open(pdfPath, '_blank');
      }
    }
  </script>
</body>
</html>`
}

// 4. Procesador de directorios con rutas absolutas
async function processDirectory(srcPath, destPath, relativePath = '') {
  const items = fs.readdirSync(srcPath, { withFileTypes: true })
  const contents = { dirs: [], files: [] }

  // Crear directorio de salida
  fs.mkdirSync(destPath, { recursive: true })

  for (const item of items) {
    if (isExcluded(item.name)) continue

    const itemRelPath = path.join(relativePath, item.name)
    const itemSrc = path.join(srcPath, item.name)
    const itemDest = path.join(destPath, item.name)

    if (item.isDirectory()) {
      contents.dirs.push({
        name: item.name,
        path: itemRelPath,
      })
      await processDirectory(itemSrc, itemDest, itemRelPath)
    } else {
      const ext = path.extname(item.name)
      contents.files.push({
        name: item.name,
        ext: ext,
      })
      fs.copyFileSync(itemSrc, itemDest)
    }
  }

  // Generar index.html solo si hay contenido
  if (contents.dirs.length > 0 || contents.files.length > 0) {
    fs.writeFileSync(
      path.join(destPath, 'index.html'),
      generateHTML(path.basename(srcPath) || 'Inicio', contents, relativePath)
    )
  }
}

// 5. Función principal completamente corregida
async function buildSite() {
  console.log('🏗  Construyendo sitio...')

  try {
    // Limpiar directorio de salida
    if (fs.existsSync(CONFIG.outputRoot)) {
      fs.rmSync(CONFIG.outputRoot, { recursive: true })
    }
    fs.mkdirSync(CONFIG.outputRoot, { recursive: true })

    // Copiar archivos estáticos
    const staticFiles = ['styles.css', 'favicon.ico']
    staticFiles.forEach((file) => {
      const src = path.join(__dirname, file)
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(CONFIG.outputRoot, file))
      }
    })

    // Procesar contenido
    await processDirectory(
      CONFIG.sourceRoot,
      path.join(CONFIG.outputRoot, 'content'), // Cambiado a 'content' en lugar de 'pages'
      'content' // Ruta relativa inicial
    )

    // Crear index.html principal
    const mainHtml = generateHTML(
      'Instituto 166 - Tecda Tandil',
      { dirs: [{ name: 'content' }], files: [] },
      ''
    )
    fs.writeFileSync(path.join(CONFIG.outputRoot, 'index.html'), mainHtml)

    console.log('✅ Sitio construido correctamente en:', CONFIG.outputRoot)
    console.log('📌 Estructura correcta:')
    console.log(`
${CONFIG.outputRoot}/
├── index.html
├── styles.css
└── content/
    ├── index.html
    ├── Primer_anio/
    │   ├── index.html
    │   └── pdfs/
    │       ├── index.html
    │       └── archivo.pdf
    └── Segundo_anio/
        ├── index.html
        └── materias/
            ├── index.html
            └── archivos/
    `)
  } catch (error) {
    console.error('❌ Error crítico:', error)
    process.exit(1)
  }
}

// Ejecutar
buildSite()
