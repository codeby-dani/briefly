/**
 * Briefs. Seeded empty on purpose: a brief is the thing the human and the agent
 * make together, and shipping pre-written ones would hide the only moment in
 * the app that matters. The empty state on the dashboard says so.
 */

import type { Brief } from '../types'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const briefStore = createStore<Brief[]>(KEYS.briefs, () => [])

export function readBriefs(): Brief[] {
  return briefStore.read()
}
