import { useEffect, useState } from 'react'
import { MyStory } from './views/MyStory'
import { WallOfShame } from './views/WallOfShame'
import { Emails } from './views/Emails'
import { RecordsVsEmails } from './views/RecordsVsEmails'

const ROUTES = [
  { path: 'my-story', label: 'My Story', view: MyStory },
  { path: 'wall-of-shame', label: 'Wall of Shame', view: WallOfShame },
  { path: 'emails', label: 'Emails', view: Emails },
  { path: 'records-vs-emails', label: 'Records vs Emails', view: RecordsVsEmails },
] as const

const currentPath = () => location.hash.replace(/^#\/?/, '') || ROUTES[0].path

export default function App() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onHash = () => setPath(currentPath())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0]
  const View = route.view

  return (
    <>
      <div className="parody-bar">
        Parody. Not affiliated with or endorsed by the Mount Sinai Health System.
      </div>
      <header className="site-header">
        <a className="wordmark" href="#/my-story">
          <span className="wordmark-mt">Mt. Sinai</span>
          <span className="wordmark-sub">Transgender Victims</span>
        </a>
        <nav>
          {ROUTES.map((r) => (
            <a key={r.path} href={`#/${r.path}`} aria-current={r.path === route.path ? 'page' : undefined}>
              {r.label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        <View />
      </main>
    </>
  )
}
