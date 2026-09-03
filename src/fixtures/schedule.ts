/**
 * Demo briefs and the calendar rows that place them.
 *
 * Seeded because an empty month grid shows a judge nothing: the cells, the
 * status colours, the day panel and the out-of-month jump list all only exist
 * once something is on them. Everything here is invented, same as the trend and
 * analytics fixtures, and the ids carry a `_seed_` marker so a demo row is
 * always distinguishable from one a human or an agent actually wrote.
 *
 * The dates are computed from the current month rather than hard-coded, for the
 * same reason `isoDay()` in the Calendar route is built from numbers: a fixture
 * pinned to a literal month renders an empty grid the moment the clock moves
 * past it, which is precisely the demo failure this file exists to prevent.
 * Offsets are day-of-month, so the spread survives any month length.
 */

import type { Brief, ScheduleEntry } from '../types'

const TREND = { barrier: 'tr_001', slugging: 'tr_002', spf: 'tr_003', routine: 'tr_004', retinol: 'tr_005' }
const SERUM = 'off_barrier-serum'
const SPF = 'off_daily-spf'

/** ISO day inside the month `today` is in, clamped to that month's length. */
function dayThisMonth(day: number): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const last = new Date(year, month + 1, 0).getDate()
  const clamped = Math.min(Math.max(day, 1), last)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`
}

/** Same, offset whole months. Feeds the two rows that sit outside the grid. */
function dayOtherMonth(monthDelta: number, day: number): string {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() + monthDelta, 1)
  const year = target.getFullYear()
  const month = target.getMonth()
  const last = new Date(year, month + 1, 0).getDate()
  const clamped = Math.min(Math.max(day, 1), last)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`
}

interface BriefSeed {
  n: number
  title: string
  trendId: string
  offeringId: string
  platform: Brief['platform']
  status: Brief['status']
  hook: string
  outline: string[]
  tone: string
  cta: string
  hashtags: string[]
  audience: string
  authoredBy: Brief['authoredBy']
  /** Days back from today the row was written. Keeps timestamps plausible. */
  agedDays: number
}

const BRIEF_SEEDS: BriefSeed[] = [
  {
    n: 1,
    title: 'barrier repair, but for night shift skin',
    trendId: TREND.barrier, offeringId: SERUM, platform: 'tiktok', status: 'published',
    hook: 'Your skin is not dry. It is leaking.',
    outline: [
      'Open on the 3am face — nobody sleeping, everybody stinging',
      'One line on what a barrier actually is, no diagram',
      'The serum, once, applied on damp skin',
      'Day 1 vs day 14, same lamp, same angle',
    ],
    tone: 'plain, slightly deadpan',
    cta: 'Two weeks. Tell me if the sting goes.',
    hashtags: ['#skinbarrier', '#nightshift', '#skincare'],
    audience: 'shift workers 22-34 with reactive skin',
    authoredBy: 'human', agedDays: 26,
  },
  {
    n: 2,
    title: 'slugging without waking up in a puddle',
    trendId: TREND.slugging, offeringId: SERUM, platform: 'instagram', status: 'published',
    hook: 'Slugging works. The way you were shown does not.',
    outline: [
      'The pillowcase problem, said out loud',
      'Serum first, occlusive second, and the thin layer rule',
      'Who should skip this entirely',
    ],
    tone: 'friendly corrective',
    cta: 'Save this before Sunday night.',
    hashtags: ['#slugging', '#skinbarrier', '#nightroutine'],
    audience: 'dry-skin types who tried slugging once and quit',
    authoredBy: 'agent', agedDays: 21,
  },
  {
    n: 3,
    title: 'spf indoors is not a marketing invention',
    trendId: TREND.spf, offeringId: SPF, platform: 'youtube', status: 'approved',
    hook: 'The window next to your desk is doing something to your face.',
    outline: [
      'UVA through glass, one sentence, one source on screen',
      'What eight hours by a window actually costs',
      'The reapply question, answered honestly',
    ],
    tone: 'calm, evidence-first',
    cta: 'Put it next to your keyboard, not in the bathroom.',
    hashtags: ['#spf', '#uva', '#skincarescience'],
    audience: 'desk workers who already own sunscreen and skip it',
    authoredBy: 'agent', agedDays: 14,
  },
  {
    n: 4,
    title: 'three steps, and the two you can drop',
    trendId: TREND.routine, offeringId: SERUM, platform: 'tiktok', status: 'approved',
    hook: 'Your routine has seven steps. Five are doing nothing.',
    outline: [
      'Lay all seven bottles out, then remove five on camera',
      'Cleanse, repair, protect — why that order',
      'What the money saved buys instead',
    ],
    tone: 'blunt, a little funny',
    cta: 'Which one are you keeping? Comment it.',
    hashtags: ['#skincareroutine', '#threestep', '#simplify'],
    audience: 'overwhelmed beginners 18-28',
    authoredBy: 'human', agedDays: 9,
  },
  {
    n: 5,
    title: 'the retinol sandwich, timed properly',
    trendId: TREND.retinol, offeringId: SERUM, platform: 'instagram', status: 'draft',
    hook: 'Retinol did not fail you. The order did.',
    outline: [
      'Moisturiser, retinol, moisturiser — on screen, in real time',
      'The 20-minute wait, and why it is not optional',
      'When to stop entirely',
    ],
    tone: 'careful, non-hype',
    cta: 'Start twice a week. Not more.',
    hashtags: ['#retinol', '#skinbarrier', '#skincaretips'],
    audience: 'retinol restarters with sensitised skin',
    authoredBy: 'agent', agedDays: 5,
  },
  {
    n: 6,
    title: 'the SPF that does not pill under makeup',
    trendId: TREND.spf, offeringId: SPF, platform: 'x', status: 'draft',
    hook: 'Pilling is a timing problem, not a formula problem.',
    outline: [
      'Show the pill, close up, no editing',
      'The 90-second wait that removes it',
      'One product, one pass, done',
    ],
    tone: 'quick, practical',
    cta: 'Try the wait tomorrow morning.',
    hashtags: ['#spf', '#makeup', '#pilling'],
    audience: 'daily makeup wearers who dropped sunscreen',
    authoredBy: 'human', agedDays: 2,
  },
]

function iso(agedDays: number): string {
  return new Date(Date.now() - agedDays * 86400000).toISOString()
}

export const SEED_BRIEFS: Brief[] = BRIEF_SEEDS.map((seed) => ({
  id: `brf_seed_${String(seed.n).padStart(2, '0')}`,
  title: seed.title,
  trendId: seed.trendId,
  offeringId: seed.offeringId,
  platform: seed.platform,
  status: seed.status,
  hook: seed.hook,
  outline: seed.outline,
  tone: seed.tone,
  cta: seed.cta,
  hashtags: seed.hashtags,
  audience: seed.audience,
  authoredBy: seed.authoredBy,
  createdAt: iso(seed.agedDays),
  updatedAt: iso(Math.max(0, seed.agedDays - 1)),
}))

interface EntrySeed {
  n: number
  brief: number
  date: string
  platform: ScheduleEntry['platform']
  pic: string
  status: ScheduleEntry['status']
}

/**
 * Nine rows: every status is represented, two days carry more than one chip so
 * the stacked-cell layout is exercised, and two sit in the neighbouring months
 * so `calendar-elsewhere` and its jump links are not dead code in the demo.
 */
const ENTRY_SEEDS: EntrySeed[] = [
  { n: 1, brief: 1, date: dayThisMonth(3), platform: 'tiktok', pic: 'Dita', status: 'published' },
  { n: 2, brief: 2, date: dayThisMonth(6), platform: 'instagram', pic: 'Rangga', status: 'published' },
  { n: 3, brief: 3, date: dayThisMonth(11), platform: 'youtube', pic: 'Dita', status: 'in_progress' },
  { n: 4, brief: 4, date: dayThisMonth(11), platform: 'tiktok', pic: 'Aya', status: 'planned' },
  { n: 5, brief: 5, date: dayThisMonth(17), platform: 'instagram', pic: 'Rangga', status: 'in_progress' },
  { n: 6, brief: 6, date: dayThisMonth(22), platform: 'x', pic: 'Aya', status: 'planned' },
  { n: 7, brief: 3, date: dayThisMonth(22), platform: 'tiktok', pic: 'Dita', status: 'planned' },
  { n: 8, brief: 1, date: dayOtherMonth(-1, 27), platform: 'instagram', pic: 'Dita', status: 'published' },
  { n: 9, brief: 4, date: dayOtherMonth(1, 4), platform: 'youtube', pic: 'Aya', status: 'planned' },
]

export const SEED_SCHEDULE: ScheduleEntry[] = ENTRY_SEEDS.map((seed) => ({
  id: `sch_seed_${String(seed.n).padStart(2, '0')}`,
  briefId: `brf_seed_${String(seed.brief).padStart(2, '0')}`,
  date: seed.date,
  platform: seed.platform,
  pic: seed.pic,
  status: seed.status,
}))
