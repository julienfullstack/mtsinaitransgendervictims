import { useState } from 'react'
import { fetchEmails, formatDate } from '../api'
import { useDebounced, useLoad } from '../useApi'
import { EVIDENCE_KIND_LABELS } from '../types'
import { Highlight, KindBadge, SearchBox } from '../components/Highlight'

export function Emails() {
  const [query, setQuery] = useState('')
  const [direction, setDirection] = useState<'all' | 'sent' | 'received'>('all')
  const [open, setOpen] = useState<string | null>(null)
  const search = useDebounced(query)
  const { data, loading, error } = useLoad(
    () => fetchEmails(search, direction === 'all' ? undefined : direction),
    [search, direction],
  )
  const emails = data ?? []

  return (
    <section className="page">
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} label="Search emails" />
        <select value={direction} onChange={(e) => setDirection(e.target.value as typeof direction)}>
          <option value="all">All emails</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
        </select>
        <span className="count">{loading ? 'Loading…' : `${emails.length} emails`}</span>
      </div>
      {error && <p className="empty">Could not load emails: {error}</p>}
      {!error && !loading && emails.length === 0 && <p className="empty">No emails published yet.</p>}
      <ol className="list">
        {emails.map((e) => (
          <li key={e.id} className="card">
            <button className="card-head" onClick={() => setOpen(open === e.id ? null : e.id)} aria-expanded={open === e.id}>
              <time>{formatDate(e.date)}</time>
              <span className={`dir dir-${e.direction}`}>{e.direction === 'sent' ? 'Sent' : 'Received'}</span>
              <strong><Highlight text={e.subject || '(no subject)'} query={search} /></strong>
              <KindBadge kind={e.kind} label={EVIDENCE_KIND_LABELS[e.kind]} />
            </button>
            <div className="meta">
              <Highlight text={`From ${e.from} to ${e.to.join(', ')}`} query={search} />
            </div>
            {open === e.id && (
              <pre className="body"><Highlight text={e.body} query={search} /></pre>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
