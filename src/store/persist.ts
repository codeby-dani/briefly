/**
 * localStorage plumbing for every store. Keys and the no-migration rule come
 * from plan/02-data-model.md.
 *
 * There are no migrations on purpose. A version mismatch wipes the seeded
 * stores and reseeds; ten hours is not enough time to be careful about a schema
 * that has never shipped, and a half-migrated store is worse than a fresh one.
 */

// 3 — Phase 3 replaces products with one business profile and offerings.
export const SCHEMA_VERSION = 3

export const KEYS = {
  version: 'td:version',
  trends: 'td:trends',
  businessProfile: 'td:business-profile',
  briefs: 'td:briefs',
  watchlist: 'td:watchlist',
  schedule: 'td:schedule',
  analytics: 'td:analytics',
} as const

/** Keys that are wiped when the schema version moves. `td:events` is not one — the log survives a reseed on purpose. */
const SEEDED_KEYS = [KEYS.trends, KEYS.businessProfile, KEYS.briefs, KEYS.watchlist, KEYS.schedule, KEYS.analytics, 'td:products']

/**
 * Every read and write is wrapped, because a private window with storage
 * disabled must degrade to an in-memory app rather than a white screen. That is
 * a real judging environment, not a hypothetical one.
 */
export function readJSON<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return undefined
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable. The in-memory copy is still correct, so the
    // session works; it just will not survive a reload.
  }
}

let checked = false

/** Wipe seeded stores when `td:version` is missing or stale. Runs once. */
export function ensureSchemaVersion(): void {
  if (checked) return
  checked = true
  try {
    const current = readJSON<number>(KEYS.version)
    if (current === SCHEMA_VERSION) return
    SEEDED_KEYS.forEach((key) => localStorage.removeItem(key))
    writeJSON(KEYS.version, SCHEMA_VERSION)
    console.log(`[store] seeded at schema version ${SCHEMA_VERSION}`)
  } catch {
    // No storage: every store falls back to its seed on each load, which is
    // exactly the behaviour we want.
  }
}
