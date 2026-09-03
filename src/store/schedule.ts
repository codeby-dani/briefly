/**
 * The publishing schedule. Seeded empty, for the same reason briefs are: a
 * schedule entry points at a brief, and nothing is seeded into the brief store,
 * so a seeded entry would have to point at a brief that does not exist.
 *
 * The write helpers live here rather than in the tool file so the human path
 * (clicking a day in the calendar) and the agent path (`schedule_brief`) share
 * one implementation. Two code paths that could disagree about what "already
 * scheduled" means would be exactly the drift plan/02-data-model.md exists to
 * prevent — and here that disagreement has a name: it is a duplicate row on the
 * calendar the moment an agent retries.
 */

import type { Platform, ScheduleEntry, ScheduleStatus } from '../types'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const scheduleStore = createStore<ScheduleEntry[]>(KEYS.schedule, () => [])

export function readSchedule(): ScheduleEntry[] {
  return scheduleStore.read()
}

export function readScheduleEntry(entryId: string): ScheduleEntry | undefined {
  return scheduleStore.read().find((entry) => entry.id === entryId)
}

/** Every entry on one ISO day. What a calendar cell renders. */
export function readScheduleForDate(date: string): ScheduleEntry[] {
  return scheduleStore.read().filter((entry) => entry.date === date)
}

export function readScheduleForBrief(briefId: string): ScheduleEntry[] {
  return scheduleStore.read().filter((entry) => entry.briefId === briefId)
}

function newEntryId(): string {
  return `sch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export interface ScheduleInput {
  briefId: string
  /** ISO date, day precision. */
  date: string
  platform: Platform
  pic: string
  status: ScheduleStatus
}

export interface ScheduleResult {
  entry: ScheduleEntry
  /** False when an existing entry for this briefId+date was reused. */
  created: boolean
  /** Fields the reused entry actually had to change. Empty on a true no-op. */
  changed: string[]
}

/**
 * Place a brief on a day.
 *
 * **Idempotent by `briefId` + `date`**, which is what plan/phases/phase-5 asks
 * for and is not a detail: an agent will retry, and the failure mode of a
 * non-idempotent version is two identical chips on one calendar cell with no
 * way for the human to tell which one is real. A repeat call with the same
 * fields returns the same entry id, reports `created: false`, and writes
 * nothing — `changed` is empty, so a caller can tell a genuine edit from a
 * retry without diffing the record itself.
 */
export function scheduleBrief(input: ScheduleInput): ScheduleResult {
  const existing = scheduleStore
    .read()
    .find((entry) => entry.briefId === input.briefId && entry.date === input.date)

  if (existing) {
    const changed = (['platform', 'pic', 'status'] as const).filter(
      (field) => existing[field] !== input[field],
    )
    if (changed.length === 0) return { entry: existing, created: false, changed: [] }

    const updated: ScheduleEntry = {
      ...existing,
      platform: input.platform,
      pic: input.pic,
      status: input.status,
    }
    scheduleStore.set((entries) => entries.map((e) => (e.id === existing.id ? updated : e)))
    return { entry: updated, created: false, changed: [...changed] }
  }

  const entry: ScheduleEntry = {
    id: newEntryId(),
    briefId: input.briefId,
    date: input.date,
    platform: input.platform,
    pic: input.pic,
    status: input.status,
  }
  scheduleStore.set((entries) => [...entries, entry])
  return { entry, created: true, changed: [] }
}

/**
 * Move an entry along its status.
 *
 * Free movement in both directions, per plan/02-data-model.md § Schedule status
 * — the opposite of the brief machine, and deliberately so. A brief that has
 * been published is a record of what shipped; a schedule slot that has been
 * published is a plan a real team drags back to `in_progress` when the post
 * comes down.
 */
export function setScheduleStatus(
  entryId: string,
  status: ScheduleStatus,
): { ok: true; entry: ScheduleEntry } | { ok: false; reason: string; known: string[] } {
  const entry = readScheduleEntry(entryId)
  if (!entry) {
    return {
      ok: false,
      reason: `no such schedule entry: ${entryId}`,
      known: readSchedule().map((e) => e.id),
    }
  }
  if (entry.status === status) return { ok: true, entry }
  const updated: ScheduleEntry = { ...entry, status }
  scheduleStore.set((entries) => entries.map((e) => (e.id === entryId ? updated : e)))
  return { ok: true, entry: updated }
}

/** Take a brief off the calendar. The human control; no tool writes this. */
export function unschedule(entryId: string): boolean {
  const before = scheduleStore.read().length
  scheduleStore.set((entries) => entries.filter((entry) => entry.id !== entryId))
  return scheduleStore.read().length !== before
}
