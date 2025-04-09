const fs = require("fs");
const path = require("path");

// 1. Configuración mejorada
const CONFIG = {
  sourceRoot: path.join(__dirname, "documents"),
  outputRoot: path.join(__dirname, "docs"),
  baseHref: "/Inst_166_Tecda_Tandil",
  excludes: [
    "node_modules",
    ".git",
    "dist",
    "*.md",
    ".DS_Store",
    "links.txt",
    "*.txt",
  ],
  // Se añaden extensiones que deberían abrirse en modal o visores específicos
  modalExtensions: [".sh"],
  // Extensiones para documentos Word
  wordExtensions: [".doc", ".docx"],
  // Extensiones para presentaciones PowerPoint
  pptExtensions: [".ppt", ".pptx"],
  // Modo debug para mostrar información detallada
  debug: process.argv.includes("--debug"),
};

// Función para imprimir mensajes de debug
function logDebug(message) {
  if (CONFIG.debug) {
    console.log(`🔍 DEBUG: ${message}`);
  }
}

// Función para imprimir mensajes de progreso
function logProgress(message) {
  console.log(`📝 ${message}`);
}

// 2. Función para validar configuraciones
function validateConfig(config) {
  try {
    logProgress("Validando configuración...");
    if (!fs.existsSync(config.sourceRoot)) {
      throw new Error(`El directorio raíz ${config.sourceRoot} no existe.`);
    }
    logDebug(`Directorio fuente encontrado: ${config.sourceRoot}`);

    if (!fs.existsSync(config.outputRoot)) {
      logProgress(`Creando directorio de salida: ${config.outputRoot}`);
      fs.mkdirSync(config.outputRoot, { recursive: true });
    } else {
      logDebug(`Directorio de salida ya existe: ${config.outputRoot}`);
    }

    logProgress("Configuración validada correctamente.");
  } catch (error) {
    console.error(`❌ Error en la configuración: ${error.message}`);
    process.exit(1);
  }
}

// 3. Función para verificar exclusiones
function isExcluded(name) {
  const excluded = CONFIG.excludes.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    return regex.test(name);
  });

  if (excluded && CONFIG.debug) {
    logDebug(`Archivo excluido: ${name}`);
  }

  return excluded;
}

// 4. Función para formatear nombres amigables para la vista
function formatName(name) {
  const nameWithoutExt = name.replace(/\.[^/.]+$/, ""); // Eliminar la extensión
  const formattedName = nameWithoutExt
    .replace(/_/g, " ") // Reemplazar guiones bajos por espacios
    .replace(/anio/g, "año") // Corregir "anio" a "año"
    .toLowerCase()
    .replace(/\b(\w)(\w*)/g, (match, firstLetter, rest) => {
      return firstLetter.toUpperCase() + rest; // Capitalizar la primera letra
    });

  logDebug(`Nombre formateado: "${name}" → "${formattedName}"`);
  return formattedName;
}

// Función para verificar si un archivo debe abrirse en modal
function shouldOpenInModal(fileExt) {
  const result = CONFIG.modalExtensions.includes(fileExt);
  if (result) {
    logDebug(`Archivo con extensión ${fileExt} se abrirá en modal`);
  }
  return result;
}

// Función para verificar si un archivo es un documento Word
function isWordDocument(fileExt) {
  const result = CONFIG.wordExtensions.includes(fileExt);
  if (result) {
    logDebug(`Archivo con extensión ${fileExt} se abrirá en el visor de Word`);
  }
  return result;
}

// Función para verificar si un archivo es una presentación PowerPoint
function isPowerPointPresentation(fileExt) {
  const result = CONFIG.pptExtensions.includes(fileExt);
  if (result) {
    logDebug(
      `Archivo con extensión ${fileExt} se abrirá en el visor de PowerPoint`
    );
  }
  return result;
}

// 5. Generador de HTML para directorios y archivos
function generateHTML(title, items = { dirs: [], files: [] }, currentPath) {
  logDebug(`Generando HTML para: ${currentPath || "raíz"} (${title})`);
  logDebug(`- Directorios: ${items.dirs.length}`);
  logDebug(`- Archivos: ${items.files.length}`);

  const dirs = items.dirs || []; // Aseguramos que dirs siempre sea un array
  const files = items.files || []; // Aseguramos que files siempre sea un array
  const rootPath =
    currentPath.split("/").filter(Boolean).fill("..").join("/") || ".";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Instituto 166</title>
  <link rel="stylesheet" href="${rootPath}/css/styles.css">
  <script src="${rootPath}/scripts/modal.js"></script>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <nav class="breadcrumb">
      <a href="${rootPath}/index.html">Inicio</a> /
      ${currentPath
      .split("/")
      .filter(Boolean)
      .map((dir, i, arr) => {
        const path = arr.slice(0, i + 1).join("/");
        return `<a href="${rootPath}/${path}/index.html">${formatName(
          dir
        )}</a>`;
      })
      .join(" / ")}
    </nav>
  </header>

  <main>
    <div class="note">
      <p>Esta sección contiene recursos para <strong>${title}</strong>. Explora los directorios y archivos disponibles.</p>
    </div>

    ${dirs.length > 0
      ? `
      <h2>🗂️ Directorios</h2>
      <div class="tech-container">
        ${dirs
        .map(
          (dir) => `
          <div class="tech-box" style="border-top-color: #3498db;">
            <div class="tech-title">${formatName(dir.name)}</div>
            <div class="tech-image">📁</div>
            <p>Accede a este directorio para ver su contenido.</p>
            <p><a href="${dir.name
            }/index.html" style="display: inline-block; padding: 8px 15px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px;">Explorar</a></p>
          </div>`
        )
        .join("")}
      </div>`
      : ""
    }

    ${files.length > 0
      ? `
      <h2>📄 Archivos</h2>
      <table class="comparison-table">
        <tr>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Acción</th>
        </tr>
        ${files
        .map((file) => {
          const isPDF = file.ext === ".pdf";
          const isWord = isWordDocument(file.ext);
          const isPowerPoint = isPowerPointPresentation(file.ext);
          const useModal = shouldOpenInModal(file.ext);

          let fileLink;
          let clickAction = "";

          if (isPDF) {
            fileLink = `${rootPath}/pdf-viewer.html?file=${encodeURIComponent(
              currentPath + "/" + file.name
            )}`;
          } else if (isWord) {
            fileLink = `${rootPath}/word-viewer.html?file=${encodeURIComponent(
              currentPath + "/" + file.name
            )}`;
          } else if (isPowerPoint) {
            fileLink = `${rootPath}/powerpoint-viewer.html?file=${encodeURIComponent(
              currentPath + "/" + file.name
            )}`;
          } else if (useModal) {
            fileLink = "#";
            clickAction = ` onclick="showFile('${file.name}'); return false;"`;
          } else {
            fileLink = file.name;
          }

          // Determinar el icono según el tipo de archivo
          let fileIcon = "📄";
          let fileType = "Documento";
          if (isPDF) {
            fileIcon = "📕";
            fileType = "PDF";
          }
          if (isWord) {
            fileIcon = "📝";
            fileType = "Word";
          }
          if (isPowerPoint) {
            fileIcon = "📊";
            fileType = "PowerPoint";
          }
          if (file.ext === ".html") {
            fileIcon = "🌐";
            fileType = "HTML";
          }
          if (file.ext === ".js") {
            fileIcon = "⚙️";
            fileType = "JavaScript";
          }
          if (file.ext === ".css") {
            fileIcon = "🎨";
            fileType = "CSS";
          }
          if (file.ext === ".sh") {
            fileIcon = "💻";
            fileType = "Script";
          }

          return `
          <tr>
            <td><strong>${fileIcon} ${formatName(file.name)}</strong></td>
            <td>${fileType}</td>
            <td>
              <a href="${fileLink}"${clickAction}${!useModal && !isPDF && !isWord && !isPowerPoint
              ? ' target="_blank"'
              : ""
            } class="action-button">Ver</a>
            </td>
          </tr>`;
        })
        .join("")}
      </table>
      `
      : ""
    }

    ${files.length === 0 && dirs.length === 0
      ? `
      <div class="note" style="background-color: #e8f4f8; border-left-color: #3498db;">
        <p>No hay contenido disponible en este directorio.</p>
      </div>
      `
      : ""
    }
  </main>

  <!-- Modal para visualización de archivos -->
  <div id="overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 1000;"></div>
  <div id="file-viewer" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border-radius: 8px; width: 80%; max-height: 80%; overflow-y: auto; z-index: 1001; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
    <button onclick="closeViewer()" style="position: absolute; top: 10px; right: 10px; cursor: pointer; background: none; border: none; font-size: 18px;">✖</button>
    <pre id="file-content" style="white-space: pre-wrap; overflow-x: auto; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd;"></pre>
  </div>

  <footer>
    <div class="footer-bar">
      <button onclick="window.history.back()">⬅ Retroceder</button>
      <button onclick="window.location.href='${rootPath}/index.html'">
        🏠 Página de Inicio
      </button>
    </div>
  </footer>
</body>
</html>`;
}

// 6. Generador de la página personalizada de inicio
function generateHomePage(outputRoot) {
  logProgress("Verificando página de inicio...");
  const homePagePath = path.join(outputRoot, "index.html");
  if (fs.existsSync(homePagePath)) {
    logProgress(
      "✅ Página personalizada de inicio encontrada (index.html). No se sobrescribirá."
    );
    return;
  }

  logProgress("Generando página de inicio predeterminada...");
  const defaultHomeHTML = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Instituto 166 - Página de Inicio</title>
    <link rel="stylesheet" href="css/styles.css" />
    <script src="scripts/modal.js"></script>
  </head>
  <body>
    <header>
      <h1>Bienvenido al Instituto 166</h1>
    </header>

    <main>
      <div class="note">
        <p><strong>Tecnicatura Superior en Análisis, Desarrollo y Programación de Aplicaciones</strong> - Recursos educativos y materiales de estudio.</p>
      </div>

      <h2>🎓 Formación Técnica</h2>
      
      <div class="tech-container">
        <div class="tech-box bios">
          <div class="tech-title">Contenido Educativo</div>
          <div class="tech-image">📚</div>
          <p>Accede a todos los materiales de estudio organizados por temas y materias.</p>
          <p><a href="content/index.html" class="action-button">Explorar Contenido</a></p>
        </div>
      </div>

      <h2>📅 Horarios</h2>
      
      <div class="boot-process horario-section">
        <div class="boot-step">Las clases se dictan de <strong>Lunes a Viernes</strong> en el horario de 18:00 a 22:00 hs.</div>
        <div class="boot-step">La distribución de materias se organiza en bloques de 2 horas.</div>
        <div class="boot-step">Haz clic en el botón correspondiente para ver el horario de cada año.</div>
      
        <div class="calendar-buttons">
          <button class="calendar-button" onclick="showCalendar('horario-primero')">📅 Ver Horario Primer Año</button>
          <button class="calendar-button" onclick="showCalendar('horario-segundo')">📅 Ver Horario Segundo Año</button>
        </div>
      </div>

      <!-- Calendarios ocultos para ser mostrados en el modal -->
      <div style="display: none;">
        <div id="horario-primero" class="calendar-content">
          <table class="comparison-table">
            <tr>
              <th>Horario</th>
              <th>Lunes</th>
              <th>Martes</th>
              <th>Miércoles</th>
              <th>Jueves</th>
              <th>Viernes</th>
            </tr>
            <tr>
              <td>18:00 - 20:00</td>
              <td><strong>EDI</strong></td>
              <td><strong>Sistemas de computación</strong></td>
              <td><strong>Análisis matemático</strong></td>
              <td><strong>Sistemas de computación</strong></td>
              <td><strong>Álgebra</strong></td>
            </tr>
            <tr>
              <td>20:00 - 22:00</td>
              <td><strong>Ingles</strong></td>
              <td><strong>Programación</strong></td>
              <td><strong>Admin de organizaciones</strong></td>
              <td><strong>Programación</strong></td>
              <td><strong>Met de la Investigación</strong></td>
            </tr>
          </table>
        </div>

        <div id="horario-segundo" class="calendar-content">
          <table class="comparison-table">
            <tr>
              <th>Horario</th>
              <th>Lunes</th>
              <th>Martes</th>
              <th>Miércoles</th>
              <th>Jueves</th>
              <th>Viernes</th>
            </tr>
            <tr>
              <td>18:00 - 20:00</td>
              <td><strong>POO</strong></td>
              <td><strong>Seminario de Programación</strong></td>
              <td><strong>Inglés Técnico II</strong></td>
              <td><strong>Bases de Datos</strong></td>
              <td><strong>Sistemas Operativos</strong></td>
            </tr>
            <tr>
              <td>20:00 - 22:00</td>
              <td><strong>Análisis de Sistemas</strong></td>
              <td><strong>Análisis Matemático II</strong></td>
              <td><strong>EDI</strong></td>
              <td><strong>POO</strong></td>
              <td><strong>Probabilidad y Estadística</strong></td>
            </tr>
          </table>
        </div>
      </div>
    </main>

    <footer>
      <div class="footer-bar">
        <button onclick="window.history.back()">⬅ Retroceder</button>
        <button onclick="window.location.href='index.html'">🏠 Página de Inicio</button>
      </div>
    </footer>

    <!-- Modal para visualización de calendarios -->
    <div id="overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 1000;"></div>
    <div id="calendar-modal">
      <div class="modal-header">
        <h2 id="modal-title">Horario</h2>
        <button class="close-button" onclick="closeCalendarModal()">✖</button>
      </div>
      <div id="modal-content"></div>
    </div>
  </body>
</html>
`;

  fs.writeFileSync(homePagePath, defaultHomeHTML);
  logProgress("✅ Página de inicio generada correctamente.");
}

// 7. Procesador de directorios
function processDirectory(srcPath, destPath, relativePath = "") {
  logProgress(`Procesando directorio: ${relativePath || "raíz"}`);

  try {
    const items = fs.readdirSync(srcPath, { withFileTypes: true });
    logDebug(`- Encontrados ${items.length} elementos en ${srcPath}`);

    const contents = { dirs: [], files: [] };

    fs.mkdirSync(destPath, { recursive: true });
    logDebug(`- Directorio de destino creado: ${destPath}`);

    items.forEach((item) => {
      if (isExcluded(item.name)) return;

      const itemRelPath = path.join(relativePath, item.name);
      const itemDest = path.join(destPath, item.name);

      if (item.isDirectory()) {
        logDebug(`- Procesando subdirectorio: ${item.name}`);
        contents.dirs.push({ name: item.name, path: itemRelPath });
        processDirectory(path.join(srcPath, item.name), itemDest, itemRelPath);
      } else {
        logDebug(`- Copiando archivo: ${item.name}`);
        contents.files.push({ name: item.name, ext: path.extname(item.name) });
        fs.copyFileSync(path.join(srcPath, item.name), itemDest);
      }
    });

    if (contents.dirs.length + contents.files.length > 0) {
      const indexPath = path.join(destPath, "index.html");
      logDebug(`- Generando index.html en: ${indexPath}`);
      fs.writeFileSync(
        indexPath,
        generateHTML(path.basename(srcPath) || "Inicio", contents, relativePath)
      );
      logProgress(`✅ Generado index.html para: ${relativePath || "raíz"}`);
    } else {
      logProgress(
        `⚠️ No se generó index.html para directorio vacío: ${relativePath || "raíz"
        }`
      );
    }
  } catch (error) {
    console.error(
      `❌ Error al procesar directorio ${srcPath}: ${error.message}`
    );
    if (CONFIG.debug) {
      console.error(error.stack);
    }
  }
}

// 8. Función principal
async function buildSite() {
  console.log("🏗 Construyendo sitio...");
  console.log(`🔧 Modo debug: ${CONFIG.debug ? "ACTIVADO" : "DESACTIVADO"}`);

  try {
    validateConfig(CONFIG);

    // Limpiar directorio de salida
    if (fs.existsSync(CONFIG.outputRoot)) {
      logProgress(`Limpiando directorio de salida: ${CONFIG.outputRoot}`);
      fs.rmSync(CONFIG.outputRoot, { recursive: true });
    }

    fs.mkdirSync(CONFIG.outputRoot, { recursive: true });
    logProgress(`Directorio de salida creado: ${CONFIG.outputRoot}`);

    // Copiar archivos estáticos
    logProgress("Copiando archivos estáticos...");
    const staticFiles = {
      "css/styles.css": path.join(__dirname, "css/styles.css"),
      "favicon.ico": path.join(__dirname, "favicon.ico"),
      "pdf-viewer.html": path.join(__dirname, "pdf-viewer.html"),
      "word-viewer.html": path.join(__dirname, "word-viewer.html"),
      "powerpoint-viewer.html": path.join(__dirname, "powerpoint-viewer.html"), // Añadido el visor de PowerPoint
      "scripts/modal.js": path.join(__dirname, "scripts/modal.js"),
    };

    Object.entries(staticFiles).forEach(([file, source]) => {
      const dest = path.join(CONFIG.outputRoot, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        logDebug(`- Copiado: ${file}`);
      } else {
        logProgress(`⚠️ Archivo estático no encontrado: ${source}`);
      }
    });
    logProgress("✅ Archivos estáticos copiados.");

    // Generar directorio de contenido
    logProgress("Generando estructura de directorios y archivos...");
    processDirectory(
      CONFIG.sourceRoot,
      path.join(CONFIG.outputRoot, "content"),
      "content"
    );

    // Generar o respetar la página de inicio
    generateHomePage(CONFIG.outputRoot);

    console.log("✅ Sitio generado correctamente.");
    console.log(`📂 Ubicación: ${CONFIG.outputRoot}`);

    // Estadísticas finales en modo debug
    if (CONFIG.debug) {
      const stats = {
        directorios: 0,
        archivos: 0,
        totalBytes: 0,
      };

      function countItems(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            stats.directorios++;
            countItems(fullPath);
          } else {
            stats.archivos++;
            stats.totalBytes += fs.statSync(fullPath).size;
          }
        }
      }

      countItems(CONFIG.outputRoot);

      console.log("📊 Estadísticas de generación:");
      console.log(`- Directorios generados: ${stats.directorios}`);
      console.log(`- Archivos generados: ${stats.archivos}`);
      console.log(`- Tamaño total: ${(stats.totalBytes / 1024).toFixed(2)} KB`);
    }
  } catch (error) {
    console.error("❌ Error en la generación del sitio:");
    console.error(CONFIG.debug ? error.stack : error.message);
    process.exit(1);
  }
}

// Mostrar ayuda si se solicita
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Generador de sitio estático para Instituto 166
Uso: node generate-pages.js [opciones]

Opciones:
  --debug    Activa el modo de depuración con información detallada
  --help, -h Muestra esta ayuda
  
Ejemplo:
  node generate-pages.js --debug
  `);
  process.exit(0);
}

buildSite();
