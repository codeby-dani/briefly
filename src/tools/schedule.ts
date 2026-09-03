/**
 * Calendar tools. Two of them, registered on the Calendar route only, which is
 * what makes Phase 5 exit criterion 2 checkable: the surface is exactly 4 there
 * — these two plus the two globals — and 2 on Performance, which has no tools
 * of its own.
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
import { readSchedule, scheduleBrief } from '../store/schedule'
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

/** Registered on the Calendar route. Surface there is these two plus the two globals. */
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
  return [scheduleBriefTool(), listScheduleTool(), searchBriefsTool()]
}
