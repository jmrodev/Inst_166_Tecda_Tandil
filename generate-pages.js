const fs = require('fs')
const path = require('path')

// 1. Configuración mejorada
const CONFIG = {
  sourceRoot: path.join(__dirname, 'documents'),
  outputRoot: path.join(__dirname, 'docs'),
  baseHref: '/Inst_166_Tecda_Tandil',
  excludes: [
    'node_modules',
    '.git',
    'dist',
    '*.md',
    '.DS_Store',
    'links.txt',
    '*.txt',
  ],
}

// 2. Función para validar configuraciones
function validateConfig(config) {
  try {
    if (!fs.existsSync(config.sourceRoot)) {
      throw new Error(`El directorio raíz ${config.sourceRoot} no existe.`)
    }
    if (!fs.existsSync(config.outputRoot)) {
      fs.mkdirSync(config.outputRoot, { recursive: true })
    }
  } catch (error) {
    console.error(`Error en la configuración: ${error.message}`)
    process.exit(1)
  }
}

// 3. Función para verificar exclusiones
function isExcluded(name) {
  return CONFIG.excludes.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
    return regex.test(name)
  })
}

// 4. Función para formatear nombres amigables para la vista
function formatName(name) {
  const nameWithoutExt = name.replace(/\.[^/.]+$/, '') // Eliminar la extensión
  return nameWithoutExt
    .replace(/_/g, ' ') // Reemplazar guiones bajos por espacios
    .replace(/anio/g, 'año') // Corregir "anio" a "año"
    .toLowerCase()
    .replace(/\b(\w)(\w*)/g, (match, firstLetter, rest) => {
      return firstLetter.toUpperCase() + rest // Capitalizar la primera letra
    })
}

// 5. Generador de HTML para directorios y archivos
function generateHTML(title, items = { dirs: [], files: [] }, currentPath) {
  const dirs = items.dirs || [] // Aseguramos que dirs siempre sea un array
  const files = items.files || [] // Aseguramos que files siempre sea un array
  const rootPath =
    currentPath.split('/').filter(Boolean).fill('..').join('/') || '.'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Instituto 166</title>
  <link rel="stylesheet" href="${rootPath}/css/styles.css">
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
          return `<a href="${rootPath}/${path}/index.html">${formatName(
            dir
          )}</a>`
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
              (dir) => `
            <li>
              <a href="${dir.name}/index.html">📁 ${formatName(dir.name)}</a>
            </li>`
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
            .map(
              (file) => `
            <li>
              <a href="${file.name}" target="_blank">📄 ${formatName(
                file.name
              )}</a>
            </li>`
            )
            .join('')}
        </ul>
      </section>`
        : ''
    }
  </main>

  <footer>
    <div class="footer-bar">
      <button onclick="window.history.back()">⬅ Retroceder</button>
      <button onclick="window.location.href='${rootPath}/index.html'">🏠 Página de Inicio</button>
    </div>
  </footer>
</body>
</html>`
}

// 6. Generador de la página personalizada de inicio
function generateHomePage(outputRoot) {
  const homePagePath = path.join(outputRoot, 'index.html')
  if (fs.existsSync(homePagePath)) {
    console.log(
      '✅ Página personalizada de inicio encontrada (home.html). No se sobrescribirá.'
    )
    return
  }

  const defaultHomeHTML = `
  <!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Instituto 166 - Página de Inicio</title>
    <link
      rel="stylesheet"
      href="css/styles.css"
    />
  </head>
  <body>
    <header>
      <h1>Bienvenido al Instituto 166</h1>
    </header>
    <main>
      <h2>Tecnicatura Superior en Análisis,</h2>
      <h2>Desarrollo y Programación de Aplicaciones</h2>
      <section class="directories">
        <h2>Explora el contenido</h2>
        <p>
          <a href="content/index.html">
            Haz clic aquí para acceder a todas las páginas.
          </a>
        </p>
      </section>
      <h3>Horarios de segundo año</h3>
      <div class="table-wrapper">
      <table
        id="horario-table"
        class="styled-table"
      >
        <tr>
          <th>Horario</th>
          <th>Lunes</th>
          <th>Martes</th>
          <th>Miércoles</th>
          <th>Jueves</th>
          <th>Viernes</th>
        </tr>
        <tr>
          <td>18:00 - 19:00</td>
          <td>
            <p>POO</p>
          </td>
          <td>
            <p>Seminario de</p>
            <p>Programación</p>
          </td>
          <td>
            <p>Inglés</p>
            <p>Técnico II</p>
          </td>
          <td>
            <p>Bases</p>

            <p>de Datos</p>
          </td>
          <td>
            <p>Sistemas</p>
            <p>Operativos</p>
          </td>
        </tr>

        <tr>
          <td>20:00 - 21:00</td>
          <td>
            <p>Análisis</p>
            <p>de Sistemas</p>
          </td>
          <td>
            <p>Análisis</p>
            <p>Matemático II</p>
          </td>
          <td>
            <p>EDI</p>
          </td>
          <td>POO</td>
          <td>
            <p>Probabilidad</p>
            <p>y Estadística</p>
          </td>
        </tr>

        <tr>
          <td>21:00 - 22:00</td>
          <td></td>
          <td></td>
          <td>
            <p>Análisis</p>
            <p>de Sistemas</p>
          </td>
          <td></td>
          <td></td>
        </tr>
      </table>
      </div>
    </main>

    <footer>
      <div class="footer-bar">
        <button onclick="window.history.back()">⬅ Retroceder</button>
        <button onclick="window.location.href='index.html'">
          🏠 Página de Inicio
        </button>
      </div>
    </footer>
  </body>
</html>
`

  fs.writeFileSync(homePagePath, defaultHomeHTML)
  console.log('✅ Página de inicio generada correctamente (home.html).')
}

// 7. Procesador de directorios
function processDirectory(srcPath, destPath, relativePath = '') {
  const items = fs.readdirSync(srcPath, { withFileTypes: true })
  const contents = { dirs: [], files: [] }

  fs.mkdirSync(destPath, { recursive: true })

  items.forEach((item) => {
    if (isExcluded(item.name)) return

    const itemRelPath = path.join(relativePath, item.name)
    const itemDest = path.join(destPath, item.name)

    if (item.isDirectory()) {
      contents.dirs.push({ name: item.name, path: itemRelPath })
      processDirectory(path.join(srcPath, item.name), itemDest, itemRelPath)
    } else {
      contents.files.push({ name: item.name, ext: path.extname(item.name) })
      fs.copyFileSync(path.join(srcPath, item.name), itemDest)
    }
  })

  if (contents.dirs.length + contents.files.length > 0) {
    fs.writeFileSync(
      path.join(destPath, 'index.html'),
      generateHTML(path.basename(srcPath) || 'Inicio', contents, relativePath)
    )
  }
}

// 8. Función principal
async function buildSite() {
  console.log('🏗 Construyendo sitio...')
  try {
    validateConfig(CONFIG)

    // Limpiar directorio de salida
    if (fs.existsSync(CONFIG.outputRoot)) {
      fs.rmSync(CONFIG.outputRoot, { recursive: true })
    }

    fs.mkdirSync(CONFIG.outputRoot, { recursive: true })

    // Copiar archivos estáticos
    const staticFiles = {
      'css/styles.css': path.join(__dirname, 'css/styles.css'),
      'favicon.ico': path.join(__dirname, 'favicon.ico'),
    }

    Object.entries(staticFiles).forEach(([file, source]) => {
      const dest = path.join(CONFIG.outputRoot, file)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest)
      }
    })

    // Generar directorio de contenido
    processDirectory(
      CONFIG.sourceRoot,
      path.join(CONFIG.outputRoot, 'content'),
      'content'
    )

    // Generar o respetar la página de inicio
    generateHomePage(CONFIG.outputRoot)

    console.log('✅ Sitio generado correctamente.')
  } catch (error) {
    console.error('❌ Error:', error.stack || error)
    process.exit(1)
  }
}

buildSite()
