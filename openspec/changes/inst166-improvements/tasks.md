# Tasks: Inst 166 Site Generator Improvements

## Batch 1 — Sanitize (PR1)

### Task 1.1: Remove malicious dependencies
- **Files**: package.json
- **Effort**: 5 min
- **Description**: Remove `path` and `fs` from dependencies (builtins, not npm packages)
- **Verification**: `pnpm install` succeeds, `npm ls path` shows no extraneous
- **Status**: [x] Complete

### Task 1.2: Fix CI trigger paths
- **Files**: .github/workflows/build-site.yml
- **Effort**: 10 min
- **Description**: Replace root-level trigger paths with src/ paths
- **Changes**: remove css/**, scripts/**, generate-pages.js, pdf-viewer.html
- **Add**: src/generator/**, src/assets/**, src/templates/**
- **Verification**: CI triggers on push to src/generator/
- **Status**: [x] Complete

### Task 1.3: Remove dead code
- **Files**: generate-pages.js, css/, scripts/
- **Effort**: 15 min
- **Description**: Delete stale root-level files no longer used by the build
- **Verification**: `npm run build` succeeds, site generates correctly
- **Status**: [x] Complete

## Batch 2 — Experience (PR2)

### Task 2.1: Create PPT viewer template
- **Files**: src/templates/ppt-viewer.html (NEW)
- **Effort**: 1h
- **Dependencies**: None
- **Description**: HTML template with slide container, prev/next buttons, loading spinner, error state
- **Status**: [x] Complete

### Task 2.2: Create PPT viewer JS module
- **Files**: src/assets/js/ppt-viewer.js (NEW)
- **Effort**: 2h
- **Dependencies**: Task 2.1
- **Description**: Parse .pptx with pptxjs (CDN), render slides, keyboard nav, fullscreen support
- **Status**: [x] Complete

### Task 2.3: Wire .pptx links to new viewer
- **Files**: src/generator/html-generator.js
- **Effort**: 30 min
- **Dependencies**: Task 2.2
- **Description**: Generate ppt-viewer.html links for .pptx files instead of "no disponible" message
- **Status**: [x] Complete

### Task 2.4: Move inline styles to CSS
- **Files**: src/generator/html-generator.js, src/assets/css/styles.css
- **Effort**: 30 min
- **Description**: Extract modal, overlay, close button inline styles to styles.css
- **Status**: [x] Complete

## Batch 3 — Foundation (PR3)

### Task 3.1: Set up Vitest
- **Files**: tests/ (NEW), package.json (add test script)
- **Effort**: 30 min
- **Description**: Install vitest, add test script, create tests/ directory, verify `pnpm test` runs
- **Status**: [x] Complete

### Task 3.2: Write unit tests for formatName, isExcluded, isWordDocument, generateHTML
- **Files**: tests/generator/ (NEW)
- **Effort**: 2h
- **Dependencies**: Task 3.1
- **Description**: Unit tests for core utility functions, covering happy path and edge cases
- **Status**: [x] Complete

### Task 3.3: Add test step to CI
- **Files**: .github/workflows/build-site.yml
- **Effort**: 15 min
- **Dependencies**: Task 3.2
- **Description**: Add `pnpm test` step after build
- **Status**: [x] Complete

### Task 3.4: Refactor error handling
- **Files**: src/generator/main.js, src/generator/file-processor.js
- **Effort**: 45 min
- **Dependencies**: Task 3.2 (safety net)
- **Description**: Replace process.exit(1) with thrown errors, wrap pipeline in try/catch
- **Status**: [x] Complete

### Task 3.5: Fix breadcrumb logic
- **Files**: src/generator/html-generator.js
- **Effort**: 15 min
- **Dependencies**: Task 3.2 (safety net)
- **Description**: Guard against empty path arrays in breadcrumb generation
- **Status**: [x] Complete

### Task 3.6: Fix .doc legacy viewer
- **Files**: src/assets/js/word-viewer.js
- **Effort**: 30 min
- **Dependencies**: None
- **Description**: Add fallback/error message for .doc files (only .docx works currently), or document limitation
- **Status**: [x] Complete

## Summary

| Batch | Tasks | Total Effort | Changed Lines (est.) |
|-------|-------|-------------|---------------------|
| 1 — Sanitize | 3 | ~30 min | ~30 |
| 2 — Experience | 4 | ~4h | ~300 |
| 3 — Foundation | 6 | ~4.5h | ~200 |
| **Total** | **13** | **~9h** | **~530** |

## Review Workload Forecast
- Chained PRs recommended: Yes (3 batches = 3 PRs)
- 400-line budget risk: Medium (Batch 2 alone ~300 lines)
- Decision needed before apply: Yes
