const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const outputFile = path.join(baseDir, 'files.json');

const generateFileTree = (dir) => {
    const result = {};
    const items = fs.readdirSync(dir, { withFileTypes: true });

    items.forEach((item) => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            // Detectar carpetas específicas como pdfs, html, images, Scripts
            if (['pdfs', 'html', 'images', 'Scripts'].includes(item.name)) {
                result[item.name] = { files: [] };
                const subItems = fs.readdirSync(fullPath);
                subItems.forEach((subItem) => {
                    const subItemPath = path.join(fullPath, subItem);
                    if (fs.statSync(subItemPath).isFile()) {
                        result[item.name].files.push(subItem);
                    }
                });
            } else {
                // Procesar otras carpetas recursivamente
                result[item.name] = generateFileTree(fullPath);
            }
        } else {
            if (!result.files) result.files = [];
            result.files.push(item.name);
        }
    });

    return result;
};

const generateFileList = () => {
    const subjectsDir = path.join(baseDir, 'subjects');
    const fileTree = fs.existsSync(subjectsDir) ? generateFileTree(subjectsDir) : {};

    fs.writeFileSync(outputFile, JSON.stringify(fileTree, null, 2));
    console.log(`File list generated at ${outputFile}`);
};

generateFileList();
