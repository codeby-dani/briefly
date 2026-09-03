/**
 * The five routes whose contents arrive in Phases 2 to 5.
 *
 * They are reachable now, by hash and by `navigate_to`, because Phase 1 exit
 * criterion 1 requires it and because an agent that navigates somewhere should
 * land on something honest. Each one names the tools that will appear here and
 * the phase that brings them, rather than faking a table — a placeholder that
 * pretends to work is worse than one that says what it is waiting for.
 */

import type { Route } from '../types'

/** Every route that has not been built yet. Trends left this set in Phase 2. */
export type PendingRouteName = Exclude<Route, 'dashboard' | 'trends'>

interface PendingSection {
  title: string
  phase: string
  blurb: string
  tools: string[]
}

const PENDING: Record<PendingRouteName, PendingSection> = {
  products: {
    title: 'Product Knowledge',
    phase: 'Phase 3',
    blurb:
      'Four seeded products with a do-and-do-not list each, and full CRUD. This is the ' +
      'brand context an agent reads before it writes anything — as data, never as ' +
      'instructions to itself.',
    tools: ['list_products', 'get_product', 'create_product', 'update_product', 'delete_product'],
  },
  briefs: {
    title: 'Briefs',
    phase: 'Phase 4',
    blurb:
      'The composer and the library. The page hands over the trend and the product; the ' +
      'connected agent writes the brief and posts it back. Nothing here calls a model ' +
      'server-side, deliberately.',
    tools: ['get_brief_context', 'save_brief', 'search_briefs', 'update_brief_status'],
  },
  calendar: {
    title: 'Calendar',
    phase: 'Phase 5 — first to be cut if the schedule slips',
    blurb:
      'A month view that schedules approved briefs. Pre-designated as the first cut in ' +
      'plan/README.md, so it may ship empty and that is a decision rather than a failure.',
    tools: ['schedule_brief', 'list_schedule'],
  },
  performance: {
    title: 'Performance',
    phase: 'Phase 5 — first to be cut if the schedule slips',
    blurb:
      'Per-content reach and engagement over the seeded analytics, and the ' +
      'best-posting-hour curve. Every number invented and badged.',
    tools: [],
  },
}

export function PendingRoute({ route }: { route: PendingRouteName }) {
  const pending = PENDING[route]

  return (
    <section className="card" data-testid={`pending-${route}`}>
      <div className="card-head">
        <h2>{pending.title}</h2>
        <span className="badge badge-pending">{pending.phase}</span>
      </div>
      <p className="muted">{pending.blurb}</p>
      {pending.tools.length > 0 && (
        <>
          <p className="muted small">
            Tools that will register on this route, and are deliberately <em>not</em> on the
            surface yet — a tool an agent cannot usefully call is the failure this project
            exists to argue against:
          </p>
          <ul className="tool-preview">
            {pending.tools.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
