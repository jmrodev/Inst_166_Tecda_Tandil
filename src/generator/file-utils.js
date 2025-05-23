const { CONFIG, logDebug } = require('./config');

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

function shouldOpenInModal(fileExt) {
  const result = CONFIG.modalExtensions.includes(fileExt);
  if (result) {
    logDebug(`Archivo con extensión ${fileExt} se abrirá en modal`);
  }
  return result;
}

function isWordDocument(fileExt) {
  const result = CONFIG.wordExtensions.includes(fileExt);
  if (result) {
    logDebug(`Archivo con extensión ${fileExt} se abrirá en el visor de Word`);
  }
  return result;
}

function isPowerPointPresentation(fileExt) {
  const result = CONFIG.pptExtensions.includes(fileExt);
  if (result) {
    logDebug(
      `Archivo con extensión ${fileExt} se abrirá en el visor de PowerPoint`
    );
  }
  return result;
}

module.exports = {
  isExcluded,
  formatName,
  shouldOpenInModal,
  isWordDocument,
  isPowerPointPresentation,
};
