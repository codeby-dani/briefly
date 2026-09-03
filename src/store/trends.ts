/**
 * Seeded trends. Read-only to the user in the UI; Phase 2's
 * `write_trend_summary` writes into `aiSummary`, which is why this is a store
 * and not a static import like the clip corpus.
 */

import { CLIPS } from '../fixtures/clips'
import { TRENDS } from '../fixtures/trends'
import type { SummarySource, Trend } from '../types'
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

/**
 * The one write this store accepts.
 *
 * Three tools and one textarea land here — `write_trend_summary` (agent),
 * `analyze_trend` (model or cached) and the drawer's own editor (human) — and
 * they differ only in the `source` they stamp. Routing all four through one
 * function is what makes the provenance label trustworthy: there is no second
 * path that could write a summary without saying where it came from.
 *
 * Returns the updated trend, or `undefined` for an id that does not exist, so
 * the caller can answer the agent honestly instead of writing a dangling
 * reference.
 */
export function writeTrendSummary(
  trendId: string,
  summary: string,
  suggestedAngles: string[],
  source: Exclude<SummarySource, null>,
): Trend | undefined {
  let updated: Trend | undefined
  trendStore.set((trends) =>
    trends.map((trend) => {
      if (trend.id !== trendId) return trend
      updated = { ...trend, aiSummary: summary, aiSummarySource: source, suggestedAngles }
      return updated
    }),
  )
  return updated
}

/** Clears the analysis back to its untouched state. The drawer's editor uses it. */
export function clearTrendSummary(trendId: string): Trend | undefined {
  let updated: Trend | undefined
  trendStore.set((trends) =>
    trends.map((trend) => {
      if (trend.id !== trendId) return trend
      updated = { ...trend, aiSummary: null, aiSummarySource: null, suggestedAngles: [] }
      return updated
    }),
  )
  return updated
}
