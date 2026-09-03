/**
 * Performance tools.
 *
 * Performance.tsx used to carry a comment saying no tools register on this
 * route, on the grounds that the phase catalog gave Phase 5 exactly two tools
 * and put both on the Calendar. That reasoning was about not inventing work for
 * a tool to do — but there is real work here: the numbers an agent needs to
 * answer "did the brief we wrote actually land?" live on this page and nowhere
 * else, and `get_app_state` returns counts, not results. So the route gets one
 * read-only tool rather than none, and the rule it was protecting still holds:
 * one tool, because one is what there is to usefully call.
 *
 * Every figure here is invented and badged `demo data` in the UI. The tool says
 * so in its own payload — `demo: true` travels with the numbers, so an agent
 * quoting them to a human can say where they came from.
 */

import type { ToolSpec } from '../webmcp'
import { PLATFORMS, isPlatform } from '../types'
import type { AnalyticsContent } from '../types'
import { readAnalytics } from '../store/analytics'
import { readBriefs } from '../store/briefs'
import { traced } from './trace'

/** 0–23 buckets to a readable window, so an agent does not have to re-derive it. */
function peakHours(buckets: number[], take: number): string[] {
  return buckets
    .map((score, hour) => ({ score, hour }))
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map(({ hour }) => `${String(hour).padStart(2, '0')}:00`)
}

export function getPerformanceTool(): ToolSpec {
  return traced({
    name: 'get_performance',
    description:
      'Use to read how published content actually performed — reach, impressions, ' +
      'engagement rate, follower growth, the best hours to post, and a row per piece of ' +
      'content joined to the brief it came from. Read-only. Every number is demo data and ' +
      'the payload says so; do not present it to the human as measured. ' +
      'Before this: nothing — it works on any route. ' +
      'After this: open_trend or generate_brief to act on what the numbers show, or ' +
      'schedule_brief to put the next post in a slot that matches bestPostingHours.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: [...PLATFORMS],
          description: 'Only content published here. Omit for every platform.',
        },
        limit: {
          type: 'number',
          description: 'How many content rows to return, best-performing first. Defaults to 10.',
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: (input: Record<string, unknown>) => {
      const analytics = readAnalytics()
      const briefs = readBriefs()
      const platform = isPlatform(input?.platform) ? input.platform : null
      const limit =
        typeof input?.limit === 'number' && Number.isFinite(input.limit)
          ? Math.max(1, Math.min(50, Math.floor(input.limit)))
          : 10

      const rows: AnalyticsContent[] = analytics.perContent
        .filter((row) => !platform || row.platform === platform)
        .slice()
        .sort((a, b) => b.reach - a.reach)
        .slice(0, limit)

      const followersGained = analytics.followerGrowth.reduce((sum, n) => sum + n, 0)

      return {
        demo: true as const,
        note: 'Every figure below is seeded demo data, not a measurement.',
        totals: {
          reach: analytics.reach,
          impressions: analytics.impressions,
          engagementRate: analytics.engagementRate,
          followersGained,
        },
        bestPostingHours: peakHours(analytics.bestPostingHours, 3),
        contentCount: rows.length,
        content: rows.map((row) => {
          const brief = row.briefId ? briefs.find((b) => b.id === row.briefId) : undefined
          return {
            title: row.title,
            platform: row.platform,
            postedAt: row.postedAt,
            reach: row.reach,
            engagement: row.engagement,
            briefId: row.briefId,
            // A row with no brief is content published without one going
            // through this app. Saying so beats returning a dangling id.
            brief: brief ? { title: brief.title, status: brief.status } : null,
          }
        }),
      }
    },
  })
}

/** Registered on the performance route. */
export function performanceRouteTools(): ToolSpec[] {
  return [getPerformanceTool()]
}
