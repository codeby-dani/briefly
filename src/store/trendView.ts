/**
 * Search, filter and sort state for the Trends table.
 *
 * Module-level rather than component state, for the reason given in
 * plan/01-architecture.md: an agent can call a tool between a render and its
 * commit, so executors have to read current state without going through render
 * scope. It is the same shape as `router.ts` and for the same reason.
 *
 * Deliberately **not** persisted. plan/02-data-model.md lists every
 * `localStorage` key this app owns and there is no key for view state — a
 * filter that survives a reload is a judge opening the live URL to an
 * inexplicably empty table. It resets on load, which is the honest default.
 *
 * The human's controls and the agent's tools write the same fields here. That
 * is Phase 2 exit criterion 2: an agent filtering and a human filtering are one
 * operation, not two that happen to agree.
 */

import { useSyncExternalStore } from 'react'
import type { Category, Platform, Trend } from '../types'
import { readTrends } from './trends'
import { readWatchlist } from './watchlist'

export type SortField = 'volume' | 'growth' | 'recency'
export type SortDirection = 'asc' | 'desc'

export interface TrendFilters {
  platform: Platform | null
  category: Category | null
  /** ISO date, inclusive, compared against `Trend.firstSeen`. */
  from: string | null
  to: string | null
  minGrowthPct: number | null
}

export interface TrendView {
  query: string
  filters: TrendFilters
  sort: { field: SortField; direction: SortDirection }
  /**
   * The watchlist filter is a UI control, not one of the five fields
   * `filter_trends` owns, so `filter_trends({})` does not clear it. It is
   * reported in `activeFilters` regardless, because an agent looking at a
   * short list deserves to know why it is short.
   */
  watchlistOnly: boolean
}

export const EMPTY_FILTERS: TrendFilters = {
  platform: null,
  category: null,
  from: null,
  to: null,
  minGrowthPct: null,
}

// Growth descending: the fastest-moving trend is the one a human opens the
// page to find, and it makes the sparkline column mean something on landing.
const INITIAL: TrendView = {
  query: '',
  filters: EMPTY_FILTERS,
  sort: { field: 'growth', direction: 'desc' },
  watchlistOnly: false,
}

let view: TrendView = INITIAL
const listeners = new Set<() => void>()

/** Current view state. Safe to call from a tool executor. */
export function readTrendView(): TrendView {
  return view
}

function commit(next: TrendView): TrendView {
  view = next
  listeners.forEach((fn) => fn())
  return view
}

export function setQuery(query: string): TrendView {
  return commit({ ...view, query })
}

/** Replaces the whole filter set. Omission is a reset, per the contract. */
export function setFilters(filters: TrendFilters): TrendView {
  return commit({ ...view, filters })
}

/** One control moving. The human's selects use this; `filter_trends` does not. */
export function patchFilters(patch: Partial<TrendFilters>): TrendView {
  return commit({ ...view, filters: { ...view.filters, ...patch } })
}

export function setSort(field: SortField, direction: SortDirection): TrendView {
  return commit({ ...view, sort: { field, direction } })
}

export function setWatchlistOnly(watchlistOnly: boolean): TrendView {
  return commit({ ...view, watchlistOnly })
}

export function resetTrendView(): TrendView {
  return commit(INITIAL)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useTrendView(): TrendView {
  return useSyncExternalStore(subscribe, readTrendView, readTrendView)
}

/* ------------------------------------------------------------------------- *
 * Selection. One function, used by the table and by every tool that has to
 * answer "what is on screen" — because if the tool and the table computed the
 * visible set separately they would eventually disagree, and the disagreement
 * would surface on camera.
 * ------------------------------------------------------------------------- */

function matchesQuery(trend: Trend, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    trend.keyword.toLowerCase().includes(q) ||
    trend.category.toLowerCase().includes(q) ||
    trend.relatedKeywords.some((k) => k.toLowerCase().includes(q))
  )
}

function matchesFilters(trend: Trend, filters: TrendFilters): boolean {
  if (filters.platform && trend.platform !== filters.platform) return false
  if (filters.category && trend.category !== filters.category) return false
  if (filters.from && trend.firstSeen < filters.from) return false
  if (filters.to && trend.firstSeen > filters.to) return false
  if (filters.minGrowthPct !== null && trend.growthPct < filters.minGrowthPct) return false
  return true
}

function compare(a: Trend, b: Trend, field: SortField): number {
  switch (field) {
    case 'volume':
      return a.volume - b.volume
    case 'growth':
      return a.growthPct - b.growthPct
    case 'recency':
      return a.firstSeen.localeCompare(b.firstSeen)
  }
}

/** Exactly the rows the table renders, in the order it renders them. */
export function visibleTrends(): Trend[] {
  const { query, filters, sort, watchlistOnly } = view
  const watchlist = watchlistOnly ? new Set(readWatchlist()) : null

  const rows = readTrends().filter(
    (trend) =>
      (!watchlist || watchlist.has(trend.id)) &&
      matchesQuery(trend, query) &&
      matchesFilters(trend, filters),
  )

  const sign = sort.direction === 'asc' ? 1 : -1
  return rows.sort((a, b) => sign * compare(a, b, sort.field))
}

/**
 * The filter map `get_app_state` and `filter_trends` report.
 *
 * Only the filters that are actually on appear, so an agent reading `{}` knows
 * nothing is filtering rather than having to compare five nulls.
 */
export function activeFilters(): Record<string, unknown> {
  const { query, filters, sort, watchlistOnly } = view
  return {
    ...(query.trim() ? { query: query.trim() } : {}),
    ...(filters.platform ? { platform: filters.platform } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
    ...(filters.minGrowthPct !== null ? { minGrowthPct: filters.minGrowthPct } : {}),
    ...(watchlistOnly ? { watchlistOnly: true } : {}),
    sort: `${sort.field} ${sort.direction}`,
  }
}
