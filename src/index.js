const fs = require("fs");
const path = require("path");
const CONFIG = require("./config/config");
const { validateAppConfig } = require("./validation/validator");
const { logProgress, logError } = require("./logging/logger");
const { generateListPageHTML } = require("./html/generator");
const { generateViewerHTML } = require("./viewer/viewer");

function copyStaticAssets() {
  logProgress("Copiando archivos estáticos...");
  Object.entries(CONFIG.staticFiles).forEach(([source, destination]) => {
    const sourcePath = path.join(CONFIG.assetsSourceDir, source);
    const destinationPath = path.join(CONFIG.outputRoot, destination);

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
    logProgress(`Copiado: ${source} → ${destination}`);
  });
}

function processDirectory(dirPath, outputPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirs = [];
  const files = [];

  items.forEach((item) => {
    if (item.isDirectory()) {
      dirs.push({ name: item.name });
    } else if (!CONFIG.excludes.some((pattern) => new RegExp(pattern).test(item.name))) {
      files.push({ name: item.name, ext: path.extname(item.name) });
    }
  });

  // Generar HTML para el directorio actual
  const relativePath = path.relative(CONFIG.sourceRoot, dirPath);
  const html = generateListPageHTML(
    relativePath || "Contenido",
    { dirs, files },
    relativePath
  );

  // Crear el archivo HTML en la carpeta de salida
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(path.join(outputPath, "index.html"), html);

  logProgress(`Generado: ${path.join(outputPath, "index.html")}`);

  // Procesar subdirectorios
  dirs.forEach((subDir) => {
    processDirectory(
      path.join(dirPath, subDir.name),
      path.join(outputPath, subDir.name)
    );
  });

  // Generar visores para archivos si es necesario
  files.forEach((file) => {
    if ([".pdf", ".doc", ".docx", ".ppt", ".pptx"].includes(file.ext)) {
      const viewerHTML = generateViewerHTML(file.ext, path.join(relativePath, file.name));
      const viewerFileName = `${path.basename(file.name, file.ext)}-viewer.html`;
      fs.writeFileSync(path.join(outputPath, viewerFileName), viewerHTML);
      logProgress(`Generado visor: ${path.join(outputPath, viewerFileName)}`);
    }
  });
}

function main() {
  logProgress("Iniciando generación del sitio...");

  if (!validateAppConfig()) {
    logError("Configuración inválida. Abortando.");
    return;
  }

  // Limpiar la carpeta de salida si es necesario
  if (CONFIG.cleanOutput && fs.existsSync(CONFIG.outputRoot)) {
    logProgress("Limpiando carpeta de salida...");
    fs.rmSync(CONFIG.outputRoot, { recursive: true, force: true });
  }

  // Copiar archivos estáticos
  copyStaticAssets();

  // Procesar la carpeta de documentos
  processDirectory(CONFIG.sourceRoot, CONFIG.outputRoot);

  logProgress("Sitio generado exitosamente.");
}

main();
