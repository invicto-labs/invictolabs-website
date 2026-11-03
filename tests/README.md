# Test workspace

Phase 1 adds the approved audit tooling. All runners read the production build and write evidence; they do not repair product code. A nonzero exit can mean audit findings, not a crashed tool; inspect the run JSON.

Audit-tool engines require Node 24.8+ (or a compatible Node 22.22+ release). This run used Node 24.15.0 and npm 11.15.0. The older README's Node 20+ application guidance does not cover the newly added audit tools; no hosting Node setting was changed.

Install and run from the repo root:

```powershell
npm ci
npm run test:install
npm run build
npm run test:e2e
npm run test:a11y
npm run test:perf
npm run test:links
npm run test:seo
npm run test:security
npm run test:html
npm run test:css
npm run test:spell
npm run test:placeholders
npm run test:quality
```

`npm run test:all` runs the complete local audit sequence and continues through failing suites. `test:e2e` runs responsive, menu, hash, functional, keyboard, input-stress, form-fallback and robustness suites. Focused commands include `test:responsive`, `test:menu`, `test:hash`, `test:functional`, `test:keyboard`, `test:input-stress`, `test:form-fallback`, `test:robustness`, `test:checks` (links/SEO/security/maintenance/validation/spell/placeholders/quality), `test:content` and `test:live`. The live suite makes public read-only requests; it does not enter live form data. Security/link suites also make external read-only requests and npm audit/outdated requests. Set `QA_CHECK_LIVE=1` to add live confirmation to the hash suite; live observations do not certify unpublished local fixes.

`test:form-fallback` uses reserved synthetic inputs only on localhost, with enabled, disabled, blocked-script and hash-loaded states in all engines. It intercepts and aborts native document submissions containing fields. Keyboard activation is attempted first; an explicitly recorded `requestSubmit()` diagnostic is also used if no request was observed. Clean hydrated controls prepare a draft without native GET. These tests never launch an OS mail handler or send a message.

Each runner owns a Vite production preview on loopback port 4187 and closes it afterward. Do not run multiple suites on the same port. `QA_PORT` selects another free port; avoid Fetch/browser restricted ports such as 4190. The Codex sandbox may require local browser/network permission; ordinary terminal execution does not rely on a Codex browser bridge.

Phase 2 default artifacts go to `qa/after-phase2/`, protecting the retained baseline; the Phase 1 E2E campaign uses `qa/baseline/e2e/`, with setup/pilot/attempt evidence retained separately. Every route/viewport/device/orientation/engine receives a screenshot and measurements. Screenshot matrix entries are viewport captures, with full-page anchors at 390px/1440px and some earlier pilot/full-page captures; each result records scope. Geometry covers rendered elements throughout the page, plus document widths at 40%, 80% and footer. Menu traces/videos and axe JSON are retained. Videos currently include all audited menu contexts so failed-state evidence is not discarded.

Options (PowerShell):

```powershell
$env:QA_OUTPUT = 'qa/after-phase2'
$env:QA_PORT = '4188'
npm run test:all
```

`QA_BROWSERS=chromium,firefox,webkit` selects engines; `QA_ROUTES` is a comma-separated route list; `QA_PERF_ROUTES` limits Lighthouse routes for a focused check. Omit these filters for the full matrix. `QA_RESUME=1` resumes completed responsive cases and saved menu cases; for `test:all`, it also retains completed passing suites only after a SHA-256 guard confirms identical product source, assets, build inputs and served output. Use it only within the same audit campaign; use a fresh output folder after product changes. `QA_STRICT_PLACEHOLDERS=1` makes placeholder findings fail that check. `tests/performance-budgets.json` records lab/resource review gates. `test:maintenance` reads public npm metadata and installed deprecation markers; it does not update packages.

Firefox cannot emulate Playwright's `isMobile` setting; its named-device cases use the same viewport/touch/UA with that unsupported flag omitted. Galaxy S23 is a documented custom descriptor, not a built-in or real device. iPad uses Playwright's iPad (gen 7) descriptor. Real Safari/iOS/Android, screen readers, OS text scale, native zoom/mail handlers and genuine ad blockers remain manual checks in `qa/MANUAL_PHASE1.md`.

Mobile WebKit does not implement the wheel API. Its menu scroll-lock probe uses PageDown/PageUp; actual finger gestures remain a manual device check. Fresh hash loads had a separately evidenced duplicate-tree defect in Phase 1; Phase 2 normalizes the initial URL before hydration and tests for a single tree. The menu suite records that state, then uses a clean load for independent controls; it does not silently select one of two duplicate triggers or count the blocked state as passing.

Phase 2 adds the Privacy clean-path rewrite to the local preview. The SEO suite checks raw clean-path parity; Lighthouse retains its explicit `/privacy-policy/` tested URL for baseline comparability. Local preview also applies the repository common response headers; this does not certify live hosting behavior.

Local preview does not reproduce Vercel caching/compression/edge behavior. Lighthouse's lab scores and TBT do not establish field INP/Core Web Vitals. Run performance tests after other browser work has finished; 3 mobile runs/median and 1 desktop run are saved for every public route. Review live delivery headers separately.

Additional diagnostics: `node tests/run.mjs keyboard` records native first-Tab behavior and explicitly focused skip-link Enter activation separately; `node tests/run.mjs resize` records the Firefox resize acknowledgement limitation against blank-page controls. No OS keyboard or browser preferences were changed. A focused functional retry can use `QA_BROWSERS=webkit`, `QA_FUNCTIONAL_WIDTHS=1440`, `QA_FUNCTIONAL_FOCUS=forms` and a separate `QA_OUTPUT`; omit these filters for the full audit. Original attempts are retained, with resolved harness errors and the focused retry linked in the final functional JSON.

`node tests/run.mjs globe-profile` repeats the local visible/hidden/reduced-motion CPU comparison; `node tests/run.mjs followups` runs input stress then that profile. The profile temporarily changes browser DOM visibility and CPU emulation only. `input-stress` records native desktop wheel/keyboard, Chromium CDP touch, service-capability controls and six-template text-spacing/long-label/RTL probes. Its reduced-data protocol probe was unsupported/unmatched here and is not a pass claim.

The Phase 1 report is generated from the retained baseline with `node tests/report-phase1.mjs`; `node tests/finalize-phase1.mjs` verifies source/backups and regenerates the exhaustive Phase 1 file inventory. These two scripts are phase-specific, not generators for later-phase reports. `normalize-performance.mjs` documents/rederives modeled TTFB from original Lighthouse JSON for this initial run; the perf runner now records modeled TTFB and local server time separately.

`helpers/` supplies the matrix, scroll/settling, error collector, geometry/decorative inventory, route discovery and evidence naming. `suites/` contains read-only checks. Existing `../scripts/check-*.mjs` and `../scripts/verify-*.mjs` remain unchanged and do not replace this matrix.

## Phase 2 regression

Backups precede all source edits in `qa/backups/phase2/`. Always set `QA_OUTPUT` to preserve the baseline:

```powershell
$env:QA_OUTPUT = 'qa/after-phase2'
npm run build
npm run test:all
npm run test:menu:regression
node tests/run.mjs priority
node tests/run.mjs globe-profile
```

The standalone menu spec runs 135 cases across Chromium, Firefox and WebKit with iPhone 13, Pixel 7 and iPad descriptors. It checks 40%, 80% and footer positions on five templates, dialog bounds, scroll preservation, lock, explicit Tab cycling, visible focus, Escape, outside click and focus return. The larger menu suite also checks landscape, links, hashes and runtime resize where supported. Firefox runtime resize acknowledgement remains an environment limitation. `priority` records footer typography/layout and menu screenshots at seven widths in each engine.

`QA_PERF_MODES=mobile` is available for focused iterations; omit it for the complete 100-measurement performance campaign. Iteration output is retained under `qa/after-phase2/iterations/`; only root final indices are the Phase 2 scorecard. A fresh production build is required after source edits. Do not run `scripts/prerender.mjs` alone on an already prerendered `dist/index.html`: use `npm run build`.

Project CSS/HTML validation settings distinguish semantic/syntax errors from the original house style. Raw strict CSS results remain in `css-strict.json`; see `qa/CODE_STYLE_PHASE2.md`. Default Prettier and legal-copy spelling findings remain separately reported, without a broad formatting or legal rewrite.

Phase 2 report helpers: `node tests/report-phase2.mjs`, `node tests/screenshots-phase2.mjs`, `node tests/finalize-phase2.mjs`, then `node tests/verify-phase2.mjs`. These read final root indices, not iteration folders. Regenerate the file inventory after documentation/artifact creation. The coverage verifier leaves Lighthouse exceptions and owner-dependent items visible in the report.

The menu spec now defaults to one worker and a 90s overall test deadline for Windows software-rendered engines and trace teardown; individual visibility assertions retain their normal expect deadlines. The first 135-case campaign had 132 passes and three timeouts. Six focused retests (including controls) are retained separately on the unchanged build; `summarize-menu-phase2.mjs` records distinct coverage and unresolved cases without replacing the original Playwright report. `test:all` includes the Phase 2 priority captures, enforced CSP compatibility and isolated globe CPU profile before Lighthouse.

The foreground-aware helper reactivates the target tab before settling; axe creates a temporary aggregation page and can leave headless WebKit behind it. Open-menu axe states await the visible dialog, and the target tab is restored after each analysis. Runner timeouts preserve detailed page state. Earlier attempts remain under `iterations/axe-foreground-before/`. The final campaign can therefore span a guarded resume without reclassifying the original timeouts as passes.

Axe scans use a fresh browser context for each route/viewport and explicitly restore the target tab after the library’s temporary aggregation page. This avoids state carried between scans in WebKit; earlier reused-context timeouts remain under `iterations/axe-reused-context/`. The candidate fingerprint excludes QA/test code so a harness correction can rerun unfinished checks without discarding valid application checks on the same source/build. The final verifier checks that fingerprint again.
