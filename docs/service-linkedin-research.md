# Service-page research — 29 October 2026

Reviewed the public company profile, accessible company updates, and indexed company-authored posts. The requested `/posts/?feedView=all` endpoint could not be fetched. Public indexes expose different cached snapshots, so this is not an exhaustive or chronological export of the account. Relative ages and follower counts were not treated as current facts.

## Evidence used

| Source | Supported additions |
| --- | --- |
| [Invicto company profile and updates](https://www.linkedin.com/company/invictolabs/) | Current-owner, two-owner, full and update searches; ancillary research; search/exam/commitment support; flexible capacity; two-layer QC; mortgage, tax and MLS services; web/application specialties. |
| [Company mortgage/valuation post](https://www.linkedin.com/posts/invictolabs_valuation-services-mortgage-activity-7046162536643108864-KSdv) | Origination, valuation, servicing, post-close, recording, data entry/indexing and offshore delivery. Older portfolio statement; engagement scope still requires confirmation. |
| [Company automation and capacity post](https://www.linkedin.com/posts/invictolabs_thriving-amid-surges-invictos-title-order-activity-7272262437783945216-ptSp) | AI-driven workflows, cross-trained support and communication as the company's stated approach. |
| [Indexed regional company page](https://in.linkedin.com/company/invictolabs) | Preview of tax-certification/title-search automation. Described as announced, with availability to be discussed; not evidence of a completed product launch. |

## Editorial decisions

Summarized company-authored content in original language, with visible source links on each new expertise card. Existing scope and handoff copy describes proposed engagement details; a link to a portfolio statement does not independently verify every implementation detail. No external employee posts were used as company commitments.

Omitted advertised delivery percentages, turnaround numbers, accuracy guarantees and insurance claims: posts have differing dates and contexts, and do not establish universal service levels. Avoided new coverage counts, customer claims, performance metrics or launch dates. MLS detail stays at the authorized-workflow level because public material establishes the service category, not a detailed product specification.

Implementation: `src/data/serviceResearch.ts` retains the evidence URLs and research summaries. `src/data/serviceArticleText.ts` expands those summaries into original explanatory prose, distinguishing published offerings from proposed engagement steps. All four detail pages use a blog-style article with contents links and source references, reusing `JournalReading` with the blogs page. The hero, switcher, capability, scope, handoff, FAQ and contact components remain shared. All four service pages reuse the DotGrid component as a subtle viewport-sized background throughout the page; the dark process section uses a matching static dot texture. The homepage retains its scroll deck; product tilt is reused in the service hero.
