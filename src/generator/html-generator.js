const { logDebug } = require('./config');
const { formatName, shouldOpenInModal, isWordDocument, isPowerPointPresentation } = require('./file-utils');

function generateHTML(title, items = { dirs: [], files: [] }, currentPath) {
  logDebug(`Generando HTML para: ${currentPath || "raíz"} (${title})`);
  logDebug(`- Directorios: ${items.dirs.length}`);
  logDebug(`- Archivos: ${items.files.length}`);

  const dirs = items.dirs || [];
  const files = items.files || [];
  const pathParts = (currentPath || "").split("/").filter(Boolean);
  const rootPath = pathParts.length > 0 ? pathParts.map(() => "..").join("/") : ".";

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
      ${pathParts.map((dir, i, arr) => {
        const path = arr.slice(0, i + 1).join("/");
        return `<a href="${rootPath}/${path}/index.html">${formatName(dir)}</a>`;
      }).join(" / ")}
    </nav>
  </header>

  <main>
    <!-- <div class="note">
       <p>Esta sección contiene recursos para <strong>${title}</strong>. Explora los directorios y archivos disponibles.</p>
     </div>
     -->
 
    ${dirs.length > 0
      ? `
      <!-- 
      <h2>🗂️ Directorios</h2>
       -->

      <div class="tech-container">
        ${dirs
        .map(
          (dir) => `
          <a href="${rootPath}/${dir.path}/index.html" class="tech-box-link">
            <div class="tech-box" style="border-top-color: #3498db;">
              <div class="tech-title">${formatName(dir.name)}</div>
              <div class="tech-image">📁</div>
              <p class="button-container"><span class="action-button">Explorar</span></p>
            </div>
          </a>`
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
            fileLink = `${rootPath}/ppt-viewer.html?file=${encodeURIComponent(
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
              ? ' target="_blank"' // Open in a new tab for non-modal files
              : "" // No target attribute for modal or specific viewers
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
      <div class="note note-empty">
        <p>No hay contenido disponible en este directorio.</p>
      </div>
      `
      : ""
    }
  </main>

  <!-- Modal para visualización de archivos -->
  <div id="overlay" class="modal-overlay" style="display: none;"></div>
  <div id="file-viewer" class="file-viewer-modal" style="display: none;">
    <button onclick="closeViewer()" class="file-viewer-close">✖</button>
    <pre id="file-content" class="file-content"></pre>
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

module.exports = {
  generateHTML,
};
