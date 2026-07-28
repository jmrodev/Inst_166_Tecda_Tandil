# Proposal: Inst 166 Site Generator Improvements

## Intent
Resolver problemas críticos de seguridad y mantenibilidad en el generador de sitio estático, mejorar experiencia con visores PPT/DOC, y establecer bases de testing.

## Scope

### In Scope (3 batches)

**Batch 1 — Sanitize** (PR1, effort: Low, impact: High):
- Remove path@0.0.1-security and fs@0.0.1-security from package.json (builtins, not deps)
- Fix CI triggers in build-site.yml to watch src/generator/**, src/assets/**, src/templates/**
- Delete dead code: generate-pages.js, css/, scripts/ from root

**Batch 2 — Experience** (PR2, effort: High):
- Implement real PPT viewer (pptxjs or similar client lib)
- Move inline styles from HTML strings to styles.css

**Batch 3 — Foundation** (PR3, effort: Medium):
- Add Vitest + unit tests for formatName, isExcluded, isWordDocument, generateHTML
- Refactor error handling: replace process.exit(1) with manageable exceptions
- Fix fragile breadcrumb logic (.fill() on empty arrays)
- Fix legacy .doc viewer (only .docx works)

### Out of Scope
- Framework migration (keeping vanilla Node.js)
- CSS preprocessor or bundler
- Full redesign of HTML templates

## Capabilities

### New Capabilities
- `ppt-viewer`: Client-side PowerPoint viewer for generated static site
- `testing-infrastructure`: Vitest setup with initial unit test suite

### Modified Capabilities
- `ci-pipeline`: Trigger paths updated to match current source layout

### Pure Refactors (no spec changes needed)
- package.json dependency cleanup
- Dead code removal
- Error handling refactor
- Breadcrumb fix
- Inline styles → CSS

## Approach
Deliver in 3 sequential PRs. Batch 1 first (critical fixes, low effort, high impact). Batch 2 next (feature work). Batch 3 last (foundations after we know the build is stable).

## Affected Areas

| Area | Impact | Batch |
|------|--------|-------|
| package.json | Modified | 1 |
| .github/workflows/build-site.yml | Modified | 1 |
| src/generator/main.js | Modified | 1, 3 |
| src/generator/html-generator.js | Modified | 2 |
| src/assets/js/powerpoint-viewer.js | New/Modified | 2 |
| src/templates/powerpoint-viewer.html | New | 2 |
| src/assets/css/styles.css | Modified | 2 |
| tests/ | New | 3 |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dead code root files might be served externally | Low | Verify before deleting |
| PPT viewer lib may not work in static site context | Medium | Research and prototype first |
| No test safety net for refactors | High | Batch 3 includes adding tests first |

## Success Criteria
- [ ] package.json has zero malicious dependencies
- [ ] CI triggers on changes to src/generator/, src/assets/, src/templates/
- [ ] No dead code remains in project root
- [ ] PPT presentations render in generated site
- [ ] Unit tests run and pass in CI
- [ ] Build failure doesn't leave docs/ in broken state
