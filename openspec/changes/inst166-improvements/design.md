# Design: Inst 166 Site Generator Improvements

## Design for ppt-viewer (NEW)

### Approach
Client-side PPT viewer using pptxjs library. Pure static HTML/JS, no backend.
Library loaded via CDN in the viewer template.

### Components
- `src/templates/ppt-viewer.html` — HTML template with slide container, prev/next nav, loading/error states
- `src/assets/js/ppt-viewer.js` — JS module: parses .pptx with pptxjs, renders slides as SVG/canvas, handles navigation
- Modified: `src/generator/html-generator.js` — link .pptx files to new viewer template

### Data Flow
1. User clicks .pptx link in generated index.html
2. Opens ppt-viewer.html?file=path/to/file.pptx
3. JS loads file via fetch(), parses with pptxjs library
4. Renders slides, enables keyboard/mouse navigation

### PPT Viewer Component Architecture
- parsePPTX(file) → returns slide data
- renderSlide(slideData, container) → appends to DOM
- SlideNavigator: state = { currentSlide, totalSlides }
- Loading: spinner overlay while parsing
- Error: message with retry option

## Design for testing-infrastructure (NEW)

### Approach
Vitest (lightweight, fast, native ESM/CommonJS compatible).
Tests in `tests/` directory mirroring src/generator/ structure.

### Test Plan
- tests/generator/formatName.test.js
- tests/generator/file-utils.test.js
- tests/generator/html-generator.test.js

### CI Integration
- Add `pnpm test` to build-site.yml after build step
- Tests must pass before docs/ commit

## Design for ci-pipeline (MODIFIED)

### Changes
- Trigger paths in .github/workflows/build-site.yml:
  - Add: src/generator/**, src/assets/**, src/templates/**
  - Remove: css/**, scripts/**, generate-pages.js, pdf-viewer.html

## Pure Refactors (no design needed)

### package.json
- Remove path@0.0.1-security and fs@0.0.1-security from dependencies

### Dead Code Removal
- Delete: generate-pages.js, css/ directory, scripts/ directory

### Error Handling
- Replace process.exit(1) with thrown Error in main.js and file-processor.js
- Wrap main pipeline in try/catch in main.js
- Log errors with console.error before throwing

### Breadcrumb Fix
- In html-generator.js, fix the fill() logic on empty path arrays
- Add guard: if path parts is empty, breadcrumb is root "/"

### Inline Styles → CSS
- Move modal, overlay, close button inline styles from html-generator.js strings to src/assets/css/styles.css
