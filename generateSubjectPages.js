const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const subjectsDir = path.join(baseDir, 'subjects');
const filesJson = path.join(baseDir, 'files.json');

const generateSubjectPages = () => {
    if (!fs.existsSync(filesJson)) {
        console.error('Error: files.json no existe. Asegúrate de generarlo antes de ejecutar este script.');
        return;
    }

    const subjects = JSON.parse(fs.readFileSync(filesJson, 'utf-8'));

    Object.keys(subjects).forEach((subject) => {
        console.log(`Procesando materia: ${subject}`);
        const subjectDir = path.join(subjectsDir, subject);
        const subjectIndex = path.join(subjectDir, 'index.html');

        // Crear la carpeta de la materia si no existe
        if (!fs.existsSync(subjectDir)) {
            console.log(`Creando carpeta para la materia: ${subject}`);
            fs.mkdirSync(subjectDir, { recursive: true });
        }

        // Buscar carpetas dentro de la materia
        const subfolders = fs.readdirSync(subjectDir, { withFileTypes: true })
            .filter(item => item.isDirectory())
            .map(folder => folder.name);

        let dynamicLinks = '';

        subfolders.forEach(folder => {
            const folderPath = path.join(subjectDir, folder);
            const files = fs.readdirSync(folderPath).filter(file => file.includes('.')); // Archivos con extensión

            if (files.length > 0) {
                dynamicLinks += `
                    <h2>${folder.charAt(0).toUpperCase() + folder.slice(1)} Files</h2>
                    <ul>
                        ${files.map(file => {
                            const isShellScript = file.endsWith('.sh'); // Verificar si es un archivo .sh
                            return `
                                <li>
                                    <a href="${folder}/${file}" ${isShellScript ? 'download' : ''}>
                                        ${isShellScript ? 'Descargar' : 'Ver'} ${file}
                                    </a>
                                </li>`;
                        }).join('')}
                    </ul>
                `;
            }
        });

        // Generar el contenido del archivo index.html
        const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <link rel="stylesheet" href="../../styles.css">
</head>
<body>
    <header id="header">
        <nav>
            <a href="../../index.html">Home</a>
        </nav>
    </header>
    <main>
        <h1>${subject}</h1>
        ${dynamicLinks || '<p>No files available for this subject.</p>'}
    </main>
    <footer id="footer">
        <p>&copy; 2023 Vanilla JS SPA</p>
    </footer>
</body>
</html>
        `;

        // Escribir el archivo index.html
        try {
            fs.writeFileSync(subjectIndex, indexContent);
            console.log(`Archivo index.html generado para la materia: ${subject}`);
        } catch (error) {
            console.error(`Error al generar index.html para la materia ${subject}:`, error);
        }
    });
};

generateSubjectPages();
