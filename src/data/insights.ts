export type Insight = {
  slug: string; title: string; category: string; intro: string; takeaway: string;
  sections: { title: string; paragraphs: string[] }[]; checklist: string[];
  related: { label: string; href: string }; sources?: { label: string; href: string }[];
}

export const blogs: Insight[] = [
  {
    slug: 'a-review-ready-title-file', category: 'Title operations', title: 'The anatomy of a review-ready title file.',
    intro: 'Good research is only useful when the next person can follow it. A practical guide to organizing scope, sources, findings, and unresolved questions.',
    takeaway: 'Make the evidence easy to follow—not just the file easy to deliver.',
    sections: [
      { title: 'Start with a scope the team can use', paragraphs: ['Before research begins, establish the property identifiers, jurisdiction, search type, requested period, and output format. Identify who can clarify the instructions and who reviews the finished working file. A familiar property address is not a substitute for confirming the identifiers supplied with the order.', 'Record changes to the instructions where the production team can see them. If a source is unavailable or the requested scope is unclear, flag the issue rather than silently narrowing the assignment.'] },
      { title: 'Keep findings connected to their sources', paragraphs: ['Organize the working record so a reviewer can trace a finding to the relevant document or source reference. Use a consistent naming approach for retrieved records, and keep property details and instrument references together.', 'A concise summary can help a reviewer navigate the file, but it should not replace the source evidence. When a finding depends on a particular page or field, make that context easy to locate.'] },
      { title: 'Separate a finding from a decision', paragraphs: ['Research support prepares information for review. The authorized examiner or decision-maker determines what that information means for the transaction. Keep observations, open questions, and approved conclusions distinct.', 'Make unresolved items visible in a dedicated exception list. Include what needs clarification, the source involved, and the person responsible for the next step. Avoid presenting an incomplete search as a completed review.'] },
      { title: 'Deliver a package with a clear next step', paragraphs: ['Before handoff, check the agreed scope against the available records and the prepared output. Confirm that the file includes the references and outstanding items the reviewer needs.', 'A useful delivery note explains what was prepared and what remains open. It does not need to repeat the whole file. The aim is to let the next person begin their work without rebuilding the context.'] },
    ],
    checklist: ['Confirm scope and property identifiers', 'Link findings to retrievable source references', 'Separate observations from approved conclusions', 'Identify open items and the next owner'],
    related: { label: 'Explore title services', href: '/services/title' },
    sources: [{ label: 'ALTA: Best Practices educational resources', href: 'https://www.alta.org/policies-and-standards/best-practices/educational-resources' }],
  },
  {
    slug: 'mortgage-operations-handoffs', category: 'Mortgage operations', title: 'Better handoffs begin before the handoff.',
    intro: 'Adding capacity is not simply adding people. Define the inputs, ownership, and review expectations that make operational support useful.',
    takeaway: 'A handoff is complete when the next owner has the context to act.',
    sections: [
      { title: 'Define the assignment, not just the queue', paragraphs: ['Describe the work that the support team will perform and what your internal team retains. Agree on the incoming documents, required access, output format, and escalation contact. An order status alone rarely communicates all of those expectations.', 'For changing priorities, establish how the queue is updated and who can authorize a change. This avoids competing instructions arriving through separate messages.'] },
      { title: 'Make the next owner explicit', paragraphs: ['For every stage, identify who prepares the work, who reviews it, and who handles an exception. Use stage definitions that distinguish prepared, under review, awaiting information, and approved for the next step.', 'When an item is placed on hold, capture the reason and the required action. A visible hold with an owner is more useful than a queue entry that appears inactive without explanation.'] },
      { title: 'Keep document review grounded in the documents', paragraphs: ['Where an assignment involves mortgage documents, preserve the relevant version and source context. Comparing the wrong revisions can create unnecessary questions even when individual fields were transcribed correctly.', 'The CFPB’s Closing Disclosure explainer encourages borrowers to check details and compare relevant amounts with their Loan Estimate. That consumer-facing resource is a useful reminder of the importance of clear document context; it is not a substitute for a lender’s procedures or compliance review.'] },
      { title: 'Use an initial assignment to test the process', paragraphs: ['Review a sample output before increasing the scope. Check whether instructions were interpreted correctly, whether exceptions were raised clearly, and whether the next team could use the handoff without extra explanation.', 'Agree on the measures you want to observe before calling a rollout successful. Queue age, repeated clarification requests, and rework reasons can inform a process review when measured consistently. Do not treat additional capacity as proof of improved performance.'] },
    ],
    checklist: ['Document incoming and outgoing requirements', 'Assign preparation, review, and exception owners', 'Keep relevant document versions identifiable', 'Review a sample before expanding the scope'],
    related: { label: 'Explore mortgage services', href: '/services/mortgage' },
    sources: [{ label: 'CFPB: Closing Disclosure explainer', href: 'https://www.consumerfinance.gov/owning-a-home/closing-disclosure/' }],
  },
  {
    slug: 'human-review-and-title-automation', category: 'Technology & review', title: 'Automate preparation. Keep judgment visible.',
    intro: 'A practical way to think about AI-assisted title work: reduce repetitive preparation while keeping verification and approval in human hands.',
    takeaway: 'An extracted field is a starting point for review, not a final decision.',
    sections: [
      { title: 'Choose a specific preparation task', paragraphs: ['Start with a defined task such as organizing source documents, preparing editable fields, or assembling a working report. An automation brief should describe the input, expected output, and situations that need review.', 'Avoid making the tool responsible for an undefined end-to-end outcome. Clear boundaries make it easier to evaluate whether the prepared work fits the team’s instructions.'] },
      { title: 'Treat extraction as editable work', paragraphs: ['Document quality, layout, and wording can vary. Review extracted information against the source, especially identifiers and recorded-document references. Do not assume that a well-formatted output is a verified output.', 'TitleFlow AI supports a preparation-and-review workflow. Its role is to help organize the working file; your team remains responsible for checking the information and completing the final review.'] },
      { title: 'Make a quality finding actionable', paragraphs: ['A finding should help a reviewer identify the affected field and the relevant evidence. The next step may be correcting a record, confirming a value, or escalating an ambiguity.', 'After a correction, rerun the relevant checks and review any remaining exceptions. A clean-looking interface should not hide questions that still require an authorized person’s decision.'] },
      { title: 'Evaluate usefulness without assuming accuracy', paragraphs: ['Use a representative set of documents and record what required correction or clarification. Distinguish successful preparation from successful verification. These are different stages with different responsibilities.', 'Agree on acceptance criteria before expanding usage. Tool output, reviewer feedback, and exception handling all belong in that evaluation. No general claim about AI replaces a review of your own workflow.'] },
    ],
    checklist: ['Define the preparation task and its limits', 'Verify extracted fields against the source', 'Resolve or escalate each quality finding', 'Retain an authorized final review'],
    related: { label: 'Explore TitleFlow AI', href: '/products/titleflow-ai' },
  },
  {
    slug: 'property-tax-retrieval-context', category: 'Property research', title: 'A tax lookup is more than a parcel number.',
    intro: 'What to confirm before turning retrieved property-tax information into a working record for your mortgage or title operation.',
    takeaway: 'Keep the property, the source, and the retrieval context together.',
    sections: [
      { title: 'Confirm the identifiers first', paragraphs: ['Use the state, county, and parcel identifier together. Check that the identifiers supplied with the order match the property you intend to research. If a source returns multiple candidates, resolve the match before preparing the record.', 'Treat source-specific parcel formatting as part of the lookup instructions. An unsuccessful search should trigger follow-up, not an assumption that there is no tax information.'] },
      { title: 'Confirm source coverage and available fields', paragraphs: ['Before planning a rollout, discuss the county sources and certificate fields your team needs. Source access, record format, and the information available can differ across assignments.', 'Tax Flow retrieves available property-tax information from supported sources. Confirm suitability for your requested counties rather than assuming every source will provide the same record.'] },
      { title: 'Keep retrieval separate from interpretation', paragraphs: ['Preserve the available source context with the returned information. Where the source provides a tax period or status, keep it visible so a reviewer can understand which record was retrieved.', 'Retrieval is not a determination that a property has no outstanding obligations. Have the responsible reviewer assess the returned information and resolve missing or ambiguous fields under your team’s procedures.'] },
      { title: 'Give unavailable information a clear path', paragraphs: ['If a source cannot be reached or a field is missing, record the issue for follow-up. Distinguish source unavailability, an unmatched parcel, and an incomplete result; these do not mean the same thing.', 'Define who performs additional research and how the completed record is handed back. A useful automated workflow includes the exception path, not only the successful lookup.'] },
    ],
    checklist: ['Confirm state, county, and parcel together', 'Check coverage and required fields', 'Preserve source and tax-period context where available', 'Flag missing information for follow-up'],
    related: { label: 'Explore Tax Flow', href: '/products/tax-flow' },
  },
]

export const caseStudies: Insight[] = [
  {
    slug: 'title-production-handoff', category: 'Title services', title: 'From a research queue to a review-ready handoff.',
    intro: 'An illustrative operating model for a title team adding production support without transferring its final review responsibilities.',
    takeaway: 'Additional capacity works best when the handoff is defined.',
    sections: [
      { title: 'The operating challenge', paragraphs: ['Consider a title team receiving assignments through a shared queue. Researchers prepare records, but the examiner also needs to understand search scope, source limitations, and unresolved questions. A bundle of documents alone does not explain what has been completed.', 'This walkthrough describes a possible service arrangement. It is not a report of a client engagement or a claim about measured improvement.'] },
      { title: 'Define the working agreement', paragraphs: ['The client identifies the search types, jurisdictions, required source access, and delivery format. Both teams agree on the review checklist and the contacts responsible for clarifying instructions.', 'Final examination and approval remain with the designated client reviewer. The production team prepares the working file and identifies exceptions within the agreed scope.'] },
      { title: 'Move the file through three checkpoints', paragraphs: ['At intake, check identifiers and instructions. During research, organize the available records and references. Before delivery, compare the prepared package with the agreed checklist and list outstanding items.', 'If a source is unavailable or an instruction conflicts with the available information, pause the affected task and escalate the question. Preserve the context rather than presenting an uncertain item as verified.'] },
      { title: 'Evaluate the initial handoff', paragraphs: ['Use an initial assignment to assess whether the examiner can locate evidence and understand unresolved questions without reconstructing the research. Review any recurring clarification or rework reasons together.', 'Expand the scope only after both teams agree that the output and communication meet their requirements. Actual turnaround and quality results would need to be measured during an engagement.'] },
    ],
    checklist: ['Client defines scope and approval ownership', 'Production prepares sources and working records', 'Exceptions retain a named next owner', 'Initial output is reviewed before expansion'],
    related: { label: 'View title services', href: '/services/title' },
  },
  {
    slug: 'traceq-order-visibility', category: 'TraceQ', title: 'One order. A shared view of what happens next.',
    intro: 'A workflow walkthrough connecting order placement, assignments, production, review, and billing in TraceQ.',
    takeaway: 'Status is useful when it explains ownership and the next action.',
    sections: [
      { title: 'The operating challenge', paragraphs: ['Consider an operation using separate trackers for client orders, employee assignments, and billing. Each tracker may be useful locally, but a team member still has to reconstruct the current position of an order across them.', 'This is an illustrative coordination problem, not an account of a named client’s experience. The goal is to show how an operating record could be structured.'] },
      { title: 'Establish the shared order record', paragraphs: ['Agree on the order identifiers, required intake information, and stage definitions. Connect responsibility for each stage to the order so the next owner is clear.', 'TraceQ supports order management, assignments, production, quality, productivity, and invoicing. Configure the working process around the information each participating team needs rather than treating a dashboard as the process itself.'] },
      { title: 'Keep the exception path visible', paragraphs: ['An order awaiting clarification should carry a reason and an assigned follow-up. Distinguish an item that is actively being prepared from one that cannot proceed until information arrives.', 'Discuss the client-facing view and access requirements during setup. The intention is to provide a useful view of order activity without exposing unrelated operational or confidential information.'] },
      { title: 'Review the configuration with the team', paragraphs: ['Walk through a sample order from intake to completed work and billing preparation. Check whether the stage, responsible person, and outstanding action are understandable to the people who will use the system.', 'Validate permissions and the operational definitions before expanding usage. The dashboard image on the product page is a product preview, not evidence of a particular customer’s performance.'] },
    ],
    checklist: ['Agree on identifiers and stage definitions', 'Connect stage ownership to the order', 'Capture hold reasons and follow-up actions', 'Validate client visibility and permissions'],
    related: { label: 'Explore TraceQ', href: '/products/traceq' },
  },
  {
    slug: 'titleflow-source-to-review', category: 'TitleFlow AI', title: 'From source documents to a reviewer-led working file.',
    intro: 'An illustrative TitleFlow AI workflow showing where automated preparation ends and human review takes over.',
    takeaway: 'Preparation, correction, and final review are separate responsibilities.',
    sections: [
      { title: 'The operating challenge', paragraphs: ['Preparing a title file can involve moving information from source records into notes, editable fields, and a typed report. The team needs consistent working outputs, but it also needs the ability to examine and correct those outputs.', 'This example describes a product workflow. It does not claim error elimination, a time saving, or a verified client outcome.'] },
      { title: 'Prepare and verify the information', paragraphs: ['Start with the documents for the order and review the extracted property and recorded-document information against those sources. Correct editable fields before relying on them in the prepared report.', 'Use the workspace to assemble Search Notes, Typing Assist, and the working report. A structured output helps organize the task; it does not make the information automatically correct.'] },
      { title: 'Resolve the quality findings', paragraphs: ['Run the relevant checks for the selected search type. For each finding, examine the affected field and the evidence, then correct or escalate the item as appropriate.', 'Rerun checks after corrections and keep unresolved exceptions visible. The final reviewer decides whether the file is ready for delivery under the team’s own instructions.'] },
      { title: 'Assess the workflow before expansion', paragraphs: ['Review representative documents with the people who prepare and approve the work. Record which outputs were useful, where corrections were required, and whether the evidence was easy to follow.', 'Agree on acceptance criteria before expanding usage. Any future case study reporting results should explain the scope, measurement approach, and limitations of the engagement.'] },
    ],
    checklist: ['Review extraction against source records', 'Prepare editable notes and reports', 'Correct or escalate quality findings', 'Keep final approval with the reviewer'],
    related: { label: 'Explore TitleFlow AI', href: '/products/titleflow-ai' },
  },
  {
    slug: 'taxflow-parcel-to-record', category: 'Tax Flow', title: 'From parcel identifiers to a reviewable tax record.',
    intro: 'A Tax Flow workflow walkthrough covering source coverage, retrieval, missing fields, and the reviewer’s next step.',
    takeaway: 'A successful lookup includes enough context to review the result.',
    sections: [
      { title: 'The operating challenge', paragraphs: ['Consider a property-research team retrieving tax information across county sources. The team needs to identify the correct property and prepare a usable record, but source availability and field formats may differ.', 'This walkthrough illustrates how to plan retrieval and follow-up. It is not a client case study or a guarantee of coverage for a specific source.'] },
      { title: 'Confirm the input and source', paragraphs: ['Provide the state, county, and parcel identifier. Before rollout, confirm the requested counties and the fields your team needs with Invicto.', 'Check the property match and the available source context. An incomplete lookup should be flagged rather than filled with assumed values.'] },
      { title: 'Retrieve, review, and route exceptions', paragraphs: ['Tax Flow retrieves available tax information from supported sources. The responsible team member reviews the returned record against the available source and resolves any unclear or missing information.', 'Route unavailable sources, unmatched parcels, and incomplete results to a defined follow-up owner. These conditions need different next steps and should not be treated as a zero balance or a cleared property.'] },
      { title: 'Evaluate a representative county set', paragraphs: ['Start with the jurisdictions relevant to your operation and inspect the returned records. Check required fields, source context, and the handling of unsuccessful retrievals.', 'Agree on the delivery format and review responsibilities before extending usage. Actual coverage and workflow fit should be confirmed for your assignments, not inferred from an illustrative example.'] },
    ],
    checklist: ['Confirm county coverage and required fields', 'Match identifiers to the intended property', 'Review the result and source context', 'Give incomplete retrievals a follow-up owner'],
    related: { label: 'Explore Tax Flow', href: '/products/tax-flow' },
  },
]

export function readingMinutes(item: Insight) {
  return Math.max(1, Math.ceil([item.intro, ...item.sections.flatMap(s => s.paragraphs)].join(' ').split(/\s+/).length / 220))
}
