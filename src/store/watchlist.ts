/** Trend ids the human or the agent has saved. Phase 2 writes it. */

import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const watchlistStore = createStore<string[]>(KEYS.watchlist, () => [])

export function readWatchlist(): string[] {
  return watchlistStore.read()
}

/**
 * Idempotent by contract, not by convention: plan/01-architecture.md says an
 * agent will retry, so calling this twice has to be calling it once. The
 * `alreadyPresent` flag is what `save_to_watchlist` reports back, and Phase 2
 * exit criterion 7 checks exactly that.
 */
export function addToWatchlist(trendId: string): { size: number; alreadyPresent: boolean } {
  const alreadyPresent = watchlistStore.read().includes(trendId)
  if (!alreadyPresent) watchlistStore.set((ids) => [...ids, trendId])
  return { size: watchlistStore.read().length, alreadyPresent }
}

export function removeFromWatchlist(trendId: string): number {
  watchlistStore.set((ids) => ids.filter((id) => id !== trendId))
  return watchlistStore.read().length
}

export function isWatched(trendId: string): boolean {
  return watchlistStore.read().includes(trendId)
}
