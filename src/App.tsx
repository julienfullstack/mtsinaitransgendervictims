import { useEffect, useState } from 'react'
import { MyStory } from './views/MyStory'
import { WallOfShame } from './views/WallOfShame'
import { Emails } from './views/Emails'
import { RecordsVsEmails } from './views/RecordsVsEmails'
import { DepartmentOfSludge } from './views/DepartmentOfSludge'

const ROUTES = [
  { path: 'my-story', label: 'My Story', view: MyStory },
  { path: 'wall-of-shame', label: 'Wall of Shame', view: WallOfShame },
  { path: 'emails', label: 'Emails', view: Emails },
  { path: 'records-vs-emails', label: 'Records vs Emails', view: RecordsVsEmails },
  { path: 'department-of-sludge', label: 'The Department of Sludge', view: DepartmentOfSludge },
] as const

const ICONS: Record<string, React.ReactNode> = {
  'wall-of-shame': (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4 44 40H4Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><path d="M24 17v11M24 33v3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
  ),
  emails: (
    <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="10" width="38" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m6 12 18 14 18-14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></svg>
  ),
  'records-vs-emails': (
    <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="6" width="16" height="36" rx="1" fill="none" stroke="currentColor" strokeWidth="3" /><rect x="26" y="6" width="16" height="36" rx="1" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M10 14h8M10 20h8M10 26h8M30 14h8M30 20h8M30 26h8" stroke="currentColor" strokeWidth="2.5" /></svg>
  ),
  'department-of-sludge': (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 8h36L28 26v14l-8-4V26Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></svg>
  ),
}

const currentPath = () => location.hash.replace(/^#\/?/, '') || ROUTES[0].path

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor" /><path d="m6.5 4.5 3.5 3.5-3.5 3.5" fill="none" stroke="#fff" strokeWidth="1.8" /></svg>
  )
}

export default function App() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onHash = () => {
      setPath(currentPath())
      scrollTo(0, 0)
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0]
  const View = route.view
  const others = ROUTES.filter((r) => r.path !== 'my-story')

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#/my-story">
            <span>Mt.</span>
            <span>Sinai</span>
          </a>
          <div className="utility">
            <span className="utility-sub">Transgender Victims</span>
            <span className="utility-parody">
              <Chevron />
              Parody. Not affiliated with or endorsed by the Mount Sinai Health System.
            </span>
          </div>
        </div>
        <nav className="main-nav">
          <ul>
            {ROUTES.map((r) => (
              <li key={r.path}>
                <a href={`#/${r.path}`} aria-current={r.path === route.path ? 'page' : undefined}>
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="title-band">
        <h1>{route.label}</h1>
      </div>

      {route.path === 'my-story' && (
        <section className="feature-band">
          {others.map((r) => (
            <div key={r.path} className="feature">
              <span className="feature-icon">{ICONS[r.path]}</span>
              <h2>{r.label}</h2>
              <a className="btn-white" href={`#/${r.path}`}>{r.label}</a>
            </div>
          ))}
        </section>
      )}

      <main>
        <View />
      </main>

      <footer className="site-footer">
        <ul>
          {ROUTES.map((r) => (
            <li key={r.path}><a href={`#/${r.path}`}>{r.label}</a></li>
          ))}
        </ul>
        <p>Parody. Not affiliated with or endorsed by the Mount Sinai Health System.</p>
      </footer>
    </>
  )
}
