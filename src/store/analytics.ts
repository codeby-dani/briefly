/** Seeded account analytics. Read-only, invented, badged `demo data` everywhere it renders. */

import { ANALYTICS } from '../fixtures/analytics'
import type { Analytics } from '../types'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const analyticsStore = createStore<Analytics>(KEYS.analytics, () => ANALYTICS)

export function readAnalytics(): Analytics {
  return analyticsStore.read()
}
