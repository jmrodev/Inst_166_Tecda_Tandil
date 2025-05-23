const fs = require("fs");
const path = require("path");
const { CONFIG, logDebug, logProgress } = require('./config');
const { isExcluded } = require('./file-utils');
const { generateHTML } = require('./html-generator');

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

module.exports = {
  validateConfig,
  processDirectory,
};
