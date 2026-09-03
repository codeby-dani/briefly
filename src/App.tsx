import { useEffect, useRef, useState } from 'react'
import './App.css'
import { ROUTES } from './types'
import type { Route } from './types'
import { NavIcon } from './components/NavIcon'
import { globalTools } from './tools/global'
import { composerTools } from './tools/briefs'
import { bindHashListener, navigate, useAppState } from './store/router'
import { setQuery, useTrendView } from './store/trendView'
import { Dashboard } from './routes/Dashboard'
import { Trends } from './routes/Trends'
import { Products } from './routes/Products'
import { Briefs } from './routes/Briefs'
import { Calendar } from './routes/Calendar'
import { Performance } from './routes/Performance'
import {
  ToolSurfacePanel,
  UnsupportedBrowserNotice,
  installBridge,
  useSurfaceSource,
  useTools,
} from './webmcp'

/**
 * The app root: the hash listener, the two global tools, the shell chrome and
 * the route switch.
 *
 * The two tools are registered here unconditionally, which is what makes Phase
 * 1 exit criterion 6 checkable — the surface count is exactly two on every
 * route with nothing selected, and any third tool appearing means a guard
 * somewhere else has leaked. Route-scoped tools are registered inside their
 * routes, never here.
 *
 * Shell layout follows the Stitch reference screens: a fixed 256px sidebar, a
 * fixed 64px top bar, and the route in the remaining space. Phase 6 replaced
 * the earlier stacked header, which put the nav in a horizontal strip and left
 * no room for the inspector.
 */
export default function App() {
  const { route, selectedTrendId, selectedOfferingId } = useAppState()

  useEffect(() => {
    installBridge()
    bindHashListener()
  }, [])

  useTools(globalTools())

  // The composer pair is scoped to *selection*, not route, so it is registered
  // here at the root — where it survives the human navigating between Trends,
  // Products and Briefs mid-composition — rather than inside the Briefs route,
  // which unmounts on navigation. See plan/02-data-model.md § Tool surface.
  useTools(composerTools(Boolean(selectedTrendId && selectedOfferingId)))

  return (
    <>
      <Sidebar route={route} />

      <div className="shell">
        <TopBar />
        <UnsupportedBrowserNotice />
        <main className="app-main" data-testid={`route-${route}`}>
          <RouteView route={route} />
        </main>
      </div>

      <ToolSurfacePanel />
    </>
  )
}

/** Human-facing labels. The route ids stay the agent-facing vocabulary. */
const NAV_LABEL: Record<Route, string> = {
  dashboard: 'Dashboard',
  trends: 'Trends Discovery',
  products: 'Profile',
  briefs: 'Content Briefs',
  calendar: 'Content Calendar',
  performance: 'Performance',
}

const WORKSPACES = [
  { id: 'briefly', initials: 'BR', name: 'Briefly Studio', description: 'Shared human + agent workspace' },
  { id: 'growth', initials: 'GT', name: 'Growth Team', description: 'Campaign and audience signals' },
  { id: 'content', initials: 'CL', name: 'Content Lab', description: 'Brief experiments and publishing' },
]

function Sidebar({ route }: { route: Route }) {
  const primaryRoutes = ROUTES.filter((name) => name !== 'products')

  // The switcher is presentational for now: there is one real workspace and
  // the other two are labels. It still needs real state, because a menu that
  // cannot be dismissed except by picking something is a trap — Escape and a
  // click outside both close it.
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(WORKSPACES[0]!.id)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  const activeWorkspace = WORKSPACES.find((w) => w.id === activeWorkspaceId) ?? WORKSPACES[0]!

  useEffect(() => {
    if (!workspaceOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setWorkspaceOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWorkspaceOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [workspaceOpen])

  return (
    <aside className="sidebar" aria-label="Sections">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img className="brand-mark" src="/brand/briefly-logo.png" alt="" aria-hidden="true" />
          <span className="brand-sr-only">Briefly</span>
        </div>

        <div className="workspace-switcher" ref={switcherRef}>
          <button
            type="button"
            className="workspace workspace-button"
            aria-label="Switch workspace"
            aria-expanded={workspaceOpen}
            aria-haspopup="listbox"
            data-testid="workspace-switcher"
            onClick={() => setWorkspaceOpen((open) => !open)}
          >
            <span className="workspace-avatar" aria-hidden="true">{activeWorkspace.initials}</span>
            <span className="workspace-text">
              <strong>{activeWorkspace.name}</strong>
              <span>{activeWorkspace.description}</span>
            </span>
            <NavIcon name="chevron" size={16} />
          </button>
          {workspaceOpen && (
            <div className="workspace-menu" role="listbox" aria-label="Available workspaces">
              {WORKSPACES.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  className={`workspace-option${workspace.id === activeWorkspaceId ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={workspace.id === activeWorkspaceId}
                  data-testid={`workspace-option-${workspace.id}`}
                  onClick={() => {
                    setActiveWorkspaceId(workspace.id)
                    setWorkspaceOpen(false)
                  }}
                >
                  <span className="workspace-avatar" aria-hidden="true">{workspace.initials}</span>
                  <span className="workspace-text"><strong>{workspace.name}</strong><span>{workspace.description}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {primaryRoutes.map((name) => (
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
              <NavIcon name={name} />
              <span>{NAV_LABEL[name]}</span>
            </a>
          ))}
        </nav>
      </div>

      <button
        type="button"
        className={`account-button${route === 'products' ? ' is-current' : ''}`}
        aria-current={route === 'products' ? 'page' : undefined}
        aria-label="Open profile for Aarief"
        data-testid="open-profile"
        onClick={() => navigate('products')}
      >
        <span className="account-avatar" aria-hidden="true">AR</span>
        <span className="account-copy">
          <strong>Aarief</strong>
          <span>Workspace owner</span>
        </span>
        <svg className="account-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </aside>
  )
}

function TopBar() {
  const { route } = useAppState()
  const view = useTrendView()
  const source = useSurfaceSource()

  // The header search is the same control `search_trends` drives. Typing here
  // and calling the tool land in one store, so the human and the agent cannot
  // be looking at two different result sets.
  const [draft, setDraft] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const value = route === 'trends' ? view.query : draft

  return (
    <header className="topbar">
      <form
        className="topbar-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          setQuery(value)
          if (route !== 'trends') navigate('trends')
        }}
      >
        <NavIcon name="search" size={18} />
        <input
          type="search"
          value={value}
          placeholder="Search trends by keyword or category…"
          aria-label="Search trends"
          data-testid="global-search"
          onChange={(event) => {
            const next = event.target.value
            if (route === 'trends') setQuery(next)
            else setDraft(next)
          }}
        />
      </form>

      <div className="topbar-right">
        <span
          className={`sync-pill${source === 'webmcp' ? ' is-live' : ''}`}
          data-testid="surface-source"
        >
          <span className="sync-dot" aria-hidden="true" />
          {source === 'webmcp' ? 'WebMCP connected' : 'Bridge: window.__td'}
        </span>
        <div className="topbar-menu-wrap">
          <button
            type="button"
            className="topbar-icon-button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            data-testid="topbar-notifications"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <NavIcon name="bell" size={19} />
            <span className="notification-dot" aria-hidden />
          </button>
          {notificationsOpen && <div className="topbar-popover notification-popover" role="status">You’re all caught up.</div>}
        </div>
        <div className="topbar-menu-wrap">
          <button
            type="button"
            className="profile-button"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            data-testid="topbar-profile"
            onClick={() => setProfileOpen((open) => !open)}
          >
            <span className="topbar-profile-avatar" aria-hidden>AR</span>
            <span className="topbar-profile-copy"><strong>Aarief</strong><small>Workspace owner</small></span>
            <NavIcon name="chevron" size={16} />
          </button>
          {profileOpen && <div className="topbar-popover profile-popover"><strong>Aarief</strong><span>Briefly workspace</span></div>}
        </div>
        <button
          type="button"
          className="button button-primary"
          data-testid="topbar-new-brief"
          onClick={() => navigate('briefs')}
        >
          New brief
        </button>
      </div>
    </header>
  )
}

function RouteView({ route }: { route: Route }) {
  // Phase 0's clip-check panel used to hang under the dashboard here. Phase 2
  // removed it, as its phase file instructs: the deployed-media exit criterion
  // is now checked by opening any clip-backed trend, which is a real surface
  // rather than a scaffold a judge has to be told to ignore.
  //
  // Phase 5 took the last two placeholders. `routes/Pending.tsx` is gone with
  // them rather than left behind unreferenced: its own header said it existed
  // to be honest about what had not been built, and a module that now describes
  // nothing is the opposite of that.
  switch (route) {
    case 'dashboard':
      return <Dashboard />
    case 'trends':
      return <Trends />
    case 'products':
      return <Products />
    case 'briefs':
      return <Briefs />
    case 'calendar':
      return <Calendar />
    case 'performance':
      return <Performance />
  }
}
