import story from '../../content/my-story.md?raw'
import { daysBetween, fetchEmails, formatDate } from '../api'
import { useLoad } from '../useApi'

/**
 * The site owner's account (content/my-story.md, written by the owner) and the
 * chronology of correspondence built from the published emails.
 */
export function MyStory() {
  const { data, loading, error } = useLoad(() => fetchEmails(), [])
  const emails = data ?? []
  const chronology = emails
    .filter((e) => e.direction === 'sent')
    .map((s) => {
      const reply = emails.find(
        (e) =>
          e.direction === 'received' &&
          e.date > s.date &&
          (s.threadId ? e.threadId === s.threadId : true),
      )
      return { sent: s, reply }
    })

  return (
    <section className="page">
      {story.trim() ? (
        <div className="story">
          {story.split(/\n+/).filter((p) => p.trim()).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      ) : (
        <p className="empty">Story not added yet.</p>
      )}

      <h2>Correspondence</h2>
      {error && <p className="empty">Could not load the correspondence: {error}</p>}
      {!error && loading && <p className="empty">Loading…</p>}
      {!error && !loading && chronology.length === 0 && (
        <p className="empty">No correspondence published yet.</p>
      )}
      {chronology.length > 0 && (
        <table className="chronology">
          <thead>
            <tr><th>Sent</th><th>Subject</th><th>Reply</th><th>Days</th><th>Substantive</th></tr>
          </thead>
          <tbody>
            {chronology.map(({ sent: s, reply }) => (
              <tr key={s.id}>
                <td>{formatDate(s.date)}</td>
                <td>{s.subject}</td>
                <td>{reply ? formatDate(reply.date) : 'None'}</td>
                <td>{reply ? daysBetween(s.date, reply.date) : '—'}</td>
                <td>{reply?.substantive === undefined ? '—' : reply.substantive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
