const fs = require("fs");
const path = require("path");
const { CONFIG, logDebug, logProgress } = require('./config');

function copyStaticAssets() {
  logProgress("Copiando archivos estáticos...");
  Object.entries(CONFIG.staticFiles).forEach(([file, source]) => {
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
}

function generatePDFViewer() {
  const pdfViewerTemplatePath = path.join(__dirname, "../templates/pdf-viewer.html");
  const pdfViewerPath = path.join(CONFIG.outputRoot, "pdf-viewer.html");
  try {
    // Check if the template file exists
    if (!fs.existsSync(pdfViewerTemplatePath)) {
        logProgress(`⚠️ Plantilla de visor PDF no encontrada en: ${pdfViewerTemplatePath}`);
        // Fallback to string literal if template is missing
        const fallbackPdfViewerHTML = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Visor de PDF</title>
    <link rel="stylesheet" href="css/pdf-viewer.css" />
  </head>
  <body>
    <div id="pdf-container">
      <div id="pdf-viewer"></div>
      <div class="controls">
        <button id="prev">Anterior</button>
        <span>
          Página
          <input type="number" id="page-num" min="1" value="1" />
          de
          <span id="page-count">0</span>
        </span>
        <button id="next">Siguiente</button>
        <div class="zoom-controls">
          <button id="zoom-out" title="Reducir">-</button>
          <span id="zoom-level">100%</span>
          <button id="zoom-in" title="Ampliar">+</button>
        </div>
        <div class="fit-controls">
          <button id="fit-width" title="Ajustar al ancho">↔</button>
          <button id="fit-height" title="Ajustar al alto">↕</button>
        </div>
        <button id="fullscreen">Pantalla completa</button>
      </div>
    </div>

    <!-- PDF.js v3.11.174 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      // Configurar el worker de PDF.js antes de cargar el script principal
      window['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    </script>
    <script src="scripts/pdf-viewer.js"></script>
  </body>
</html>`;
        fs.writeFileSync(pdfViewerPath, fallbackPdfViewerHTML);
        logProgress("✅ Visor PDF generado correctamente (fallback).");
        return;
    }

    const pdfViewerHTML = fs.readFileSync(pdfViewerTemplatePath, "utf-8");
    fs.writeFileSync(pdfViewerPath, pdfViewerHTML);
    logProgress("✅ Visor PDF generado correctamente desde plantilla.");
  } catch (error) {
    console.error(`❌ Error al generar el visor PDF: ${error.message}`);
  }
}

function generateHomePage() {
  logProgress("Verificando página de inicio...");
  const homePagePath = path.join(CONFIG.outputRoot, "index.html");
  // Check if a custom index.html already exists in docs/
   if (fs.existsSync(homePagePath) && fs.statSync(homePagePath).size > 0) {
    const content = fs.readFileSync(homePagePath, 'utf8').trim();
    if (content) { // Check if content is not empty
        logProgress("✅ Página de inicio personalizada encontrada (docs/index.html). No se sobrescribirá.");
        return;
    }
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
      <!--
      <div class="note">
        <p><strong>Tecnicatura Superior en Análisis, Desarrollo y Programación de Aplicaciones</strong> - Recursos educativos y materiales de estudio.</p>
      </div>
    
      <h2>🎓 Formación Técnica</h2>
    
      -->  
    
      <div class="tech-container">
        <div class="tech-box bios">
        
        <!--
        <div class="tech-title">Contenido Educativo</div>
        -->  
        
        
        <div class="tech-image">📚</div>
          <div id="content-description">
            <p>Accede a todos los materiales de estudio</p>
            <p>organizados por temas y materias.</p> 
          </div>
            <p>
                <a 
                    href="content/index.html" 
                    class="action-button"
                >
                    Explorar Contenido
                </a>
            </p>
       
        </div>
      </div>

      <h3>📅 Horarios</h3>
      
      <div class="boot-process horario-section tech-box">
      
      <!--
      <div class="boot-step">Las clases se dictan de <strong>Lunes a Viernes</strong> en el horario de 18:00 a 22:00 hs.</div>
        <div class="boot-step">La distribución de materias se organiza en bloques de 2 horas.</div>
        <div class="boot-step">Haz clic en el botón correspondiente para ver el horario de cada año.</div>
      -->

        <div class="calendar-buttons">
          <button class="calendar-button" onclick="showCalendar('horario-primero')">📅 Ver Horario Primer Año</button>
          <button class="calendar-button" onclick="showCalendar('horario-segundo')">📅 Ver Horario Segundo Año</button>
        </div>
      </div>

      <!-- Calendarios ocultos para ser mostrados en el modal -->
      <div style="display: none;">
      <div id="table-container">
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
              <td><strong>Administración de organizaciones</strong></td>
              <td><strong>Programación</strong></td>
              <td><strong>Metodología de la Investigación</strong></td>
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


module.exports = {
  generatePDFViewer,
  generateHomePage,
  copyStaticAssets,
};
