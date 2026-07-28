const path = require("path");

const CONFIG = {
  sourceRoot: path.join(__dirname, "../../documents"),
  outputRoot: path.join(__dirname, "../../docs"),
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
  modalExtensions: [".sh"],
  wordExtensions: [".doc", ".docx"],
  pptExtensions: [".ppt", ".pptx"],
  debug: process.argv.includes("--debug"),
  staticFiles: {
    "css/styles.css": path.join(__dirname, "../assets/css/styles.css"),
    "css/pdf-viewer.css": path.join(__dirname, "../assets/css/pdf-viewer.css"),
    "css/viewer-common.css": path.join(__dirname, "../assets/css/viewer-common.css"),
    "scripts/modal.js": path.join(__dirname, "../assets/js/modal.js"),
    "scripts/pdf-viewer.js": path.join(__dirname, "../assets/js/pdf-viewer.js"),
    "scripts/word-viewer.js": path.join(__dirname, "../assets/js/word-viewer.js"),
    "scripts/powerpoint-viewer.js": path.join(__dirname, "../assets/js/powerpoint-viewer.js"),
    "scripts/ppt-viewer.js": path.join(__dirname, "../assets/js/ppt-viewer.js"),
    "pdf-viewer.html": path.join(__dirname, "../templates/pdf-viewer.html"),
    "word-viewer.html": path.join(__dirname, "../templates/word-viewer.html"),
    "powerpoint-viewer.html": path.join(__dirname, "../templates/powerpoint-viewer.html"),
    "ppt-viewer.html": path.join(__dirname, "../templates/ppt-viewer.html"),
  },
};

function logDebug(message) {
  if (CONFIG.debug) {
    console.log(`🔍 DEBUG: ${message}`);
  }
}

function logProgress(message) {
  console.log(`📝 ${message}`);
}

module.exports = {
  CONFIG,
  logDebug,
  logProgress,
};
