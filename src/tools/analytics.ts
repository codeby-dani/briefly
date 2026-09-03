/**
 * Performance tools.
 *
 * Performance.tsx used to carry a comment saying no tools register on this
 * route, on the grounds that the phase catalog gave Phase 5 exactly two tools
 * and put both on the Calendar. That reasoning was about not inventing work for
 * a tool to do — but there is real work here: the numbers an agent needs to
 * answer "did the brief we wrote actually land?" live on this page and nowhere
 * else, and `get_app_state` returns counts, not results. So the route gets a
 * read-only tool rather than none, and the rule it was protecting still holds:
 * only what there is to usefully call.
 *
 * That is two now. `export_performance` is the Export button on this page, which
 * wrote a CSV no agent could ask for — a human could hand the file to someone
 * and the agent standing beside them could not.
 *
 * Every figure here is invented and badged `demo data` in the UI. The tool says
 * so in its own payload — `demo: true` travels with the numbers, so an agent
 * quoting them to a human can say where they came from.
 */

import type { ToolSpec } from '../webmcp'
import { PLATFORMS, isPlatform } from '../types'
import type { AnalyticsContent, Platform } from '../types'
import { readAnalytics } from '../store/analytics'
import { readBriefs } from '../store/briefs'
import { toCsv } from '../csv'
import { traced } from './trace'

/** The name the Export button on this route gives the file it writes. */
const CSV_FILENAME = 'briefly-performance.csv'

/**
 * Content rows, filtered and ordered the one way both tools here agree on.
 *
 * Best-performing first rather than the column the human happens to have
 * clicked: the route's sort is component state, so no executor can read it, and
 * inventing an order that claims to mirror the screen would be a claim this
 * code cannot keep.
 */
function contentRows(platform: Platform | null): AnalyticsContent[] {
  return readAnalytics()
    .perContent.filter((row) => !platform || row.platform === platform)
    .slice()
    .sort((a, b) => b.reach - a.reach)
}

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
      // A platform this executor cannot read used to be dropped, which returned
      // every platform and read as an answer — the same silent-drop bug the
      // other four filtering tools were fixed for. Refuse instead.
      if (input?.platform !== undefined && !isPlatform(input.platform)) {
        return {
          ok: false as const,
          reason: `not a platform: ${JSON.stringify(input.platform)}`,
          known: [...PLATFORMS],
        }
      }
      if (
        input?.limit !== undefined &&
        (typeof input.limit !== 'number' || !Number.isFinite(input.limit) || input.limit < 1)
      ) {
        return { ok: false as const, reason: 'limit must be a number of at least 1' }
      }

      const analytics = readAnalytics()
      const briefs = readBriefs()
      const platform = isPlatform(input?.platform) ? input.platform : null
      const limit =
        typeof input?.limit === 'number' ? Math.min(50, Math.floor(input.limit)) : 10

      const rows: AnalyticsContent[] = contentRows(platform).slice(0, limit)

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

export function exportPerformanceTool(): ToolSpec {
  return traced({
    name: 'export_performance',
    description:
      'Use when the human wants the performance table as a file or a spreadsheet — it ' +
      'returns the same CSV the Export button on this route writes, as text, so you can ' +
      'hand it over or paste it where they need it. If you want to read the numbers ' +
      'yourself, call get_performance instead: same rows, as objects. Rows come back ' +
      'best-performing first, which is not necessarily the column the human has the table ' +
      'sorted by — that sort is on-screen state no tool can read. ' +
      'Every figure is demo data and the payload says so; do not present it as measured.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: [...PLATFORMS],
          description: 'Only content published here. Omit for every platform.',
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: (input: Record<string, unknown>) => {
      if (input?.platform !== undefined && !isPlatform(input.platform)) {
        return {
          ok: false as const,
          reason: `not a platform: ${JSON.stringify(input.platform)}`,
          known: [...PLATFORMS],
        }
      }
      const platform = isPlatform(input?.platform) ? input.platform : null
      const rows = contentRows(platform)

      return {
        demo: true as const,
        note: 'Every figure below is seeded demo data, not a measurement.',
        // The same name the button gives it, so a human who has both files does
        // not end up with two differently-named copies of one table.
        filename: platform ? `briefly-performance-${platform}.csv` : CSV_FILENAME,
        rowCount: rows.length,
        // Leading BOM and CRLF line endings, from the same serialiser the
        // button uses. It is what a spreadsheet expects; it is not damage.
        csv: toCsv(rows),
      }
    },
  })
}

/** Registered on the performance route. */
export function performanceRouteTools(): ToolSpec[] {
  return [getPerformanceTool(), exportPerformanceTool()]
}
