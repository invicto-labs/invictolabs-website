import { readFile, writeFile } from 'node:fs/promises'
import { issues } from './report-data.mjs'
async function read(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}
const root = 'qa/baseline/'
const responsive = await read(root + 'e2e/responsive-index.json', { index: [], errors: [] })
const axe = await read(root + 'axe-index.json', { index: [], errors: [] })
const menu = await read(root + 'e2e/menu.json', { results: [], errors: [] })
const functional = await read(root + 'e2e/functional.json', {
  pages: [],
  forms: [],
  interactions: [],
  controls: [],
  errors: [],
})
const robustness = await read(root + 'e2e/robustness.json', { results: [], errors: [] })
const keyboard = await read(root + 'keyboard.json', { results: [], errors: [] })
const fallback = await read(root + 'nojs-form.json', { results: [] })
const stress = await read(root + 'input-stress.json', { results: [], errors: [] })
const globeProfile = await read(root + 'globe-profile.json', { results: [] })
const perf = await read(root + 'lighthouse-index.json', { rows: [], errors: [] })
const security = await read(root + 'security.json', {})
const links = await read(root + 'links.json', {})
const seo = await read(root + 'seo.json', { pages: [] })
const live = await read(root + 'live.json', { documents: [], browserCases: [] })
const html = await read(root + 'html-index.json', [])
const css = await read(root + 'css.json', { results: [] })
const eslint = await read(root + 'eslint.json', [])
const placeholder = await read(root + 'placeholders.json', { matches: [] })
const source = await read(root + 'source-features.json', { cssStats: [] })
const num = (v, d = 0) => (v === null || v === undefined ? 'not measured' : Number(v).toFixed(d))
const esc = (v) =>
  String(v ?? '—')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')
const table = (headers, rows) =>
  '| ' +
  headers.join(' | ') +
  ' |\n| ' +
  headers.map(() => '---').join(' | ') +
  ' |\n' +
  rows.map((r) => '| ' + r.map(esc).join(' | ') + ' |').join('\n') +
  '\n'
const publicRoutes = seo.pages.map((p) => p.route)
const menuRows = menu.results.flatMap((r) => r.rows)
const scoreString = (row) =>
  row
    ? ['performance', 'accessibility', 'best-practices', 'seo']
        .map((k) => row.scores[k] ?? '—')
        .join(' / ')
    : 'not measured'
const axeCounts = (route) => {
  const counts = { critical: new Set(), serious: new Set(), moderate: new Set(), minor: new Set() }
  for (const row of axe.index.filter((r) => r.route === route))
    for (const v of row.rules) (counts[v.impact] ||= new Set()).add(v.id)
  return ['critical', 'serious', 'moderate', 'minor'].map((k) => counts[k].size).join(' / ')
}
const allIssues = [...issues]
if (robustness.results.some((r) => r.mode === 'back-scroll-restoration' && r.scrollY < 2))
  allIssues.push({
    id: 'FUNC-002',
    severity: 'Medium',
    category: 'History navigation',
    pages: 'SPA routes',
    viewport: 'Browser Back after a scrolled page',
    evidence: ['qa/baseline/e2e/robustness.json'],
    root: 'src/components/RouteScrollManager.tsx:60–67',
    cause:
      'History scrollRestoration is set to manual, while each route key without a target scrolls to top; prior per-entry positions are not stored.',
    impact: 'Back does not reliably restore the prior reading position.',
    options: [
      [
        'Track scroll positions by history entry and restore on POP navigation',
        '0.5–1 day',
        'Medium',
        'Coordinate with anchor navigation and route loading.',
      ],
      [
        'Use browser restoration for history navigation and custom handling only for explicit targets',
        '0.5 day',
        'Medium',
        'Cross-browser checks needed with prerendered SPA transitions.',
      ],
    ],
    recommended: 1,
  })
if (
  perf.rows.some(
    (r) =>
      r.mode === 'mobile' &&
      r.budgetFailures.length &&
      !r.route.startsWith('/services/') &&
      !['/location', '/products/traceq'].includes(r.route),
  )
)
  allIssues.push({
    id: 'PERF-004',
    severity: perf.rows.some(
      (r) =>
        r.mode === 'mobile' &&
        r.scores.performance < 90 &&
        !r.route.startsWith('/services/') &&
        !['/location', '/products/traceq'].includes(r.route),
    )
      ? 'High'
      : 'Medium',
    category: 'Measured performance budgets',
    pages: perf.rows
      .filter(
        (r) =>
          r.mode === 'mobile' &&
          r.budgetFailures.length &&
          !r.route.startsWith('/services/') &&
          !['/location', '/products/traceq'].includes(r.route),
      )
      .map((r) => r.route)
      .join(', '),
    viewport: 'Lighthouse simulated mobile 4G; three-run median',
    evidence: ['qa/baseline/lighthouse-index.json', 'qa/baseline/lighthouse/'],
    root: 'src/ProductsPage.tsx:1–30; src/FaqPage.tsx:7,20–22; src/components/DeferredDottedSurface.tsx:10–18; src/styles.css; scripts/prerender.mjs; saved per-page audits',
    cause:
      'Remaining mobile timing/resource budgets fail on the listed routes. Product variants share one ProductsPage entry (sampled TitleFlow: about 75% of its 54 KB transferred route JS unused, about 91% of shared stylesheet unused). Products hub transfers about 269 KB JS. FAQ triggers a decorative 3D surface as soon as its hero intersects, transfers about 212 KB JS and has median TBT about 551 ms. Home has LCP about 3.6 s and TBT about 290 ms; critical rendering/hydration requires profiling against the saved audit. Initial unused-code estimates are route/state coverage, not proof that code can be deleted. Preview gzip/no-cache differs from live Brotli/immutable assets.',
    impact:
      'Measured lab responsiveness/loading or resource cost exceeds the proposed review budget; field INP is not measured.',
    options: [
      [
        'Prioritize each page’s measured LCP/TBT/CLS/resource causes; compare live delivery, then optimize only affected critical resources/visual work',
        '1–3 days depending on pages',
        'Medium',
        'Preserve visual identity; prove improvements on the same measurement setup.',
      ],
      [
        'Reduce or defer decorative WebGL/canvas on phones and reduced-motion/data modes',
        '0.5–1 day',
        'Low–Medium',
        'Changes the amount/timing of nonessential motion.',
      ],
      [
        'Accept specific budget deviations with documented live/field evidence and an owner',
        '0.5 day analysis',
        'Medium',
        'Requires explicit acceptance; does not meet a literal universal 90+ goal.',
      ],
    ],
    recommended: 1,
  })
const counts = Object.fromEntries(
  ['Critical', 'High', 'Medium', 'Low'].map((s) => [
    s,
    allIssues.filter((i) => i.severity === s).length,
  ]),
)
let report =
  '# Phase 1 — end-to-end audit and solution options\n\nDate: 2026-11-02 (Asia/Calcutta). Phase 1 only; no product fixes. See `ENGAGEMENT_REQUEST.txt` for scope and `FILES_PHASE1.md` for exact local file changes.\n\n'
report += '## 1. Summary\n\n'
report += `- Added dev-only Playwright/axe, validation, lint and spelling tooling and rerunnable audit scripts.\n- Audited ${publicRoutes.length} discovered public routes plus custom 404; saved ${responsive.index.length} responsive matrix cases and ${axe.index.length} axe scans.\n- Reproduced the scrolled-menu defect and isolated the body-overflow/sticky-header interaction with pointer clicks and temporary DOM-only experiments.\n- Serious axe findings cluster around Tax Flow contrast and the Products scroll-link accessible name.\n- Checked public live responses, delivery headers and runtime separately from local preview behavior; no messages or form data were sent.\n- Recorded ${counts.Critical} Critical, ${counts.High} High, ${counts.Medium} Medium and ${counts.Low} Low findings; none has been repaired in this phase.\n- Product source, runtime dependencies, public URLs, brand and hosting/CI settings remain unchanged.\n- Phase 2 is not authorized; review the options and content decisions before proceeding.\n\n`
report +=
  '- Confirmed native-form GET fallback and persistent duplicate trees on fresh hash loads; all synthetic field-bearing requests were aborted locally.\n- Added the user-requested footer typography/column redesign to the Phase 2 priorities; no footer copy or styles were changed.\n\n'
report += '## 2. Coverage and scorecards\n\n'
report +=
  'Evidence is dated to this run. Automated testing does not prove absence of every defect or WCAG/legal/security conformance. A failing suite can represent expected baseline findings, rather than a tool crash. Original attempts and corrected-run logs are retained.\n\n'
report += table(
  ['Area', 'Measured result', 'Evidence'],
  [
    [
      'Production build',
      'Fresh Phase 1 production build and existing 25-page SEO verifier passed; generated-file hashes compared with the matrix build',
      'baseline/setup/build.txt; baseline/setup/build-integrity.json; baseline/setup/source-integrity.json',
    ],
    [
      'Responsive matrix',
      `${responsive.index.length} recorded cases; ${responsive.index.filter((r) => r.horizontalOverflow).length} document-overflow incidents; ${responsive.errors.length} runner errors`,
      'baseline/e2e/responsive-index.json',
    ],
    [
      'Menu',
      `${menuRows.length} scroll cases; ${menuRows.filter((r) => !r.opened.visible).length} panels outside viewport; ${menuRows.filter((r) => r.trap === false).length} tested focus-trap failures; ${menu.results.filter((r) => r.runtimeResizeLimitation).length} Firefox resize contexts unverified; ${menu.errors.length} runner errors`,
      'baseline/e2e/menu.json; baseline/diagnostic-confirmation/menu-root-cause.json',
    ],
    [
      'axe',
      `${axe.index.length} scans; ${axe.index.reduce((n, r) => n + r.impacts.critical, 0)} critical and ${axe.index.reduce((n, r) => n + r.impacts.serious, 0)} serious violation occurrences; ${axe.errors.length} runner errors`,
      'baseline/axe-index.json; per-scan axe/*.json',
    ],
    [
      'Lighthouse',
      `${perf.rows.reduce((n, r) => n + r.runs.length, 0)} measurements; ${perf.errors.length} runner errors; ${perf.rows.filter((r) => r.mode === 'mobile' && r.scores.performance < 90).length} pages below mobile performance 90`,
      'baseline/lighthouse-index.json; individual JSON/HTML',
    ],
    [
      'Internal/external links',
      `${links.internal?.filter((r) => r.status >= 400).length ?? 'not measured'} broken internal; ${links.external?.filter((r) => r.classification === 'error').length ?? 'not measured'} confirmed 404/410 external; ${links.external?.filter((r) => r.classification.includes('unverified')).length ?? 'not measured'} external destinations unverified/blocked`,
      'baseline/links.json',
    ],
    [
      'HTML/CSS validation',
      `${html.reduce((n, r) => n + r.errorCount, 0)} raw HTML rule findings; ${css.results.reduce((n, r) => n + r.warnings.length, 0)} raw CSS rule findings. Mostly style/convention warnings; semantic findings are separately registered.`,
      'baseline/html-index.json; baseline/css.json',
    ],
    [
      'Lint/spelling',
      `${eslint.reduce((n, r) => n + r.errorCount, 0)} ESLint errors; existing formatting baseline and two US-English spelling variants (Privacy) require reviewed conventions`,
      'baseline/eslint.json; prettier.json; spell.txt',
    ],
    [
      'Dependencies',
      `npm audit production: ${security.audits?.production?.metadata?.vulnerabilities?.total ?? 'not measured'} advisories; all dependencies: ${security.audits?.all?.metadata?.vulnerabilities?.total ?? 'not measured'}`,
      'baseline/security.json',
    ],
    [
      'Source maps / secret patterns',
      `${security.sourceMaps?.length ?? 'not measured'} built source maps/references; ${security.secretPatternFindings?.length ?? 'not measured'} configured secret-pattern hits. Not an exhaustive secret assurance.`,
      'baseline/security.json; live map probes in baseline/live.json',
    ],
    [
      'Visible TBD scanner',
      `${placeholder.matches.length} built placeholder occurrences; unknown business data is registered for the later rebuild`,
      'baseline/placeholders.json; ../CONTENT_TODO.md',
    ],
  ],
)
report +=
  '\n### Per-page Lighthouse, CWV lab proxies and axe\n\nMobile = three runs, median; desktop = one run. Scores are Performance / Accessibility / Best Practices / SEO. Axe C/S/M/m counts unique rule IDs by impact per page across engines/states, not repeated occurrences or affected nodes. LCP/FCP/TTFB are milliseconds; TBT is milliseconds, not INP. A missing Lighthouse timing is explicitly unmeasured. Local preview delivery differs from the live Brotli/caching stack. Privacy performance uses its actual built `/privacy-policy/` directory URL because the existing clean-path preview serves Home HTML before hydration.\n\n'
report += table(
  [
    'Route',
    'Mobile P/A/BP/S',
    'Desktop P/A/BP/S',
    'LCP',
    'TBT',
    'CLS',
    'TTFB',
    'FCP',
    'axe C/S/M/m',
  ],
  publicRoutes.map((route) => {
    const m = perf.rows.find((r) => r.route === route && r.mode === 'mobile'),
      d = perf.rows.find((r) => r.route === route && r.mode === 'desktop')
    return [
      route,
      scoreString(m),
      scoreString(d),
      num(m?.medians.lcpMs),
      num(m?.medians.tbtMs),
      num(m?.medians.cls, 3),
      num(m?.medians.ttfbMs),
      num(m?.medians.fcpMs),
      axeCounts(route),
    ]
  }),
)
report +=
  '\nTTFB is Lighthouse modeled timeToFirstByte in simulate mode; unthrottled local server-response-time is retained separately as localServerTtfbMs. Lighthouse uses DPR 1 here. INP/field CWV and actual high-DPR devices remain unmeasured. All mobile CLS medians were zero. Accessibility scores of 96–100 do not negate the state-specific axe/menu findings.\n\n'
report +=
  'Current executable gates and template-specific future targets are explained in `PERFORMANCE_BUDGETS_PHASE1.md`. Mobile timing/resource budget misses are listed below; a score of 90+ can still miss a stricter LCP/FCP or byte budget. Byte figures are local transferred KB (decimal), not source-file sizes.\n\n'
report += table(
  ['Route', 'JS / CSS / images / total KB', 'Failed mobile gates'],
  perf.rows
    .filter((r) => r.mode === 'mobile' && r.budgetFailures.length)
    .map((r) => [
      r.route,
      ['script', 'stylesheet', 'image', 'total']
        .map((k) => num(r.transferMedians[k] / 1000, 1))
        .join(' / '),
      r.budgetFailures.map((b) => b.metric).join(', '),
    ]),
)
report +=
  '\nCustom 404 has a separate layout/axe/route check; search indexing is intentionally disabled, so a 90+ SEO score is not a useful 404 requirement.\n\n### Console events and overflow by matrix entry\n\n'
report += table(
  ['Route', 'Console warnings/errors', 'Page errors', 'Failed requests', 'HTML rule findings'],
  publicRoutes.map((route) => {
    const rows = responsive.index.filter((r) => r.route === route)
    return [
      route,
      rows.reduce((n, r) => n + r.consoleErrors, 0),
      rows.reduce((n, r) => n + r.pageErrors, 0),
      rows.reduce((n, r) => n + r.failedRequests, 0),
      html.find((r) => r.route === route)?.errorCount ?? 'not measured',
    ]
  }),
)
report +=
  '\nConsole columns sum recorded matrix scenarios, so one repeated event can occur more than once. Raw messages/URLs and expected 404 negative-route events are in each layout JSON. The custom missing-page route is excluded from this public-page table.\n\n'
const groups = new Map()
for (const row of responsive.index) {
  const key = row.scenario + ' ' + row.orientation
  const g = groups.get(key) || { count: 0, overflow: 0, engines: new Set() }
  g.count++
  g.overflow += Number(row.horizontalOverflow)
  g.engines.add(row.engine)
  groups.set(key, g)
}
report += table(
  ['Viewport / device + orientation', 'Cases', 'Overflow incidents', 'Engines'],
  [...groups].map(([k, g]) => [k, g.count, g.overflow, [...g.engines].join(', ')]),
)
report +=
  '\nRequested numeric widths are covered in portrait/landscape as listed in `tests/helpers/matrix.mjs`, plus a short 667×375 phone. Named devices include portrait and landscape. Firefox does not support Playwright isMobile; those cases retain viewport/touch/UA without that flag. Galaxy S23 is a documented custom approximation. iPad uses the gen-7 descriptor. These are not real devices. Every matrix entry has geometry and a screenshot; most are viewport captures, with full-page anchors at 390/1440 and some retained earlier full-page captures. Mobile WebKit has no wheel API, so the menu lock probe uses PageDown/PageUp there; actual finger-scroll locking remains a real-device check.\n\n### Live security and delivery headers\n\n'
const liveHome = security.live?.find((r) => r.url === 'https://invictolabs.com/')
report += table(
  ['Header / property', 'Observed Home response', 'Interpretation'],
  [
    [
      'HTTPS / HSTS',
      liveHome?.headers?.['strict-transport-security'],
      'Observed; not a TLS certificate/cipher penetration test',
    ],
    [
      'CSP',
      liveHome?.headers?.['content-security-policy'] || 'Absent',
      'Defense-in-depth gap; report-only/build compatibility review needed',
    ],
    [
      'Frame protection',
      liveHome?.headers?.['x-frame-options'] || 'Absent; no CSP frame-ancestors',
      'Embedding decision needed',
    ],
    ['X-Content-Type-Options', liveHome?.headers?.['x-content-type-options'], 'Observed'],
    ['Referrer-Policy', liveHome?.headers?.['referrer-policy'], 'Observed'],
    [
      'Permissions-Policy',
      liveHome?.headers?.['permissions-policy'] || 'Absent',
      'Optional hardening decision',
    ],
    [
      'HTML caching',
      liveHome?.headers?.['cache-control'],
      'Separate asset headers are in live.json',
    ],
    [
      'Compression',
      liveHome?.headers?.['content-encoding'],
      'Observed live; local preview differs',
    ],
    [
      'COOP / CORP',
      (liveHome?.headers?.['cross-origin-opener-policy'] || 'Absent') +
        ' / ' +
        (liveHome?.headers?.['cross-origin-resource-policy'] || 'Absent'),
      'Not universal requirements; evaluate compatibility before adding',
    ],
  ],
)
report +=
  '\nPer-route results, cookies, redirects and dependency/license inventories are retained in `baseline/security.json`; live body/canonical/assets/source-map probes are in `baseline/live.json`. The three live .map probes returned 403, so they do not prove the files are absent on the host; the local build contains no emitted maps/references. Missing hardening headers do not establish an exploit. A `rel=noreferrer` link also prevents opener access; absence of the literal noopener token alone was not classified as a vulnerability. External HEAD 405 receives a GET retry; anti-bot 403/429/999 results remain unverified, not declared broken. Registry maintenance signals and installed deprecations are in maintenance.json; modification dates alone do not establish support or abandonment.\n\n'
report +=
  '## 3. Issue register and solution options\n\nSeverity: **Critical** blocks core use, exposes security/legal risk with concrete evidence, or risks data loss; **High** is a major usability/accessibility/SEO or purchase-influencing trust failure; **Medium** is a noticeable defect or best-practice gap; **Low** is polish/maintainability. Legal findings flag human review and do not assert a violation of a specific law. All findings below are **Open — no product fix in Phase 1**.\n\n'
report += table(
  ['ID', 'Severity', 'Category', 'Page(s)', 'Recommended option'],
  allIssues.map((i) => [i.id, i.severity, i.category, i.pages, i.recommended]),
)
for (const issue of allIssues) {
  report +=
    `\n### ${issue.id} — ${issue.category}\n\n**${issue.severity}; Open.** Page(s): ${issue.pages}. Viewport/browser scope: ${issue.viewport}.\n\nEvidence: ${issue.evidence.map((p) => '`' + p + '`').join(', ')}. Source: ${issue.root}.\n\nRoot cause: ${issue.cause}\n\nUser impact: ${issue.impact}\n\n` +
    table(
      ['Option', 'Solution', 'Effort', 'Risk', 'Side effects / trade-offs'],
      issue.options.map((o, i) => [
        `${i + 1}${issue.recommended === i + 1 ? ' — recommended' : ''}`,
        ...o,
      ]),
    )
}
report += '\n## 4. Functional, decorative and robustness evidence\n\n'
report += `Focused keyboard confirmation: ${keyboard.results.length} cases; ${keyboard.results.filter((r) => !r.mainFocused).length} explicitly focused skip-link Enter failures. Chromium/Firefox native first Tab reaches the skip link. On this host WebKit native Tab skips links; its first-Tab observation is retained separately, and explicit focus is not counted as proof of native Tab reachability. The earlier timing-sensitive functional attempt is retained under e2e/attempts. See baseline/keyboard.json.\n\n`
report += `Native form fallback: ${fallback.results.length} engine/mode cases; ${fallback.results.filter((r) => r.attempted?.length).length} attempted field-bearing native GET cases, with three clean hydrated controls. Keyboard activation was attempted first; requestSubmit diagnostics are explicitly recorded where used. All field-bearing requests were aborted locally before delivery. See baseline/nojs-form.json and SEC-004. Fresh hash loading also leaves duplicate headers/main landmarks in all engines and selected live confirmations; see baseline/hash-diagnostic.json and FUNC-003.\n\n`
report += `The functional suite recorded ${functional.pages.length} page/width/engine observations, ${functional.forms.length} form cases and ${functional.controls.length} distinct control exercises. It inventories links/buttons on each route and exercises shared controls by component family rather than sending mail or activating every external destination. Header CTA targets, native skip behavior and per-control expanded/pressed states are in functional.json. Empty/invalid submissions, Unicode/special characters, long input, XSS/SQL strings, double submit, draft encoding and clipboard status are inspected locally. These strings are not evidence of a backend injection test; there is no form backend in this application. Native mail-client handling and URI limits remain manual.\n\n`
report += `Additional input/stress evidence: ${stress.results.length} observations and ${stress.errors.length} runner errors in baseline/input-stress.json. This includes 72 service-capability keyboard activations, 30 scroll-input cases, and 36 cases each for text spacing, long labels and RTL across six selected templates at 390/1440 in all engines; ${stress.results.filter((r) => r.horizontalOverflow).length} stress document-overflow incidents. Desktop mouse/keyboard tests reach fully expanded states; phones already use an expanded fallback. Chromium native CDP touch scroll/drag worked and changed the globe canvas; other-engine touch swipes and physical hardware remain manual. The reduced-data protocol probe did not match and is unverified, not a product pass.\n\n`
report += `Globe CPU isolation: baseline/globe-profile.json records ${globeProfile.results.length} four-second samples under Chromium 4× CPU. Visible globe occupied about 99.9% task time; hiding it locally so its existing intersection observer stopped rendering reduced task time to about 0.03%; visible reduced-motion still occupied about 99.8%. This is a controlled local DOM-only comparison, not a device battery/field-INP estimate. It supports PERF-002's rendering cause.\n\n`
report += table(
  ['Form check', 'Recorded result'],
  [
    [
      'XSS-like input',
      functional.forms.some((f) => f.xssExecuted)
        ? 'Unexpected execution — inspect immediately'
        : 'No execution observed in recorded cases',
    ],
    [
      'Longest captured mailto URI',
      Math.max(0, ...functional.forms.map((f) => f.mailtoLength || 0)) +
        ' characters; actual client acceptance not verified',
    ],
    [
      'Empty/invalid cases',
      functional.forms.filter((f) => ['empty', 'invalid-email'].includes(f.test)).length +
        ' recorded; native validity and draft count in evidence',
    ],
    [
      'Copy fallback',
      functional.forms
        .filter((f) => f.test === 'copy-draft')
        .map((f) => f.engine + ': ' + f.status)
        .join('; ') || 'not recorded',
    ],
  ],
)
report +=
  '\n`baseline/e2e/robustness.json` contains ' +
  robustness.results.length +
  ' cases covering no-JS core content/navigation, reduced motion, forced colors, root-font scaling, reduced-viewport reflow, print-media screenshots, offline/failed font/image/ad-block simulation, history and Chromium slow-network/CPU conditions. These emulations do not establish real native zoom, OS font size, real ad-blocker behavior, field memory stability or actual mobile networks. All incomplete/errored cases are listed there rather than treated as passing.\n\n'
report +=
  'Decorative inventories include every rendered absolute/fixed/SVG/gradient/blur candidate and generated pseudo-element style found by the helper. Off-viewport geometry with a clipping ancestor is not automatically a defect. Visually reviewed families include Home grid/orb/property image, Services SVG artwork, Approach cards, product backgrounds/concepts/certificate backing, Company dots and Locations globe. The concrete phone annotation clipping is RESP-004. Oversized product contact-wave surfaces are clipped by their local layer and did not cause measured document overflow. Pseudo-element measurements are computed styles plus parent geometry, not exact raster bounds; transparent/canvas aesthetic alignment still needs the manual visual checklist. No blanket “all blobs are broken” conclusion is supported.\n\nSource review found ' +
  source.cssStats.reduce((n, c) => n + c.hundredVH.length, 0) +
  ' literal 100vh declarations; existing svh/dvh, clamp tokens, local WOFF2 with swap/preload, WebP derivatives, image dimensions and reduced-motion branches should be preserved where they work.\n\n'
report +=
  '## 5. Claims and page-by-page content review\n\nThe 911-item source-copy candidate inventory is in `baseline/content-candidates.md`/JSON with source lines. It deliberately includes instructions/headings/metadata as well as claims; source presence does not substantiate an operating fact. The reviewed business-claim groups below cover the factual assertions requiring evidence or approval. Historical repo notes are evidence of a prior source, not independent current verification. No competitor claims were copied into Invicto product code.\n\n'
report += table(
  ['Claim/group', 'Evidence status', 'Required reviewer / action'],
  [
    [
      'Dallas HQ / Bengaluru delivery roles',
      'Supported by user context and repo notes; exact addresses/legal entity still need current approval',
      'Leadership / Legal / Operations; CONTENT-020',
    ],
    [
      'Contact inbox/phone and founder titles',
      'Documented in docs/content-source.md as prior company/public-profile information',
      'Confirm current ownership/title/contact use; CONTENT-019/020',
    ],
    [
      'Tushar experience and educational credentials',
      'Published in site.ts; no substantiating credential source in reviewed repo evidence',
      'Leadership approval; CONTENT-019',
    ],
    [
      'Nationwide title/mortgage/tax/MLS support and service families',
      'Prior source notes exist; supported jurisdictions and actual scope are not defined per service',
      'Operations/Legal; CONTENT-001/004–008',
    ],
    [
      'TraceQ capabilities and live-product status',
      'Repo notes say company-supplied scope; screenshots are explicitly fictional sample data',
      'Product approval of release/demo/role-dependent availability; CONTENT-023',
    ],
    [
      'TitleFlow AI availability',
      'Older notes describe development direction while current pages show a live-product badge; current availability must be confirmed',
      'Product/Marketing; CONTENT-023',
    ],
    [
      'Tax Flow 1,200+ county websites',
      'Not substantiated by the reviewed evidence; not established false',
      'Product/Tax Operations/Legal; CONTENT-029',
    ],
    [
      'Human review and final determinations',
      'Consistent support-oriented framing appears in service/editorial/walkthrough copy; verify real contractual responsibilities',
      'Operations/Legal; CONTENT-013',
    ],
    [
      'Illustrative walkthroughs, certificate values and sample dashboards',
      'Explicitly identified as illustrative/fictional, not measured client results',
      'Preserve disclosures and approve screenshots; CONTENT-018/023',
    ],
    [
      'Website draft/clipboard/no automatic send behavior',
      'Clean hydrated controls support the draft mechanism; disabled/blocked scripts and unbound duplicate forms attempt native GET (SEC-004)',
      'Fix fallback and obtain approved wording; native email/provider handling and hosting processing remain separate; CONTENT-017/021/030',
    ],
    [
      'No advertising/analytics/browser-draft storage in application',
      'Source review and observed live requests/storage support the narrow application statement',
      'Hosting/provider processing is not fully established; CONTENT-021/027',
    ],
    [
      'Historical milestone figures in documentation',
      'Company-provided historical notes, not current website proof or a newly approved claim',
      'Validate definitions/date/evidence before any future use; CONTENT-003',
    ],
  ],
)
const contentRow = (route) => {
  if (route === '/')
    return [
      'Introduce title/mortgage/property support',
      'U.S. operations buyers',
      'Start a conversation / Services',
      'Shared cards/process repeat the hubs; proof and scope specifics need owner evidence.',
      'Clear human-review positioning; no fabricated customer proof.',
    ]
  if (route === '/our-company')
    return [
      'Company identity/leadership',
      'Buyer/vendor review',
      'Story/leaders, FAQ, shared contact CTA',
      'Confirm biographies, credentials, legal identity and operating claims.',
      'Named leaders and offices exist; current approval needed.',
    ]
  if (route === '/services')
    return [
      'Service discovery',
      'Lenders/title agents/servicers/law firms',
      'Explore service / contact',
      'Needs audience paths, catalogue, deliverables, turnaround terms, verified proof and due diligence.',
      'Useful existing atelier/cards; thin buyer detail at hub.',
    ]
  if (route.startsWith('/services/'))
    return [
      'Define ' + route.split('/').pop() + ' support',
      'Relevant operations buyer',
      'Discuss requirements / related product',
      'Existing scope/input-output/FAQ copy should be retained where approved; catalogue tiers, exclusions, integrations and evidence need confirmation.',
      'Review responsibility is stated; exact offered items require Ops/Legal sign-off.',
    ]
  if (route === '/our-approach')
    return [
      'Explain engagement/governance',
      'Operations/vendor governance',
      'Contact form',
      'Six generic stages lack measurable gates, owners, pilot terms, escalation, continuity and due-diligence detail.',
      'Pilot-first intent can be made specific only with owner data.',
    ]
  if (route === '/products')
    return [
      'Connect the product family',
      'Title/mortgage/property teams',
      'Open product system / product pages',
      'Release maturity and feature availability need approval; fix label-in-name.',
      'Human review stays central; product links and concepts exist.',
    ]
  if (route.startsWith('/products/'))
    return [
      'Explain ' + route.split('/').pop(),
      'Relevant operational/product buyer',
      'Demo/walkthrough/workflow / contact',
      'Confirm actual availability, integrations, demo scope and sample-data approval; Tax Flow coverage claim needs evidence.',
      'Fictional sample/concept disclosures are valuable; no sample is proof of client performance.',
    ]
  if (route === '/location')
    return [
      'Office identity and contact',
      'Buyers/candidates',
      'Directions / contact',
      'Approve addresses/roles and fix clipped globe annotations/keyboard controls.',
      'Office list supplies accessible information beyond the graphic.',
    ]
  if (route === '/privacy-policy')
    return [
      'Explain public website data handling',
      'All visitors / vendor review',
      'Privacy email; header CTA needs a valid target',
      'Public notice remains a draft; actual entity/providers/retention/rights require legal/business review.',
      'Clear narrow draft/clipboard behavior; no legal-compliance guarantee.',
    ]
  if (route === '/faq')
    return [
      'Answer engagement questions',
      'Prospective clients',
      'Ask another question / draft form',
      'Six answers remain broad; later service/approach FAQs should answer real buyer objections without duplicate claims.',
      'Native controls expose answer states; keyboard checks recorded.',
    ]
  if (route === '/blogs' || route === '/case-studies')
    return [
      'Find ' + (route === '/blogs' ? 'operating guides' : 'illustrative workflows'),
      'Title/mortgage/property buyers',
      'Read/filter/search / talk to team',
      'Approve editorial ownership and dates; walkthrough URL must not imply verified client outcomes.',
      'Explicit illustrative/no-measured-results disclosures retained.',
    ]
  return [
    'Read ' + route.split('/').pop().replaceAll('-', ' '),
    'Relevant operations reader',
    'Related capability / contact',
    'Needs approved editorial date/review ownership and useful service links; do not invent case results.',
    'Practical procedural content; walkthrough disclosures and some external sources exist.',
  ]
}
report +=
  '\n' +
  table(
    [
      'Page',
      'Purpose',
      'Audience',
      'Primary action',
      'Gaps / repetition / objections',
      'Trust/content status',
    ],
    publicRoutes.map((route) => [route, ...contentRow(route)]),
  )
report +=
  '\n## 6. Cannot verify here and manual checks\n\nSee `MANUAL_PHASE1.md` for repeatable real-device and screen-reader steps. Not verified: actual iOS Safari/Android/Samsung Internet/iPad hardware; VoiceOver/TalkBack/NVDA/JAWS; actual desktop browser zoom/OS font scale; native email-app launch/send/failure and URI limits; genuine ad-blocker/data-saver behavior; field INP/CrUX and real networks; TLS/cipher/origin/server-side security; hosting dashboards/provider logs/data residency; business claims, insurance, certifications, product availability or legal compliance.\n\nLive HTTP headers and selected live Chromium rendering were checkable and are not blanket “cannot verify” items; the exact observations are in security.json/live.json. Emulated WebKit is not real Safari. Source review, pattern scans, npm audit and JSON-LD syntax/graph checks are limited checks, not penetration testing, a complete license opinion or official rich-results validation. Memory checks do not prove absence of long-session leaks.\n\n'
report +=
  '## 7. Proposed fix order / inputs\n\n' +
  table(
    ['Order', 'Work group', 'Engineering estimate', 'Dependencies / phase'],
    [
      [
        1,
        'Guard native form submission, repair initial hash hydration, then menu portal/lock/focus with regression tests',
        '2–3 days',
        'Phase 2 approval; real-device follow-up',
      ],
      [
        2,
        'User-priority phone footer reflow/type, serious axe contrast/name findings, native skip semantics, input sizing and target areas',
        '1 day',
        'Phase 2; preserve desktop/brand',
      ],
      [
        3,
        'Confirmed decorative annotation clipping, safe areas and pointer/keyboard alternatives',
        '1 day',
        'Phase 2; phone/rotation checks',
      ],
      [
        4,
        'CTA route targets, history, semantic HTML/ARIA and local preview parity',
        '1 day',
        'Phase 2 focused fixes',
      ],
      [
        5,
        'Measured performance causes and policy-compatible header proposals',
        '1–3 days plus owner review',
        'Phase 2; no host deployment by agent',
      ],
      [
        6,
        'Coverage/availability/identity/privacy/operating policy approvals',
        'Owner-dependent',
        'Begin evidence gathering now; no invented replacements',
      ],
      [
        7,
        'Typed Services/Approach rebuild with approved specifics/TBDs',
        '4–7 days plus inputs',
        'Phase 3 only after Phase 2 gate',
      ],
      [
        8,
        'Sitewide trust/editorial/consistency and final documentation/regression',
        'Separate approved phases',
        'Phases 4 and 5',
      ],
    ],
  )
report +=
  '\nDecisions needed: approve the recommended Phase 2 fix scope; assign owners to `CONTENT_TODO.md`; confirm embedding/security-policy needs before header enforcement; decide later whether to replace the email-draft mechanism with an approved real endpoint/booking tool. Runtime services, analytics, tracking and hosting changes remain unapproved. Measurement/header options are proposals in `SECURITY_AND_MEASUREMENT_OPTIONS.md`; benchmark sources/patterns are in `BENCHMARKS.md`.\n\n'
report +=
  '## 8. Evidence index and files changed\n\n' +
  table(
    ['Path', 'Purpose'],
    [
      [
        'qa/backups/phase1/MANIFEST.md',
        'Pre-change copies/hashes of every existing file edited in this phase',
      ],
      ['qa/baseline/setup/', 'Installs, browser versions, attempts, typecheck and run logs'],
      [
        'qa/AUDIT_COVERAGE_PHASE1.md; PERFORMANCE_BUDGETS_PHASE1.md',
        'Requirement-to-evidence map, limits and template-specific future budget proposals',
      ],
      [
        'qa/baseline/{keyboard,input-stress,nojs-form,hash-diagnostic,globe-profile}.json',
        'Focused activation, native-input, failure-path and controlled root-cause confirmations',
      ],
      [
        'qa/baseline/routes.json',
        'Sitemap/nav/footer/internal route graph, orphans and HTTP observations',
      ],
      [
        'qa/baseline/e2e/',
        'Responsive screenshots/geometry, menu traces/videos, functional and robustness evidence',
      ],
      [
        'qa/baseline/axe/ and axe-index.json',
        'Per-page/engine/state axe results and screenshot references',
      ],
      [
        'qa/baseline/lighthouse/ and lighthouse-index.json',
        'Individual reports, medians, timing/resource and budget details',
      ],
      [
        'qa/baseline/{links,seo,security,live}.json',
        'Local/live links, metadata, headers, requests, storage and delivery observations',
      ],
      [
        'qa/baseline/html/; html-index.json; css.json',
        'Raw validation evidence; policy findings distinguished from semantic defects',
      ],
      [
        'qa/baseline/{eslint,prettier,spell,placeholders,source-features,content-candidates}.*',
        'Code/content/tooling checks and source lines',
      ],
      [
        'qa/FILES_PHASE1.md',
        'Full created/modified/deleted file inventory, including all evidence and backup copies',
      ],
    ],
  )
report +=
  '\nModified existing files are limited to AGENTS.md, package.json/package-lock.json (dev tooling/scripts), CONTENT_TODO.md, tests/README.md and qa/README.md. Product src/, public assets, build/prerender scripts and hosting/CI config were not edited. New tests/config/helpers/runners/reports/evidence and six pre-change backup copies are listed individually in FILES_PHASE1.md. No source files were deleted. Generated dependency/browser caches are excluded from the authored-file inventory and backups.\n\nRerun instructions: `tests/README.md`. In brief: `npm ci`, `npm run test:install`, `npm run build`, then `npm run test:all` (or the individual requested test scripts). Use a fresh QA_OUTPUT for later phases and do not run performance while other browser workloads are active.\n\n## 9. Safety confirmation and gate\n\nNo git commands that modify the repo were run. All changes are local and uncommitted.\n\nPhase 1 stops after this report and evidence review. No Phase 2 product work will begin without explicit written approval.\n'
await writeFile('qa/QA_REPORT_PHASE1.md', report)
await writeFile('qa/baseline/issue-register.json', JSON.stringify(allIssues, null, 2) + '\n')
console.log(
  JSON.stringify({
    report: 'qa/QA_REPORT_PHASE1.md',
    issues: counts,
    responsiveCases: responsive.index.length,
    axeScans: axe.index.length,
    lighthouseMeasurements: perf.rows.reduce((n, r) => n + r.runs.length, 0),
  }),
)
