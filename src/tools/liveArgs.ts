/**
 * Real arguments for the console commands in the tool surface panel.
 *
 * The panel used to build its example call from the schema alone, which meant
 * every id came out as `''`:
 *
 *     await window.__td.callTool('update_brief_status', { briefId: '', status: 'draft' })
 *
 * That line cannot be run. A viewer has to work out that `briefId` wants an id,
 * that ids are not guessable, that `search_briefs` is the tool that returns
 * them, and that `search_briefs` might be on a route they are not on — four
 * inferences before the copy button does anything. So the placeholders are
 * filled from the live stores instead, and the command pastes and runs.
 *
 * The harder half is the ids that do not exist yet. On the Calendar with an
 * empty library there is no brief to schedule, and no value this file could
 * invent would make `schedule_brief` succeed. Rather than emit a line that
 * fails, `prerequisite()` returns the calls that create the missing thing
 * first — the chain the tool descriptions describe, written out as one
 * runnable snippet. That is the whole point of the exercise: on the Calendar
 * the panel should show you how to write a brief and then schedule it, not
 * hand you a blank to fill.
 *
 * Everything here reads the stores at call time. The panel re-renders on store
 * changes (see `useLiveArgsVersion`), so the ids in a command are the ids that
 * exist while you are looking at it.
 */

import { readBriefs } from '../store/briefs'
import { readBusinessProfile } from '../store/businessProfile'
import { readAppState } from '../store/router'
import { readSchedule } from '../store/schedule'
import { readTrend, readTrends } from '../store/trends'
import { visibleTrends } from '../store/trendView'
import { getClip } from '../fixtures/clips'
import { canTransition } from '../store/briefs'
import { BRIEF_STATUSES } from '../types'
import type { Brief, BriefStatus } from '../types'

/* ----------------------------------------------------------------------- *
 * Picking the subject of an example.
 * ----------------------------------------------------------------------- */

/** What the human is looking at wins; otherwise the first row they can see. */
function exampleTrendId(): string | null {
  const open = readAppState().selectedTrendId
  if (open && readTrend(open)) return open
  return visibleTrends()[0]?.id ?? readTrends()[0]?.id ?? null
}

/** A trend that actually has a clip, for the tools that need one. */
function exampleClipId(): string | null {
  const openId = readAppState().selectedTrendId
  const open = openId ? readTrend(openId) : undefined
  const fromOpen = open?.clipIds[0]
  if (fromOpen && getClip(fromOpen)) return fromOpen
  return readTrends().find((t) => t.clipIds.length > 0)?.clipIds[0] ?? null
}

function exampleOfferingId(): string | null {
  const selected = readAppState().selectedOfferingId
  const offerings = readBusinessProfile().offerings
  if (selected && offerings.some((o) => o.id === selected)) return selected
  return offerings[0]?.id ?? null
}

/** The most recently touched brief — the one a human is most likely to mean. */
function exampleBrief(): Brief | null {
  return (
    readBriefs()
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  )
}

/**
 * The move that will succeed, and the one worth suggesting.
 *
 * Forward first: from `approved` both `published` and `draft` are legal, and
 * offering "send it back" as the example move on an approved brief suggests the
 * lifecycle runs backwards. Only if nothing forward is legal does this fall
 * back to a legal move in the other direction.
 */
function nextStatus(brief: Brief | null): BriefStatus {
  if (!brief) return 'approved'
  const at = BRIEF_STATUSES.indexOf(brief.status)
  const forward = BRIEF_STATUSES.slice(at + 1).find((to) => canTransition(brief.status, to))
  if (forward) return forward
  return BRIEF_STATUSES.find((to) => to !== brief.status && canTransition(brief.status, to)) ?? 'draft'
}

/** Day precision, a week out — far enough that the slot is plausibly free. */
function exampleDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

/* ----------------------------------------------------------------------- *
 * Field resolution.
 * ----------------------------------------------------------------------- */

/**
 * A value for one required field, or `undefined` when nothing real exists.
 *
 * `undefined` is not a failure to look — it is the signal that the tool cannot
 * be called yet, which is what `prerequisite()` answers.
 */
export function liveValue(toolName: string, field: string): unknown {
  switch (field) {
    case 'trendId':
      return exampleTrendId() ?? undefined
    case 'clipId':
      return exampleClipId() ?? undefined
    case 'offeringId':
      return exampleOfferingId() ?? undefined
    case 'briefId':
      return exampleBrief()?.id ?? undefined
    case 'entryId':
      return readSchedule()[0]?.id ?? undefined
    case 'date':
      return exampleDate()
    case 'status':
      return toolName === 'update_brief_status' ? nextStatus(exampleBrief()) : undefined
    case 'query':
    case 'keyword':
      // A query that matches nothing teaches nothing. Use a word from a row
      // the human can currently see.
      return exampleTrendId() ? (readTrend(exampleTrendId()!)?.keyword ?? '') : ''
    case 'route':
      return readAppState().route === 'briefs' ? 'calendar' : 'briefs'
    default:
      return contentValue(toolName, field)
  }
}

/**
 * Defaults for the fields that hold writing rather than ids.
 *
 * `save_brief` came out as seven empty strings, which is a form, not a command
 * — a viewer wanting to see what the tool does had to invent a brief first.
 * These are filled from the trend in front of them, so the line runs and the
 * result in the library is recognisably about the thing they were looking at.
 * They are deliberately plain: a reader should want to replace them.
 */
function contentValue(toolName: string, field: string): unknown {
  const id = exampleTrendId()
  const trend = id ? readTrend(id) : undefined
  if (!trend) return undefined

  if (toolName === 'save_brief') {
    switch (field) {
      case 'title':
        return `${trend.keyword} — first pass`
      case 'hook':
        return 'Say the thing that stops the scroll.'
      case 'outline':
        return ['open on the problem', 'show the fix', 'close on the CTA']
      case 'tone':
        return 'plain'
      case 'cta':
        return 'Save this for later.'
      case 'hashtags':
        return [`#${trend.category}`]
      case 'audience':
        return 'people already searching for this'
      default:
        return undefined
    }
  }

  if (toolName === 'write_trend_summary') {
    switch (field) {
      case 'summary':
        return `${trend.keyword} is rising because the advice people had been given stopped working for them.`
      case 'suggestedAngles':
        return ['name the mistake', 'show the correction']
      default:
        return undefined
    }
  }

  return undefined
}

/* ----------------------------------------------------------------------- *
 * Prerequisites — the chain, written out.
 * ----------------------------------------------------------------------- */

export interface Prerequisite {
  /** Why the plain command cannot run as-is. One sentence, shown above the snippet. */
  reason: string
  /** A complete, paste-able snippet that creates what is missing and then does the thing. */
  snippet: string
}

const CALL = (name: string, args?: string) =>
  `await window.__td.callTool('${name}'${args ? `, ${args}` : ''})`

/**
 * The calls that take an empty library to one saved draft, including the
 * navigation.
 *
 * The navigation steps are not padding. `open_trend` is registered by the
 * Trends route and nothing else, so a snippet shown on the Calendar that opens
 * with `open_trend` fails on its first line with `no such tool` — which is
 * exactly the confusion this whole file exists to remove. Whether the hop is
 * needed depends on where the reader is standing, so it is emitted only when
 * they are not already there.
 *
 * `whenTool` after each hop rather than a sleep: tools register on React's
 * next commit, so the call that arms one and the call that uses it cannot sit
 * in the same tick.
 */
function writeABriefSnippet(): { lines: string[]; briefVar: string } {
  const trendId = exampleTrendId() ?? 'tr_001'
  const trend = readTrend(trendId)
  const offeringId = exampleOfferingId()
  const keyword = trend?.keyword ?? 'this trend'
  const here = readAppState().route

  const lines: string[] = []
  let step = 1
  const n = () => step++

  if (here !== 'trends') {
    lines.push(
      `// ${n()}. open_trend is registered by the Trends route, so go there first`,
      CALL('navigate_to', `{ route: 'trends' }`),
      `await window.__td.whenTool('open_trend')`,
      '',
    )
  }

  lines.push(
    `// ${n()}. open a trend — this is half of the composer's selection`,
    CALL('open_trend', `{ trendId: '${trendId}' }`),
    '',
    `// ${n()}. pick what the brief sells — the other half`,
    offeringId
      ? CALL('select_offering', `{ offeringId: '${offeringId}' }`)
      : `// no offerings exist yet — add one on the Profile route first`,
    '',
    `// ${n()}. those two selections are what put save_brief on the surface, and it`,
    `//    registers on the next render — so wait for it rather than racing it`,
    `await window.__td.whenTool('save_brief')`,
    '',
    `// ${n()}. write the brief. generate_brief drafts it with the model instead,`,
    `//    but it returns a draft rather than saving, so save_brief still runs`,
    `const brief = ${CALL('save_brief', [
      `{`,
      `  title: '${keyword} — first pass',`,
      `  hook: 'Say the thing that stops the scroll.',`,
      `  outline: ['open on the problem', 'show the fix', 'close on the CTA'],`,
      `  tone: 'plain',`,
      `  cta: 'Save this for later.',`,
      `  hashtags: ['#${(trend?.category ?? 'content').replace(/\s+/g, '')}'],`,
      `  audience: 'people already searching for this',`,
      `}`,
    ].join('\n'))}`,
  )

  return { lines, briefVar: `// ${step}.` }
}

/** Come back to the route the reader is on, so the last line can actually run. */
function returnHome(toolName: string, stepLabel: string): string[] {
  const here = readAppState().route
  if (here === 'trends') return []
  return [
    '',
    `${stepLabel} back to where you were — ${toolName} is registered by this route`,
    CALL('navigate_to', `{ route: '${here}' }`),
    `await window.__td.whenTool('${toolName}')`,
  ]
}

/**
 * What to run when the plain command would fail for want of a record.
 *
 * Returns null when the command is fine as it stands — which is the common
 * case, and the reason this is checked per tool rather than assumed.
 */
export function prerequisite(toolName: string, required: string[]): Prerequisite | null {
  const needs = (field: string) => required.includes(field)

  if (needs('briefId') && !exampleBrief()) {
    const { lines, briefVar } = writeABriefSnippet()
    const step = Number(briefVar.replace(/\D/g, '')) || lines.length
    const home = returnHome(toolName, `// ${step}.`)
    const last =
      toolName === 'schedule_brief'
        ? CALL('schedule_brief', `{ briefId: brief.briefId, date: '${exampleDate()}' }`)
        : CALL(toolName, `{ briefId: brief.briefId, status: 'approved' }`)

    return {
      reason:
        'No brief exists yet, so there is no id to pass. This writes one first — including ' +
        'the hops between routes, because the tools it needs are not all on this one — then ' +
        'runs the call. Paste the whole block.',
      snippet: [
        ...lines,
        ...home,
        '',
        `// ${step + (home.length ? 1 : 0)}. now use the brief that call returned`,
        last,
      ].join('\n'),
    }
  }

  if (needs('entryId') && readSchedule().length === 0) {
    return {
      reason: 'Nothing is on the calendar yet, so there is no entry id. Schedule something first.',
      snippet: [
        `// find a brief, then put it on a day`,
        `const found = ${CALL('search_briefs', '{}')}`,
        CALL('schedule_brief', `{ briefId: found.briefs[0].id, date: '${exampleDate()}' }`),
      ].join('\n'),
    }
  }

  if (needs('clipId') && !exampleClipId()) {
    return {
      reason: 'No trend in this corpus has a clip attached, so there is nothing to play.',
      snippet: CALL('list_visible_trends', '{}'),
    }
  }

  if (needs('offeringId') && !exampleOfferingId()) {
    return {
      reason:
        'The business profile has no offerings yet, so there is no id to select. Add one on ' +
        'the Profile route, or from here.',
      snippet: [
        CALL('navigate_to', `{ route: 'products' }`),
        `// then open the editor on the page — add_business_offering registers with it`,
      ].join('\n'),
    }
  }

  return null
}

/* ----------------------------------------------------------------------- *
 * Keeping the panel's commands current.
 * ----------------------------------------------------------------------- */

import { briefStore } from '../store/briefs'
import { scheduleStore } from '../store/schedule'
import { businessProfileStore } from '../store/businessProfile'
import { trendStore } from '../store/trends'

/**
 * A command showing a brief id that was deleted two seconds ago is worse than
 * a blank, because it looks correct. So the panel subscribes to every store a
 * command can quote and re-renders when one moves.
 */
export function subscribeToLiveArgs(listener: () => void): () => void {
  const offs = [
    briefStore.subscribe(listener),
    scheduleStore.subscribe(listener),
    businessProfileStore.subscribe(listener),
    trendStore.subscribe(listener),
  ]
  return () => offs.forEach((off) => off())
}
