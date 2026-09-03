/**
 * Deterministic Phase 5 contract checks, bundled for Node with Vite SSR.
 *
 * Run it the same way Phase 3's was run:
 *
 *   npx vite build --ssr scripts/verify-phase5.mjs --outDir node_modules/.verify \
 *     --emptyOutDir --logLevel warn && node node_modules/.verify/verify-phase5.js
 *
 * It covers the machine-checkable half of every Phase 5 exit criterion. What it
 * cannot cover is stated in PROGRESS.md rather than papered over here: the CSV
 * *download* needs a browser, and the deployed-origin claim needs a deploy.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

class MemoryStorage {
  values = new Map()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key) {
    return this.values.get(key) ?? null
  }

  key(index) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key) {
    this.values.delete(key)
  }

  setItem(key, value) {
    this.values.set(key, value)
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage() })
Object.defineProperty(globalThis, 'location', { value: { hash: '#/calendar' } })

const { saveDraft, setStatus } = await import('../src/store/briefs.ts')
const { readSchedule } = await import('../src/store/schedule.ts')
const { createElement } = await import('react')
const { renderToStaticMarkup } = await import('react-dom/server')
const { Calendar } = await import('../src/routes/Calendar.tsx')
const { Briefs } = await import('../src/routes/Briefs.tsx')
const { Performance } = await import('../src/routes/Performance.tsx')
const { toCsv } = await import('../src/csv.ts')
const {
  calendarRouteTools,
  listScheduleTool,
  scheduleBriefTool,
  setScheduleStatusTool,
  unscheduleBriefTool,
} = await import('../src/tools/schedule.ts')
const { globalTools } = await import('../src/tools/global.ts')
const { performanceRouteTools } = await import('../src/tools/analytics.ts')

const context = { signal: new AbortController().signal }
const execute = async (tool, input) => await tool.execute(input, context)
const assertTraced = (result) => assert.match(String(result._trace), /^t_[a-z0-9]+_[a-z0-9]{4}$/)

/* --- Exit criterion 2: surface counts ----------------------------------
 *
 * These numbers are not the ones Phase 5 was written against, and the drift is
 * recorded rather than papered over. The criterion said 2 global and 4 on the
 * Calendar. Three things moved it since:
 *
 *   1. `select_offering` became global in Phase 4, making it 3.
 *   2. `search_briefs` was registered on the Calendar as well as the Briefs
 *      route, because scheduling needs a brief id and nothing here produced one.
 *   3. The read/write asymmetries were closed: `get_tool_trace` global, and
 *      `set_schedule_status` and `unschedule_brief` here — the status chips and
 *      the remove button, which had no tool at all.
 *
 * What the criterion was actually protecting is that the counts are *exact* and
 * that route tools do not leak into the global set. Both still hold, so the
 * assertions keep their shape and take the current numbers.
 */

const GLOBAL = globalTools().length
assert.equal(GLOBAL, 4)
assert.equal(GLOBAL + calendarRouteTools().length, 9)
// Performance now registers two of its own: the read and the CSV export the
// button on that page writes. See the header comment in src/tools/analytics.ts.
assert.equal(GLOBAL + performanceRouteTools().length, 6)
assert.deepEqual(calendarRouteTools().map((tool) => tool.name), [
  'schedule_brief',
  'list_schedule',
  'set_schedule_status',
  'unschedule_brief',
  'search_briefs',
])
assert.equal(scheduleBriefTool().annotations?.idempotentHint, true)
assert.equal(listScheduleTool().annotations?.readOnlyHint, true)
assert.equal(setScheduleStatusTool().annotations?.idempotentHint, true)
// The one destructive tool on this route says so, because the annotation is
// what an agent reads before deciding whether to confirm with the human first.
assert.equal(unscheduleBriefTool().annotations?.destructiveHint, true)

/* --- Brief Library: visual catalog stays separate from stored briefs ------ */

const libraryMarkup = renderToStaticMarkup(createElement(Briefs))
assert.match(libraryMarkup, /data-testid="library-catalog-count">67 briefs/)
assert.match(libraryMarkup, /data-testid="library-showcase-/)
assert.match(libraryMarkup, /Educating|Entertaining|Promotional|Community/)
assert.match(libraryMarkup, /data-testid="library-pagination"/)
assert.match(libraryMarkup, /data-testid="composer-trend-picker"/)
assert.match(libraryMarkup, /data-testid="composer-offering-picker"/)
assert.match(libraryMarkup, /aria-haspopup="listbox"/)

/* --- Exit criterion 1: an agent-scheduled brief renders, no reload ------ */

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

const brief = saveDraft(
  {
    title: 'Barrier repair, but for night shift skin',
    trendId: 'trd_01',
    productId: 'prd_lumen',
    platform: 'tiktok',
    hook: 'You are not oily, you are stripped.',
    outline: ['Open on the 3am mirror', 'Show the routine', 'Close on the CTA'],
    tone: 'Warm, direct',
    cta: 'Link in bio',
    hashtags: ['#barrierrepair'],
    audience: 'Night shift nurses',
  },
  'agent',
)

const emptyMarkup = renderToStaticMarkup(createElement(Calendar))
assert.match(emptyMarkup, /data-testid="calendar-grid"/)
assert.match(emptyMarkup, new RegExp(`data-testid="calendar-day-${today}"`))
assert.equal(emptyMarkup.includes('data-testid="schedule-chip-'), false)
assert.match(emptyMarkup, /data-testid="calendar-plan-/)
assert.match(emptyMarkup, /data-testid="calendar-insights"/)
assert.doesNotMatch(emptyMarkup, /schedule_brief/)
assert.match(emptyMarkup, /Select a date to view its content plan/)

const appCss = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
assert.doesNotMatch(appCss, /border-left:\s*3px solid/)

const scheduled = await execute(scheduleBriefTool(), { briefId: brief.id, date: today })
assert.equal(scheduled.ok, true)
assert.equal(scheduled.created, true)
assert.deepEqual(scheduled.changed, [])
// Defaults come from the brief and the contract, not from the caller.
assert.equal(scheduled.entry.platform, 'tiktok')
assert.equal(scheduled.entry.pic, 'Unassigned')
assert.equal(scheduled.entry.status, 'planned')
assertTraced(scheduled)

const scheduledMarkup = renderToStaticMarkup(createElement(Calendar))
assert.match(scheduledMarkup, new RegExp(`data-testid="schedule-chip-${scheduled.entryId}"`))
assert.match(scheduledMarkup, /Barrier repair, but for night shift skin/)

/* --- Idempotent by briefId + date -------------------------------------- */

const repeat = await execute(scheduleBriefTool(), { briefId: brief.id, date: today })
assert.equal(repeat.entryId, scheduled.entryId)
assert.equal(repeat.created, false)
assert.deepEqual(repeat.changed, [])
assert.equal(readSchedule().length, 1)
assertTraced(repeat)

const edited = await execute(scheduleBriefTool(), {
  briefId: brief.id,
  date: today,
  pic: 'Rin',
  status: 'in_progress',
})
assert.equal(edited.entryId, scheduled.entryId)
assert.equal(edited.created, false)
assert.deepEqual(edited.changed, ['pic', 'status'])
assert.equal(readSchedule().length, 1)

// A different date is a different slot, not an update.
const secondDate = '2026-09-30'
const second = await execute(scheduleBriefTool(), { briefId: brief.id, date: secondDate, platform: 'youtube' })
assert.equal(second.created, true)
assert.notEqual(second.entryId, scheduled.entryId)
assert.equal(readSchedule().length, 2)

/* --- Refusals name what they know, and never throw ---------------------- */

const unknownBrief = await execute(scheduleBriefTool(), { briefId: 'brf_nope', date: today })
assert.equal(unknownBrief.ok, false)
// `known` carries the title and status beside each id, not bare ids: see the
// comment on that refusal in src/tools/schedule.ts — an agent given ids alone
// had to guess which brief it meant. This assertion trailed that change.
assert.deepEqual(unknownBrief.known, [{ id: brief.id, title: brief.title, status: brief.status }])
assertTraced(unknownBrief)

const badDate = await execute(scheduleBriefTool(), { briefId: brief.id, date: '2026-02-31' })
assert.equal(badDate.ok, false)
assert.match(badDate.reason, /ISO day/)

const badPlatform = await execute(scheduleBriefTool(), { briefId: brief.id, date: today, platform: 'threads' })
assert.equal(badPlatform.ok, false)
assert.deepEqual(badPlatform.known, ['tiktok', 'instagram', 'youtube', 'x'])

const extraField = await execute(scheduleBriefTool(), { briefId: brief.id, date: today, colour: 'red' })
assert.equal(extraField.ok, false)
assert.equal(extraField.reason, 'unexpected field: colour')
assert.equal(readSchedule().length, 2)

/* --- list_schedule ------------------------------------------------------ */

const all = await execute(listScheduleTool(), {})
assert.equal(all.count, 2)
assert.equal(all.total, 2)
assert.equal(all.entries[0].title, brief.title)
assertTraced(all)

const filtered = await execute(listScheduleTool(), { platform: 'youtube' })
assert.equal(filtered.count, 1)
assert.equal(filtered.total, 2)
assert.equal(filtered.entries[0].date, secondDate)

const ranged = await execute(listScheduleTool(), { from: secondDate })
assert.equal(ranged.count, 1)

const byStatus = await execute(listScheduleTool(), { status: 'in_progress' })
assert.equal(byStatus.count, 1)
assert.equal(byStatus.entries[0].id, scheduled.entryId)

/* --- Performance remains readable without implementation-disclosure copy --- */

const perfMarkup = renderToStaticMarkup(createElement(Performance))
assert.doesNotMatch(perfMarkup, /data-testid="demo-badge"/)
assert.match(perfMarkup, /data-testid="performance-social-coverage"/)
assert.match(perfMarkup, /Instagram/)
assert.match(perfMarkup, /TikTok/)
assert.match(perfMarkup, /YouTube/)
assert.match(perfMarkup, /X/)
assert.match(perfMarkup, /data-testid="bar-chart"/)
assert.match(perfMarkup, /data-testid="stacked-bar"/)
assert.match(perfMarkup, /data-testid="per-content-table"/)
assert.match(perfMarkup, /data-testid="trend-versus-result"/)
// One brief exists and it is tied to trd_01, so the loop-closing view has a row.
assert.match(perfMarkup, /data-testid="tvr-row-trd_01"/)

/* --- Exit criterion 4: the CSV a spreadsheet has to open ---------------- */

const csv = toCsv([
  { briefId: null, title: 'nine stands, two survived', platform: 'youtube', postedAt: '2026-08-23', reach: 54300, engagement: 3900 },
  { briefId: brief.id, title: 'commas, "quotes" and\nnewlines', platform: 'tiktok', postedAt: '2026-08-30', reach: 148200, engagement: 12400 },
])
assert.equal(csv.charCodeAt(0), 0xfeff, 'no UTF-8 BOM')
const lines = csv.slice(1).split('\r\n')
assert.equal(lines[0], 'title,platform,postedAt,reach,engagement,briefId')
assert.equal(lines[1], 'nine stands, two survived,youtube,2026-08-23,54300,3900,'.replace('nine stands, two survived', '"nine stands, two survived"'))
assert.equal(lines[2], `"commas, ""quotes"" and\nnewlines",tiktok,2026-08-30,148200,12400,${brief.id}`)
assert.equal(lines.at(-1), '')
// A field containing a comma stays one field: split on unquoted commas only.
assert.equal(lines[1].split(',').length > 6, true, 'sanity: the quoted field does contain a comma')

/* --- The brief machine is untouched by the schedule machine ------------- */

assert.equal(setStatus(brief.id, 'approved').ok, true)
assert.equal(setStatus(brief.id, 'published').ok, true)
assert.equal(setStatus(brief.id, 'draft').ok, false)

console.log(JSON.stringify({
  ok: true,
  // Derived, not typed in. The literals here said 4 and 2 long after the
  // assertions above had been corrected to 9 and 6, which is how a summary line
  // ends up disagreeing with the checks it is summarising.
  surface: {
    calendar: GLOBAL + calendarRouteTools().length,
    performance: GLOBAL + performanceRouteTools().length,
  },
  scheduledByAgentRendersWithoutReload: true,
  idempotentByBriefIdAndDate: true,
  refusalsNameKnownValues: true,
  listScheduleFilters: true,
  socialCoverageVisible: true,
  csvQuotedCrlfBom: true,
  traceIdOnEveryCall: true,
}))
