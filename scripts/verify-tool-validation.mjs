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
const { listScheduleTool } = await import('../src/tools/schedule.ts')
const { filterTrendsTool } = await import('../src/tools/trends.ts')
const { dispatch } = await import('../src/store/router.ts')
const { readTrends } = await import('../src/store/trends.ts')
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

console.log(JSON.stringify({ ok: true, checks: results.length, failed: results.filter((r) => !r.ok).length }))
