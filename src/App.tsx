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

type RoutePath = (typeof ROUTES)[number]['path']

const UTILITY_LINKS: { label: string; to: RoutePath }[] = [
  { label: 'MyMountSilence (MyChart)', to: 'records-vs-emails' },
  { label: 'Check Symptoms & Get Misgendered', to: 'wall-of-shame' },
  { label: 'Read the Emails', to: 'emails' },
  { label: 'The Department of Sludge', to: 'department-of-sludge' },
]

const SLIDES: { title: string; text: string; to: RoutePath }[] = [
  {
    title: 'Proud to Be the Official Health Care Partner of Silence',
    text: 'Patient complaints receive our award-winning non-response.',
    to: 'my-story',
  },
  {
    title: 'Ranked #1 in Taking Your Complaint Under Advisement',
    text: 'Search every report on the Wall of Shame.',
    to: 'wall-of-shame',
  },
  {
    title: 'An Easier Way to Wait for Your Records',
    text: 'Medical records, side by side with the emails about them.',
    to: 'records-vs-emails',
  },
]

const FEATURES: { title: string; text: string; button: string; to: RoutePath; icon: React.ReactNode }[] = [
  {
    title: 'Get Ignored Now',
    text: 'Misgendering, discrimination, and complaints that went nowhere.',
    button: 'See the Wall of Shame',
    to: 'wall-of-shame',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="12" r="7" fill="currentColor" /><path d="M10 44c0-10 6-17 14-17s14 7 14 17Z" fill="currentColor" /><path d="M17 31v6a4 4 0 0 0 8 0M31 31v4" fill="none" stroke="#fff" strokeWidth="2.5" /></svg>
    ),
  },
  {
    title: 'Book Online',
    text: 'Every message sent, and every reply that never came.',
    button: 'Read the Emails',
    to: 'emails',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="9" width="36" height="34" rx="2" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M6 17h36M15 4v9M33 4v9M12 23h6M21 23h6M30 23h6M12 30h6M21 30h6M30 30h6M12 37h6M21 37h6" stroke="currentColor" strokeWidth="3" /></svg>
    ),
  },
  {
    title: 'MyMountSilence® App',
    text: 'Your medical records, lined up against the correspondence.',
    button: 'Compare Records',
    to: 'records-vs-emails',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="14" y="4" width="20" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M21 38h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
    ),
  },
]

const FOOTER_COLUMNS: { title: string; links: RoutePath[] }[] = [
  { title: 'Patient Information', links: ['my-story', 'wall-of-shame'] },
  { title: 'Research & Evasion', links: ['emails', 'records-vs-emails'] },
  { title: 'For Health Professionals', links: ['department-of-sludge'] },
]

const labelFor = (path: RoutePath) => ROUTES.find((r) => r.path === path)!.label
const currentPath = () => location.hash.replace(/^#\/?/, '') || ROUTES[0].path

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor" /><path d="m6.5 4.5 3.5 3.5-3.5 3.5" fill="none" stroke="#fff" strokeWidth="1.8" /></svg>
  )
}

function Hero() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000)
    return () => clearInterval(id)
  }, [index])
  const slide = SLIDES[index]
  const go = (step: number) => setIndex((i) => (i + step + SLIDES.length) % SLIDES.length)

  return (
    <section className="hero" aria-roledescription="carousel">
      <button className="hero-arrow hero-prev" onClick={() => go(-1)} aria-label="Previous slide">‹</button>
      <div className="hero-caption">
        <a className="hero-title" href={`#/${slide.to}`}>
          {slide.title} <span aria-hidden="true">›</span>
        </a>
        <p>{slide.text}</p>
      </div>
      <button className="hero-arrow hero-next" onClick={() => go(1)} aria-label="Next slide">›</button>
      <div className="hero-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            className={i === index ? 'active' : undefined}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </section>
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
  const isHome = route.path === 'my-story'

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#/my-story">
            <span className="wordmark-name">
              <span>Mt.</span>
              <span>Sinai</span>
            </span>
            <span className="wordmark-sub">Transgender Victims</span>
          </a>
          <div className="utility">
            <p className="utility-parody">
              Parody. Not affiliated with or endorsed by the Mount Sinai Health System.
            </p>
            <ul className="utility-links">
              <li className="utility-phone">1-800-MD-SILENCE</li>
              {UTILITY_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={`#/${l.to}`}><Chevron />{l.label}</a>
                </li>
              ))}
            </ul>
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
            <li className="nav-search">
              <a href="#/wall-of-shame">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="m15 15 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                <span>Search</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {isHome ? (
        <>
          <Hero />
          <section className="feature-band">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature">
                <span className="feature-icon">{f.icon}</span>
                <h2>{f.title}</h2>
                <p>{f.text}</p>
                <a className="btn-white" href={`#/${f.to}`}>{f.button}</a>
              </div>
            ))}
          </section>
          <div className="section-heading"><h1>My Story</h1></div>
        </>
      ) : (
        <div className="title-band">
          <h1>{route.label}</h1>
        </div>
      )}

      <main>
        <View />
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <span>Mount Silence Today Blog</span>
          <span aria-hidden="true">|</span>
          <span>1-800-MD-SILENCE</span>
        </div>
        <div className="footer-columns">
          {FOOTER_COLUMNS.map((c) => (
            <div key={c.title}>
              <h3>{c.title}</h3>
              <ul>
                {c.links.map((p) => (
                  <li key={p}><a href={`#/${p}`}>{labelFor(p)}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="footer-parody">Parody. Not affiliated with or endorsed by the Mount Sinai Health System.</p>
      </footer>
    </>
  )
}
