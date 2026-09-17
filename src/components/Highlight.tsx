/** Marks each query term inside the text so keyword hits are visible. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!terms.length) return <>{text}</>
  const re = new RegExp(`(${terms.join('|')})`, 'gi')
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : part,
      )}
    </>
  )
}

export function SearchBox({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <label className="search">
      <span className="visually-hidden">{label}</span>
      <input
        type="search"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function KindBadge({ label, kind }: { label: string; kind: string }) {
  return <span className={`badge badge-${kind}`}>{label}</span>
}
