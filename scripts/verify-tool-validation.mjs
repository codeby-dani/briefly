/**
 * Input-validation contract checks for the agent tool surface.
 *
 * Bundled for Node with Vite SSR, the same way the other verify scripts are:
 *
 *   npx vite build --ssr scripts/verify-tool-validation.mjs \
 *     --outDir node_modules/.verify --emptyOutDir --logLevel warn \
 *     && node node_modules/.verify/verify-tool-validation.js
 *
 * It covers the four cases an external pass through the bridge found accepting
 * garbage: save_brief with fields missing, filter_trends with an impossible
 * date, and list_schedule / search_briefs with a status no store can mean. A
 * filter the executor cannot understand used to be dropped silently, which
 * returned the whole table and read as a successful answer.
 *
 * The second half covers the tools added to close the read/write asymmetries —
 * the watchlist, the calendar's status and remove controls, the CSV export, the
 * summary clear, the player stop, and the trace log. Those are checked here for
 * the same reason: each one is a control the human already had, so the failure
 * to guard against is not "it does not work" but "it accepted something the
 * button could never have produced".
 */

import assert from 'node:assert/strict'

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
Object.defineProperty(globalThis, 'location', { value: { hash: '#/trends' } })

const { saveBriefTool, searchBriefsTool } = await import('../src/tools/briefs.ts')
const {
  listScheduleTool,
  scheduleBriefTool,
  setScheduleStatusTool,
  unscheduleBriefTool,
} = await import('../src/tools/schedule.ts')
const {
  clearTrendSummaryTool,
  filterTrendsTool,
  listWatchlistTool,
  removeFromWatchlistTool,
  resetTrendViewTool,
  saveToWatchlistTool,
  setWatchlistOnlyTool,
  stopClipTool,
  writeTrendSummaryTool,
} = await import('../src/tools/trends.ts')
const { exportPerformanceTool, getPerformanceTool } = await import('../src/tools/analytics.ts')
const { getToolTraceTool } = await import('../src/tools/observability.ts')
const { dispatch } = await import('../src/store/router.ts')
const { readTrends } = await import('../src/store/trends.ts')
const { addToWatchlist, readWatchlist } = await import('../src/store/watchlist.ts')
const { readBusinessProfile } = await import('../src/store/businessProfile.ts')

const context = { signal: new AbortController().signal }
const run = async (tool, input) => await tool.execute(input, context)

const results = []
const check = (name, condition, detail) => {
  results.push({ name, ok: Boolean(condition), detail })
  assert.ok(condition, `${name}: ${detail ?? 'failed'}`)
}

/* --- save_brief: a required field left out is a refusal, not a blank brief -- */

const trend = readTrends()[0]
const offering = readBusinessProfile().offerings[0]
assert.ok(trend && offering, 'fixtures must supply a trend and an offering')
dispatch({ type: 'selectTrend', trendId: trend.id })
dispatch({ type: 'selectOffering', offeringId: offering.id })

const saveBrief = saveBriefTool()
const complete = {
  title: 'Title',
  hook: 'Hook',
  outline: ['One', 'Two'],
  tone: 'Direct',
  cta: 'Follow',
  hashtags: ['#a'],
  audience: 'Owners',
}

for (const field of Object.keys(complete)) {
  const input = { ...complete }
  delete input[field]
  const out = await run(saveBrief, input)
  check(
    `save_brief rejects missing ${field}`,
    out?.ok === false && String(out.reason).includes(field),
    JSON.stringify(out),
  )
}

const blank = await run(saveBrief, { ...complete, hook: '   ' })
check('save_brief rejects whitespace-only hook', blank?.ok === false, JSON.stringify(blank))

const emptyOutline = await run(saveBrief, { ...complete, outline: [] })
check('save_brief rejects empty outline', emptyOutline?.ok === false, JSON.stringify(emptyOutline))

const badPlatform = await run(saveBrief, { ...complete, platform: 'myspace' })
check('save_brief rejects unknown platform', badPlatform?.ok === false, JSON.stringify(badPlatform))

const saved = await run(saveBrief, complete)
check('save_brief accepts a complete brief', saved?.ok === true && saved.status === 'draft', JSON.stringify(saved))

/* --- filter_trends: an impossible date is refused, not coerced ------------- */

const filterTrends = filterTrendsTool()

const notADay = await run(filterTrends, { from: '2026-02-31' })
check('filter_trends rejects 2026-02-31', notADay?.ok === false, JSON.stringify(notADay))

const month13 = await run(filterTrends, { from: '2026-13-01' })
check('filter_trends rejects month 13', month13?.ok === false, JSON.stringify(month13))

const inverted = await run(filterTrends, { from: '2026-08-31', to: '2026-08-01' })
check('filter_trends rejects an inverted range', inverted?.ok === false, JSON.stringify(inverted))

const goodRange = await run(filterTrends, { from: '2026-08-01', to: '2026-08-31' })
check('filter_trends accepts a real range', typeof goodRange?.count === 'number', JSON.stringify(goodRange))
await run(filterTrends, {})

/* --- list_schedule: an unknown status is refused, not dropped -------------- */

const listSchedule = listScheduleTool()

const badScheduleStatus = await run(listSchedule, { status: 'postd' })
check('list_schedule rejects an unknown status', badScheduleStatus?.ok === false, JSON.stringify(badScheduleStatus))

const badSchedulePlatform = await run(listSchedule, { platform: 'myspace' })
check('list_schedule rejects an unknown platform', badSchedulePlatform?.ok === false, JSON.stringify(badSchedulePlatform))

const badScheduleDay = await run(listSchedule, { from: '2026-02-31' })
check('list_schedule rejects an impossible day', badScheduleDay?.ok === false, JSON.stringify(badScheduleDay))

const invertedSchedule = await run(listSchedule, { from: '2026-09-02', to: '2026-09-01' })
check('list_schedule rejects an inverted range', invertedSchedule?.ok === false, JSON.stringify(invertedSchedule))

const scheduleOk = await run(listSchedule, {})
check('list_schedule answers an empty filter', scheduleOk?.ok !== false, JSON.stringify(scheduleOk))

/* --- search_briefs: same rule, same shape --------------------------------- */

const searchBriefs = searchBriefsTool()

const badBriefStatus = await run(searchBriefs, { status: 'aproved' })
check('search_briefs rejects an unknown status', badBriefStatus?.ok === false, JSON.stringify(badBriefStatus))

const badBriefPlatform = await run(searchBriefs, { platform: 'myspace' })
check('search_briefs rejects an unknown platform', badBriefPlatform?.ok === false, JSON.stringify(badBriefPlatform))

const badBriefDay = await run(searchBriefs, { to: '2026-02-31' })
check('search_briefs rejects an impossible day', badBriefDay?.ok === false, JSON.stringify(badBriefDay))

const invertedBriefs = await run(searchBriefs, { from: '2026-09-02', to: '2026-09-01' })
check('search_briefs rejects an inverted range', invertedBriefs?.ok === false, JSON.stringify(invertedBriefs))

const searchOk = await run(searchBriefs, { status: 'draft' })
check('search_briefs answers a real status', searchOk?.ok !== false, JSON.stringify(searchOk))

/* --- the watchlist: what goes on has to come off ---------------------------- */

const saveToWatchlist = saveToWatchlistTool()
const removeFromWatchlistT = removeFromWatchlistTool()
const listWatchlist = listWatchlistTool()

const notAnId = await run(removeFromWatchlistT, { trendId: 42 })
check('remove_from_watchlist rejects a non-string id', notAnId?.ok === false, JSON.stringify(notAnId))

await run(saveToWatchlist, { trendId: trend.id })
const removed = await run(removeFromWatchlistT, { trendId: trend.id })
check(
  'remove_from_watchlist takes a saved trend off',
  removed?.ok === true && removed.wasPresent === true && !readWatchlist().includes(trend.id),
  JSON.stringify(removed),
)

const removedAgain = await run(removeFromWatchlistT, { trendId: trend.id })
check(
  'remove_from_watchlist is idempotent',
  removedAgain?.ok === true && removedAgain.wasPresent === false,
  JSON.stringify(removedAgain),
)

// An id the corpus no longer knows. It cannot be created through the tool —
// save_to_watchlist refuses one — but it is exactly what a persisted list looks
// like after a schema bump reseeds the trends, and it has to be removable.
addToWatchlist('tr_gone')
await run(saveToWatchlist, { trendId: trend.id })
const listed = await run(listWatchlist, {})
check(
  'list_watchlist separates resolved rows from dangling ids',
  listed?.count === 2 &&
    listed.trends.length === 1 &&
    listed.trends[0].id === trend.id &&
    listed.unresolved.length === 1 &&
    listed.unresolved[0] === 'tr_gone',
  JSON.stringify(listed),
)

const clearedStale = await run(removeFromWatchlistT, { trendId: 'tr_gone' })
check(
  'remove_from_watchlist clears an id whose trend is gone',
  clearedStale?.ok === true && clearedStale.wasPresent === true,
  JSON.stringify(clearedStale),
)

/* --- the watchlist chip and the reset: the two controls filter_trends lacks - */

const setWatchlistOnly = setWatchlistOnlyTool()
const resetTrendView = resetTrendViewTool()

const notABoolean = await run(setWatchlistOnly, { watchlistOnly: 'yes' })
check('set_watchlist_only rejects a non-boolean', notABoolean?.ok === false, JSON.stringify(notABoolean))

const narrowed = await run(setWatchlistOnly, { watchlistOnly: true })
check(
  'set_watchlist_only narrows the table to the watchlist',
  narrowed?.ok === true && narrowed.count === 1 && narrowed.activeFilters.watchlistOnly === true,
  JSON.stringify(narrowed),
)

// The documented seam: filter_trends owns five fields and this chip is not one
// of them, so an empty filter call must leave the table narrowed.
const clearedFilters = await run(filterTrends, {})
check(
  'filter_trends({}) does not clear the watchlist chip',
  clearedFilters?.activeFilters?.watchlistOnly === true && clearedFilters.count === 1,
  JSON.stringify(clearedFilters),
)

const reset = await run(resetTrendView, {})
check(
  'reset_trend_view clears the chip filter_trends cannot',
  reset?.ok === true &&
    reset.count === readTrends().length &&
    reset.activeFilters.watchlistOnly === undefined,
  JSON.stringify(reset),
)

/* --- the open trend: a summary that can be written can be taken back ------- */

const writeTrendSummary = writeTrendSummaryTool()
const clearTrendSummary = clearTrendSummaryTool()
const stopClip = stopClipTool()

const nothingToClear = await run(clearTrendSummary, {})
check(
  'clear_trend_summary refuses when nothing is written',
  nothingToClear?.ok === false && String(nothingToClear.reason).includes('nothing is written'),
  JSON.stringify(nothingToClear),
)

await run(writeTrendSummary, { summary: 'Rising because the old advice stopped working.', suggestedAngles: ['one'] })
const cleared = await run(clearTrendSummary, {})
check(
  'clear_trend_summary reports what it removed',
  cleared?.ok === true && cleared.cleared.source === 'agent' && cleared.cleared.angles === 1,
  JSON.stringify(cleared),
)

const wrongTrend = await run(clearTrendSummary, { trendId: readTrends()[1].id })
check(
  'clear_trend_summary refuses a trend that is not the one open',
  wrongTrend?.ok === false,
  JSON.stringify(wrongTrend),
)

const stopped = await run(stopClip, {})
check('stop_clip is safe with nothing playing', stopped?.ok === true && stopped.wasLoaded === false, JSON.stringify(stopped))

/* --- the calendar: an entry that can be made can be moved and removed ------ */

const scheduleBrief = scheduleBriefTool()
const setScheduleStatusT = setScheduleStatusTool()
const unscheduleBrief = unscheduleBriefTool()

const entry = await run(scheduleBrief, { briefId: saved.briefId, date: '2026-09-20' })
assert.ok(entry?.ok === true, `schedule_brief must succeed to test the rest: ${JSON.stringify(entry)}`)

const badMove = await run(setScheduleStatusT, { entryId: entry.entryId, status: 'postd' })
check('set_schedule_status rejects an unknown status', badMove?.ok === false, JSON.stringify(badMove))

const unknownEntry = await run(setScheduleStatusT, { entryId: 'sc_nope', status: 'published' })
check('set_schedule_status refuses an unknown entry', unknownEntry?.ok === false, JSON.stringify(unknownEntry))

const moved = await run(setScheduleStatusT, { entryId: entry.entryId, status: 'in_progress' })
check(
  'set_schedule_status reports the move, not just the value',
  moved?.ok === true && moved.from === 'planned' && moved.to === 'in_progress' && moved.changed === true,
  JSON.stringify(moved),
)

// Free movement in both directions, which is the whole difference from the
// brief machine and the reason this is a separate tool.
const movedBack = await run(setScheduleStatusT, { entryId: entry.entryId, status: 'planned' })
check('set_schedule_status moves backwards too', movedBack?.ok === true && movedBack.to === 'planned', JSON.stringify(movedBack))

const unknownRemoval = await run(unscheduleBrief, { entryId: 'sc_nope' })
check(
  'unschedule_brief refuses an id it never found',
  unknownRemoval?.ok === false && Array.isArray(unknownRemoval.known),
  JSON.stringify(unknownRemoval),
)

const dropped = await run(unscheduleBrief, { entryId: entry.entryId })
check(
  'unschedule_brief removes the slot and keeps the brief',
  dropped?.ok === true && dropped.briefKept === 'draft' && dropped.remaining === 0,
  JSON.stringify(dropped),
)

/* --- performance: the export, and the filter that used to be dropped ------- */

const getPerformance = getPerformanceTool()
const exportPerformance = exportPerformanceTool()

const droppedFilter = await run(getPerformance, { platform: 'myspace' })
check(
  'get_performance refuses an unknown platform instead of ignoring it',
  droppedFilter?.ok === false,
  JSON.stringify(droppedFilter),
)

const badExport = await run(exportPerformance, { platform: 'myspace' })
check('export_performance refuses an unknown platform', badExport?.ok === false, JSON.stringify(badExport))

const csvOut = await run(exportPerformance, {})
const csvLines = String(csvOut.csv).trimEnd().split('\r\n')
check(
  'export_performance returns one header plus one line per row',
  csvLines.length === csvOut.rowCount + 1 && csvLines[0].startsWith('\ufefftitle,'),
  JSON.stringify({ rowCount: csvOut.rowCount, lines: csvLines.length, head: csvLines[0] }),
)

/* --- the trace log, pointed back at the caller ----------------------------- */

const getToolTrace = getToolTraceTool()

const badField = await run(getToolTrace, { limit: 5, nope: true })
check('get_tool_trace rejects an unexpected field', badField?.ok === false, JSON.stringify(badField))

const byId = await run(getToolTrace, { traceId: saved._trace })
check(
  'get_tool_trace resolves the _trace id a result handed back',
  byId?.events?.length === 1 && byId.events[0].tool === 'save_brief',
  JSON.stringify(byId?.events?.[0] ?? byId),
)

const missingId = await run(getToolTrace, { traceId: 't_nope' })
check('get_tool_trace refuses an id it has no event for', missingId?.ok === false, JSON.stringify(missingId))

const failuresOnly = await run(getToolTrace, { onlyFailures: true, limit: 200 })
check(
  'get_tool_trace filters to the calls that refused',
  failuresOnly?.events?.length > 0 && failuresOnly.events.every((event) => event.ok === false),
  JSON.stringify({ returned: failuresOnly?.returned, matched: failuresOnly?.matched }),
)

console.log(JSON.stringify({ ok: true, checks: results.length, failed: results.filter((r) => !r.ok).length }))
