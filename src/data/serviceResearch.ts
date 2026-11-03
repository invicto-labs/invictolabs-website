// Public company-authored LinkedIn material reviewed 2026-10-29.
// Summaries, not quotations. See docs/service-linkedin-research.md for scope and limitations.
const company = 'https://www.linkedin.com/company/invictolabs/'
const operations = 'https://www.linkedin.com/posts/invictolabs_valuation-services-mortgage-activity-7046162536643108864-KSdv'
const automation = 'https://www.linkedin.com/posts/invictolabs_thriving-amid-surges-invictos-title-order-activity-7272262437783945216-ptSp'
const updates = 'https://in.linkedin.com/company/invictolabs'

type Research = {
  headline: string
  accent: string
  signals: string[]
  heading: string
  cards: { title: string; description: string; items: string[]; source: string; sourceLabel: string }[]
}

export const serviceResearch: Record<string, Research> = {
  title: {
    headline: 'Every search.', accent: 'A clearer next step.',
    signals: ['Search', 'Examination', 'Commitment'],
    heading: 'More depth behind every title file.',
    cards: [
      { title: 'The search your file needs', description: 'Choose the research scope that fits the transaction.', items: ['Current-owner and two-owner searches', 'Full searches and update searches', 'Lien, judgment, and bankruptcy research'], source: company, sourceLabel: 'Title search updates' },
      { title: 'Capacity that moves with you', description: 'Add production support as order volume changes.', items: ['Search, exam, and commitment work', 'Daily orders and bulk workloads', 'Support within your existing workflow'], source: company, sourceLabel: 'Production capacity updates' },
      { title: 'A considered review process', description: 'Agree how the file will be checked and who will review exceptions.', items: ['Agreed review checklist', 'Exceptions flagged at handoff', 'Support for examiners and escrow teams'], source: company, sourceLabel: 'Quality-control updates' },
    ],
  },
  mortgage: {
    headline: 'Keep files moving.', accent: 'Make room for growth.',
    signals: ['Origination', 'Post-close', 'Valuations'],
    heading: 'Support across the mortgage lifecycle.',
    cards: [
      { title: 'Before the closing', description: 'Invicto’s published service portfolio includes origination and valuation services.', items: ['Origination operations', 'Valuation workflow coordination', 'Title and settlement support'], source: operations, sourceLabel: 'Mortgage service portfolio' },
      { title: 'Beyond the closing', description: 'The operational work continues after a file closes. Discuss the stages your team needs help managing.', items: ['Post-close support', 'Recording workflows', 'Servicing operations'], source: operations, sourceLabel: 'Post-close and servicing' },
      { title: 'Organized from the start', description: 'Data entry and indexing are part of Invicto’s published offering, alongside offshore delivery support.', items: ['Data-entry support', 'Document indexing', 'Offshore delivery coordination'], source: operations, sourceLabel: 'Data and delivery services' },
    ],
  },
  'tax-property': {
    headline: 'Property details.', accent: 'Connected to context.',
    signals: ['Tax research', 'Property data', 'MLS support'],
    heading: 'From property records to useful information.',
    cards: [
      { title: 'Tax and title, connected', description: 'Invicto positions tax services alongside its title and mortgage operations.', items: ['Property-tax research', 'Information organized by parcel', 'Inputs for the wider property file'], source: company, sourceLabel: 'Company service overview' },
      { title: 'Support for listing data', description: 'MLS services are part of the company’s stated outsourcing offering.', items: ['Agree the required listing fields', 'Work within authorized systems', 'Define the review and handoff'], source: company, sourceLabel: 'MLS service overview' },
      { title: 'Less repetitive research', description: 'A company update previews automation for tax certification and title search, aimed at reducing manual lookups and copy-paste work.', items: ['Tax-certification automation direction', 'A focus on less manual effort', 'Ask about current availability'], source: updates, sourceLabel: 'Automation preview · announced' },
    ],
  },
  technology: {
    headline: 'Built for your people.', accent: 'Connected to your work.',
    signals: ['Web experiences', 'Applications', 'Automation'],
    heading: 'Technology with an operational purpose.',
    cards: [
      { title: 'Web and application expertise', description: 'Web development and application development are listed company specialties.', items: ['Web experiences', 'Business applications', 'Requirements shaped with your team'], source: company, sourceLabel: 'Technology specialties' },
      { title: 'People and automation', description: 'Invicto’s approach pairs AI-driven solutions with cross-trained specialists and proactive communication.', items: ['Identify workflow bottlenecks', 'Connect tools with delivery teams', 'Keep communication in the process'], source: automation, sourceLabel: 'Automation and capacity' },
      { title: 'Built around real workflows', description: 'The company’s tax-certification and title-search automation preview focuses on repetitive operational work.', items: ['Manual lookup reduction', 'Less repeated data handling', 'Discuss the available product scope'], source: updates, sourceLabel: 'Automation preview · announced' },
    ],
  },
}
