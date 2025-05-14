const path = require("path");

const CONFIG = {
  sourceRoot: path.join(__dirname, "../../documents"),
  outputRoot: path.join(__dirname, "../../docs"),
  assetsSourceDir: path.join(__dirname, "../../assets_src"),
  baseHref: "/",
  excludes: ["node_modules", ".git", "dist", "*.md", ".DS_Store", "links.txt"],
  modalExtensions: [".sh", ".txt", ".json", ".xml", ".csv", ".log"],
  wordExtensions: [".doc", ".docx"],
  pptExtensions: [".ppt", ".pptx"],
  staticFiles: {
    "css/styles.css": "css/styles.css",
    "css/pdf-viewer.css": "css/pdf-viewer.css",
    "css/viewer-styles.css": "css/viewer-styles.css",
    "scripts/modal.js": "scripts/modal.js",
    "scripts/pdf-viewer.js": "scripts/pdf-viewer.js",
    "favicon.ico": "favicon.ico",
  },
  debug: process.argv.includes("--debug"),
  cleanOutput: !process.argv.includes("--no-clean"),
  forceHomePage: process.argv.includes("--force-home"),
};

CONFIG.getBaseHrefForTag = function () {
  return this.baseHref.endsWith("/") ? this.baseHref : this.baseHref + "/";
};

CONFIG.getBaseHrefPrefix = function () {
  return this.baseHref === "/" ? "" : this.baseHref;
};

if (CONFIG.baseHref && !CONFIG.baseHref.startsWith("/")) {
  console.error(`❌ CONFIG.baseHref debe comenzar con '/' o estar vacío.`);
  process.exit(1);
}

module.exports = CONFIG;