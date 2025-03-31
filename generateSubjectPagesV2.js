const fs = require('fs');
const path = require('path');

// Configuración
const BASE_DIR = __dirname;
const SUBJECTS_DIR = path.join(BASE_DIR, 'subjects');
const FILES_JSON = path.join(BASE_DIR, 'files.json');

// Función para normalizar nombres manteniendo capitalización original
const normalizeName = (name) => {
  return name
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
    .replace(/[^a-zA-Z0-9_\-.]/g, ''); // Elimina caracteres especiales
};

// Función para generar nombres legibles para mostrar
const createDisplayName = (filename) => {
  return filename
    .replace(/_/g, ' ') // Reemplaza guiones bajos por espacios
    .replace(/.pdf$/, '') // Elimina extensión .pdf
    .replace(/(?:^|\s)\S/g, a => a.toUpperCase()); // Capitaliza palabras
};

// Función para generar el visor PDF
const generatePDFViewerHTML = (pdfFilename, displayName, depth = 0) => {
  const backPath = '../'.repeat(depth);
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayName}</title>
    <link rel="stylesheet" href="${backPath}styles.css">
</head>
<body>
    <header id="header"></header>
    <main>
        <h1>Visualizando: ${displayName}</h1>
        <iframe src="${pdfFilename}" width="100%" height="600px" style="border: none;"></iframe>
    </main>
    <footer id="footer"></footer>
    <script src="${backPath}script.js"></script>
</body>
</html>
`;
};

// Función para generar el index de una materia
const generateIndexHTML = (title, content, depth = 0) => {
  const backPath = '../'.repeat(depth);
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${backPath}styles.css">
</head>
<body>
    <header id="header"></header>
    <main>
        <h1>${title}</h1>
        ${content}
    </main>
    <footer id="footer"></footer>
    <script src="${backPath}script.js"></script>
</body>
</html>
`;
};

// Procesar archivos PDF
const processPDFs = (folderPath, pdfFiles, depth) => {
  const pdfsDir = path.join(folderPath, 'pdfs');
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  let linksHTML = '<ul>';

  pdfFiles.forEach(file => {
    if (!file.endsWith('.pdf')) return;

    const safeName = normalizeName(file);
    const displayName = createDisplayName(safeName);
    const originalPath = path.join(folderPath, file);
    const newPdfPath = path.join(pdfsDir, safeName);
    const viewerPath = path.join(pdfsDir, `${safeName}.html`);

    // Mover/renombrar el PDF si existe en la ubicación original
    if (fs.existsSync(originalPath)) {
      fs.renameSync(originalPath, newPdfPath);
    } else if (!fs.existsSync(newPdfPath)) {
      console.warn(`El archivo PDF no existe: ${originalPath}`);
      return;
    }

    // Generar el visor HTML
    fs.writeFileSync(
      viewerPath,
      generatePDFViewerHTML(safeName, displayName, depth + 1)
    );

    linksHTML += `
      <li>
        <a href="pdfs/${safeName}.html">${displayName}</a>
      </li>`;
  });

  linksHTML += '</ul>';
  return linksHTML;
};

// Procesar una materia completa
const processSubject = (subjectName, subjectContent, parentDir, depth = 0) => {
  // Mantener la capitalización original pero normalizar caracteres especiales
  const safeSubjectName = normalizeName(subjectName);
  const subjectDir = path.join(parentDir, subjectName); // Usar el nombre original
  
  try {
    if (!fs.existsSync(subjectDir)) {
      fs.mkdirSync(subjectDir, { recursive: true });
    }

    let contentHTML = '';

    // Procesar archivos PDF en la raíz de la materia
    if (subjectContent.files) {
      contentHTML += processPDFs(subjectDir, subjectContent.files, depth);
    }

    // Procesar subcarpetas especiales (pdfs, html, images, Scripts)
    const specialFolders = ['pdfs', 'html', 'images', 'Scripts'];
    specialFolders.forEach(folder => {
      if (subjectContent[folder] && subjectContent[folder].files) {
        const folderPath = path.join(subjectDir, folder);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        contentHTML += `<h2>${folder}</h2>`;
        contentHTML += processPDFs(subjectDir, subjectContent[folder].files, depth);
      }
    });

    // Generar index.html para la materia
    const indexPath = path.join(subjectDir, 'index.html');
    fs.writeFileSync(
      indexPath,
      generateIndexHTML(subjectName, contentHTML, depth)
    );

    return true;
  } catch (error) {
    console.error(`Error procesando ${subjectName}:`, error);
    return false;
  }
};

// Función principal
const generateSubjectPages = async () => {
  try {
    // Verificar si files.json existe
    if (!fs.existsSync(FILES_JSON)) {
      throw new Error('files.json no existe. Ejecuta generateFileList.js primero.');
    }

    // Crear estructura de directorios
    if (!fs.existsSync(SUBJECTS_DIR)) {
      fs.mkdirSync(SUBJECTS_DIR, { recursive: true });
    }

    // Crear .nojekyll para GitHub Pages
    fs.writeFileSync(path.join(BASE_DIR, '.nojekyll'), '');

    // Generar index.html principal en subjects
    const subjectsIndexPath = path.join(SUBJECTS_DIR, 'index.html');
    fs.writeFileSync(
      subjectsIndexPath,
      generateIndexHTML('Materias', '<div id="app"></div>', 0)
    );

    // Leer y procesar archivo JSON
    const data = await fs.promises.readFile(FILES_JSON, 'utf-8');
    const subjects = JSON.parse(data);

    // Procesar cada materia
    let successCount = 0;
    for (const [subject, content] of Object.entries(subjects)) {
      console.log(`Procesando: ${subject}`);
      if (processSubject(subject, content, SUBJECTS_DIR, 1)) {
        successCount++;
      }
    }

    console.log('\n✅ Generación completada:');
    console.log(`- Materias procesadas: ${successCount}/${Object.keys(subjects).length}`);
    console.log('- Todos los archivos PDF han sido normalizados');
    console.log('- Visores HTML generados para cada PDF');
    console.log('- Estructura compatible con GitHub Pages');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

// Ejecutar el generador
generateSubjectPages()
  .catch((error) => {
    console.error('Error al generar las páginas de materias:', error)
    process.exit(1)
  })
  .finally(() => {
    console.log('Proceso finalizado.')
  })
// Fin del script
// Este script genera páginas HTML para cada materia en la carpeta subjects
// y normaliza los nombres de los archivos PDF, además de crear visores HTML
// para cada PDF. Se asegura de que todos los archivos tengan nombres válidos
// y legibles, y organiza la estructura de carpetas de manera adecuada.
// También maneja errores y proporciona mensajes claros sobre el progreso y los resultados.
// Asegúrate de tener el archivo files.json generado previamente con
// generateFileList.js antes de ejecutar este script.
//
// Puedes ejecutar este script con Node.js en la terminal:
// node generateSubjectPagesV2.js
// Asegúrate de tener los permisos necesarios para crear y modificar archivos
// y carpetas en el directorio donde se ejecuta el script.
// Si tienes alguna pregunta o necesitas más ayuda, no dudes en preguntar.
// Este script es parte de un proyecto más grande que organiza y presenta
// materiales de estudio de manera eficiente y accesible.
// ¡Buena suerte con tu proyecto!
// Si necesitas más funcionalidades o mejoras, no dudes en solicitarlo.
// Recuerda siempre hacer copias de seguridad de tus archivos importantes
// antes de realizar cambios masivos en la estructura de carpetas o archivos.
// ¡Feliz codificación!
// Fin del script
