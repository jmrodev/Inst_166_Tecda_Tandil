const fs = require("fs");
const path = require("path");
const { CONFIG, logDebug, logProgress } = require('./config');
const { validateConfig, processDirectory } = require('./file-processor');
const { generatePDFViewer, generateHomePage, copyStaticAssets } = require('./static-handler');

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
    copyStaticAssets();

    // Generar el visor PDF
    generatePDFViewer();

    // Generar directorio de contenido
    logProgress("Generando estructura de directorios y archivos...");
    processDirectory(
      CONFIG.sourceRoot,
      path.join(CONFIG.outputRoot, "content"),
      "content"
    );

    // Generar o respetar la página de inicio
    generateHomePage();

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
Uso: node src/generator/main.js [opciones]

Opciones:
  --debug    Activa el modo de depuración con información detallada
  --help, -h Muestra esta ayuda
  
Ejemplo:
  node src/generator/main.js --debug
  `);
  process.exit(0);
}

buildSite();
