/**
 * Global tools — registered on every route, for the whole session.
 *
 * Phase 0 ships one of the two: `get_app_state`. It is the throwaway tool the
 * phase calls for and it is not thrown away, because Phase 1 keeps it as-is.
 * `navigate_to` arrives with the router in Phase 1; registering it now would
 * put a tool on the surface that cannot do anything, which is the exact
 * failure mode this project exists to argue against.
 */

import { useTool } from '../webmcp'
import { traced } from './trace'
import { CLIPS } from '../fixtures/clips'

export type Route =
  | 'dashboard'
  | 'trends'
  | 'products'
  | 'briefs'
  | 'calendar'
  | 'performance'

/**
 * What `get_app_state` reports. Phase 1 fills the counts from the stores; in
 * Phase 0 the stores do not exist yet, so the zeros are true rather than stubs
 * standing in for numbers we have.
 */
export interface AppStateSnapshot {
  route: Route
  selectedTrendId: string | null
  selectedProductId: string | null
  openBriefId: string | null
  counts: { trends: number; products: number; briefs: number; watchlist: number }
  visibleTrendCount: number
  activeFilters: Record<string, unknown>
}

export function useGlobalTools(state: AppStateSnapshot): void {
  useTool(
    traced({
      name: 'get_app_state',
      description:
        'Use this first, before anything else, to learn what the human is currently looking at: ' +
        'which route is open, what they have selected, and how much data is on screen. ' +
        'Every other tool on this surface acts on that context.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: () => ({
        route: state.route,
        selectedTrendId: state.selectedTrendId,
        selectedProductId: state.selectedProductId,
        openBriefId: state.openBriefId,
        counts: state.counts,
        visibleTrendCount: state.visibleTrendCount,
        activeFilters: state.activeFilters,
        // Phase 0: the corpus is the only real data on the origin so far.
        // Saying so keeps an agent from reading the zeros above as an error.
        buildPhase: 0,
        clipCount: CLIPS.length,
      }),
    }),
  )
}
