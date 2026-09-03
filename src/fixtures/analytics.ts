/**
 * 30 days of account analytics. Every value is invented and the whole record
 * carries `demo: true`, so anything rendered from it must sit next to a
 * `demo data` badge.
 *
 * Shaped, not random: weekends run lower than weekdays and the posting-hour
 * curve has an evening peak, because a "best posting time" chart built on noise
 * shows a flat line and teaches a judge nothing about whether the page works.
 */

import type { Analytics, AnalyticsContent } from '../types'

/** Day 0 is 30 days before the sprint, so the series ends "today". */
const START = new Date('2026-08-05T00:00:00.000Z')

function followerGrowth(): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    const day = new Date(START.getTime() + i * 86400000).getUTCDay()
    const weekend = day === 0 || day === 6
    const base = weekend ? 34 : 71
    const drift = i * 1.6
    const wobble = 9 * Math.sin(i * 1.1)
    return Math.max(0, Math.round(base + drift + wobble))
  })
}

/** 24 buckets of relative score. Evening peak, a smaller lunchtime bump. */
function bestPostingHours(): number[] {
  return Array.from({ length: 24 }, (_, hour) => {
    const evening = 62 * Math.exp(-Math.pow(hour - 20, 2) / 8)
    const lunch = 28 * Math.exp(-Math.pow(hour - 12, 2) / 6)
    const morning = 14 * Math.exp(-Math.pow(hour - 7, 2) / 5)
    return Math.round(evening + lunch + morning)
  })
}

/**
 * `briefId` is null on every row. Briefs are user- and agent-owned and nothing
 * is seeded into that store, so a seeded analytics row cannot honestly point at
 * one. Phase 5's Performance view joins on this field when real briefs exist.
 */
const PER_CONTENT: AnalyticsContent[] = [
  { briefId: null, title: 'barrier repair, but for night shift skin', platform: 'tiktok', postedAt: '2026-08-30', reach: 148200, engagement: 12400 },
  { briefId: null, title: 'cold brew at the ratio the cafe uses', platform: 'instagram', postedAt: '2026-08-28', reach: 96700, engagement: 7100 },
  { briefId: null, title: 'the 3pm neck thing, explained in 40 seconds', platform: 'tiktok', postedAt: '2026-08-26', reach: 81400, engagement: 6800 },
  { briefId: null, title: 'nine stands, two survived', platform: 'youtube', postedAt: '2026-08-23', reach: 54300, engagement: 3900 },
  { briefId: null, title: 'you are eating half the protein you think', platform: 'youtube', postedAt: '2026-08-19', reach: 47900, engagement: 4200 },
  { briefId: null, title: 'spf indoors is not a marketing invention', platform: 'x', postedAt: '2026-08-15', reach: 22600, engagement: 1500 },
]

export const ANALYTICS: Analytics = {
  demo: true,
  reach: 512400,
  impressions: 1284900,
  engagementRate: 4.7,
  followerGrowth: followerGrowth(),
  perContent: PER_CONTENT,
  bestPostingHours: bestPostingHours(),
}
