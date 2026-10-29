# Invicto company website

A professional, minimal, responsive company website for Invicto's United States audience. The project includes clean production routes, responsive interactive sections, company and FAQ pages, deployment fallbacks, and a tested production build.

## Current scope

- Responsive company website with a homepage, combined About/Leadership page, dedicated Products page, and Client FAQ page
- Industry-specific homepage hero with a preloaded three-image property carousel and reduced-motion-safe animation
- Desktop and mobile navigation
- Homepage hero, services, operating approach, partnership benefits, locations, contact, and footer sections
- Our Company page with a focused company-facts hero, combined story/founder profiles, and operating principles
- Client FAQ page with six accessible accordion answers and client-experience outcome cards
- Product studio page with an interactive Magic Rings hero, TraceQ operating-system showcase, and conceptual AI-assisted quality workflow
- Accessible semantic markup, keyboard-friendly navigation, and reduced-motion support
- Route-specific SEO and social-sharing metadata, canonical URLs, a custom 404 page, and legacy URL aliases
- Directly loadable canonical pages with reload-free in-app navigation, smooth view transitions, and working browser history
- Visibility-aware canvas/WebGL animation with reduced-motion support and resource cleanup
- Optimized WebP imagery and route-level JavaScript code splitting
- Supplied Invicto logo and custom favicon
- Click-to-email and click-to-call contact actions

## Technology

- React
- TypeScript
- Vite
- Three.js for responsive WebGL background effects
- Lucide icons
- Plain CSS with reusable design tokens

## Start locally

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Canonical routes

- `/` — homepage and section anchors such as `/#services`, `/#approach`, and `/#locations`
- `/our-company` — company story and leadership
- `/products` — TraceQ operations platform and developing AI-assisted quality workflow
- `/faq` — client questions and answers

Legacy `/home`, `/homepage`, `/company`, `/ourcompany`, `about.html`, and `faq.html` entries remain available. Browser-side normalization plus Netlify-style `_redirects` and `vercel.json` keep old links working while presenting the canonical URL.

## Quality checks

```bash
npm run typecheck
npm run build
npm run preview
```

## Deploy to Vercel

The repository includes a production-ready `vercel.json`. Import the project into Vercel or run the Vercel CLI from this project directory. The committed configuration sets:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: automatically detected from `package-lock.json` (`npm install`/`npm ci`)
- Required environment variables: none

Dashboard deployment:

1. Create a new Vercel project and import this source repository.
2. Keep the project root at the folder containing `package.json`.
3. Vercel will read all build and output settings from `vercel.json`.
4. Deploy, then connect the approved production domain in Vercel project settings.

CLI deployment:

```bash
npx vercel
npx vercel --prod
```

After deployment, verify `/`, `/our-company`, `/products`, `/faq`, and the legacy redirects listed below.

## Project structure

```text
invicto-website/
├── public/
│   ├── favicon.svg
│   ├── home-title-hero.webp
│   ├── home-title-house-2.webp
│   ├── home-title-house-3.webp
│   ├── invicto-logo.webp
│   ├── jay-prasad.webp
│   └── sneha-gowda.webp
├── src/
│   ├── components/
│   │   ├── Approach.tsx
│   │   ├── Contact.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Locations.tsx
│   │   ├── Logo.tsx
│   │   ├── Partnership.tsx
│   │   ├── RouteScrollManager.tsx
│   │   ├── SectionHeading.tsx
│   │   ├── Services.tsx
│   │   └── ui/
│   │       ├── MagicRings.tsx
│   │       └── MagicRings.css
│   ├── data/
│   │   └── site.ts
│   ├── AboutPage.tsx
│   ├── ProductsPage.tsx
│   ├── FaqPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── docs/
│   ├── content-source.md
│   └── roadmap.md
├── scripts/
│   └── build-production.ps1
├── home/
│   └── index.html
├── our-company/
│   └── index.html
├── products/
│   └── index.html
├── faq/
│   └── index.html
├── index.html
├── about.html
├── faq.html
├── 404.html
├── vercel.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Editing content

Most repeatable content—navigation, services, audiences, benefits, and locations—lives in `src/data/site.ts`. Section-level wording is in the matching component under `src/components`.

Global colors, spacing, typography, and responsive behavior are in `src/styles.css`.

## Content status

Company positioning and factual details were adapted from Invicto's public LinkedIn company profile. See `docs/content-source.md` for what was used and what should be confirmed before launch.

## Production notes

- `npm run build` is the standard production build command.
- On locked-down Windows environments where Vite cannot spawn its bundler, `scripts/build-production.ps1` provides an equivalent direct production bundle.
- Netlify-compatible redirects are emitted from `public/_redirects`.
- Vercel clean-route redirects and rewrites are defined in `vercel.json`.
- Unknown client routes render the custom 404 page when the host uses the included SPA fallback.
- Original high-resolution source imagery is archived in `docs/source-assets/`; only optimized WebP files are public.

## Business sign-off before public launch

1. Confirm service names, contact details, and legal footer requirements.
2. Add approved client proof, testimonials, and measurable outcomes when available.
3. Connect the contact CTA to a CRM or secure form endpoint if email is not the final workflow.
4. Add approved privacy, terms, cookie, and accessibility language before public launch.
# Production rendering and performance (October 2026)

`npm run build` now builds the React client and a temporary server-rendering bundle,
then pre-renders all 14 public routes. React Router still handles navigation;
the generated HTML improves first render and crawler access. Vercel rewrites
serve each route's generated HTML. Do not edit files inside `dist` or `.ssr`.

Production domain metadata targets `https://invictolabs.com`; DNS is unchanged.
Use `npm run preview -- --host 127.0.0.1 --port 4173` for production testing,
then `npm run verify:production`, `npm run audit:desktop` or `npm run audit:mobile`
in another terminal. See `PERFORMANCE-NOTES.txt` for measured results and limits.

