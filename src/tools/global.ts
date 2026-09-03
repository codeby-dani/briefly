/**
 * Tools that are on the surface everywhere, on every route.
 *
 * Two of them, and Phase 1 exit criterion 6 is that the count is exactly two on
 * every route — a third tool appearing here would mean a route guard elsewhere
 * has leaked, which is the failure this project exists to argue against.
 *
 * Neither executor takes state as an argument. They read the stores directly,
 * because an agent can call a tool between a render and its commit and a
 * closure over render-scope state would hand back a stale answer. Contracts:
 * plan/02-data-model.md § Tool Contracts.
 */

import type { ToolSpec } from '../webmcp'
import { ROUTES, isRoute } from '../types'
import type { Route } from '../types'
import { navigate, readAppState } from '../store/router'
import { readBriefs } from '../store/briefs'
import { readProducts } from '../store/products'
import { readTrends } from '../store/trends'
import { activeFilters, visibleTrends } from '../store/trendView'
import { readWatchlist } from '../store/watchlist'
import { traced } from './trace'

export interface AppStateSnapshot {
  route: Route
  selectedTrendId: string | null
  selectedProductId: string | null
  openBriefId: string | null
  counts: { trends: number; products: number; briefs: number; watchlist: number }
  visibleTrendCount: number
  activeFilters: Record<string, unknown>
}

/**
 * The snapshot, built from the stores at call time.
 *
 * `visibleTrendCount` and `activeFilters` describe the Trends view, and since
 * Phase 2 they are read from the same selector the table renders from. An
 * agent that has just connected asks this first, and the answer has to be the
 * table on screen rather than a plausible reconstruction of it.
 */
export function readAppSnapshot(): AppStateSnapshot {
  const app = readAppState()
  const trends = readTrends()
  return {
    route: app.route,
    selectedTrendId: app.selectedTrendId,
    selectedProductId: app.selectedProductId,
    openBriefId: app.openBriefId,
    counts: {
      trends: trends.length,
      products: readProducts().length,
      briefs: readBriefs().length,
      watchlist: readWatchlist().length,
    },
    visibleTrendCount: visibleTrends().length,
    activeFilters: activeFilters(),
  }
}

export function getAppStateTool(): ToolSpec {
  return traced({
    name: 'get_app_state',
    description:
      'Call this first, before anything else, to learn what the human is currently ' +
      'looking at: which route is open, which trend and product are selected, and how ' +
      'many records exist. Every other tool on this page is scoped to that state.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => readAppSnapshot(),
  })
}

export function navigateToTool(): ToolSpec {
  return traced({
    name: 'navigate_to',
    description:
      'Use when the tools you need are not on the surface yet, or when the human asks ' +
      'to be taken somewhere. Moves the page to one of six sections; the human sees the ' +
      'navigation happen. Calling it for the route already open is harmless.',
    inputSchema: {
      type: 'object',
      properties: {
        route: {
          type: 'string',
          enum: [...ROUTES],
          description: 'The section to open.',
        },
      },
      required: ['route'],
      additionalProperties: false,
    },
    annotations: { idempotentHint: true },
    execute: (input: { route?: unknown }) => {
      // The schema is a hint to the agent, not a guarantee about what arrives.
      if (!isRoute(input?.route)) {
        return {
          ok: false as const,
          reason: `not a route: ${JSON.stringify(input?.route ?? null)}`,
          known: [...ROUTES],
        }
      }
      return { ok: true as const, route: navigate(input.route) }
    },
  })
}

/** Registered unconditionally at the app root. */
export function globalTools(): ToolSpec[] {
  return [getAppStateTool(), navigateToTool()]
}
