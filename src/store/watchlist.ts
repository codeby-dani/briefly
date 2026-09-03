/** Trend ids the human or the agent has saved. Phase 2 writes it. */

import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const watchlistStore = createStore<string[]>(KEYS.watchlist, () => [])

export function readWatchlist(): string[] {
  return watchlistStore.read()
}
