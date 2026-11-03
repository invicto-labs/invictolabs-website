# Launch checklist

- Confirm every publication input in `CONTENT_TODO.md`, replace approved placeholders, then run `npm run test:placeholders` with `QA_STRICT_PLACEHOLDERS=1`.
- Obtain business approval for sample and pilot terms, coverage, turnaround, the security summary, and any redacted deliverable.
- Obtain legal and privacy review. Confirm whether analytics or a lead endpoint is approved.
- Run the final production-build browser, accessibility, performance, and link suites. Review the unresolved findings and complete the real-device checklist.
- Review local hosting configuration with the release owner. Verify live headers, redirects, 404 status, sitemap, and canonical URLs after a separately authorized release.
- Keep a rollback reference and identify owners for uptime, field performance, and broken-link monitoring.
