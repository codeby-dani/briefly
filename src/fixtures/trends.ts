/**
 * 24 seeded trends. Counts, ranges and the clip mapping come from
 * plan/02-data-model.md § Seed Data.
 *
 * Every number in here is invented and carries `demo: true`, which is what the
 * `demo data` badge reads. Nothing was scraped and nothing was observed — the
 * only measured numbers in this app live on `ClipSignals`, and they are badged
 * differently on purpose.
 *
 * `fashion` and `finance` trends carry no clips. That is a decision, not a gap:
 * the Phase 2 drawer has to render correctly for a trend with nothing to play,
 * and the only reliable way to guarantee that is to ship trends in that state.
 */

import type { Category, Platform, Sample, Trend } from '../types'

/**
 * 14 daily points, shaped rather than random.
 *
 * A trend at +680% gets a visible hockey stick and a trend at -12% drifts down,
 * because a sparkline that contradicts the growth number beside it makes the
 * whole dashboard read as noise. Deterministic: the same fixture reseeds
 * identically in a private window, which Phase 1 exit criterion 3 requires.
 */
function spike(volume: number, growthPct: number, seed: number): number[] {
  const g = growthPct / 100
  const start = volume / Math.max(1 + g, 0.35)
  const exponent = g > 2 ? 3.4 : g > 0.6 ? 2 : 1
  return Array.from({ length: 14 }, (_, i) => {
    const t = i / 13
    const value = start + (volume - start) * Math.pow(t, exponent)
    return Math.max(0, Math.round(value * (1 + 0.05 * Math.sin(i * 1.7 + seed))))
  })
}

type SampleSeed = [author: string, text: string, engagement: number, clipId?: string]

interface TrendSeed {
  id: string
  keyword: string
  volume: number
  growthPct: number
  platform: Platform
  category: Category
  firstSeen: string
  relatedKeywords: string[]
  clipIds: string[]
  samples: SampleSeed[]
}

const SEEDS: TrendSeed[] = [
  {
    id: 'tr_001', keyword: 'skin barrier repair', volume: 184200, growthPct: 680,
    platform: 'tiktok', category: 'beauty', firstSeen: '2026-08-21',
    relatedKeywords: ['moisture barrier', 'over-exfoliation', 'ceramides', 'retinol burn'],
    clipIds: ['barrier-repair-myth'],
    samples: [
      ['@dr.mira.derm', 'Stop using retinol every single night. Your barrier disagrees.', 41200, 'barrier-repair-myth'],
      ['@skinfluent', 'Three weeks of nothing but cleanser and cream fixed what six serums broke.', 18700],
    ],
  },
  {
    id: 'tr_002', keyword: 'slugging at night', volume: 96400, growthPct: 214,
    platform: 'instagram', category: 'beauty', firstSeen: '2026-08-19',
    relatedKeywords: ['occlusive', 'petrolatum', 'night routine'],
    clipIds: ['glow-serum-3am'],
    samples: [
      ['@lumen.skin', 'Serum, ninety seconds, thick cream on top to seal it. That is the whole routine.', 22400, 'glow-serum-3am'],
      ['@nightshiftskin', 'Works if you sleep at 3am too. Routine follows sleep, not the clock.', 9100],
    ],
  },
  {
    id: 'tr_003', keyword: 'spf indoors', volume: 71800, growthPct: 142,
    platform: 'tiktok', category: 'beauty', firstSeen: '2026-08-24',
    relatedKeywords: ['uva glass', 'window burn', 'daily spf'],
    clipIds: ['spf-indoors'],
    samples: [
      ['@uv.facts', 'UVA goes straight through window glass. Your desk is not shade.', 15600, 'spf-indoors'],
      ['@budgetbeauty', 'Cheapest sunscreen you will actually reapply beats the expensive one you will not.', 7300],
    ],
  },
  {
    id: 'tr_004', keyword: 'three step routine', volume: 45300, growthPct: 38,
    platform: 'youtube', category: 'beauty', firstSeen: '2026-08-11',
    relatedKeywords: ['minimal skincare', 'routine fatigue', 'shelfie'],
    clipIds: ['three-step-routine'],
    samples: [
      ['@plainface', 'Cleanser, moisturiser, sunscreen. I stopped buying the other nine.', 11800, 'three-step-routine'],
      ['@sarah.tries', 'My skin got better when my routine got shorter, which is annoying.', 5400],
    ],
  },
  {
    id: 'tr_005', keyword: 'retinol sandwich', volume: 22900, growthPct: -7,
    platform: 'x', category: 'beauty', firstSeen: '2026-07-29',
    relatedKeywords: ['buffering', 'tretinoin', 'irritation'],
    clipIds: [],
    samples: [
      ['@derm.notes', 'Moisturiser, retinol, moisturiser. Slower results, far fewer casualties.', 3100],
      ['@acidtok', 'The sandwich is not a hack, it is just a lower dose with extra steps.', 2200],
    ],
  },

  {
    id: 'tr_006', keyword: 'cold brew ratio', volume: 132700, growthPct: 301,
    platform: 'tiktok', category: 'food', firstSeen: '2026-08-22',
    relatedKeywords: ['1:8 ratio', 'steep time', 'concentrate'],
    clipIds: ['cold-brew-ratio'],
    samples: [
      ['@kopi.harian', 'I stopped buying cold brew. One jar, twelve hours, four days of coffee.', 28900, 'cold-brew-ratio'],
      ['@brewmath', 'Ratio matters more than the beans at this price point and nobody wants to hear it.', 8800],
    ],
  },
  {
    id: 'tr_007', keyword: 'grind size', volume: 58900, growthPct: 96,
    platform: 'youtube', category: 'food', firstSeen: '2026-08-14',
    relatedKeywords: ['bitter coffee', 'over-extraction', 'burr grinder'],
    clipIds: ['grind-size-fix'],
    samples: [
      ['@thirdwave.id', 'Your coffee is bitter for one reason and it is not the roast.', 13400, 'grind-size-fix'],
      ['@homebarista', 'Went one notch coarser. Fixed six months of complaining.', 6100],
    ],
  },
  {
    id: 'tr_008', keyword: 'cheap beans test', volume: 41200, growthPct: 64,
    platform: 'instagram', category: 'food', firstSeen: '2026-08-16',
    relatedKeywords: ['blind taste', 'specialty coffee', 'price per cup'],
    clipIds: ['cheap-beans-test'],
    samples: [
      ['@tasteoff', 'Six dollar bag against a twenty four dollar bag, blind, five people.', 9700, 'cheap-beans-test'],
      ['@frugalbrew', 'The expensive bag won, but not by twenty four dollars worth.', 4300],
    ],
  },
  {
    id: 'tr_009', keyword: 'matcha latte at home', volume: 88300, growthPct: 173,
    platform: 'tiktok', category: 'food', firstSeen: '2026-08-20',
    relatedKeywords: ['ceremonial grade', 'whisk', 'oat milk'],
    clipIds: [],
    samples: [
      ['@matcha.pagi', 'Cafe charges 45k for something that costs 6k to make badly and 11k to make well.', 19200],
      ['@greenwhisk', 'Sieve it. Every clumpy matcha video skips the sieve.', 5900],
    ],
  },

  {
    id: 'tr_010', keyword: 'desk neck pain', volume: 76500, growthPct: 228,
    platform: 'tiktok', category: 'fitness', firstSeen: '2026-08-23',
    relatedKeywords: ['tech neck', 'monitor height', 'upper trap'],
    clipIds: ['desk-neck-fix'],
    samples: [
      ['@fisio.rian', 'If your neck hurts by 3pm, the problem is at 9am.', 17800, 'desk-neck-fix'],
      ['@deskbound', 'Raised the monitor, kept the same chair, pain gone in four days.', 6600],
    ],
  },
  {
    id: 'tr_011', keyword: 'protein math', volume: 63100, growthPct: 118,
    platform: 'youtube', category: 'fitness', firstSeen: '2026-08-15',
    relatedKeywords: ['grams per kg', 'protein target', 'tracking'],
    clipIds: ['protein-math'],
    samples: [
      ['@coach.dinda', 'You are eating half the protein you think you are. Weigh it once and see.', 14900, 'protein-math'],
      ['@liftlogic', 'Everyone doing the maths in food weight instead of protein weight.', 5200],
    ],
  },
  {
    id: 'tr_012', keyword: 'ten minute workout', volume: 154900, growthPct: 402,
    platform: 'instagram', category: 'fitness', firstSeen: '2026-08-25',
    relatedKeywords: ['minimum effective dose', 'consistency', 'no equipment'],
    clipIds: ['ten-minute-lie'],
    samples: [
      ['@short.sets', 'Ten minute workouts do not work, unless you are honest about what they are for.', 33100, 'ten-minute-lie'],
      ['@gymskeptic', 'Ten minutes daily beats sixty minutes never, which is the only comparison that matters.', 10400],
    ],
  },
  {
    id: 'tr_013', keyword: 'zone 2 cardio', volume: 29400, growthPct: 12,
    platform: 'youtube', category: 'fitness', firstSeen: '2026-07-31',
    relatedKeywords: ['heart rate zones', 'aerobic base', 'nose breathing'],
    clipIds: [],
    samples: [
      ['@enduro.pods', 'If you can hold a conversation you are in zone 2. That is the whole test.', 4100],
      ['@runslow', 'Slow running feels like cheating for about three weeks.', 2600],
    ],
  },

  {
    id: 'tr_014', keyword: 'cable management drawer', volume: 51600, growthPct: 87,
    platform: 'tiktok', category: 'tech', firstSeen: '2026-08-17',
    relatedKeywords: ['desk setup', 'velcro ties', 'the drawer'],
    clipIds: ['cable-drawer'],
    samples: [
      ['@meja.rapi', 'Everyone has the drawer. Mine had four chargers for devices I do not own.', 12200, 'cable-drawer'],
      ['@setupdiary', 'Labelled every cable. Took twenty minutes. Should have done it in 2019.', 4800],
    ],
  },
  {
    id: 'tr_015', keyword: 'laptop stand test', volume: 37800, growthPct: 45,
    platform: 'youtube', category: 'tech', firstSeen: '2026-08-12',
    relatedKeywords: ['ergonomics', 'aluminium stand', 'wobble test'],
    clipIds: ['laptop-stand-test'],
    samples: [
      ['@ujicoba.tech', 'Nine laptop stands. Two survived the wobble test.', 8900, 'laptop-stand-test'],
      ['@wfhgear', 'Cheap stands are fine until you type on them.', 3400],
    ],
  },
  {
    id: 'tr_016', keyword: 'e-ink tablet', volume: 24100, growthPct: 23,
    platform: 'x', category: 'tech', firstSeen: '2026-08-06',
    relatedKeywords: ['paper display', 'note taking', 'distraction free'],
    clipIds: [],
    samples: [
      ['@slowtech', 'Bought it to read more. Read more. Reported honestly, this surprised me.', 3900],
      ['@inkfans', 'Refresh rate is the whole argument and nobody demos it properly.', 1800],
    ],
  },
  {
    id: 'tr_017', keyword: 'usb-c everything', volume: 19800, growthPct: -12,
    platform: 'x', category: 'tech', firstSeen: '2026-07-24',
    relatedKeywords: ['one cable', 'charging standard', 'dongle life'],
    clipIds: [],
    samples: [
      ['@portwatch', 'One port, six incompatible behaviours behind it.', 2900],
      ['@cablehell', 'The standard arrived and the drawer stayed full.', 1500],
    ],
  },

  {
    id: 'tr_018', keyword: 'quiet luxury', volume: 112300, growthPct: 156,
    platform: 'instagram', category: 'fashion', firstSeen: '2026-08-18',
    relatedKeywords: ['stealth wealth', 'logo-free', 'tailoring'],
    clipIds: [],
    samples: [
      ['@modest.mode', 'Quiet luxury got loud about eight months ago.', 21400],
      ['@rakstyle', 'It is just beige with a good fit and a bad price.', 7600],
    ],
  },
  {
    id: 'tr_019', keyword: 'thrift flip', volume: 67400, growthPct: 71,
    platform: 'tiktok', category: 'fashion', firstSeen: '2026-08-13',
    relatedKeywords: ['upcycling', 'sewing machine', 'second hand'],
    clipIds: [],
    samples: [
      ['@jahit.sendiri', 'Two thousand rupiah shirt, one hour, one seam. Wearable.', 15100],
      ['@thriftpile', 'The flip everyone skips is washing it properly first.', 5700],
    ],
  },
  {
    id: 'tr_020', keyword: 'capsule wardrobe', volume: 33500, growthPct: 29,
    platform: 'youtube', category: 'fashion', firstSeen: '2026-08-04',
    relatedKeywords: ['33 pieces', 'decision fatigue', 'uniform dressing'],
    clipIds: [],
    samples: [
      ['@lessrack', 'Counted my clothes. Wore eleven things in six weeks.', 6300],
      ['@uniformfit', 'A capsule is a uniform you are embarrassed to call a uniform.', 2700],
    ],
  },
  {
    id: 'tr_021', keyword: 'cargo pants revival', volume: 26700, growthPct: -5,
    platform: 'instagram', category: 'fashion', firstSeen: '2026-07-27',
    relatedKeywords: ['y2k', 'utility wear', 'pocket count'],
    clipIds: [],
    samples: [
      ['@arsip.mode', 'The revival peaked in March and the racks did not get the message.', 4400],
      ['@pocketcount', 'Eleven pockets, none of them fit a phone.', 2100],
    ],
  },

  {
    id: 'tr_022', keyword: 'emergency fund challenge', volume: 58200, growthPct: 134,
    platform: 'tiktok', category: 'finance', firstSeen: '2026-08-21',
    relatedKeywords: ['three months expenses', 'sinking fund', 'auto transfer'],
    clipIds: [],
    samples: [
      ['@duit.rapi', 'Automate it on payday or it does not happen. That is the whole method.', 13800],
      ['@savefirst', 'Three months of expenses, not three months of income. People mix these up.', 5100],
    ],
  },
  {
    id: 'tr_023', keyword: 'no spend january', volume: 44900, growthPct: 58,
    platform: 'instagram', category: 'finance', firstSeen: '2026-08-09',
    relatedKeywords: ['spending fast', 'budget reset', 'accountability'],
    clipIds: [],
    samples: [
      ['@anggaran', 'A no spend month works because it is short, not because it is virtuous.', 9200],
      ['@ledgerlife', 'February always eats the savings. Nobody posts that part.', 3600],
    ],
  },
  {
    id: 'tr_024', keyword: 'index fund basics', volume: 31100, growthPct: 19,
    platform: 'youtube', category: 'finance', firstSeen: '2026-08-02',
    relatedKeywords: ['expense ratio', 'dollar cost averaging', 'diversification'],
    clipIds: [],
    samples: [
      ['@pelan.pelan', 'Expense ratio is the only number in the brochure that is guaranteed.', 5800],
      ['@boringmoney', 'The strategy is boring and that is the feature.', 2400],
    ],
  },
]

export const TRENDS: Trend[] = SEEDS.map((seed, index) => ({
  id: seed.id,
  keyword: seed.keyword,
  volume: seed.volume,
  growthPct: seed.growthPct,
  platform: seed.platform,
  category: seed.category,
  firstSeen: seed.firstSeen,
  spike: spike(seed.volume, seed.growthPct, index),
  relatedKeywords: seed.relatedKeywords,
  samples: seed.samples.map<Sample>(([author, text, engagement, clipId]) => ({
    author,
    text,
    engagement,
    ...(clipId ? { clipId } : {}),
  })),
  clipIds: seed.clipIds,
  // Nothing has written an analysis yet. Phase 2's `write_trend_summary` and
  // `analyze_trend` are what fill these, and the empty state is deliberate:
  // a judge should see the field arrive, not find it pre-filled.
  aiSummary: null,
  aiSummarySource: null,
  suggestedAngles: [],
  demo: true,
}))
