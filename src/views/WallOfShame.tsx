import { useState } from 'react'
import { daysBetween, fetchFilters, fetchReports, formatDate } from '../api'
import { useDebounced, useLoad } from '../useApi'
import { CATEGORY_LABELS, EVIDENCE_KIND_LABELS, type EvidenceKind, type ReportCategory } from '../types'
import { Highlight, KindBadge, SearchBox } from '../components/Highlight'

export function WallOfShame() {
  const [query, setQuery] = useState('')
  const [hospital, setHospital] = useState('')
  const [department, setDepartment] = useState('')
  const [staff, setStaff] = useState('')
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [kind, setKind] = useState<EvidenceKind | ''>('')
  const search = useDebounced(query)

  const filters = useLoad(() => fetchFilters(), [])
  const { data, loading, error } = useLoad(
    () =>
      fetchReports({
        q: search,
        hospital: hospital || undefined,
        department: department || undefined,
        staff: staff || undefined,
        category: category || undefined,
        kind: kind || undefined,
      }),
    [search, hospital, department, staff, category, kind],
  )
  const reports = data ?? []
  const options = filters.data

  return (
    <section className="page">
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} label="Search reports" />
        <select value={hospital} onChange={(e) => setHospital(e.target.value)}>
          <option value="">All hospitals</option>
          {(options?.hospitals ?? []).map((h) => <option key={h}>{h}</option>)}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {(options?.departments ?? []).map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={staff} onChange={(e) => setStaff(e.target.value)}>
          <option value="">All staff</option>
          {(options?.staff ?? []).map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as ReportCategory | '')}>
          <option value="">All categories</option>
          {(options?.categories ?? Object.keys(CATEGORY_LABELS)).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c as ReportCategory] ?? c}</option>
          ))}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as EvidenceKind | '')}>
          <option value="">All evidence types</option>
          {Object.entries(EVIDENCE_KIND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="count">{loading ? 'Loading…' : `${reports.length} reports`}</span>
      </div>
      {error && <p className="empty">Could not load reports: {error}</p>}
      {!error && !loading && reports.length === 0 && <p className="empty">No reports published yet.</p>}
      <ul className="grid">
        {reports.map((r) => {
          const wait = daysBetween(r.complaintSubmitted, r.firstResponse)
          return (
            <li key={r.id} className="card report">
              <header>
                <KindBadge kind={r.kind} label={EVIDENCE_KIND_LABELS[r.kind]} />
                <strong><Highlight text={r.title} query={search} /></strong>
              </header>
              <div className="meta">
                {[r.hospital, r.department].filter(Boolean).join(' · ')}
                {r.staff?.filter((s) => s.publishable).map((s) => ` · ${s.name}${s.role ? ` (${s.role})` : ''}`)}
              </div>
              <div className="tags">
                {r.categories.map((c) => <span key={c} className="tag">{CATEGORY_LABELS[c] ?? c}</span>)}
              </div>
              <p><Highlight text={r.summary} query={search} /></p>
              <dl className="response">
                <dt>Complaint submitted</dt><dd>{r.complaintSubmitted ? formatDate(r.complaintSubmitted) : 'Not recorded'}</dd>
                <dt>Acknowledged</dt><dd>{r.acknowledged ? formatDate(r.acknowledged) : 'Not recorded'}</dd>
                <dt>First response</dt><dd>{r.firstResponse ? `${formatDate(r.firstResponse)}${wait !== null ? ` (${wait} days)` : ''}` : 'Not recorded'}</dd>
                <dt>Corrective action communicated</dt><dd>{r.correctiveActionCommunicated === undefined ? 'Not recorded' : r.correctiveActionCommunicated ? 'Yes' : 'No'}</dd>
              </dl>
              {!r.hospitalStatement && <p className="meta">No hospital statement on record.</p>}
              {r.hospitalStatement && (
                <blockquote className="statement">
                  <KindBadge kind="hospital_response" label="Hospital statement" />
                  <Highlight text={r.hospitalStatement} query={search} />
                </blockquote>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
