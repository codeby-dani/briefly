/**
 * The Trends route: controls, table, and the detail drawer.
 *
 * The controls and the ten route tools write the same view state
 * (`store/trendView.ts`), which is Phase 2 exit criterion 2 in one sentence: an
 * agent filtering and a human filtering are one operation. There is no shadow
 * copy of the table for the agent to drive. Every control on this page is now
 * reachable from both sides: the watchlist star, the watchlist chip and the
 * reset are tools as well as buttons.
 *
 * Registration is split deliberately. The ten route tools go through one
 * `useTools`, and the six detail tools are six separate `useTool(open ? spec
 * : null)` calls — the shape plan/01-architecture.md gives for the lifecycle.
 * Bundling all sixteen into one call would tear down and re-register the whole
 * set every time the drawer opens, and the inspector would show sixteen tools
 * churning where the truth is six arriving. That churn is the demo's most
 * valuable shot, so it has to be honest.
 */

import { useEffect, useRef } from 'react'
import { DemoBadge } from '../components/Badge'
import { Sparkline } from '../components/Sparkline'
import { TrendThumb } from '../components/TrendThumb'
import { TrendDetail } from './TrendDetail'
import { dispatch, useAppState } from '../store/router'
import { resetPlayer, selectClip } from '../store/player'
import { readTrend, trendStore } from '../store/trends'
import {
  EMPTY_FILTERS,
  patchFilters,
  resetTrendView,
  setQuery,
  setSort,
  setWatchlistOnly,
  useTrendView,
  visibleTrends,
} from '../store/trendView'
import type { SortField } from '../store/trendView'
import { addToWatchlist, removeFromWatchlist, watchlistStore } from '../store/watchlist'
import {
  analyzeTrendTool,
  clearTrendSummaryTool,
  getTrendDetailTool,
  playClipTool,
  stopClipTool,
  trendRouteTools,
  writeTrendSummaryTool,
} from '../tools/trends'
import { CATEGORIES, PLATFORMS } from '../types'
import type { Category, Platform, Trend } from '../types'
import { useTool, useTools } from '../webmcp'

const NUM = new Intl.NumberFormat('en-US')

function growthLabel(value: number): string {
  // The sign is in the text, not only in the colour. Colour alone is not a
  // signal a colour-blind judge can read.
  return `${value > 0 ? '+' : ''}${value}%`
}

const SORT_COLUMNS: { field: SortField; label: string }[] = [
  { field: 'volume', label: 'Volume' },
  { field: 'growth', label: 'Growth' },
  { field: 'recency', label: 'First seen' },
]

export function Trends() {
  // Subscriptions, so the table re-renders when an agent moves the controls.
  const view = useTrendView()
  const { selectedTrendId } = useAppState()
  trendStore.use()
  const watchlist = watchlistStore.use()

  const rows = visibleTrends()
  const open = selectedTrendId ? readTrend(selectedTrendId) : undefined

  // Ten on the route.
  useTools(trendRouteTools())

  // Six more while a trend is open, and exactly six removed when it closes.
  const isOpen = Boolean(open)
  useTool(isOpen ? getTrendDetailTool() : null)
  useTool(isOpen ? writeTrendSummaryTool() : null)
  useTool(isOpen ? clearTrendSummaryTool() : null)
  useTool(isOpen ? playClipTool() : null)
  useTool(isOpen ? stopClipTool() : null)
  useTool(isOpen ? analyzeTrendTool() : null)

  // The player follows the drawer: opening a trend loads its first clip
  // without starting it, and closing the drawer stops holding one at all.
  const openId = open?.id ?? null
  useEffect(() => {
    if (!openId) {
      resetPlayer()
      return
    }
    const trend = readTrend(openId)
    selectClip(trend?.clipIds[0] ?? null)
  }, [openId])

  return (
    <>
      {open && <TrendDetail trend={open} />}

      <section className="card" data-testid="trend-controls">
        <div className="card-head">
          <h2>Trends</h2>
        </div>

        <div className="controls">
          <label className="field field-wide">
            <span>Search</span>
            <input
              type="search"
              value={view.query}
              placeholder="keyword, category or related term"
              data-testid="trend-search"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Platform</span>
            <select
              value={view.filters.platform ?? ''}
              data-testid="filter-platform"
              onChange={(event) =>
                patchFilters({ platform: (event.target.value || null) as Platform | null })
              }
            >
              <option value="">any</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={view.filters.category ?? ''}
              data-testid="filter-category"
              onChange={(event) =>
                patchFilters({ category: (event.target.value || null) as Category | null })
              }
            >
              <option value="">any</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>First seen from</span>
            <input
              type="date"
              value={view.filters.from ?? ''}
              data-testid="filter-from"
              onChange={(event) => patchFilters({ from: event.target.value || null })}
            />
          </label>

          <label className="field">
            <span>to</span>
            <input
              type="date"
              value={view.filters.to ?? ''}
              data-testid="filter-to"
              onChange={(event) => patchFilters({ to: event.target.value || null })}
            />
          </label>

          <label className="field">
            <span>Min growth %</span>
            <input
              type="number"
              value={view.filters.minGrowthPct ?? ''}
              placeholder="any"
              data-testid="filter-min-growth"
              onChange={(event) =>
                patchFilters({
                  minGrowthPct: event.target.value === '' ? null : Number(event.target.value),
                })
              }
            />
          </label>

          <label className="field">
            <span>Sort</span>
            <select
              value={`${view.sort.field}:${view.sort.direction}`}
              data-testid="sort-select"
              onChange={(event) => {
                const [field, direction] = event.target.value.split(':')
                setSort(field as SortField, direction === 'asc' ? 'asc' : 'desc')
              }}
            >
              <option value="growth:desc">growth, high to low</option>
              <option value="growth:asc">growth, low to high</option>
              <option value="volume:desc">volume, high to low</option>
              <option value="volume:asc">volume, low to high</option>
              <option value="recency:desc">first seen, newest</option>
              <option value="recency:asc">first seen, oldest</option>
            </select>
          </label>

          <div className="control-actions">
            <button
              type="button"
              className={`chip${view.watchlistOnly ? ' is-current' : ''}`}
              aria-pressed={view.watchlistOnly}
              data-testid="filter-watchlist"
              onClick={() => setWatchlistOnly(!view.watchlistOnly)}
            >
              ★ watchlist only ({watchlist.length})
            </button>
            <button
              type="button"
              className="chip"
              data-testid="reset-filters"
              onClick={() => resetTrendView()}
            >
              reset
            </button>
          </div>
        </div>

        <p className="muted small" data-testid="trend-count">
          Showing <strong>{rows.length}</strong> of {trendStore.read().length} trends
          {view.query.trim() ? ` matching “${view.query.trim()}”` : ''}.
          {JSON.stringify(view.filters) !== JSON.stringify(EMPTY_FILTERS) ? ' Filters active.' : ''}
        </p>
      </section>

      <section className="card" data-testid="trend-table">
        <div className="card-head">
          <h2>All trends</h2>
          {/* One badge for the card, not one per figure: a badge repeated on
              every card stops being read, and the claim is about the whole
              grid. Clip signals are badged separately, in the drawer. */}
          <DemoBadge what="Volume, growth and the 14-day spike on every card" />
        </div>

        {/* The sort control lives on the card grid rather than in a column
            header, because a grid has no columns to click. The same three
            fields and the same `sort-{field}` hooks, so `sort_trends` and the
            human still move one control. */}
        <div className="grid-sort" role="group" aria-label="Sort trends">
          <span className="grid-sort-label">Sort by</span>
          {SORT_COLUMNS.map(({ field, label }) => (
            <button
              key={field}
              type="button"
              className={`chip${view.sort.field === field ? ' is-current' : ''}`}
              data-testid={`sort-${field}`}
              aria-pressed={view.sort.field === field}
              onClick={() =>
                setSort(
                  field,
                  view.sort.field === field && view.sort.direction === 'desc' ? 'asc' : 'desc',
                )
              }
            >
              {label}
              <span aria-hidden>
                {view.sort.field === field ? (view.sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </span>
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="muted" data-testid="trend-empty">
            No trend matches these controls. Clear the search or press reset — the 24 seeded
            trends are still there.
          </p>
        ) : (
          <ul className="trend-cards">
            {rows.map((trend) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                isOpen={trend.id === selectedTrendId}
                watched={watchlist.includes(trend.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

/**
 * One trend as a card: the frame it came from, the platform it came from, and
 * then the numbers. The card is one button plus one star — the whole surface
 * opens the drawer, so the click target is the card and not a link inside it.
 */
function TrendCard({
  trend,
  isOpen,
  watched,
}: {
  trend: Trend
  isOpen: boolean
  watched: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)

  return (
    <li
      ref={ref}
      className={`trend-card${isOpen ? ' is-open' : ''}`}
      data-testid={`trend-row-${trend.id}`}
    >
      <button
        type="button"
        className="trend-open"
        aria-expanded={isOpen}
        data-testid={`open-trend-${trend.id}`}
        onClick={() =>
          dispatch({ type: 'selectTrend', trendId: isOpen ? null : trend.id })
        }
      >
        <TrendThumb
          trendId={trend.id}
          clipId={trend.clipIds[0]}
          keyword={trend.keyword}
          platform={trend.platform}
          category={trend.category}
        />

        <span className="card-body">
          <span className="card-top">
            <span className={`growth-pill${trend.growthPct < 0 ? ' is-down' : ''}`}>
              {growthLabel(trend.growthPct)}
            </span>
            <span className="muted small">{trend.category}</span>
          </span>

          <span className="row-title">{trend.keyword}</span>

          <span className="card-foot">
            <span className="td-volume">{NUM.format(trend.volume)}</span>
            <Sparkline points={trend.spike} label={`${trend.keyword}, 14-day spike`} />
          </span>

          <span className="muted small">first seen {trend.firstSeen}</span>
        </span>
      </button>

      <button
        type="button"
        className={`star${watched ? ' is-on' : ''}`}
        aria-pressed={watched}
        title={watched ? 'Remove from watchlist' : 'Save to watchlist'}
        data-testid={`watch-${trend.id}`}
        onClick={() => (watched ? removeFromWatchlist(trend.id) : addToWatchlist(trend.id))}
      >
        {watched ? '★' : '☆'}
      </button>
    </li>
  )
}
