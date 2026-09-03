import { useEffect } from 'react'
import './App.css'
import { ROUTES } from './types'
import type { Route } from './types'
import { globalTools } from './tools/global'
import { composerTools } from './tools/briefs'
import { bindHashListener, navigate, useAppState } from './store/router'
import { Dashboard } from './routes/Dashboard'
import { CorpusCheck } from './routes/CorpusCheck'
import { Briefs } from './routes/Briefs'
import { PendingRoute } from './routes/Pending'
import { ToolSurfacePanel, UnsupportedBrowserNotice, installBridge, useTools } from './webmcp'

/**
 * The app root, and nothing more than a root: the hash listener, the two global
 * tools, and the route switch.
 *
 * The two tools are registered here unconditionally, which is what makes Phase
 * 1 exit criterion 6 checkable — the surface count is exactly two on every
 * route, and any third tool appearing means a guard somewhere else has leaked.
 * Route-scoped tools land with their routes in Phases 2 to 5 and are registered
 * inside those routes, never here.
 */
export default function App() {
  const { route, selectedTrendId, selectedProductId } = useAppState()

  useEffect(() => {
    installBridge()
    bindHashListener()
  }, [])

  useTools(globalTools())

  // The composer pair is scoped to *selection*, not route, so it is registered
  // here at the root — where it survives the human navigating between Trends,
  // Products and Briefs mid-composition — rather than inside the Briefs route,
  // which unmounts on navigation. See plan/02-data-model.md § Tool surface.
  useTools(composerTools(Boolean(selectedTrendId && selectedProductId)))

  return (
    <>
      <UnsupportedBrowserNotice />

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>TrendDashboard</h1>
            <p className="tagline">
              Trend research, product knowledge and briefs — worked by a human and an agent
              on the same screen.
            </p>
          </div>
        </div>

        <nav className="app-nav" aria-label="Sections">
          {ROUTES.map((name) => (
            <a
              key={name}
              href={`#/${name}`}
              className={`nav-item${name === route ? ' is-current' : ''}`}
              aria-current={name === route ? 'page' : undefined}
              data-testid={`nav-${name}`}
              onClick={(event) => {
                // Route through the same reducer `navigate_to` uses, so the
                // human's click and the agent's call cannot diverge.
                event.preventDefault()
                navigate(name)
              }}
            >
              {name}
            </a>
          ))}
        </nav>
      </header>

      <main className="app-main" data-testid={`route-${route}`}>
        <RouteView route={route} />
      </main>

      <ToolSurfacePanel />
    </>
  )
}

function RouteView({ route }: { route: Route }) {
  if (route === 'dashboard') {
    return (
      <>
        <Dashboard />
        <CorpusCheck />
      </>
    )
  }
  if (route === 'briefs') {
    return <Briefs />
  }
  return <PendingRoute route={route} />
}
