const CONFIG = require("../config/config");

function logDebug(message) {
  if (CONFIG.debug) {
    console.log(`🔍 DEBUG: ${message}`);
  }
}

function logProgress(message) {
  console.log(`📝 ${message}`);
}

function logError(message, errorObject = null) {
  console.error(`❌ ERROR: ${message}`);
  if (errorObject && CONFIG.debug) {
    console.error(errorObject.stack || errorObject);
  }
}

module.exports = {
  logDebug,
  logProgress,
  logError,
};