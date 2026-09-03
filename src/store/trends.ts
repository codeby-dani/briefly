/**
 * Seeded trends. Read-only to the user in the UI; Phase 2's
 * `write_trend_summary` writes into `aiSummary`, which is why this is a store
 * and not a static import like the clip corpus.
 */

import { CLIPS } from '../fixtures/clips'
import { TRENDS } from '../fixtures/trends'
import type { Trend } from '../types'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

/**
 * A dangling clip id surfaces in Phase 2 as a blank video player, and tracing a
 * blank player back to a fixture typo costs far more than this check does.
 * Phase 1 exit criterion 7 is exactly this assertion, so it runs at seed time
 * and shouts rather than failing quietly.
 */
function assertClipIdsResolve(trends: Trend[]): Trend[] {
  const known = new Set(CLIPS.map((clip) => clip.id))
  const dangling = trends.flatMap((trend) =>
    trend.clipIds.filter((id) => !known.has(id)).map((id) => `${trend.id} → ${id}`),
  )
  if (dangling.length > 0) {
    console.error(`[store] trend fixture references clips that do not exist: ${dangling.join(', ')}`)
  }
  return trends
}

export const trendStore = createStore<Trend[]>(KEYS.trends, () => assertClipIdsResolve(TRENDS))

export function readTrends(): Trend[] {
  return trendStore.read()
}

export function readTrend(trendId: string): Trend | undefined {
  return trendStore.read().find((trend) => trend.id === trendId)
}
