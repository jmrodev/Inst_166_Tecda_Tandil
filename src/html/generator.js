// filepath: /site-generator/site-generator/src/html/generator.js
const CONFIG = require("../config/config");
const { logDebug } = require("../logging/logger");

function formatName(name) {
  return name.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function generateListPageHTML(title, items, currentPath) {
  logDebug(`Generando HTML para: ${title}`);
  const baseHref = CONFIG.getBaseHrefForTag();
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="${baseHref}">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <ul>
    ${items.map((item) => `<li><a href="${currentPath}/${item}">${formatName(item)}</a></li>`).join("")}
  </ul>
</body>
</html>`;
}

module.exports = {
  generateListPageHTML,
  formatName,
};