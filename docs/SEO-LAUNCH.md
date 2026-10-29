# SEO deployment for invictolabs.com

## Domain status

The owner confirmed on October 22, 2026 that the main domain is not connected yet. The Vercel address remains usable for review. The canonical origin is https://invictolabs.com throughout the metadata, structured data, sitemap and discovery file.

Before treating this as an SEO launch:

1. Add invictolabs.com and www.invictolabs.com to this Vercel project. Use the exact DNS values displayed by Vercel for this project; do not guess an IP address. Preserve existing email MX/TXT records.
2. Wait for Vercel to validate DNS and HTTPS. The repository redirects www to the apex domain.
3. Confirm all canonical pages load on invictolabs.com. Check a deliberately nonexistent URL returns HTTP 404, and /home redirects to /.
4. Only after the apex domain works, configure the old invictolabs.vercel.app address to redirect to the primary domain using Vercel's domain settings. Do not redirect the review address to an unconnected domain.
5. Verify the invictolabs.com domain property in Google Search Console using its supplied DNS TXT record. Submit https://invictolabs.com/sitemap.xml. Inspect the homepage and priority service/product URLs.
6. Enable analytics with an approved public measurement identifier and consent configuration appropriate to the chosen provider. No analytics account or identifier was supplied, so no fake identifier or tracking script has been added.
7. Track actual enquiry actions separately: preparing an email draft is not a submitted lead. Track opening the email application as intent, not confirmed delivery. The current contact flow does not send messages from a server.

## Code safeguards

- npm run build includes static rendering and automatic SEO checks for all public routes.
- npm run verify:seo checks unique metadata, one H1, canonical URLs, JSON-LD, social images, internal links, local media and the missing-page configuration.
- npm run verify:production -- https://invictolabs.com checks deployed page HTML, canonicals and bundles.
- Sitemap and llms.txt are generated from actual route metadata; no invented modification dates are added.
- Organization, WebSite, page, breadcrumb, service and software data reflect existing content. Articles identify the organization as author. There are no invented reviews, ratings, prices, certification claims or publication dates. Software markup does not guarantee Google rich-result eligibility.
- The custom 404 is prerendered with noindex. Vercel has no catch-all homepage rewrite.
- Existing page aliases redirect permanently. Social metadata updates on both initial requests and client navigation.

## Performance and ongoing search work

Use production builds for Lighthouse. Run desktop and mobile sequentially; concurrent audits distort CPU measurements. Local scores are lab measurements, not field measurements or a guarantee of live scores. Verify deployment using PageSpeed Insights and Search Console after connecting the domain. Core Web Vitals targets at the 75th percentile: LCP <= 2.5 seconds, INP <= 200 ms, CLS <= 0.1.

Review Search Console queries and page indexing monthly. Improve pages based on real buyer questions and product evidence. Publish substantive original guides with appropriate human review. Only add customer results or testimonials after receiving permission and supporting evidence. Do not generate county landing pages without useful county-specific content and verified coverage.

No one-time code change guarantees number-one rankings or permanent 100 scores. Search visibility also depends on indexing, competition, real user experience and credible external references.
