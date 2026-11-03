// Evidence-reviewed Phase 1 findings. Measurements are merged by report-phase1.mjs.
export const issues = [
  {
    id: 'PERF-003',
    severity: 'High',
    category: 'Full-resolution PNG delivery on phones',
    pages: '/products/traceq and /our-company',
    viewport:
      '390×844 Lighthouse mobile; TraceQ median performance 71; Company 95 but above image/total-byte budgets',
    evidence: [
      'qa/baseline/lighthouse/products_traceq_mobile_1.json',
      'qa/baseline/lighthouse/our-company_mobile_1.json',
      'qa/baseline/lighthouse-index.json',
      'src/components/ProductHeroVisual.tsx:11',
      'src/components/TraceQGallery.tsx:20',
    ],
    root: 'src/components/ProductHeroVisual.tsx:11; src/components/TraceQGallery.tsx:20; src/AboutPage.tsx:111; src/data/site.ts:48',
    cause:
      'TraceQ eagerly requests a 3200×2100 PNG at high priority without responsive source variants; its gallery also references original-size PNGs. The sampled mobile run transfers about 1.99 MB of images and 2.26 MB total, with modeled LCP about 7.1 s. Lighthouse identifies the heading as LCP, so the screenshot is a competing delivery cost rather than an asserted image-LCP element. Company also downloads a roughly 1.88 MB portrait PNG; Lighthouse estimates about 1.85 MB avoidable image bytes there, despite its good loading score.',
    impact:
      'Phone visitors download desktop-sized screenshot/portrait bytes and exceed image/total transfer budgets. Exact performance gains must be measured after generating legible responsive variants.',
    options: [
      [
        'Generate smaller WebP/AVIF variants with srcset/sizes for screenshots and portraits; preserve originals for deliberate detailed views',
        '0.5–1 day',
        'Low–Medium',
        'Check UI-text legibility, portrait quality and sample disclosures at every size; keep dimensions stable.',
      ],
      [
        'Use a cropped, readable phone preview with an explicit full screenshot action',
        '0.5–1 day',
        'Medium',
        'Changes mobile composition and requires keyboard-accessible enlargement; still optimize portraits.',
      ],
      [
        'Keep originals and defer noncritical images until intent/visibility',
        '2–4 hours',
        'Medium',
        'Useful for gallery/portrait traffic but does not remove the hero download cost.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'PERF-001',
    severity: 'High',
    category: 'Unused 3D dependency on service detail entry',
    pages: '/services/title, /services/mortgage, /services/tax-property, /services/technology',
    viewport: 'Lighthouse mobile, simulated 4G and 4× CPU, 3-run medians',
    evidence: [
      'qa/baseline/lighthouse-index.json',
      'qa/baseline/lighthouse/services_title_mobile_2.json',
      'qa/baseline/setup/build.txt',
    ],
    root: 'src/ServiceDetailPage.tsx:8,12; src/components/ServiceExperience.tsx:4,9; scripts/prerender.mjs:13–24',
    cause:
      'ServiceDetailPage re-exports ServicesHero, whose module imports MagicRings/Three.js. The built detail entry imports/preloads the 3D chunk even though the detail page renders SVG/GridBox art rather than ServicesHero. Lighthouse records about 116 KB transferred for Three.js, with about 75 KB unused in the sampled title run, plus the shared CSS cost. Detail mobile medians are 82–84, LCP about 3.2 s; CLS is zero.',
    impact:
      'Unneeded initial dependency delivery and processing reduce mobile performance on conversion-oriented detail pages. Exact savings require an approved implementation and repeat measurements; no improvement is promised from a code-size estimate alone.',
    options: [
      [
        'Split the hero/export dependency from detail capabilities so detail entries do not preload unused 3D code; remeasure critical CSS and hydration',
        '0.5–1 day',
        'Low–Medium',
        'Preserve the Services hub hero and all public URLs; verify SSR manifest dependencies and lazy-route behavior.',
      ],
      [
        'Lazy-load the decorative renderer only inside the actual visible hero, with a static mobile fallback',
        '0.5–1 day',
        'Medium',
        'May alter art timing; keep dimensions stable and avoid unnecessary network work on detail routes.',
      ],
      [
        'Replace all related 3D decoration with equivalent CSS/SVG',
        '1–2 days',
        'Medium–High',
        'Wider visual scope and desktop regression risk; not needed just to remove an unused detail import.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'PERF-002',
    severity: 'High',
    category: 'Continuous phone globe drawing dominates CPU',
    pages: '/location; shared globe on Home when visible',
    viewport: '/location mobile 3-run median performance 66; simulated 4× CPU; desktop score 99',
    evidence: [
      'qa/baseline/lighthouse/location_mobile_2.json',
      'qa/baseline/lighthouse-index.json',
      'qa/baseline/globe-profile.json',
      'src/components/ui/CobeGlobe.tsx',
    ],
    root: 'src/components/ui/CobeGlobe.tsx:232–372,375–383; shared Services bundle contains globe code',
    cause:
      'The visible globe redraws gradients, latitude/longitude paths, land points, arcs and labels on every animation frame. Reduced motion stops automatic rotation but still schedules full redraws. Mobile Lighthouse median modeled TBT is about 6.4 seconds (one sampled run about 8 seconds). A separate local 4× CPU comparison measured about 99.9% task occupancy while visible, about 0.03% with the globe hidden so its intersection observer stopped drawing, and about 99.8% when visible with reduced motion. This supports the continuous-rendering root cause; frame/CPU budgets still need implementation validation.',
    impact:
      'Continuous nonessential work can compete with input and increase battery/CPU use. Lighthouse modeled TBT is a lab result, not a claim that every real visitor experiences an eight-second freeze.',
    options: [
      [
        'Use a static or on-demand phone globe, draw only for interaction/state changes, and stop entirely while idle/offscreen/reduced-motion',
        '0.5–1 day',
        'Low–Medium',
        'Retain the office list and make any optional interaction accessible; less idle motion on phones.',
      ],
      [
        'Cache geometry/gradients, reduce/batch points and cap the active frame rate with a measured CPU budget',
        '1–2 days',
        'Medium',
        'Retains more animation but requires profiling and broad touch/resize testing.',
      ],
      [
        'Replace the phone graphic with an approved static SVG/location diagram',
        '0.5–1 day',
        'Medium',
        'Most predictable runtime cost but changes the mobile visual; preserve text information.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'RESP-005',
    severity: 'Medium',
    category: 'Phone footer typography and column hierarchy',
    pages: 'Shared footer; user reference from Our Approach',
    viewport: 'User-supplied 415×876 screenshot; phone layouts in the baseline matrix',
    evidence: [
      'qa/baseline/user-footer-reference.png',
      'src/components/Footer.tsx',
      'qa/baseline/e2e/layout/chromium/our-approach_390x844_portrait.json',
    ],
    root: 'src/styles.css:4325,4351,4353,4364,4958; src/components/Footer.tsx',
    cause:
      'At phone widths the outer footer becomes two columns, while Explore remains a nested two-column grid in only half the footer. overflow-wrap:anywhere permits mid-word breaks (including Walkthroughs and the contact email). Nav type is already about 13.9px and brand copy 14.4px; narrow columns and line spacing make the footer feel oversized/dense. The user explicitly requested a smaller, more balanced footer.',
    impact:
      'Link scanning and contact recognition suffer, with avoidable multi-line word fragments. There is no universal industry-mandated footer font size; hierarchy, readable wrapping and touch areas matter together.',
    options: [
      [
        'Reflow phone groups to useful widths, let Explore span the row, and tune secondary type/spacing while retaining 44px touch areas',
        '0.5 day',
        'Low–Medium',
        'Recommended 13–14px nav range and quieter legal text need visual/zoom review; preserve desktop and existing branding.',
      ],
      [
        'Use accessible expandable phone footer groups with a compact brand/contact block',
        '1 day',
        'Medium',
        'Reduces length but adds keyboard/state behavior and hides links until expanded.',
      ],
      [
        'Only shrink type and gaps within the current nested grid',
        '1–2 hours',
        'Medium UX risk',
        'Fast, but long labels/email may still break and target areas can become too small.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'ROBUST-001',
    severity: 'Medium',
    category: 'Print retains interactive collapsed/reveal states',
    pages: 'Home; shared scroll/reveal sections on Services/Approach/Locations',
    viewport:
      '1440×900 print-media emulation; Chromium screenshot inspected, other-engine artifacts retained',
    evidence: [
      'qa/baseline/e2e/screenshots/home_chromium-print_landscape_print.png',
      'qa/baseline/e2e/robustness.json',
    ],
    root: 'src/components/Services.tsx:27; src/components/Approach.tsx:30; src/styles.css scroll/reveal/sticky states; no explicit @media print rules found',
    cause:
      'The scroll-driven components enable their stacked/orbit layout based on viewport dimensions without excluding print. Print media retains collapsed cards, large scroll travel and unrevealed/low-opacity sections. The Home print-media capture shows concealed card content and long empty areas.',
    impact:
      'A visitor printing or saving the page may receive incomplete or wasteful output. A media screenshot does not establish printer pagination; paper/PDF checks remain in the manual checklist.',
    options: [
      [
        'Add a focused print stylesheet that expands cards, unpins sections, reveals content and hides nonessential art/navigation',
        '0.5 day',
        'Low–Medium',
        'Print-only visual changes; verify backgrounds off and page breaks.',
      ],
      [
        'Provide a concise accessible print view assembled from the same approved data',
        '1–2 days',
        'Medium',
        'Additional view to maintain; preserve URLs and avoid duplicated factual copy.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'SEC-004',
    severity: 'High',
    category: 'Native form fallback exposes fields in URL',
    pages: 'Shared contact form; fresh /#contact duplicate form',
    viewport: '390×844; Chromium, Firefox and WebKit',
    evidence: [
      'qa/baseline/nojs-form.json',
      'qa/baseline/nojs-native-confirmation/nojs-form.json',
      'src/components/Contact.tsx:19',
    ],
    root: 'src/components/Contact.tsx:19 and form opening tag (no action/method); src/main.tsx:68,97 for the unbound hash-loaded copy',
    cause:
      'The SSR form is enabled and has neither action nor method. Its draft-only behavior depends on the React submit handler calling preventDefault. Without JavaScript, with scripts blocked, or on the first unbound form in the duplicate hash-loaded tree, a valid submission attempts the native GET default with name, email, organization, topic and message as query parameters. Nine of twelve engine/mode cases attempted GETs; the three clean hydrated controls prepared a local draft without a GET.',
    impact:
      'Entered inquiry data could appear in URLs, browser history and hosting/request logs if the native request reaches the server. Only reserved synthetic data was used locally; all matching requests were intercepted and aborted before delivery. This does not establish any actual user-data exposure.',
    options: [
      [
        'Keep SSR submission disabled until enhancement is attached; provide a clear accessible email fallback and fix hash hydration',
        '0.5–1 day',
        'Medium',
        'Preserves draft-only behavior with no new service; verify slow/failed scripts, keyboard and all duplicate-tree cases.',
      ],
      [
        'Render the draft form only after client enhancement, retaining contact details and explanation in SSR content',
        '0.5 day',
        'Medium',
        'Form appears later and needs stable reserved space/loading semantics.',
      ],
      [
        'Replace the draft mechanism with an explicitly approved endpoint and reviewed privacy/error behavior',
        'Separate project',
        'High / approval required',
        'Adds data processing and a service; outside current authorization. Merely changing method to POST still sends data.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'FUNC-003',
    severity: 'High',
    category: 'Direct-hash hydration',
    pages: 'Fresh /#contact, /services#contact and /products#product-system loads',
    viewport: '390px; Chromium, Firefox and WebKit; live confirmation recorded separately',
    evidence: [
      'qa/baseline/hash-diagnostic.json',
      'qa/baseline/setup/hash-initial.json',
      'src/main.tsx',
    ],
    root: 'src/main.tsx:68 (early Navigate) and :97 (hydrateRoot)',
    cause:
      'The first client render returns Navigate when a hash/canonicalization is present instead of hydrating the prerendered page tree. Clean-load controls have one header/main; hash-load cases retain two. A temporary test-only normalization before hydration restores a single tree in all three engines.',
    impact:
      'Duplicate page content, IDs, landmarks and navigation controls make deep links unreliable. The persistent duplicate tree was observed beyond the initial load, not merely inferred from a timeout.',
    options: [
      [
        'Normalize the initial URL/target before hydration while preserving query/history state, so the first rendered tree matches the prerendered document',
        '0.5–1 day',
        'Medium',
        'Global routing bootstrap must be checked against aliases, history, focus and hashes.',
      ],
      [
        'Render the matching page during hydration and perform canonicalization/target navigation in a post-hydration effect',
        '1 day',
        'Medium',
        'Avoid a second duplicate scroll and ensure the intended target is applied exactly once.',
      ],
      [
        'Use a deliberate client-only render for initial redirect cases',
        '0.5 day',
        'Medium–High',
        'May flash loading content and sacrifices hydration/first-render benefits on those entries.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CODE-005',
    severity: 'Low',
    category: 'Unused source candidates',
    pages: 'Source/component architecture',
    viewport: 'Static import graph and reference search',
    evidence: [
      'qa/baseline/source-features.json',
      'src/components/ServiceSignature.tsx',
      'src/components/TaxCertificatePreview.tsx',
      'src/ServiceDetailPage.tsx:14',
    ],
    root: 'src/components/ServiceSignature.tsx; src/components/TaxCertificatePreview.tsx; unreferenced ServiceDirectory export',
    cause:
      'Reference searches identify older component/export candidates not used by the current rendered route tree; the import-graph inventory needs review before deletion. Old preview/zoom CSS also appears detached from current markup.',
    impact:
      'Dead or superseded examples can mislead future edits and audits; no measured runtime cost is claimed for tree-shaken/unimported modules.',
    options: [
      [
        'Document/deprecate the candidates and use the active components as the Phase 3 starting point',
        '1–2 hours',
        'Low',
        'No deletion or behavior change; cleanup remains explicit.',
      ],
      [
        'Remove confirmed unused files/exports/CSS after explicit deletion approval and regression checks',
        '0.5 day',
        'Medium',
        'User approval is required before deleting any file.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'FORM-001',
    severity: 'Medium',
    category: 'Required-field instructions',
    pages: 'Shared contact form',
    viewport: 'Mobile and desktop',
    evidence: ['src/components/Contact.tsx:40–45', 'qa/baseline/e2e/functional.json'],
    root: 'src/components/Contact.tsx:40–45',
    cause:
      'Name, email, company and message are natively required, but the visible form labels/instructions do not identify required fields before submission. Native validity remains useful and is exercised separately.',
    impact:
      'Visitors learn the requirement only after an attempted submission; actual screen-reader announcements still need manual verification.',
    options: [
      [
        'Add a concise visible required-field instruction or consistent markers/legend while retaining native required semantics',
        '1–2 hours',
        'Low',
        'Small microcopy/layout change; no backend needed.',
      ],
      [
        'Add accessible inline validation and field-specific error associations',
        '0.5–1 day',
        'Medium',
        'More client state and announcement testing; do not duplicate confusing native messages.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'RESP-004',
    severity: 'Medium',
    category: 'Decorative alignment',
    pages: '/location and shared Home globe',
    viewport: '430×932 phone baseline; animated label positions',
    evidence: [
      'qa/baseline/e2e/screenshots/location_chromium-430x932_portrait_baseline.png',
      'qa/baseline/e2e/layout/chromium/location_430x932_portrait.json',
    ],
    root: 'src/components/ui/CobeGlobe.tsx (projected label positioning); src/styles.css (.locations-globe-panel, .cobe-globe__label)',
    cause:
      'The projected arc label is centered on its moving point without bounding the label box to the clipped globe panel. At the captured state its x was -15.2px while the panel began at 16px, cutting off the beginning of “Connected delivery.” The panel correctly prevents document overflow.',
    impact:
      'A visible graphic annotation is partially clipped. The separate textual location list remains available, so this is not loss of the office information.',
    options: [
      [
        'Clamp projected label bounds within the panel with a small inset and verify at every rotation/phone width',
        '0.5 day',
        'Low–Medium',
        'May need leader-line or edge-anchor adjustments near the globe boundary.',
      ],
      [
        'Use a static mobile legend and hide moving annotation text while retaining location information',
        '2–4 hours',
        'Low',
        'Changes the mobile presentation of the graphic.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'MENU-001',
    severity: 'High',
    category: 'Mobile menu',
    pages: 'Shared header; reproduced on Home and repeated section pages',
    viewport: 'Phones/tablets at 40%, 80% and footer',
    evidence: [
      'qa/baseline/diagnostic-confirmation/menu-root-cause.json',
      'qa/baseline/e2e/menu.json',
    ],
    root: 'src/styles.css:1606,1743,1756,4421,4443; src/components/Header.tsx:24',
    cause:
      'Opening toggles body overflow:hidden. This creates a scrolling ancestor for the sticky header while the document stays scrolled; header and its absolute menu move above the viewport. Pointer-click diagnostics kept scrollY unchanged, and temporarily making body overflow visible restored header y=0 and menu y=71. Header backdrop-filter would also constrain a fixed descendant.',
    impact:
      'Navigation disappears when opened after scrolling; a fixed panel left inside the filtered header is insufficient.',
    options: [
      [
        'Portal a viewport-fixed menu outside the filtered header and use a tested scroll lock',
        '1–2 days',
        'Medium',
        'Shared header behavior changes; preserve desktop layout and safe areas.',
      ],
      [
        'Keep a header dropdown and redesign the lock/containing-block relationship',
        '0.5–1 day',
        'Medium–High',
        'Smaller patch but short-landscape panels and sticky interactions remain harder to reason about.',
      ],
      [
        'Use an expanding in-flow menu with explicit navigation to top',
        '0.5 day',
        'High UX risk',
        'Moves the reader away from the current position and does not meet the requested behavior.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'MENU-002',
    severity: 'High',
    category: 'Scroll locking',
    pages: 'Shared mobile menu',
    viewport: 'Phone/tablet emulations while scrolled',
    evidence: ['qa/baseline/e2e/menu.json', 'qa/baseline/menu.json'],
    root: 'src/components/Header.tsx:24; src/styles.css:1743,4421',
    cause:
      'Only body overflow is toggled; the document scroller remains movable. There is no explicit saved-position/restore mechanism. Keyboard focus escaping the overlay can also move the document.',
    impact:
      'Background content moves under the open menu and closing may return to a different reading position.',
    options: [
      [
        'Lock the actual document scroller, preserve scrollY and verify iOS/rotation cleanup',
        '0.5–1 day',
        'Medium',
        'Coordinate with the portal and scrollbar-gutter behavior.',
      ],
      [
        'Use a saved-position fixed-body lock with top:-scrollY and exact restoration',
        '0.5–1 day',
        'Medium–High',
        'More iOS/visual-viewport and focus restoration edge cases.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'MENU-003',
    severity: 'High',
    category: 'Keyboard accessibility',
    pages: 'Shared mobile menu',
    viewport: 'Phone/tablet menu-open state',
    evidence: ['qa/baseline/e2e/menu.json', 'qa/baseline/menu.json'],
    root: 'src/components/Header.tsx:9–44,77–99',
    cause:
      'The component has Escape/outside/route close handlers but no initial-focus placement, focus trap, background inertness or stored trigger-focus restoration.',
    impact:
      'Tab enters the page behind an open menu; keyboard/screen-reader users lose navigation context.',
    options: [
      [
        'Implement modal navigation focus management with native dialog or a small portal component',
        '1 day',
        'Medium',
        'Must account for nested Resources controls and route/resize close.',
      ],
      [
        'Keep nonmodal navigation and provide controlled disclosure focus behavior',
        '0.5–1 day',
        'Medium',
        'Would require changing the full-viewport modal requirement and explicit acceptance.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'A11Y-001',
    severity: 'High',
    category: 'Color contrast',
    pages: '/products/tax-flow',
    viewport: '390px and 1440px; Chromium/Firefox/WebKit',
    evidence: [
      'qa/baseline/axe-index.json',
      'qa/baseline/axe/chromium/_products_tax-flow_390_default.json',
    ],
    root: 'src/components/taxflow-experience.css:52,54; src/site-polish.css:41 (selected-state background)',
    cause:
      'Tax Flow step numbers use #91bacd on a blue selected-state background; axe measured 3.93:1 for 10.4px normal text, below 4.5:1.',
    impact: 'Small step labels are harder to read; serious WCAG contrast finding.',
    options: [
      [
        'Use an existing light text token for all selected step label states and verify every background',
        '1–2 hours',
        'Low',
        'A small state-specific color adjustment within the existing brand.',
      ],
      [
        'Darken the selected background and adjust the subordinate label as a pair',
        '2–3 hours',
        'Low–Medium',
        'Affects more of the selected visual treatment.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'A11Y-002',
    severity: 'High',
    category: 'Label in name',
    pages: '/products',
    viewport: '1440px; all three engines',
    evidence: [
      'qa/baseline/axe-index.json',
      'qa/baseline/axe/chromium/_products_1440_default.json',
    ],
    root: 'src/ProductsPage.tsx:190',
    cause:
      'Visible “Scroll to open” is replaced by aria-label “Scroll to explore the product system”; the visible wording is absent from the accessible name.',
    impact:
      'Voice-control users cannot reliably target the link by its visible label; serious axe finding.',
    options: [
      [
        'Remove the unnecessary aria-label and use the visible wording',
        '15–30 minutes',
        'Low',
        'Keep any extra destination context in nearby text.',
      ],
      [
        'Make the accessible name start with the visible wording and add concise context',
        '30 minutes',
        'Low',
        'Slightly longer announcement.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'RESP-001',
    severity: 'Medium',
    category: 'Mobile form',
    pages: 'Every page with Contact',
    viewport: 'Phone widths; measured at 320px',
    evidence: [
      'qa/baseline/e2e/responsive-index.json',
      'qa/baseline/e2e/layout/chromium/home_320x568_portrait.json',
    ],
    root: 'src/components/inquiry.css:6',
    cause: 'Inputs, select and textareas have font-size:.9rem = 14.4px with a 16px root.',
    impact:
      'Below the requested 16px input floor and creates iOS focus-zoom risk; actual iOS behavior needs a real-device check.',
    options: [
      [
        'Set form controls to at least 1rem and recheck wrapping/keyboard visibility',
        '1–2 hours',
        'Low',
        'Small control height/line-wrap changes.',
      ],
      [
        'Apply a phone-only 16px minimum while preserving larger-screen sizing',
        '1–2 hours',
        'Low',
        'Adds one responsive rule and a split sizing policy.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'RESP-002',
    severity: 'Medium',
    category: 'Touch targets',
    pages: 'Shared footer, service links, logo and product secondary links',
    viewport: 'Phone and tablet matrix',
    evidence: [
      'qa/baseline/e2e/responsive-index.json',
      'qa/baseline/e2e/layout/chromium/home_320x568_portrait.json',
    ],
    root: 'src/styles.css (logo/footer/service links); src/components/inquiry.css:13; src/refinements.css:15',
    cause:
      'Several interactive boxes are 18–40px high; service links are about 28px high on the 320px Home layout.',
    impact:
      'Misses the engagement’s 44×44px goal. This inventory alone is not proof of a WCAG 2.5.8 failure: inline-link/spacing exceptions and its 24px minimum require assessment.',
    options: [
      [
        'Add component-level minimum hit areas and spacing without enlarging copy',
        '0.5 day',
        'Low–Medium',
        'May increase mobile card/footer height.',
      ],
      [
        'Enlarge typography and full-row link areas',
        '0.5–1 day',
        'Medium',
        'Changes density more visibly.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'RESP-003',
    severity: 'Medium',
    category: 'Safe areas',
    pages: 'Global document / fixed and sticky surfaces',
    viewport: 'Notched-device support; real device not verified',
    evidence: ['index.html', 'qa/baseline/source-features.json'],
    root: 'index.html:5; shared header/menu CSS',
    cause: 'Viewport meta omits viewport-fit=cover and no safe-area env padding was found.',
    impact:
      'The requested notched-device foundation is absent; this is a code gap, not evidence of actual notch clipping in emulation.',
    options: [
      [
        'Add viewport-fit and scoped safe-area padding to edge-touching surfaces',
        '0.5 day',
        'Medium',
        'Must avoid double padding and check landscape/iOS keyboard behavior.',
      ],
      [
        'Keep the browser-inset viewport and document reduced edge-to-edge support',
        '1–2 hours',
        'Low',
        'Would require accepting a deviation from the requested foundation.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'A11Y-003',
    severity: 'Medium',
    category: 'Native skip-link semantics',
    pages: 'Shared header',
    viewport: 'All pages; JS-disabled/native navigation path',
    evidence: [
      'qa/baseline/axe-index.json',
      'qa/baseline/e2e/functional.json',
      'qa/baseline/e2e/robustness.json',
    ],
    root: 'src/components/Header.tsx:73; src/components/SiteLink.tsx:10–12; src/components/RouteScrollManager.tsx:26',
    cause:
      'SiteLink strips #main-content from the native href and carries it in router state. Axe reports the same-URL skip link outside a landmark. JS routing includes an explicit main-focus handler; this is not automatically a total JS-enabled bypass failure.',
    impact:
      'The bypass depends on JavaScript/router state and lacks the native fragment contract; no-JS/native link behavior is weaker.',
    options: [
      [
        'Use a native fragment anchor for the skip link and retain actual main focus behavior',
        '1–2 hours',
        'Low',
        'Coordinate with hash normalization and sticky-header offsets.',
      ],
      [
        'Teach SiteLink to preserve native fragments while retaining SPA scroll behavior',
        '0.5–1 day',
        'Medium',
        'Improves all anchor fallbacks but touches more routing semantics.',
      ],
    ],
    recommended: 2,
  },
  {
    id: 'A11Y-004',
    severity: 'Medium',
    category: 'Pointer alternatives',
    pages: '/location and Home globe',
    viewport: 'Mouse/touch/keyboard',
    evidence: ['qa/baseline/e2e/functional.json', 'src/components/ui/CobeGlobe.tsx'],
    root: 'src/components/ui/CobeGlobe.tsx:111–151,397–406; src/components/Locations.tsx:68–110',
    cause:
      'The globe implements pointer drag but has no focusable keyboard rotation controls; role=img names an interactive graphic. A text location list exists and preserves the underlying office information.',
    impact:
      'Keyboard/single-pointer users cannot explore the same rotation interaction; semantic purpose is ambiguous.',
    options: [
      [
        'Keep the office list and add labeled rotate/reset controls with bounded keyboard handling',
        '0.5–1 day',
        'Low–Medium',
        'Adds a few small controls; must preserve vertical touch scrolling.',
      ],
      [
        'Make the globe a decorative noninteractive visual and rely on the complete text list',
        '0.5 day',
        'Low',
        'Removes the exploration feature and needs design acceptance.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'FUNC-001',
    severity: 'Medium',
    category: 'Conversion path',
    pages: '/privacy-policy and custom 404',
    viewport: 'Mobile and desktop',
    evidence: ['qa/baseline/e2e/functional.json', 'src/components/Header.tsx'],
    root: 'src/components/Header.tsx:124–127',
    cause:
      'Header CTA routing special-cases Company/insights, while Privacy and 404 have no #contact section and still receive a same-route contact target.',
    impact:
      '“Talk to our team” can lead to no contact form or visible useful action on these routes.',
    options: [
      [
        'Route the shared CTA to /#contact unless the current page explicitly declares a contact section',
        '1–2 hours',
        'Low',
        'Requires a clear per-page capability instead of route-name guesses.',
      ],
      [
        'Use a consistent /#contact destination everywhere',
        '1 hour',
        'Low',
        'Moves visitors off the current page even when a local form exists.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'SEO-001',
    severity: 'Medium',
    category: 'Local preview parity',
    pages: '/privacy-policy and URL variants',
    viewport: 'Raw production-preview HTML before hydration',
    evidence: ['qa/baseline/seo.json', 'qa/baseline/live.json'],
    root: 'vite.config.ts:16–21',
    cause:
      'The manual preview rewrite route list omits Privacy. The clean path receives Home HTML with HTTP 200, while /privacy-policy/ serves its generated Privacy HTML. React later renders Privacy. Live hosting is separately checked and must not be conflated with this local result.',
    impact:
      'Can invalidate local raw-HTML, no-JS and performance evidence for this path and create false duplicate-title findings.',
    options: [
      [
        'Derive preview routes from the same route metadata or generated manifest',
        '0.5 day',
        'Low–Medium',
        'Prevents future drift; preserve real 404 handling.',
      ],
      [
        'Add the missing route to the manual list',
        '15 minutes',
        'Low',
        'Quick but future routes can drift again.',
      ],
      [
        'Use generated directory URLs only in test tooling',
        '1 hour',
        'Low',
        'Useful audit workaround but does not repair preview parity.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'SEO-002',
    severity: 'Low',
    category: 'Social/editorial metadata',
    pages: 'All social previews; blog/walkthrough articles',
    viewport: 'Raw HTML and share previews',
    evidence: ['qa/baseline/seo.json', 'src/seo.ts', 'src/InsightsPage.tsx'],
    root: 'src/seo.ts:4,10; src/data/insights.ts:1–4',
    cause:
      'One social image is shared across routes, while editorial data has no publication/review-date fields. Organization authorship is present; no named-author credibility or date should be invented.',
    impact:
      'Less specific share cards and weaker editorial context; not proof of invalid JSON-LD or an indexing failure.',
    options: [
      [
        'Add approved article dates/review ownership and selected route-specific social assets',
        '1–2 days plus content approval',
        'Low',
        'Requires real editorial data and maintained assets.',
      ],
      [
        'Keep the shared image and document a review cadence until approved material exists',
        '0.5 day',
        'Low',
        'Lower differentiation but avoids fabricated details.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'SEC-001',
    severity: 'Medium',
    category: 'CSP hardening',
    pages: 'Live site',
    viewport: 'HTTP response headers',
    evidence: ['qa/baseline/security.json', 'qa/SECURITY_AND_MEASUREMENT_OPTIONS.md'],
    root: 'vercel.json:7–35; scripts/prerender.mjs:64–73',
    cause:
      'No live CSP or report-only policy was returned. Current generated HTML uses inline critical CSS and inline stylesheet onload handlers, which need policy-aware treatment.',
    impact:
      'Missing defense in depth if a future injection occurs; no XSS exploit was found in this audit.',
    options: [
      [
        'Test a report-only policy, externalize/hash required inline code, then review enforcement',
        '1–2 days plus host approval',
        'Medium',
        'Can break style loading if enforced prematurely; no host changes during Phase 1.',
      ],
      [
        'Document a policy now and defer enforcement until build changes are approved',
        '0.5 day',
        'Low',
        'Leaves the defense-in-depth gap temporarily open.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'SEC-002',
    severity: 'Medium',
    category: 'Frame protection',
    pages: 'Live site',
    viewport: 'HTTP response headers',
    evidence: ['qa/baseline/security.json', 'qa/SECURITY_AND_MEASUREMENT_OPTIONS.md'],
    root: 'vercel.json headers',
    cause: 'Neither X-Frame-Options nor an enforced frame-ancestors policy was observed.',
    impact:
      'No declared browser frame restriction. This is clickjacking exposure, not proof of a working exploit or sensitive action.',
    options: [
      [
        'Confirm embedding needs, then propose frame-ancestors and compatible X-Frame-Options in local config',
        '1–2 hours plus owner approval',
        'Low',
        'DENY would block any approved embedding.',
      ],
      [
        'Allow only confirmed parent origins with frame-ancestors',
        '2–4 hours',
        'Medium',
        'Requires a maintained allowlist and compatibility testing.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'SEC-003',
    severity: 'Low',
    category: 'Permissions hardening',
    pages: 'Live site',
    viewport: 'HTTP response headers',
    evidence: ['qa/baseline/security.json'],
    root: 'vercel.json headers',
    cause:
      'No Permissions-Policy header was returned; the marketing site does not visibly require camera, microphone, geolocation or payment capabilities.',
    impact:
      'Unused capabilities are not explicitly restricted; no evidence that they are being accessed.',
    options: [
      [
        'Propose a narrow deny policy for unused capabilities after compatibility review',
        '1 hour',
        'Low',
        'Future features would need explicit policy updates.',
      ],
      [
        'Keep browser defaults and document the accepted hardening gap',
        '30 minutes',
        'Low',
        'No immediate behavior change.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'LEGAL-001',
    severity: 'High',
    category: 'Privacy/trust approval',
    pages: '/privacy-policy',
    viewport: 'Public live notice',
    evidence: ['src/PrivacyPage.tsx', 'docs/PRIVACY-REVIEW.md', 'qa/baseline/live.json'],
    root: 'src/PrivacyPage.tsx:8–44,57–60',
    cause:
      'The published notice explicitly remains a draft pending business/legal approval and leaves entity/provider/retention/rights practices unresolved.',
    impact:
      'Visitors cannot rely on a finalized approved account of actual processing. This is an approval/trust risk, not a legal conclusion that a specific law was violated.',
    options: [
      [
        'Complete the documented business/security/legal review and publish only approved accurate text in an authorized phase',
        'Owner-dependent; engineering 0.5 day',
        'Medium',
        'Requires evidence of real practices and an approved effective date.',
      ],
      [
        'Retain the explicit draft disclosure while obtaining approval and record launch acceptance',
        '1–2 hours',
        'Medium',
        'Transparent but does not resolve the underlying review gap.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CONTENT-001',
    severity: 'High',
    category: 'Claim substantiation',
    pages: '/products/tax-flow',
    viewport: 'Published product copy',
    evidence: [
      'src/components/TaxFlowExperience.tsx:17,19',
      'CONTENT_TODO.md:CONTENT-029',
      'qa/baseline/content-candidates.json',
    ],
    root: 'src/components/TaxFlowExperience.tsx:17,19',
    cause:
      '“1,200+ county websites” is an existing numerical coverage claim without a dated source inventory or approval in the reviewed evidence.',
    impact:
      'Potentially unsupported purchase-influencing claim. The audit does not establish that the number is false; it remains unverified.',
    options: [
      [
        'Obtain a dated, defined and approved source-coverage inventory, then retain appropriately scoped wording',
        'Owner-dependent; copy 1–2 hours',
        'Low',
        'Needs ongoing ownership as source availability changes.',
      ],
      [
        'Replace the number with a visible TBD in the next approved copy change',
        '1 hour',
        'Low',
        'Makes the review gap visible but is not finished public marketing copy.',
      ],
      [
        'Use approved nonnumeric scope wording and a county-confirmation CTA',
        '1–2 hours plus approval',
        'Low',
        'Less quantitative proof.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CONTENT-002',
    severity: 'High',
    category: 'Services conversion content',
    pages: '/services and service detail family',
    viewport: 'Mobile and desktop buyer journey',
    evidence: [
      'src/OperationsPage.tsx',
      'src/data/serviceDetails.ts',
      'src/data/serviceEditorial.ts',
      'CONTENT_TODO.md',
      'qa/BENCHMARKS.md',
    ],
    root: 'src/OperationsPage.tsx:10–18; src/data/site.ts services; src/data/serviceDetails.ts',
    cause:
      'The hub repeats the service-card model and lacks audience paths, scoped turnaround/delivery catalogue, approved coverage/proof, integration/due-diligence detail and engagement models. Detail pages already contain useful scope, handoffs and FAQs, so the brief’s “one sentence only” description is not universally accurate.',
    impact:
      'A buyer cannot complete vendor evaluation or understand the exact service/deliverable agreement.',
    options: [
      [
        'Build the requested typed shared catalogue and buyer/governance components in Phase 3, preserving useful approved detail copy and URLs',
        '3–5 days plus owner inputs',
        'Medium',
        'Visible TBDs remain where facts are unavailable.',
      ],
      [
        'Expand only the current cards and add a scope-request CTA',
        '1–2 days',
        'Low',
        'Faster but does not satisfy the agreed full structure.',
      ],
      [
        'Create separate audience landing pages in addition to the catalogue',
        '5–8 days',
        'High scope risk',
        'Adds URLs/content maintenance and needs a separate redirect/IA decision.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CONTENT-003',
    severity: 'High',
    category: 'Delivery governance content',
    pages: '/our-approach',
    viewport: 'Mobile and desktop buyer journey',
    evidence: ['src/components/Approach.tsx', 'src/data/site.ts:approach', 'CONTENT_TODO.md'],
    root: 'src/components/Approach.tsx; src/data/site.ts:approach',
    cause:
      'The six named stages do not define durations, roles, artifacts, decision owners/exit criteria, pilot acceptance, measured quality policy, escalation, continuity or due-diligence requirements.',
    impact:
      'An operations/security buyer cannot assess governance or how an engagement safely scales.',
    options: [
      [
        'Keep the six stages and rebuild their content as the approved Phase 3 delivery/governance model',
        '2–4 days plus owner inputs',
        'Medium',
        'Requires factual operating policies; no invented SLAs.',
      ],
      [
        'Add a concise onboarding checklist and contact-based due-diligence path first',
        '1 day',
        'Low',
        'Useful interim scope but incomplete against the requested model.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CONTENT-004',
    severity: 'Medium',
    category: 'Business/product evidence',
    pages: 'Company, Locations, Products, FAQ and shared positioning',
    viewport: 'Sitewide copy',
    evidence: ['qa/baseline/content-candidates.md', 'docs/content-source.md', 'CONTENT_TODO.md'],
    root: 'src/data/site.ts:company,leaders,locations; src/data/routeMetadata.ts; product components',
    cause:
      'Repo notes document earlier company-provided facts, but current product availability, source coverage, biography credentials, legal identity and broad operating claims need dated owner approval. Editorial examples are explicitly illustrative and must not be relabeled client proof.',
    impact: 'Trust and factual accuracy can drift even when wording is careful.',
    options: [
      [
        'Use the content register and copy-candidate inventory for owner-by-owner evidence approval',
        'Owner-dependent; 1 day editorial coordination',
        'Low',
        'Maintains claims evidence and preserves truthful illustrative material.',
      ],
      [
        'Remove or visibly mark unresolved claims in a later authorized copy phase',
        '0.5–1 day plus approval',
        'Medium',
        'May reduce persuasive detail until evidence arrives.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CODE-001',
    severity: 'Medium',
    category: 'HTML semantics',
    pages: '/products/traceq',
    viewport: 'Generated production HTML',
    evidence: ['qa/baseline/html/_products_traceq.json', 'qa/baseline/html-index.json'],
    root: 'src/ProductsPage.tsx:320',
    cause:
      'Six capability descriptions render <p> inside <span>, which is invalid permitted content.',
    impact:
      'Invalid HTML and potential parsing/assistive-technology inconsistency; no observed hydration crash is claimed solely from validation.',
    options: [
      [
        'Use an appropriate block wrapper for the capability title and paragraph',
        '1 hour',
        'Low',
        'Verify CSS selectors and spacing.',
      ],
      [
        'Use phrasing text elements consistently within the existing span',
        '1–2 hours',
        'Low–Medium',
        'May require recreating block spacing with CSS.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CODE-002',
    severity: 'Medium',
    category: 'ARIA semantics',
    pages: 'Home/Services/Tax Flow and other named generic wrappers',
    viewport: 'Generated HTML / assistive technology',
    evidence: ['qa/baseline/html-index.json', 'qa/baseline/html/home.json'],
    root: 'src/components/Partnership.tsx; src/components/ServiceAtelier.tsx; src/components/TaxFlowExperience.tsx',
    cause:
      'HTML validation reports aria-label on generic elements that do not permit naming; labels alone do not establish a group/region/list semantic.',
    impact: 'Intended group names may not be conveyed consistently.',
    options: [
      [
        'Use native labeled sections/lists or a justified group role where the grouping has meaning',
        '0.5 day',
        'Low',
        'Avoid adding noisy regions for decoration.',
      ],
      [
        'Remove redundant wrapper labels where visible surrounding headings already provide context',
        '1–2 hours',
        'Low',
        'Use only when no programmatic grouping is needed.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CODE-003',
    severity: 'Low',
    category: 'CSS maintainability',
    pages: 'Shared/page CSS',
    viewport: 'Source validation',
    evidence: ['qa/baseline/css.json', 'qa/baseline/source-features.json'],
    root: 'src/styles.css; src/service-details.css; src/components/product-insights.css; refinement styles',
    cause:
      'The strict Stylelint baseline includes duplicate selectors, descending specificity and many formatting/convention findings. They are not thousands of independent visual defects.',
    impact:
      'Layered overrides make responsive root causes and future regressions harder to manage.',
    options: [
      [
        'Agree repo-compatible lint rules, then consolidate only the affected component rules during approved fixes',
        '1–2 days spread across fixes',
        'Low–Medium',
        'Avoid a sitewide style-only rewrite.',
      ],
      [
        'Normalize all CSS formatting and naming in one pass',
        '2–3 days',
        'High review risk',
        'Large diff can conceal behavior changes and exceeds focused-fix preferences.',
      ],
    ],
    recommended: 1,
  },
  {
    id: 'CODE-004',
    severity: 'Low',
    category: 'Type/lint conventions',
    pages: 'Source tooling',
    viewport: 'Static checks',
    evidence: ['qa/baseline/eslint.json', 'qa/baseline/prettier.json', 'qa/baseline/spell.txt'],
    root: 'src/types/three.d.ts:47; project-wide existing formatting',
    cause:
      'One explicit any is flagged by the new TypeScript lint rules. Existing source fails the default formatting baseline; after reviewing the technical dictionary, two US-English variants remain in Privacy (finalised and behaviour).',
    impact:
      'The new checks need a reviewed baseline and a sound type boundary; dictionary findings are not automatically customer-facing misspellings.',
    options: [
      [
        'Use a precise/unknown type at the boundary, document accepted conventions and tune only legitimate dictionary identifiers',
        '0.5 day',
        'Low',
        'Keeps review focused and prevents suppressing real copy issues.',
      ],
      [
        'Introduce a broad formatting/type cleanup separately',
        '1–2 days',
        'Medium',
        'Large unrelated diff; requires explicit scope approval.',
      ],
    ],
    recommended: 1,
  },
]
