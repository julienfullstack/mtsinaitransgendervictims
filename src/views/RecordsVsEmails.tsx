import { useMemo, useState } from 'react'
import { fetchEmails, fetchRecords, formatDate } from '../api'
import { useDebounced, useLoad } from '../useApi'
import { EVIDENCE_KIND_LABELS, type Email, type MedicalRecord } from '../types'
import { Highlight, KindBadge, SearchBox } from '../components/Highlight'

type Row = { day: string; records: MedicalRecord[]; emails: Email[] }

/** Medical records and emails side by side on one shared timeline. */
export function RecordsVsEmails() {
  const [query, setQuery] = useState('')
  const [focus, setFocus] = useState<string | null>(null)
  const search = useDebounced(query)

  const loaded = useLoad(
    async () => {
      const [records, emails] = await Promise.all([fetchRecords(search), fetchEmails(search)])
      return { records, emails }
    },
    [search],
  )
  const records = loaded.data?.records ?? []
  const emails = loaded.data?.emails ?? []

  const rows = useMemo(() => {
    const focused = focus ? records.find((r) => r.id === focus) : undefined
    const linked = focused ? new Set(focused.linkedEmailIds ?? []) : null
    const byDay = new Map<string, Row>()
    const row = (day: string) => {
      if (!byDay.has(day)) byDay.set(day, { day, records: [], emails: [] })
      return byDay.get(day)!
    }
    for (const r of records) {
      if (focus && r.id !== focus) continue
      row(r.date.slice(0, 10)).records.push(r)
    }
    for (const e of emails) {
      if (linked && !linked.has(e.id)) continue
      row(e.date.slice(0, 10)).emails.push(e)
    }
    return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day))
  }, [records, emails, focus])

  return (
    <section className="page">
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} label="Search records and emails" />
        {focus && <button className="chip" onClick={() => setFocus(null)}>Show all</button>}
        <span className="count">
          {loaded.loading ? 'Loading…' : `${records.length} records · ${emails.length} emails`}
        </span>
      </div>
      {loaded.error && <p className="empty">Could not load the timeline: {loaded.error}</p>}
      {!loaded.error && !loaded.loading && !records.length && !emails.length && (
        <p className="empty">No records or emails published yet.</p>
      )}
      <div className="timeline">
        {rows.length > 0 && (
          <div className="timeline-head">
            <span>Date</span><span>Medical record</span><span>Emails</span>
          </div>
        )}
        {rows.map((row) => (
          <div key={row.day} className="timeline-row">
            <time>{formatDate(row.day)}</time>
            <div>
              {row.records.map((r) => (
                <article key={r.id} className="card record">
                  <header>
                    <strong><Highlight text={r.title} query={search} /></strong>
                    <KindBadge kind={r.kind} label={EVIDENCE_KIND_LABELS[r.kind]} />
                  </header>
                  <div className="meta">{[r.recordType, r.author, r.department].filter(Boolean).join(' · ')}</div>
                  <pre className="body"><Highlight text={r.body} query={search} /></pre>
                  {!!r.linkedEmailIds?.length && (
                    <button className="chip" onClick={() => setFocus(r.id)}>
                      {r.linkedEmailIds.length} linked emails
                    </button>
                  )}
                </article>
              ))}
            </div>
            <div>
              {row.emails.map((e) => (
                <article key={e.id} className="card">
                  <header>
                    <span className={`dir dir-${e.direction}`}>{e.direction === 'sent' ? 'Sent' : 'Received'}</span>
                    <strong><Highlight text={e.subject || '(no subject)'} query={search} /></strong>
                  </header>
                  <div className="meta">{e.from}</div>
                  <pre className="body"><Highlight text={e.body} query={search} /></pre>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
