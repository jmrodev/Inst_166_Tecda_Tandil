# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes (y docentes) de las carreras de Análisis de Sistemas y Programación del Instituto 166 (Tandil). Suelen ingresar en situaciones de estudio, cursada o consulta rápida, buscando apuntes, programas y horarios.

## Product Purpose

Funcionar como una wiki de documentación estática y centralizada que sirva de repositorio para apuntes, horarios y materiales de estudio del instituto.

## Positioning

Un sitio wiki estático liviano e instantáneo, autogenerado a partir de una estructura de carpetas físicas. Evita la complejidad de un CMS pesado y permite que cualquier archivo nuevo subido a las carpetas se publique automáticamente con su visor integrado.

## Operating Context

Acceso web multidispositivo (móvil y escritorio) por parte de estudiantes durante la cursada o períodos de exámenes. Se navega jerárquicamente por carpetas estructuradas por año y materia.

## Capabilities and Constraints

- **Generación Automática:** Un script de Node.js (`src/generator/main.js`) procesa archivos locales en `documents/` y genera HTML estático en `docs/`.
- **Visores Integrados:** Soporte para visualizar archivos PDF, Word (.docx) y PowerPoint (.pptx) directamente en el navegador sin descargarlos.
- **Limitación:** Al ser estático, no posee base de datos en tiempo real; se regenera ante cambios de archivos.

## Brand Commitments

- **Nombre/Identidad:** Instituto 166 Tecda Tandil.
- **Tono:** Educativo, profesional, accesible y utilitario para estudiantes de tecnología.

## Evidence on Hand

- Código fuente del generador en [src/generator/](file:///home/jmro/Projects/Inst_166_Tecda_Tandil/src/generator)
- Plantillas HTML de los visores en [src/templates/](file:///home/jmro/Projects/Inst_166_Tecda_Tandil/src/templates)
- Estilos CSS base en [src/assets/css/](file:///home/jmro/Projects/Inst_166_Tecda_Tandil/src/assets/css)

## Product Principles

- **Velocidad y Eficiencia:** Carga rápida de la documentación y navegación instantánea.
- **Facilidad de Lectura:** Contraste tipográfico óptimo y visores de documentos limpios y responsivos.
- **Navegación Intuitiva:** Jerarquía de carpetas clara y sin fricciones para encontrar archivos rápidamente.
