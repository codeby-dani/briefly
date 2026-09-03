import { useState } from 'react'
import './App.css'
import { ToolSurfacePanel } from './webmcp'
import { useGlobalTools, type Route } from './tools/global'
import { useSurfaceLogging } from './tools/trace'
import { CLIPS } from './fixtures/clips'

/**
 * Phase 0 shell.
 *
 * Header, nav placeholder, main slot — and one registered tool, so the deploy
 * can be verified against a real tool surface rather than an empty one. The
 * routes below are labels, not links: navigation and the stores land in
 * Phase 1, and a nav that pretended to work would make the deploy check lie.
 */

const ROUTES: Route[] = ['dashboard', 'trends', 'products', 'briefs', 'calendar', 'performance']

// One clip, rendered so the deploy check can confirm a poster and an mp4 both
// load from the Netlify origin rather than only from localhost. `preload` is
// "none" on purpose: 8.8MB of corpus must not sit in front of first paint.
const PROBE = CLIPS[0]

function App() {
  const [playing, setPlaying] = useState(false)

  useSurfaceLogging()
  useGlobalTools({
    route: 'dashboard',
    selectedTrendId: null,
    selectedProductId: null,
    openBriefId: null,
    counts: { trends: 0, products: 0, briefs: 0, watchlist: 0 },
    visibleTrendCount: 0,
    activeFilters: {},
  })

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>TrendDashboard</h1>
            <p className="tagline">Trend research that hands its controls to your agent</p>
          </div>
        </div>

        <nav className="app-nav" aria-label="Sections">
          <ul>
            {ROUTES.map((route) => (
              <li key={route}>
                <span
                  className={route === 'dashboard' ? 'nav-item is-current' : 'nav-item'}
                  aria-current={route === 'dashboard' ? 'page' : undefined}
                >
                  {route}
                </span>
              </li>
            ))}
          </ul>
          <span className="nav-note">navigation lands in phase 1</span>
        </nav>
      </header>

      <main className="app-main" data-testid="route-dashboard">
        <section className="card">
          <h2>Foundation is live</h2>
          <p>
            This origin serves the app, registers a tool on{' '}
            <code>document.modelContext</code>, and ships the clip corpus. Open the tool
            surface panel in the corner to see what an agent sees.
          </p>
          <p className="muted">
            Ask a connected agent to call <code>get_app_state</code>. It answers with the
            route, the selection and the counts — which is how every other tool in the
            catalog gets its bearings.
          </p>
        </section>

        <section className="card">
          <h2>Corpus check</h2>
          <p className="muted">
            {CLIPS.length} cc0 clips ship with the build. One is rendered here so a
            deployed poster and a deployed mp4 can both be confirmed by eye.
          </p>

          <figure className="probe" data-testid="clip-player">
            {playing ? (
              <video
                src={PROBE.src}
                poster={PROBE.poster}
                controls
                autoPlay
                preload="none"
                playsInline
              >
                {PROBE.captionTrack && (
                  <track kind="captions" srcLang="en" label="English" src={PROBE.captionTrack} default />
                )}
              </video>
            ) : (
              <button type="button" className="probe-poster" onClick={() => setPlaying(true)}>
                <img src={PROBE.poster} alt="" width={270} height={480} loading="eager" />
                <span className="probe-play" aria-hidden>
                  ▶
                </span>
                <span className="sr-only">Play {PROBE.title}</span>
              </button>
            )}
            <figcaption>
              <strong>{PROBE.title}</strong> <span className="muted">{PROBE.creator}</span>
              <span className="badge-measured" data-testid="measured-badge">
                measured
              </span>
              <span className="muted probe-signals" data-testid={`clip-signals-${PROBE.id}`}>
                {PROBE.signals.durationS}s · {PROBE.signals.words} words ·{' '}
                {PROBE.signals.wordsPerMinute} wpm · hook ends {PROBE.signals.hookEndS}s
              </span>
              <span className="muted">{PROBE.sourceNote}</span>
            </figcaption>
          </figure>
        </section>
      </main>

      <ToolSurfacePanel />
    </div>
  )
}

export default App
