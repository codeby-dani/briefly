/**
 * Calendar tools. Four of them, registered on the Calendar route only, plus the
 * `search_briefs` lookup borrowed from the Briefs route for the reason given at
 * the bottom of this file.
 *
 * It was two, and two was a calendar an agent could write to and never correct:
 * `schedule_brief` put an entry on a day, and the two controls beside it on
 * screen — the status chips and the remove button — had no tool at all. An
 * agent could fill a calendar and not empty it. `set_schedule_status` and
 * `unschedule_brief` are those two controls, and nothing more.
 *
 * The Phase 5 exit-criterion arithmetic moved with them: the surface here is no
 * longer 4. Whatever recount that criterion needs belongs in the phase file,
 * not in a comment that quietly keeps saying 4.
 *
 * **A contract note, recorded rather than assumed.** plan/01-architecture.md
 * lists `schedule_brief` as `idempotent` and `list_schedule` as `readOnly`, and
 * plan/02-data-model.md § Types defines `ScheduleEntry` and the schedule status
 * machine — but § Tool Contracts stops at `update_brief_status` and writes no
 * input or output schema for either tool here. The shapes below are therefore
 * derived, from three things and nothing else:
 *
 *   1. `ScheduleEntry` — every field an entry has is a field these tools speak.
 *   2. plan/phases/phase-5 task 4 — "idempotent by briefId+date", verbatim.
 *   3. The refusal shape every other tool in this app already uses:
 *      `{ ok: false, reason, known: [...] }`, never a throw.
 *
 * Nothing was invented beyond that. A later pass should either write these two
 * into § Tool Contracts as they stand or correct them there first; this comment
 * is the flag, in the same style as the Phase 4 note about the phantom `+1`.
 *
 * Executors read the stores at call time rather than closing over render scope,
 * because an agent can call between a render and its commit.
 */

import type { ToolSpec } from '../webmcp'
import { PLATFORMS, SCHEDULE_STATUSES, isPlatform, isScheduleStatus } from '../types'
import type { Platform, ScheduleStatus } from '../types'
import { readBrief, readBriefs } from '../store/briefs'
import { searchBriefsTool } from './briefs'
import {
  readSchedule,
  readScheduleEntry,
  scheduleBrief,
  setScheduleStatus,
  unschedule,
} from '../store/schedule'
import { traced } from './trace'

/** ISO day, `YYYY-MM-DD`, and a real calendar date rather than 2026-02-31. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

function isIsoDay(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DAY.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unexpectedField(input: Record<string, unknown>, allowed: readonly string[]): string | null {
  const field = Object.keys(input).find((key) => !allowed.includes(key))
  return field ? `unexpected field: ${field}` : null
}

const SCHEDULE_FIELDS = ['briefId', 'date', 'platform', 'pic', 'status'] as const
const LIST_FIELDS = ['from', 'to', 'status', 'platform', 'briefId'] as const
const STATUS_FIELDS = ['entryId', 'status'] as const
const UNSCHEDULE_FIELDS = ['entryId'] as const

/** The default owner when nobody is named. Rendered as-is on the chip. */
export const UNASSIGNED_PIC = 'Unassigned'

export function scheduleBriefTool(): ToolSpec {
  return traced({
    name: 'schedule_brief',
    description:
      'Use to put an existing brief on a specific day. It schedules a brief; it cannot ' +
      'create one, and briefId must be a real id. ' +
      'BEFORE THIS, in order: (1) call search_briefs — it is on this route too — to find ' +
      'a brief and take its id; (2) if nothing there is right, the brief does not exist ' +
      'yet, so navigate_to("briefs"), open_trend and select_offering to arm the composer, ' +
      'then generate_brief or save_brief to write one, and come back; (3) call ' +
      'list_schedule to see what that day already holds. ' +
      'AFTER THIS: list_schedule to confirm the slot, or update_brief_status to approve ' +
      'the brief you just scheduled. ' +
      'Safe to retry: scheduling the same brief on the same date twice updates that one ' +
      'entry rather than creating a second, and the result says whether anything actually ' +
      'changed. Omit platform and it follows the brief; omit pic and the slot is left ' +
      'unassigned; omit status and it starts as planned.',
    inputSchema: {
      type: 'object',
      properties: {
        briefId: {
          type: 'string',
          description:
            'The brief to schedule, by id. Get one from search_briefs — never invent an id.',
        },
        date: { type: 'string', description: 'ISO date, day precision: YYYY-MM-DD.' },
        platform: {
          type: 'string',
          enum: [...PLATFORMS],
          description: "Where it publishes. Defaults to the brief's own platform.",
        },
        pic: { type: 'string', description: 'Person in charge. Defaults to Unassigned.' },
        status: {
          type: 'string',
          enum: [...SCHEDULE_STATUSES],
          description: 'Defaults to planned. Moves freely in both directions afterwards.',
        },
      },
      required: ['briefId', 'date'],
      additionalProperties: false,
    },
    annotations: { idempotentHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input)) return { ok: false as const, reason: 'input must be an object' }
      const unexpected = unexpectedField(input, SCHEDULE_FIELDS)
      if (unexpected) return { ok: false as const, reason: unexpected }

      const briefId = typeof input.briefId === 'string' ? input.briefId.trim() : ''
      if (!briefId) return { ok: false as const, reason: 'briefId is required' }

      const brief = readBrief(briefId)
      if (!brief) {
        return {
          ok: false as const,
          reason: `no such brief: ${briefId}`,
          hint: 'Call search_briefs to get a real id, or write the brief first with save_brief.',
          // Ids alone made an agent guess which one it meant. The title is what
          // it was actually looking for.
          known: readBriefs().map((b) => ({ id: b.id, title: b.title, status: b.status })),
        }
      }

      if (!isIsoDay(input.date)) {
        return {
          ok: false as const,
          reason: `date must be an ISO day, YYYY-MM-DD: ${JSON.stringify(input.date ?? null)}`,
        }
      }

      if ('platform' in input && !isPlatform(input.platform)) {
        return {
          ok: false as const,
          reason: `not a platform: ${JSON.stringify(input.platform ?? null)}`,
          known: [...PLATFORMS],
        }
      }
      if ('status' in input && !isScheduleStatus(input.status)) {
        return {
          ok: false as const,
          reason: `not a schedule status: ${JSON.stringify(input.status ?? null)}`,
          known: [...SCHEDULE_STATUSES],
        }
      }
      if ('pic' in input && typeof input.pic !== 'string') {
        return { ok: false as const, reason: 'pic must be a string' }
      }

      const platform: Platform = isPlatform(input.platform) ? input.platform : brief.platform
      const status: ScheduleStatus = isScheduleStatus(input.status) ? input.status : 'planned'
      const pic = typeof input.pic === 'string' && input.pic.trim() ? input.pic.trim() : UNASSIGNED_PIC

      const result = scheduleBrief({ briefId, date: input.date, platform, pic, status })
      return {
        ok: true as const,
        entryId: result.entry.id,
        created: result.created,
        changed: result.changed,
        entry: result.entry,
      }
    },
  })
}

export function listScheduleTool(): ToolSpec {
  return traced({
    name: 'list_schedule',
    description:
      'Use to see what is already on the calendar before scheduling something, so you do ' +
      'not stack three posts on one day. All filters are optional and combine; omit one ' +
      'to leave it unconstrained. Returns one row per entry with the brief title resolved, ' +
      'sorted by date. Read-only — it does not change what the human is looking at.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'ISO date; entries on or after this day.' },
        to: { type: 'string', description: 'ISO date; entries on or before this day.' },
        status: { type: 'string', enum: [...SCHEDULE_STATUSES] },
        platform: { type: 'string', enum: [...PLATFORMS] },
        briefId: { type: 'string', description: 'Only entries for this brief.' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input)) return { ok: false as const, reason: 'input must be an object' }
      const unexpected = unexpectedField(input, LIST_FIELDS)
      if (unexpected) return { ok: false as const, reason: unexpected }

      // An unreadable filter used to be dropped, so `status: "postd"` returned
      // the whole calendar and looked like an answer. Say no instead.
      for (const key of ['from', 'to'] as const) {
        if (input[key] !== undefined && !isIsoDay(input[key])) {
          return { ok: false as const, reason: `${key} must be an ISO day, e.g. 2026-08-21` }
        }
      }
      if (input.status !== undefined && !isScheduleStatus(input.status)) {
        return {
          ok: false as const,
          reason: `not a status: ${JSON.stringify(input.status)}`,
          known: [...SCHEDULE_STATUSES],
        }
      }
      if (input.platform !== undefined && !isPlatform(input.platform)) {
        return {
          ok: false as const,
          reason: `not a platform: ${JSON.stringify(input.platform)}`,
          known: [...PLATFORMS],
        }
      }
      if (input.briefId !== undefined && typeof input.briefId !== 'string') {
        return { ok: false as const, reason: 'briefId must be a string' }
      }

      const from = isIsoDay(input.from) ? input.from : ''
      const to = isIsoDay(input.to) ? input.to : ''
      const status = isScheduleStatus(input.status) ? input.status : ''
      const platform = isPlatform(input.platform) ? input.platform : ''
      const briefId = typeof input.briefId === 'string' ? input.briefId.trim() : ''
      if (from && to && from > to) {
        return { ok: false as const, reason: `from ${from} is after to ${to}` }
      }

      const entries = readSchedule()
        .filter((entry) => {
          if (from && entry.date < from) return false
          if (to && entry.date > to) return false
          if (status && entry.status !== status) return false
          if (platform && entry.platform !== platform) return false
          if (briefId && entry.briefId !== briefId) return false
          return true
        })
        .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
        .map((entry) => ({
          id: entry.id,
          briefId: entry.briefId,
          // Resolved here so an agent does not have to call search_briefs to
          // turn a calendar into something it can talk about.
          title: readBrief(entry.briefId)?.title ?? null,
          date: entry.date,
          platform: entry.platform,
          pic: entry.pic,
          status: entry.status,
        }))

      return { count: entries.length, total: readSchedule().length, entries }
    },
  })
}

export function setScheduleStatusTool(): ToolSpec {
  return traced({
    name: 'set_schedule_status',
    description:
      'Use to move a calendar entry along: planned to in_progress when someone picks it ' +
      'up, in_progress to published when the post actually goes out. These are the status ' +
      'chips on the entry. Unlike update_brief_status this moves freely in both ' +
      'directions — a slot is a plan, and a plan gets dragged back when a post comes down. ' +
      'It changes the schedule entry and never the brief; the brief keeps its own status. ' +
      'BEFORE THIS: list_schedule, for a real entryId.',
    inputSchema: {
      type: 'object',
      properties: {
        entryId: { type: 'string' },
        status: { type: 'string', enum: [...SCHEDULE_STATUSES] },
      },
      required: ['entryId', 'status'],
      additionalProperties: false,
    },
    annotations: { idempotentHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input)) return { ok: false as const, reason: 'input must be an object' }
      const unexpected = unexpectedField(input, STATUS_FIELDS)
      if (unexpected) return { ok: false as const, reason: unexpected }

      const entryId = typeof input.entryId === 'string' ? input.entryId.trim() : ''
      if (!entryId) return { ok: false as const, reason: 'entryId is required' }
      if (!isScheduleStatus(input.status)) {
        return {
          ok: false as const,
          reason: `not a schedule status: ${JSON.stringify(input.status ?? null)}`,
          known: [...SCHEDULE_STATUSES],
        }
      }

      // Read first: `from` is the half of the answer the store cannot give
      // back once it has been overwritten, and it is what makes the move
      // reportable to the human as a move rather than as a new value.
      const before = readScheduleEntry(entryId)
      const result = setScheduleStatus(entryId, input.status)
      if (!result.ok) {
        return { ...result, hint: 'Call list_schedule to get a real entry id.' }
      }

      return {
        ok: true as const,
        entryId,
        from: before?.status ?? null,
        to: result.entry.status,
        changed: before?.status !== result.entry.status,
        entry: result.entry,
      }
    },
  })
}

export function unscheduleBriefTool(): ToolSpec {
  return traced({
    name: 'unschedule_brief',
    description:
      'Use to take one entry off the calendar — the remove button on the entry. It removes ' +
      'the slot, not the brief: the brief stays in the library at whatever status it had ' +
      'and can be scheduled again on another day. Read the row back to the human before ' +
      'calling this; nothing here puts it back. ' +
      'BEFORE THIS: list_schedule, for a real entryId. ' +
      'If you only want to move a brief to a different day, call schedule_brief with the ' +
      'new date instead — it is idempotent by brief and date and does not need this first.',
    inputSchema: {
      type: 'object',
      properties: { entryId: { type: 'string' } },
      required: ['entryId'],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input)) return { ok: false as const, reason: 'input must be an object' }
      const unexpected = unexpectedField(input, UNSCHEDULE_FIELDS)
      if (unexpected) return { ok: false as const, reason: unexpected }

      const entryId = typeof input.entryId === 'string' ? input.entryId.trim() : ''
      if (!entryId) return { ok: false as const, reason: 'entryId is required' }

      const entry = readScheduleEntry(entryId)
      if (!entry) {
        // Not silently ok. A destructive tool that reports success for an id it
        // never found is a tool that will one day report success for the id you
        // typed wrong, on the entry you meant to keep.
        return {
          ok: false as const,
          reason: `no such schedule entry: ${entryId}`,
          hint: 'Call list_schedule to get a real entry id.',
          known: readSchedule().map((e) => ({ id: e.id, date: e.date, briefId: e.briefId })),
        }
      }

      unschedule(entryId)
      return {
        ok: true as const,
        removed: {
          id: entry.id,
          briefId: entry.briefId,
          title: readBrief(entry.briefId)?.title ?? null,
          date: entry.date,
          platform: entry.platform,
          status: entry.status,
        },
        // Said out loud, because "unschedule" is a word an agent could report
        // to a human as "deleted the brief".
        briefKept: readBrief(entry.briefId)?.status ?? null,
        remaining: readSchedule().length,
      }
    },
  })
}

/** Registered on the Calendar route, with the two globals alongside. */
/**
 * `search_briefs` is registered here as well as on the Briefs route, and that
 * duplication is the point. `schedule_brief` needs a brief id and nothing on
 * this route produced one, so an agent asked to schedule something had to
 * navigate away to look a brief up, losing the calendar's tools to get the
 * briefs' — and the two halves of one obvious task were never on the surface at
 * the same time. Registering the lookup where the id is needed is cheaper than
 * asking every agent to work that out.
 */
export function calendarRouteTools(): ToolSpec[] {
  return [
    scheduleBriefTool(),
    listScheduleTool(),
    setScheduleStatusTool(),
    unscheduleBriefTool(),
    searchBriefsTool(),
  ]
}
