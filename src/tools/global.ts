/**
 * Tools that are on the surface everywhere, on every route.
 *
 * Two of them, and Phase 1 exit criterion 6 is that the count is exactly two on
 * every route — a third tool appearing here would mean a route guard elsewhere
 * has leaked, which is the failure this project exists to argue against.
 *
 * Neither executor takes state as an argument. They read the stores directly,
 * because an agent can call a tool between a render and its commit and a
 * closure over render-scope state would hand back a stale answer. Contracts:
 * plan/02-data-model.md § Tool Contracts.
 */

import type { ToolSpec } from '../webmcp'
import { ROUTES, isRoute } from '../types'
import type { Route } from '../types'
import { dispatch, navigate, readAppState } from '../store/router'
import { readBriefs } from '../store/briefs'
import { readSchedule } from '../store/schedule'
import { readBusinessProfile } from '../store/businessProfile'
import { readTrends } from '../store/trends'
import { activeFilters, visibleTrends } from '../store/trendView'
import { readWatchlist } from '../store/watchlist'
import { traced } from './trace'

export interface AppStateSnapshot {
  route: Route
  selectedTrendId: string | null
  selectedOfferingId: string | null
  openBriefId: string | null
  counts: { trends: number; offerings: number; briefs: number; watchlist: number }
  visibleTrendCount: number
  activeFilters: Record<string, unknown>
}

/**
 * The snapshot, built from the stores at call time.
 *
 * `visibleTrendCount` and `activeFilters` describe the Trends view, and since
 * Phase 2 they are read from the same selector the table renders from. An
 * agent that has just connected asks this first, and the answer has to be the
 * table on screen rather than a plausible reconstruction of it.
 */
export function readAppSnapshot(): AppStateSnapshot {
  const app = readAppState()
  const trends = readTrends()
  return {
    route: app.route,
    selectedTrendId: app.selectedTrendId,
    selectedOfferingId: app.selectedOfferingId,
    openBriefId: app.openBriefId,
    counts: {
      trends: trends.length,
      offerings: readBusinessProfile().offerings.length,
      briefs: readBriefs().length,
      watchlist: readWatchlist().length,
    },
    visibleTrendCount: visibleTrends().length,
    activeFilters: activeFilters(),
  }
}

export function getAppStateTool(): ToolSpec {
  return traced({
    name: 'get_app_state',
    description:
      'Call this first, before anything else, to learn what the human is currently ' +
      'looking at: which route is open, which trend and offering are selected, and how ' +
      'many records exist. Every other tool on this page is scoped to that state.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => readAppSnapshot(),
  })
}

export function navigateToTool(): ToolSpec {
  return traced({
    name: 'navigate_to',
    description:
      'Use when the tools you need are not on the surface yet, or when the human asks ' +
      'to be taken somewhere. Moves the page to one of six sections; the human sees the ' +
      'navigation happen. Calling it for the route already open is harmless.',
    inputSchema: {
      type: 'object',
      properties: {
        route: {
          type: 'string',
          enum: [...ROUTES],
          description: 'The section to open.',
        },
      },
      required: ['route'],
      additionalProperties: false,
    },
    annotations: { idempotentHint: true },
    execute: (input: { route?: unknown }) => {
      // The schema is a hint to the agent, not a guarantee about what arrives.
      if (!isRoute(input?.route)) {
        return {
          ok: false as const,
          reason: `not a route: ${JSON.stringify(input?.route ?? null)}`,
          known: [...ROUTES],
        }
      }
      return { ok: true as const, route: navigate(input.route) }
    },
  })
}

/**
 * The gap this closes: `open_trend` lets an agent pick the trend half of the
 * composer's selection, and nothing let it pick the other half. So an agent
 * asked to write a brief could navigate, filter, open a trend — and then had
 * to stop and ask the human to choose an offering from a dropdown before
 * `get_brief_context` and `save_brief` would even appear. One selection was
 * agent-drivable and its pair was not, which is the kind of asymmetry that
 * makes a tool surface look complete and behave broken.
 */
export function selectOfferingTool(): ToolSpec {
  return traced({
    name: 'select_offering',
    description:
      'Use to pick which of the business offerings a brief is for. This is the second half ' +
      'of the brief composer selection — with a trend open (see open_trend) it puts ' +
      'get_brief_context, save_brief and generate_brief on this surface. Call ' +
      'get_business_profile first to see the offerings and their ids. Pass null to clear.',
    inputSchema: {
      type: 'object',
      properties: {
        offeringId: {
          type: ['string', 'null'],
          description: 'An offering id from get_business_profile, or null to clear the selection.',
        },
      },
      required: ['offeringId'],
      additionalProperties: false,
    },
    annotations: { idempotentHint: true },
    execute: (input: { offeringId?: unknown }) => {
      const offerings = readBusinessProfile().offerings

      if (input?.offeringId === null) {
        dispatch({ type: 'selectOffering', offeringId: null })
        return { ok: true as const, offeringId: null }
      }
      if (typeof input?.offeringId !== 'string') {
        return {
          ok: false as const,
          reason: 'offeringId must be a string, or null to clear',
          known: offerings.map((o) => ({ id: o.id, name: o.name })),
        }
      }
      const offering = offerings.find((o) => o.id === input.offeringId)
      if (!offering) {
        return {
          ok: false as const,
          reason: `no such offering: ${input.offeringId}`,
          known: offerings.map((o) => ({ id: o.id, name: o.name })),
        }
      }
      dispatch({ type: 'selectOffering', offeringId: offering.id })
      return { ok: true as const, offeringId: offering.id, name: offering.name }
    },
  })
}

/**
 * The dashboard is where an agent lands, and until now landing there gave it
 * three tools, none of which say what is going on — `get_app_state` returns
 * counts, and counts do not tell you which trend is worth opening or which
 * brief is waiting on a human. So the route gets the overview the page itself
 * shows: what is climbing, what is drafted, what is scheduled next.
 *
 * One call rather than three, because the point is orientation. An agent that
 * has to make three round trips to find out where to start will guess instead.
 */
export function getOverviewTool(): ToolSpec {
  return traced({
    name: 'get_overview',
    description:
      'Call this on arrival to see the state of the workspace in one read: the fastest ' +
      'rising trends, the most recent briefs and their statuses, and what is scheduled ' +
      'next. Read-only. Use it to decide where to start; every id it returns is accepted ' +
      'by open_trend, search_briefs or schedule_brief. ' +
      'Trend volume and growth are demo data. ' +
      'After this: open_trend to dig into a trend, or navigate_to to reach the tools for ' +
      'whatever you decided to do.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => {
      const today = new Date().toISOString().slice(0, 10)
      const briefs = readBriefs()

      return {
        demo: true as const,
        topTrends: readTrends()
          .slice()
          .sort((a, b) => b.growthPct - a.growthPct)
          .slice(0, 5)
          .map((t) => ({
            id: t.id,
            keyword: t.keyword,
            platform: t.platform,
            category: t.category,
            growthPct: t.growthPct,
            volume: t.volume,
            hasClips: t.clipIds.length > 0,
            analysed: Boolean(t.aiSummary),
          })),
        recentBriefs: briefs
          .slice()
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .slice(0, 5)
          .map((b) => ({
            id: b.id,
            title: b.title,
            status: b.status,
            platform: b.platform,
            authoredBy: b.authoredBy,
            updatedAt: b.updatedAt,
          })),
        briefCounts: {
          draft: briefs.filter((b) => b.status === 'draft').length,
          approved: briefs.filter((b) => b.status === 'approved').length,
          published: briefs.filter((b) => b.status === 'published').length,
        },
        upcoming: readSchedule()
          .filter((entry) => entry.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 5)
          .map((entry) => ({
            id: entry.id,
            date: entry.date,
            briefId: entry.briefId,
            briefTitle: briefs.find((b) => b.id === entry.briefId)?.title ?? null,
            platform: entry.platform,
            pic: entry.pic,
            status: entry.status,
          })),
      }
    },
  })
}

/** Registered on the dashboard route. */
export function dashboardRouteTools(): ToolSpec[] {
  return [getOverviewTool()]
}

/** Registered unconditionally at the app root. */
export function globalTools(): ToolSpec[] {
  return [getAppStateTool(), navigateToTool(), selectOfferingTool()]
}
