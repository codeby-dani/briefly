/**
 * The routes whose contents arrive in Phase 5.
 *
 * They are reachable now, by hash and by `navigate_to`, because Phase 1 exit
 * criterion 1 requires it and because an agent that navigates somewhere should
 * land on something honest. Each one names the tools that will appear here and
 * the phase that brings them, rather than faking a table — a placeholder that
 * pretends to work is worse than one that says what it is waiting for.
 */

import type { Route } from '../types'

/**
 * Every route that has not been built yet. Trends left this set in Phase 2,
 * Products in Phase 3 and Briefs in Phase 4; only the cuttable Phase 5 pair
 * remains.
 */
export type PendingRouteName = Exclude<Route, 'dashboard' | 'trends' | 'products' | 'briefs'>

interface PendingSection {
  title: string
  phase: string
  blurb: string
  tools: string[]
}

const PENDING: Record<PendingRouteName, PendingSection> = {
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
