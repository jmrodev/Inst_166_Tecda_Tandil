# Spec: Inst 166 Site Generator Improvements

## Change Overview
Change: inst166-improvements
Based on proposal: see proposal.md
Source: openspec/changes/inst166-improvements/

## Capabilities

### ppt-viewer (NEW)
**Requirements**:
- System MUST render .pptx files as slide-by-slide viewer in the generated static site
- Viewer MUST work without a backend server (purely static HTML/JS)
- Viewer MUST support text, images, and basic formatting in slides
- System MUST show a loading indicator while parsing the .pptx file
- System MUST display a fallback message when viewer cannot load the file
- Navigation MUST provide previous/next slide controls with keyboard support
- System MUST handle corrupt or unsupported files with a clear error state

**Scenarios**:
- User opens a page with a .pptx file link and clicks it → slides render with navigation controls
- User presses left/right arrow keys → viewer moves to previous/next slide
- User clicks a .pptx file that is corrupt → error message displayed with "preview not available"
- User opens a large .pptx file → loading indicator shown during parsing

### testing-infrastructure (NEW)
**Requirements**:
- Project MUST use Vitest as test runner
- Test command MUST be `pnpm test`, configured to run vitest
- Tests MUST be located in `tests/` directory at project root
- System MUST have unit tests for: `formatName`, `isExcluded`, `isWordDocument`, `generateHTML`
- Unit tests MUST cover happy path and edge cases (empty input, special characters, malformed data)
- CI pipeline MUST run tests on every push that triggers the workflow
- CI MUST fail the build when tests fail

**Scenarios**:
- Developer runs `pnpm test` → vitest executes and reports pass/fail per test file
- Developer modifies `formatName` → tests catch if output format changes unexpectedly
- Developer pushes code that breaks `isExcluded` → CI fails and blocks the build
- Developer adds a new file to `tests/` → vitest auto-discovers and runs it

### ci-pipeline (MODIFIED)
**Delta requirements**:
- CI trigger paths SHALL change from root paths to `src/` paths
- CI MUST trigger on: `src/generator/**`, `src/assets/**`, `src/templates/**`
- CI MUST run `pnpm test` after build step
- CI MUST still auto-commit `docs/` output on success

**Previously**: CI triggered on `css/**`, `pdf-viewer.html`, `generate-pages.js` — paths that no longer match active source files.

## No Spec Changes Needed (pure refactors)
- package.json dependency cleanup
- Dead code removal (generate-pages.js, root css/, root scripts/)
- Error handling refactor (process.exit(1))
- Breadcrumb logic fix
- Inline styles → CSS
