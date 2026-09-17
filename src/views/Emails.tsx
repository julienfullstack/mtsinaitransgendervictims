import { useMemo, useState } from 'react'
import { emails, formatDate, searchEmails } from '../data'
import { EVIDENCE_KIND_LABELS } from '../types'
import { Highlight, KindBadge, SearchBox } from '../components/Highlight'

export function Emails() {
  const [query, setQuery] = useState('')
  const [direction, setDirection] = useState<'all' | 'sent' | 'received'>('all')
  const [open, setOpen] = useState<string | null>(null)

  const visible = useMemo(() => {
    const hits = searchEmails(query)
    return emails.filter(
      (e) => (!hits || hits.has(e.id)) && (direction === 'all' || e.direction === direction),
    )
  }, [query, direction])

  return (
    <section className="page">
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} label="Search emails" />
        <select value={direction} onChange={(e) => setDirection(e.target.value as typeof direction)}>
          <option value="all">All emails</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
        </select>
        <span className="count">{visible.length} of {emails.length}</span>
      </div>
      {emails.length === 0 && <p className="empty">No emails imported yet.</p>}
      <ol className="list">
        {visible.map((e) => (
          <li key={e.id} className="card">
            <button className="card-head" onClick={() => setOpen(open === e.id ? null : e.id)} aria-expanded={open === e.id}>
              <time>{formatDate(e.date)}</time>
              <span className={`dir dir-${e.direction}`}>{e.direction === 'sent' ? 'Sent' : 'Received'}</span>
              <strong><Highlight text={e.subject || '(no subject)'} query={query} /></strong>
              <KindBadge kind={e.kind} label={EVIDENCE_KIND_LABELS[e.kind]} />
            </button>
            <div className="meta">
              <Highlight text={`From ${e.from} to ${e.to.join(', ')}`} query={query} />
            </div>
            {open === e.id && (
              <pre className="body"><Highlight text={e.body} query={query} /></pre>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
