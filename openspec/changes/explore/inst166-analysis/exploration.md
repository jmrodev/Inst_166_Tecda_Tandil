# Exploration: Análisis Integral Inst_166_Tecda_Tandil

## Current State

Batch processor Node.js 18 + pnpm 8, CommonJS, sin framework. Pipeline en `src/generator/main.js`: valida config → limpia `docs/` → copia assets estáticos (CSS/JS desde `src/assets/`, templates desde `src/templates/`) → genera PDF viewer (con fallback string si falta template) → recorre `documents/` recursivamente copiando archivos raw y generando `index.html` por directorio con navegación, breadcrumbs, y links tipo-aware (PDF→visor, Word→Mammoth.js, PPT→mensaje "no disponible", .sh→modal) → genera homepage con horarios. ~754 archivos, 0 tests, 0 linters, 0 formatters.

## What Works Well

- **Separación de responsabilidades limpia**: 6 módulos (config, file-utils, file-processor, html-generator, static-handler, main) con single responsibility
- **PDF viewer completo**: zoom con rueda + pinch, fullscreen, fit-width/height, pan, keyboard nav, descarga
- **CI/CD funcional**: GitHub Actions build on push, auto-commit `docs/` a la branch
- **HTML semántico y responsive**: breadcrumbs funcionales, tech-box grid, tablas de archivos
- **Fallback en PDF viewer**: si falta template, genera HTML inline
- **Manejo de exclusión**: glob patterns funcionales para ignorar archivos

## Pain Points

- **`generate-pages.js` monolítico (684 líneas) en raíz**: versión anterior sin refactor, NO la usa `npm run build`, pero los triggers de CI la referencian. Código muerto que confunde.
- **Triggers de CI desactualizados**: build-site.yml mira `css/**`, `pdf-viewer.html`, `generate-pages.js` en raíz — las fuentes reales están en `src/assets/css/` y `src/templates/`. Build corre bien, pero CI no se gatilla cuando cambian los CSS reales.
- **Archivos stale en raíz**: `scripts/` y `css/` root contienen duplicados no usados del build actual.
- **PPT viewer no renderiza**: `powerpoint-viewer.js` solo muestra "no se puede previsualizar". Es placeholder.
- **`.doc` legacy no renderiza**: `word-viewer.js` maneja .docx con Mammoth.js pero .doc solo muestra error.
- **`path` y `fs` como dependencias npm**: packages `0.0.1-security` que son no-op maliciosos. Los builtins de Node no van en dependencies.
- **Breadcrumb frágil**: `currentPath.split("/").filter(Boolean).fill("..").join("/")` — `.fill()` en array vacío o edge cases produce `..` incorrectos.
- **Inline styles en HTML generado**: modal, overlay, close button en `html-generator.js` strings.
- **`process.exit(1)` en catch**: mata el proceso sin cleanup. Podría dejar `docs/` incompleto.
- **Sin testing ni linting**: refactor o cambios son puramente manuales. Cero red de seguridad.

## Improvement Opportunities (priorizadas)

1. **Sanear CI/CD y archivos stale** — Actualizar `build-site.yml` triggers a `src/generator/**`, `src/assets/**`, `src/templates/**`. Eliminar `generate-pages.js`, `css/`, `scripts/` root.
   - Impacto: Alto
   - Esfuerzo: Bajo
   - Files: `.github/workflows/build-site.yml`, `generate-pages.js`, `css/`, `scripts/`

2. **Eliminar dependencias fantasma** — Sacar `path` y `fs` de `package.json`; son builtins de Node.
   - Impacto: Medio
   - Esfuerzo: Bajo (5 min)
   - Files: `package.json`

3. **Implementar visor PPT real** — Integrar librería cliente (pptxjs, PptxGenJS) o generar preview server-side convirtiendo a imágenes.
   - Impacto: Alto
   - Esfuerzo: Alto
   - Files: `src/assets/js/powerpoint-viewer.js`, `src/templates/powerpoint-viewer.html`

4. **Agregar testing infra** — Vitest + tests unitarios para `formatName`, `isExcluded`, `isWordDocument`, `generateHTML`.
   - Impacto: Alto
   - Esfuerzo: Medio
   - Files: (new) `tests/`

5. **Refactor error handling** — Reemplazar `process.exit(1)` con excepciones manejables, asegurar que `docs/` no quede corrupto en fallo.
   - Impacto: Medio
   - Esfuerzo: Bajo
   - Files: `src/generator/main.js`, `src/generator/file-processor.js`

6. **Mover inline styles a CSS** — Modal, overlay, close button en `html-generator.js` son strings HTML con `style=` attributes. Pasarlos a `styles.css`.
   - Impacto: Bajo
   - Esfuerzo: Bajo
   - Files: `src/generator/html-generator.js`, `src/assets/css/styles.css`

## Recommended First Step

**Eliminar `path` y `fs` de `package.json`** — 5 minutos, riesgo cero, elimina un supply chain warning real (paquetes 0.0.1-security). Después, actualizar los triggers del CI.

## Risks

- Los archivos root `css/` y `scripts/` podrían estar siendo servidos por algún deployment manual; verificarlos antes de borrar.
- `generate-pages.js` aunque no lo usa el build script, alguien podría ejecutarlo directamente.
- Sin tests, cambios al HTML generator o file-processor requieren build + diff visual manual.
- PPT viewer real requiere investigación de librerías cliente-side funcionales.

## Ready for Proposal

Yes
