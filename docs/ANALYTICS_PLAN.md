# Analytics proposal

Measure qualified interest by service and route. Start with aggregate events and review the purpose, data retention, vendor access, consent, and regional requirements with Legal and Security before choosing tooling.

| Event | Permitted attributes |
| --- | --- |
| Service selected | Route and service slug |
| Service detail opened | Source route and destination service slug |
| Sample or pilot CTA selected | Route and CTA identifier |
| Inquiry draft prepared | Route and a success flag |
| Contact method selected | Route and email or phone category |

Exclude form contents, email addresses, borrower or property identifiers, and full query strings. A draft event measures draft preparation. It cannot measure email delivery or lead receipt.

Compare aggregate host reporting and a consent-aware first-party measurement option. Document consent behavior, retention, and QA before implementation. This proposal adds no tracking code.
