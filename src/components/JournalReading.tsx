import { SiteLink } from './SiteLink'

export function JournalContents({ titles, prefix = 'reading' }: { titles: string[]; prefix?: string }) {
  return <nav aria-label="Article contents">{titles.map((title, index) => <SiteLink href={`#${prefix}-${index}`} key={title}><span>{String(index + 1).padStart(2, '0')}</span>{title}</SiteLink>)}</nav>
}

export function JournalReadingSection({ title, paragraphs, index, prefix = 'reading', headingLevel = 2 }: {
  title: string; paragraphs: string[]; index: number; prefix?: string; headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  return <section id={`${prefix}-${index}`} className="journal-reading-section"><span className="journal-section-index">{String(index + 1).padStart(2, '0')}</span><Heading>{title}</Heading>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
}
