# Archive: inst166-improvements

**Status**: COMPLETED
**Date**: 2026-07-27
**Batches**: 3 (Sanitize → Experience → Foundation)
**Tasks**: 13/13

## Summary
El cambio limpió dependencias maliciosas, eliminó dead code, agregó visor PPT con pptxjs,
estableció infraestructura de testing con Vitest (32 tests), actualizó CI pipeline, y
refactorizó error handling y breadcrumb navigation.

## Files Created
- src/templates/ppt-viewer.html
- src/assets/js/ppt-viewer.js
- vitest.config.js
- tests/generator/core.test.js

## Files Modified
- package.json
- .github/workflows/build-site.yml
- src/generator/html-generator.js
- src/assets/css/styles.css
- src/generator/config.js
- src/generator/file-processor.js
- src/assets/js/word-viewer.js

## Files Deleted
- generate-pages.js
- css/pdf-viewer.css
- css/styles.css
- scripts/modal.js
- scripts/pdf-viewer.js
- scripts/pdf-viewer-v2.js

## Verification
- Build: passes
- Tests: 32/32 pass
- CI triggers: updated to src/ paths
- Supply chain risk: removed path@0.12.7 and fs@0.0.1-security

## Delta Specs (consolidated)
### New Capabilities
- **ppt-viewer**: PPTX viewer via pptxjs CDN, prev/next nav, keyboard, fullscreen, loading/error states
- **testing-infrastructure**: Vitest v4, 32 tests, CI integration

### Modified Capabilities
- **ci-pipeline**: Triggers scoped to src/generator/**, src/assets/**, src/templates/**, added test step

## Next Steps
None — change is complete. Future improvements:
- Fix `formatName` accent bug (pre-existing)
- Extract calendar modal inline styles from static-handler.js
- Expand test coverage to edge cases
