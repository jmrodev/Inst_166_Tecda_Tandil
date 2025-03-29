# Inst_166_Tecda_Tandil

Bienvenido/a al repositorio de la aplicación **Inst_166_Tecda_Tandil**. Este proyecto está diseñado para facilitar la gestión de materias y la organización de archivos relacionados con cada una de ellas. Es ideal para instituciones educativas que buscan una solución sencilla y eficiente para manejar su información.

## 🚀 Funcionalidades principales

- **Gestión de materias**: Crea, edita y organiza materias de forma intuitiva.
- **Carga de archivos**: Sube y organiza archivos mediante la creación de carpetas específicas para cada materia.
- **Generación de páginas dinámicas**: Automatiza la creación de páginas HTML para cada materia con enlaces a los archivos disponibles.

---

## 📂 Estructura de carpetas

A continuación, se muestra un ejemplo de cómo debería organizarse el directorio `subjects` para que el sistema funcione correctamente, con los archivos organizados por tipo dentro de cada materia:

```
subjects/
├── Materia1/
│   ├── index.html
│   ├── PDFs/
│   │   ├── archivo1.pdf
│   │   ├── archivo2.pdf
│   ├── Images/
│   │   ├── imagen1.png
│   │   ├── imagen2.jpg
│   ├── Scripts/
│   │   ├── script1.sh
│   │   ├── script2.py
│   └── Others/
│       ├── archivo1.txt
│       ├── archivo2.docx
├── Materia2/
│   ├── index.html
│   ├── PDFs/
│   │   ├── archivo3.pdf
│   ├── Images/
│   │   ├── imagen3.png
│   └── Scripts/
│       ├── script3.sh
└── Materia3/
    ├── index.html
    ├── PDFs/
    │   ├── archivo4.pdf
    └── Images/
        ├── imagen4.svg
```

- **PDFs/**: Carpeta para documentos en formato PDF.
- **Images/**: Carpeta para imágenes en formatos como `.png`, `.jpg`, `.svg`, etc.
- **Scripts/**: Carpeta para scripts en formatos como `.sh`, `.py`, etc.
- **Others/**: Carpeta para otros tipos de archivos como `.txt`, `.docx`, etc.

Esta organización facilita la navegación y el acceso a los archivos según su tipo.

---

## 📚 ¿Cómo generar el archivo `files.json`?

El archivo `files.json` contiene la estructura de carpetas y archivos dentro del directorio `subjects`. Sigue estos pasos para generarlo:

1. Asegúrate de que el directorio `subjects` contenga las carpetas y archivos organizados por materia.
2. Ejecuta el siguiente comando desde la raíz del proyecto:
   ```bash
   node scripts/generateFileTree.js
   ```
3. Esto generará un archivo `files.json` en el directorio `scripts`, que incluirá la estructura de carpetas y archivos.

---

## 📂 ¿Cómo generar las páginas dinámicas para las materias?

Una vez que tengas el archivo `files.json`, puedes generar las páginas HTML dinámicas para cada materia:

1. Asegúrate de haber generado el archivo `files.json` siguiendo los pasos anteriores.
2. Ejecuta el siguiente comando desde la raíz del proyecto:
   ```bash
   node scripts/generateSubjectPages.js
   ```
3. Esto creará un archivo `index.html` dentro de cada carpeta de materia en el directorio `subjects`. Estas páginas incluirán enlaces a los archivos disponibles en cada materia.

---

## 🛠️ Requisitos técnicos

- **Node.js**: Versión 16 o superior.
- **Navegador**: Compatible con las últimas versiones de Chrome, Firefox y Edge.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas colaborar, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección de errores (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz un commit (`git commit -m "Descripción de los cambios"`).
4. Envía un pull request y espera la revisión.

---

## 📞 Soporte

Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos a través de nuestro correo: **juanmarcelo.rodrigueztandil@gmail.com**.

¡Gracias por usar **Inst_166_Tecda_Tandil**! 🎉
