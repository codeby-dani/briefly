import { useEffect, useState } from 'react'
import './App.css'
import { CLIPS } from './fixtures/clips'
import { ROUTES } from './types'
import type { Route } from './types'
import { getAppStateTool } from './tools/global'
import type { AppStateSnapshot } from './tools/global'
import { ToolSurfacePanel, UnsupportedBrowserNotice, installBridge, useTool } from './webmcp'

/**
 * Phase 0 shell. Header, nav placeholder, main slot — and the two things that
 * have to be proven on the deployed origin before any feature work is committed
 * to it: that a tool registers, and that the clip corpus loads.
 *
 * Navigation lands in Phase 1 with the hash router and the stores. The nav here
 * is deliberately inert rather than faked, so nothing on screen claims to work
 * before it does.
 */
export default function App() {
  const route: Route = 'dashboard'

  useEffect(() => {
    installBridge()
  }, [])

  // Phase 0 stub. The shape is the contract from plan/02-data-model.md; the
  // counts become real when the stores land in Phase 1.
  const snapshot = (): AppStateSnapshot => ({
    route,
    selectedTrendId: null,
    selectedProductId: null,
    openBriefId: null,
    counts: { trends: 0, products: 0, briefs: 0, watchlist: 0 },
    visibleTrendCount: 0,
    activeFilters: {},
  })

  useTool(getAppStateTool(snapshot))

  return (
    <>
      <UnsupportedBrowserNotice />

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>TrendDashboard</h1>
            <p className="tagline">Trend research, product knowledge and briefs — worked by a human and an agent on the same screen.</p>
          </div>
        </div>

        <nav className="app-nav" aria-label="Sections">
          {ROUTES.map((name) => (
            <span
              key={name}
              className={`nav-item${name === route ? ' is-current' : ''}`}
              aria-current={name === route ? 'page' : undefined}
              data-testid={`nav-${name}`}
            >
              {name}
              {name !== route && <span className="nav-soon">phase 1</span>}
            </span>
          ))}
        </nav>
      </header>

      <main className="app-main" data-testid={`route-${route}`}>
        <section className="card">
          <h2>Foundation</h2>
          <p>
            This is the Phase 0 shell. One tool — <code>get_app_state</code> — is on the
            agent surface, and the panel in the corner shows it exactly as an agent sees
            it. Routes, stores and the other twenty tools arrive in Phases 1 to 5.
          </p>
        </section>

        <CorpusCheck />
      </main>

      <ToolSurfacePanel />
    </>
  )
}

/**
 * The deploy smoke test for the media corpus, on screen rather than in a
 * checklist: if the poster and the mp4 both load from the deployed origin, this
 * renders and plays. Phase 2 replaces it with the real trend detail drawer.
 */
function CorpusCheck() {
  const [index, setIndex] = useState(0)
  const clip = CLIPS[index]
  if (!clip) return null

  return (
    <section className="card" data-testid="corpus-check">
      <div className="card-head">
        <h2>Clip corpus</h2>
        <span className="badge badge-measured" data-testid="measured-badge">
          measured
        </span>
      </div>

      <p className="muted">
        {CLIPS.length} clips ship with the build. Every number below is derived from the
        encoded file by a committed script, which is what the <em>measured</em> badge
        means — as opposed to <em>demo data</em>, which will mark the invented trend
        volumes and analytics.
      </p>

      <div className="clip">
        <video
          className="clip-player"
          data-testid="clip-player"
          src={clip.src}
          poster={clip.poster}
          preload="none"
          controls
          playsInline
        >
          {clip.captionTrack && (
            <track kind="captions" srcLang="en" label="English" src={clip.captionTrack} default />
          )}
        </video>

        <div className="clip-meta">
          <h3>{clip.title}</h3>
          <p className="muted">
            {clip.creator} · {clip.category} · {clip.license}
          </p>
          <dl className="signals" data-testid={`clip-signals-${clip.id}`}>
            <div><dt>duration</dt><dd>{clip.signals.durationS}s</dd></div>
            <div><dt>words</dt><dd>{clip.signals.words}</dd></div>
            <div><dt>words / min</dt><dd>{clip.signals.wordsPerMinute}</dd></div>
            <div><dt>hook ends</dt><dd>{clip.signals.hookEndS}s</dd></div>
            <div><dt>segments</dt><dd>{clip.signals.segments}</dd></div>
            <div><dt>transcript</dt><dd>{clip.signals.transcriptSource}</dd></div>
          </dl>
          <p className="source-note">{clip.sourceNote}</p>
        </div>
      </div>

      <div className="clip-picker">
        {CLIPS.map((candidate, i) => (
          <button
            key={candidate.id}
            type="button"
            className={`chip${i === index ? ' is-current' : ''}`}
            onClick={() => setIndex(i)}
          >
            {candidate.id}
          </button>
        ))}
      </div>
    </section>
  )
}
