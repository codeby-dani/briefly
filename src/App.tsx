import { useEffect } from 'react'
import './App.css'
import { ROUTES } from './types'
import type { Route } from './types'
import { globalTools } from './tools/global'
import { bindHashListener, navigate, useAppState } from './store/router'
import { Dashboard } from './routes/Dashboard'
import { Trends } from './routes/Trends'
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
  const { route } = useAppState()

  useEffect(() => {
    installBridge()
    bindHashListener()
  }, [])

  useTools(globalTools())

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
  if (route === 'dashboard') return <Dashboard />
  // Phase 2 replaced the Phase 0 corpus-check panel on the dashboard with the
  // real drawer here, per plan/phases/phase-2-trends.md. The deploy smoke test
  // it existed for — a poster and an mp4 loading from the deployed origin — is
  // now done by opening any clip-backed trend.
  if (route === 'trends') return <Trends />
  return <PendingRoute route={route} />
}
