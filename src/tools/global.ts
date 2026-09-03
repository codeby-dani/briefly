/**
 * Tools that are on the surface everywhere, on every route.
 *
 * Phase 0 registers exactly one: `get_app_state`. It is the tool an agent that
 * has just connected calls first, to learn what the human is looking at, and it
 * is what makes every other tool coherent. Contract: plan/02-data-model.md.
 *
 * The counts it returns are zeroed stubs until Phase 1 lands the stores. The
 * *shape* is the contract and does not change when the numbers become real.
 */

import type { ToolSpec } from '../webmcp'
import type { Route } from '../types'
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

export function getAppStateTool(read: () => AppStateSnapshot): ToolSpec {
  return traced({
    name: 'get_app_state',
    description:
      'Call this first, before anything else, to learn what the human is currently ' +
      'looking at: which route is open, which trend and product are selected, and how ' +
      'many records exist. Every other tool on this page is scoped to that state.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => read(),
  })
}
