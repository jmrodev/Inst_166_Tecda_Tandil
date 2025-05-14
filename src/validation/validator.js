const fs = require("fs");
const CONFIG = require("../config/config");
const { logDebug, logProgress, logError } = require("../logging/logger");

function validateAppConfig() {
  try {
    logProgress("Validando configuración...");
    if (!fs.existsSync(CONFIG.sourceRoot)) {
      throw new Error(`El directorio fuente ${CONFIG.sourceRoot} no existe.`);
    }
    logDebug(`Directorio fuente encontrado: ${CONFIG.sourceRoot}`);
    return true;
  } catch (error) {
    logError(`Error en la configuración: ${error.message}`);
    return false;
  }
}

function isExcluded(name) {
  return CONFIG.excludes.some((pattern) => new RegExp(`^${pattern.replace(/\*/g, ".*")}$`).test(name));
}

module.exports = {
  validateAppConfig,
  isExcluded,
};