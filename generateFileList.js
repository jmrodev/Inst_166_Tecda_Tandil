const fs = require('fs')
const path = require('path')

const baseDir = __dirname
const outputFile = path.join(baseDir, 'files.json')

const generateFileTree = (dir) => {
  const result = {}
  const items = fs.readdirSync(dir, { withFileTypes: true })

  items.forEach((item) => {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      // Detectar carpetas específicas como pdfs, html, images, Scripts
      if (['pdfs', 'html', 'images', 'Scripts'].includes(item.name)) {
        result[item.name] = { files: [] }
        const subItems = fs.readdirSync(fullPath)
        subItems.forEach((subItem) => {
          const subItemPath = path.join(fullPath, subItem)
          if (fs.statSync(subItemPath).isFile()) {
            result[item.name].files.push(subItem)
          }
        })
      } else {
        // Procesar otras carpetas recursivamente
        result[item.name] = generateFileTree(fullPath)
      }
    } else {
      // Inicializar result.files como array si no existe
      if (!result.files || !Array.isArray(result.files)) {
        result.files = []
      }
      result.files.push(item.name)
    }
  })

  return result
}

const generateFileList = () => {
  try {
    const subjectsDir = path.join(baseDir, 'subjects')

    if (!fs.existsSync(subjectsDir)) {
      throw new Error('La carpeta "subjects" no existe en el directorio actual')
    }

    const fileTree = generateFileTree(subjectsDir)

    fs.writeFileSync(outputFile, JSON.stringify(fileTree, null, 2))
    console.log(
      `✅ Archivo files.json generado correctamente en: ${outputFile}`
    )
    console.log(
      `📂 Total de materias procesadas: ${Object.keys(fileTree).length}`
    )
  } catch (error) {
    console.error('❌ Error al generar la lista de archivos:', error.message)
    process.exit(1)
  }
}

generateFileList()
