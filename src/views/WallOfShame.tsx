import { useMemo, useState } from 'react'
import { daysBetween, formatDate, reports, searchReports } from '../data'
import { CATEGORY_LABELS, EVIDENCE_KIND_LABELS, type EvidenceKind, type ReportCategory } from '../types'
import { Highlight, KindBadge, SearchBox } from '../components/Highlight'

const unique = (values: (string | undefined)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort()

export function WallOfShame() {
  const [query, setQuery] = useState('')
  const [hospital, setHospital] = useState('')
  const [department, setDepartment] = useState('')
  const [staff, setStaff] = useState('')
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [kind, setKind] = useState<EvidenceKind | ''>('')

  const hospitals = unique(reports.map((r) => r.hospital))
  const departments = unique(reports.map((r) => r.department))
  const staffNames = unique(reports.flatMap((r) => (r.staff ?? []).filter((s) => s.publishable).map((s) => s.name)))

  const visible = useMemo(() => {
    const hits = searchReports(query)
    return reports.filter(
      (r) =>
        (!hits || hits.has(r.id)) &&
        (!hospital || r.hospital === hospital) &&
        (!department || r.department === department) &&
        (!staff || r.staff?.some((s) => s.publishable && s.name === staff)) &&
        (!category || r.categories.includes(category)) &&
        (!kind || r.kind === kind),
    )
  }, [query, hospital, department, staff, category, kind])

  return (
    <section className="page">
      <h1>Wall of Shame</h1>
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} label="Search reports" />
        <select value={hospital} onChange={(e) => setHospital(e.target.value)}>
          <option value="">All hospitals</option>
          {hospitals.map((h) => <option key={h}>{h}</option>)}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={staff} onChange={(e) => setStaff(e.target.value)}>
          <option value="">All staff</option>
          {staffNames.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as ReportCategory | '')}>
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as EvidenceKind | '')}>
          <option value="">All evidence types</option>
          {Object.entries(EVIDENCE_KIND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="count">{visible.length} of {reports.length}</span>
      </div>
      {reports.length === 0 && <p className="empty">No reports published yet.</p>}
      <ul className="grid">
        {visible.map((r) => {
          const wait = daysBetween(r.complaintSubmitted, r.firstResponse)
          return (
            <li key={r.id} className="card report">
              <header>
                <KindBadge kind={r.kind} label={EVIDENCE_KIND_LABELS[r.kind]} />
                <strong><Highlight text={r.title} query={query} /></strong>
              </header>
              <div className="meta">
                {[r.hospital, r.department].filter(Boolean).join(' · ')}
                {r.staff?.filter((s) => s.publishable).map((s) => ` · ${s.name}${s.role ? ` (${s.role})` : ''}`)}
              </div>
              <div className="tags">
                {r.categories.map((c) => <span key={c} className="tag">{CATEGORY_LABELS[c]}</span>)}
              </div>
              <p><Highlight text={r.summary} query={query} /></p>
              <dl className="response">
                <dt>Complaint submitted</dt><dd>{formatDate(r.complaintSubmitted)}</dd>
                <dt>Acknowledged</dt><dd>{r.acknowledged ? formatDate(r.acknowledged) : 'No'}</dd>
                <dt>First response</dt><dd>{r.firstResponse ? `${formatDate(r.firstResponse)}${wait !== null ? ` (${wait} days)` : ''}` : 'None'}</dd>
                <dt>Corrective action communicated</dt><dd>{r.correctiveActionCommunicated ? 'Yes' : 'No'}</dd>
              </dl>
              {r.hospitalStatement && (
                <blockquote className="statement">
                  <KindBadge kind="hospital_response" label="Hospital statement" />
                  <Highlight text={r.hospitalStatement} query={query} />
                </blockquote>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
