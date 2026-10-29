type Editorial = {
  heading: string
  introduction: string
  scope: { title: string; description: string; items: string[] }[]
  inputs: string[]
  outputs: string[]
  questions: [string, string][]
}

// Proposed engagement scope, not blanket coverage or service-level guarantees.
export const serviceEditorial: Record<string, Editorial> = {
  title: {
    heading: 'Behind every file, a connected chain of work.',
    introduction: 'A title file is more than a collection of records. Research must be organized, findings must retain their context, and the next person in the process needs to know what still requires attention. We shape the support around that handoff.',
    scope: [
      { title: 'Research with a defined boundary', description: 'Start with the property, jurisdiction, and search requirements. The agreed scope determines which records are researched and how the findings are organized.', items: ['Property and party identifiers supplied with the order', 'Ownership and recorded-document research within the agreed scope', 'Source references and unavailable-record exceptions'] },
      { title: 'Production your team can review', description: 'Turn collected information into a consistent working file. Use your required structure so reviewers can focus on the findings rather than rebuilding the document.', items: ['Organization of source documents and research notes', 'Preparation of agreed title-production fields and formats', 'Unresolved items identified for your designated reviewer'] },
      { title: 'A more deliberate handoff', description: 'Support the information flow around settlement without obscuring who is responsible for examination, approval, and professional decisions.', items: ['File information prepared for the next workflow stage', 'Missing inputs and follow-up items made visible', 'Delivery format and review ownership agreed at onboarding'] },
    ],
    inputs: ['Property address, parcel details, and relevant parties', 'Jurisdiction, search type, and required search period', 'Output template, review checklist, and escalation contact'],
    outputs: ['Research organized to the agreed search scope', 'Prepared working documents with source context', 'Exceptions and outstanding items for client review'],
    questions: [
      ['Can you work with our title-production format?', 'Share your template, sample file, and required fields during scoping. We use these to define the preparation and review workflow before work begins.'],
      ['Who makes the final title determination?', 'Your designated examiner or authorized professional retains responsibility for final determinations and approvals. Our role is the operational support agreed for the engagement.'],
      ['How are missing records handled?', 'Source limitations and unresolved items should be surfaced rather than treated as complete findings. The escalation route and follow-up responsibilities are established with your team.'],
    ],
  },
  mortgage: {
    heading: 'Keep the file moving. Keep your team in control.',
    introduction: 'Mortgage operations span multiple teams and checkpoints. Our support is scoped to the administrative work between those checkpoints, with clear inputs, responsibilities, and handoffs—not a replacement for lending judgment.',
    scope: [
      { title: 'Origination operations', description: 'Bring structure to the information entering your workflow. Define the administrative tasks your team needs help with and the checks required before the next handoff.', items: ['Organization of client-supplied file information', 'Document indexing and checklist-based preparation, when scoped', 'Missing-information queues routed to the responsible team'] },
      { title: 'Post-close coordination', description: 'Closing does not end the operational workload. Support the organization and follow-up of documents against your post-close requirements.', items: ['File and document organization against agreed checklists', 'Outstanding-item tracking within the assigned workflow', 'Prepared information for your internal review and follow-up'] },
      { title: 'Valuation-related workflows', description: 'Help coordinate the movement of information around valuation work while keeping valuation conclusions with the appropriate professionals.', items: ['Organization of property and order information', 'Administrative status and handoff coordination', 'Exceptions directed to your designated owner'] },
    ],
    inputs: ['Workflow stage, task list, and required file inputs', 'Authorized system access and document-handling requirements', 'Review criteria, escalation owners, and delivery priorities'],
    outputs: ['File information organized for the assigned stage', 'Visible outstanding items and operational handoffs', 'Work prepared for your team’s review and next action'],
    questions: [
      ['Can we start with a single workflow stage?', 'Yes—define the stage and tasks you want to discuss. A focused scope helps establish inputs, ownership, and acceptance criteria before considering broader support.'],
      ['Does this include underwriting or appraisal decisions?', 'This page describes operational and administrative support. Lending decisions, appraisal conclusions, and other professional determinations remain with the responsible authorized team.'],
      ['How are changing priorities managed?', 'Agree on queue ownership, priority rules, and escalation channels at onboarding. Capacity and turnaround expectations must be confirmed for the actual scope and volume.'],
    ],
  },
  'tax-property': {
    heading: 'The right property. The relevant information.',
    introduction: 'Property data only becomes useful when it is tied to the correct parcel and understood in the context of its source. We organize research around the jurisdiction, required fields, and intended review process.',
    scope: [
      { title: 'Property-tax research', description: 'Research available tax information for the identified property and jurisdiction. Available fields vary by source, so the scope is confirmed before delivery expectations are set.', items: ['Parcel and jurisdiction matching from supplied identifiers', 'Available assessment, tax, and payment information when in scope', 'Source limitations or missing fields highlighted for review'] },
      { title: 'Property-data preparation', description: 'Bring the requested property information into a usable structure without stripping away the context your reviewers need.', items: ['Property identifiers and source information organized together', 'Required data fields prepared in your agreed format', 'Conflicting or incomplete information flagged for follow-up'] },
      { title: 'MLS-related support', description: 'Support agreed property-data tasks using the systems and access your team is authorized to provide. Access rights and permitted use are part of scoping.', items: ['Organization of authorized listing-related information', 'Field preparation and agreed data-maintenance tasks', 'Exceptions and incomplete inputs routed to your team'] },
    ],
    inputs: ['Parcel number, state, county, and available property address', 'Required tax or property fields and intended output format', 'Authorized sources, access requirements, and review contact'],
    outputs: ['Available information tied to the identified property', 'Structured research with source context', 'Unavailable or conflicting fields identified for review'],
    questions: [
      ['Is every county or field available?', 'No universal coverage is implied. Source access, available fields, and data freshness vary by jurisdiction. Confirm your county list and requirements with our team.'],
      ['How does Tax Flow relate to this service?', 'Tax Flow is our property-tax retrieval application. The service engagement defines the research and handling your team needs; use of the application and supported sources can be discussed separately.'],
      ['Is the output a guarantee of current tax liability?', 'No. Research reflects the information available from the relevant source. Your team should review the findings and confirm any time-sensitive amounts with the appropriate authority.'],
    ],
  },
  technology: {
    heading: 'Start with the work. Build the right system.',
    introduction: 'Useful technology begins with a specific operational problem. We connect the intended users, information flows, and acceptance criteria before shaping the web experience, application, or workflow.',
    scope: [
      { title: 'Web experiences with a purpose', description: 'Define what visitors need to understand and do, then shape the content, navigation, and responsive experience around those goals.', items: ['Audience, content, and page-structure planning', 'Responsive interfaces and clear navigation', 'Agreed functionality validated before handoff'] },
      { title: 'Applications around real users', description: 'Map the tasks and information each user needs. Translate the agreed requirements into focused screens and actions rather than a disconnected collection of features.', items: ['User journeys and functional requirements', 'Task-oriented interfaces and scoped business workflows', 'Review against agreed acceptance criteria'] },
      { title: 'Workflow enablement', description: 'Identify repetitive steps, inconsistent inputs, and avoidable handoffs. Explore automation where the process and source access support it, with explicit handling for exceptions.', items: ['Process mapping and automation opportunity assessment', 'Integration requirements and dependencies identified early', 'Review checkpoints and exception paths designed into the flow'] },
    ],
    inputs: ['Business objective, intended users, and current process', 'Required features, existing systems, and access constraints', 'Acceptance criteria, delivery priorities, and deployment needs'],
    outputs: ['A solution shaped around the agreed requirements', 'Validated user flows and defined operational handoffs', 'Deployment, documentation, and support deliverables as scoped'],
    questions: [
      ['Can you connect to an existing system?', 'Integration feasibility depends on the system’s interfaces, access permissions, and restrictions. We identify those dependencies during scoping rather than assume compatibility.'],
      ['Can we build in phases?', 'A phased scope can separate essential workflows from later enhancements. Milestones and acceptance criteria should be agreed before implementation.'],
      ['What happens after delivery?', 'Deployment, maintenance, documentation, and ongoing support are defined in the engagement. They are not assumed to be included without an agreed scope.'],
    ],
  },
}
