import { FileText, Layers3, SearchCheck, UserCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './titleflow-concept.css'

export function TitleFlowConcept() {
  return <figure className="titleflow-concept" aria-label="Illustration of document preparation and human review, not the TitleFlow interface">
    <div className="titleflow-concept__label">TITLEFLOW AI <span>WORKFLOW CONCEPT</span></div>
    <div className="titleflow-concept__papers" aria-hidden="true"><div /><div /><div><FileText size={38} /><i /><i /><i /><span>SOURCE RECORDS</span></div></div>
    <div className="titleflow-concept__line" aria-hidden="true"><i /></div>
    <div className="titleflow-concept__steps"><span><Layers3 size={22} />Prepare</span><span><SearchCheck size={22} />Review</span><span><UserCheck size={22} />Finalize</span></div>
    <figcaption><strong>Technology assists.<br />Your team makes the decision.</strong><p>Illustrative workflow—not the product interface.</p></figcaption>
  </figure>
}

export function TitleFlowExample() {
  const gridRef = useRef<HTMLDivElement>(null)
  const referenceRef = useRef<HTMLDivElement>(null)
  const sourceValueRef = useRef<HTMLDivElement>(null)
  const [referencePath, setReferencePath] = useState('')

  useEffect(() => {
    const grid = gridRef.current
    const reference = referenceRef.current
    const sourceValue = sourceValueRef.current
    if (!grid || !reference || !sourceValue) return

    const observer = new ResizeObserver(() => {
      const bounds = grid.getBoundingClientRect()
      const start = reference.getBoundingClientRect()
      const end = sourceValue.getBoundingClientRect()
      const startX = start.right - bounds.left + 4
      const endX = end.left - bounds.left - 4
      const startY = start.top - bounds.top + start.height / 2
      const endY = end.top - bounds.top + end.height / 2
      const middleX = (startX + endX) / 2
      setReferencePath(endX > startX ? `M ${startX} ${startY} C ${middleX} ${startY}, ${middleX} ${endY}, ${endX} ${endY}` : '')
    })
    observer.observe(grid)
    observer.observe(reference)
    observer.observe(sourceValue)
    return () => observer.disconnect()
  }, [])

  return <figure className="titleflow-example">
    <div className="titleflow-example__header"><strong>From source to review</strong><span>Fictional example</span></div>
    <div className="titleflow-example__grid" ref={gridRef}>
      <div className="titleflow-example__source">
        <div className="titleflow-example__panel-label"><FileText size={18} aria-hidden="true" /> 01 / Source record</div>
        <div className="titleflow-example__document">
          <h3>Sample deed</h3>
          <dl>
            <div><dt>Property</dt><dd>100 Example Lane</dd></div>
            <div><dt>Named party</dt><dd>Example Owner</dd></div>
            <div className="titleflow-example__field" ref={referenceRef}><dt>Recording reference</dt><dd>DEMO-001</dd></div>
          </dl>
        </div>
      </div>
      <div className="titleflow-example__review">
        <div className="titleflow-example__panel-label"><SearchCheck size={18} aria-hidden="true" /> 02 / Examiner review</div>
        <h3>Check the recording reference</h3>
        <p>The draft and the source show different values. The examiner checks the original deed before making a correction.</p>
        <dl className="titleflow-example__comparison">
          <div className="titleflow-example__field" ref={sourceValueRef}><dt>Source value</dt><dd>DEMO-001</dd></div>
          <div><dt>Draft value</dt><dd>DEMO-010</dd></div>
        </dl>
        <div className="titleflow-example__resolution">
          <UserCheck size={20} aria-hidden="true" />
          <p><strong>Examiner correction</strong>Confirm the source value and update the draft before final approval.</p>
        </div>
      </div>
      {referencePath && <svg className="titleflow-example__reference-link" aria-hidden="true">
        <path d={referencePath} fill="none" stroke="currentColor" strokeOpacity=".4" strokeDasharray="3 4" />
        <path d="M -7 -4 L 0 0 L -7 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <animateMotion path={referencePath} rotate="auto" dur="2.8s" keyPoints="0;1;1" keyTimes="0;.45;1" calcMode="linear" repeatCount="indefinite" />
        </path>
      </svg>}
    </div>
    <figcaption>This example uses a fictional deed and invented values to illustrate examiner review.</figcaption>
  </figure>
}
