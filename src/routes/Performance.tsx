/**
 * Performance — the seeded account analytics, and the loop back to trends.
 *
 * **No tools register here**, and that is a decision rather than an omission.
 * plan/01-architecture.md's catalog gives Phase 5 exactly two tools and puts
 * both on the Calendar. Inventing a third for this route would break the rule
 * the whole project argues for: a tool an agent cannot usefully call must not
 * be on the surface. So the surface on this route is 2 — the two globals — and
 * an agent that wants these numbers reads them through `get_app_state` and the
 * page the human is already looking at.
 *
 * Everything from `analytics` is invented, so every section built on it carries
 * a `demo data` badge beside its heading. The Trend-versus-result section is
 * the exception and is badged differently on purpose — see the comment there.
 */

import { useState } from 'react'
import { BarChart, StackedBar } from '../components/BarChart'
import { toCsv } from '../csv'
import { DemoBadge } from '../components/Badge'
import { LineChart } from '../components/LineChart'
import { analyticsStore } from '../store/analytics'
import { briefStore } from '../store/briefs'
import { dispatch, navigate } from '../store/router'
import { scheduleStore } from '../store/schedule'
import { trendStore } from '../store/trends'
import type { Brief, Platform, ScheduleEntry, Trend } from '../types'

const ID = new Intl.NumberFormat('en-US')

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return ID.format(value)
}

type SortField = 'title' | 'platform' | 'postedAt' | 'reach' | 'engagement'

const COLUMNS: { field: SortField; label: string; numeric?: boolean }[] = [
  { field: 'title', label: 'Content' },
  { field: 'platform', label: 'Platform' },
  { field: 'postedAt', label: 'Posted' },
  { field: 'reach', label: 'Reach', numeric: true },
  { field: 'engagement', label: 'Engagement', numeric: true },
]

export function Performance() {
  const analytics = analyticsStore.use()
  const briefs = briefStore.use()
  const trends = trendStore.use()
  const entries = scheduleStore.use()

  const [sort, setSort] = useState<{ field: SortField; dir: 'asc' | 'desc' }>({
    field: 'reach',
    dir: 'desc',
  })

  const followersGained = analytics.followerGrowth.reduce((sum, n) => sum + n, 0)
  const peakHour = analytics.bestPostingHours.indexOf(Math.max(...analytics.bestPostingHours))

  const rows = [...analytics.perContent].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    const av = a[sort.field]
    const bv = b[sort.field]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })

  const byPlatform = new Map<Platform, number>()
  analytics.perContent.forEach((row) => {
    byPlatform.set(row.platform, (byPlatform.get(row.platform) ?? 0) + row.reach)
  })
  const mix = [...byPlatform.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, value }))

  function toggleSort(field: SortField) {
    setSort((current) =>
      current.field === field
        ? { field, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: field === 'title' || field === 'platform' ? 'asc' : 'desc' },
    )
  }

  function downloadCsv() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'anglebook-performance.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Revoked on the next macrotask, not synchronously. `click()` only *starts*
    // the download; revoking the object URL in the same tick races the browser
    // fetching it, and the way that failure shows up is a zero-byte file rather
    // than an error — which is the least debuggable version of exit criterion 4
    // failing. A one-tick delay costs nothing and removes the race.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <>
      <section className="card" data-testid="performance-overview">
        <div className="card-head">
          <h2>Overview — last 30 days</h2>
          <DemoBadge what="Every figure in this card" />
        </div>
        <div className="kpis">
          <Kpi label="Reach" value={compact(analytics.reach)} />
          <Kpi label="Impressions" value={compact(analytics.impressions)} />
          <Kpi label="Engagement rate" value={`${analytics.engagementRate}%`} />
          <Kpi label="Follower growth" value={compact(followersGained)} />
        </div>
        <LineChart points={analytics.followerGrowth} label="Follower growth, last 30 days" />
      </section>

      <section className="card" data-testid="best-posting-time">
        <div className="card-head">
          <h2>Best posting time</h2>
          <DemoBadge what="The whole curve" />
          <span className="muted small" data-testid="peak-hour">
            peak at {String(peakHour).padStart(2, '0')}:00
          </span>
        </div>
        <BarChart
          values={analytics.bestPostingHours}
          label="Relative engagement by hour of day"
          formatX={(hour) => `${hour}`}
          highlight={peakHour}
        />
        <p className="muted small">
          24 hourly buckets, relative score. The y axis is deliberately unlabelled: the numbers
          behind it are invented, and axis ticks over invented data claim a precision that does
          not exist.
        </p>
      </section>

      <section className="card" data-testid="platform-mix">
        <div className="card-head">
          <h2>Platform mix</h2>
          <DemoBadge what="Every share in this bar" />
        </div>
        <StackedBar segments={mix} label="Share of reach by platform" />
        <p className="muted small">
          plan/phases/phase-5 asks for a format breakdown. There is no <code>format</code> field
          anywhere in <code>02-data-model.md</code>, so this splits by <code>platform</code> —
          the closest dimension the data model actually has — rather than inventing a field to
          justify a chart.
        </p>
      </section>

      <section className="card" data-testid="per-content">
        <div className="card-head">
          <h2>Per content</h2>
          <DemoBadge what="Reach and engagement on every row" />
          <button type="button" className="chip" data-testid="export-csv" onClick={downloadCsv}>
            Export CSV
          </button>
        </div>

        <table className="data-table" data-testid="per-content-table">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.field} className={column.numeric ? 'is-num' : undefined} scope="col">
                  <button
                    type="button"
                    className="th-sort"
                    data-testid={`sort-${column.field}`}
                    aria-sort={
                      sort.field === column.field
                        ? sort.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    onClick={() => toggleSort(column.field)}
                  >
                    {column.label}
                    {sort.field === column.field ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </button>
                </th>
              ))}
              <th scope="col">Brief</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.title}-${row.postedAt}`} data-testid={`content-row-${row.postedAt}`}>
                <td>{row.title}</td>
                <td>{row.platform}</td>
                <td>{row.postedAt}</td>
                <td className="is-num">{ID.format(row.reach)}</td>
                <td className="is-num">{ID.format(row.engagement)}</td>
                <td>
                  {row.briefId ? (
                    <button
                      type="button"
                      className="link"
                      data-testid={`content-brief-link-${row.briefId}`}
                      onClick={() => {
                        dispatch({ type: 'openBrief', briefId: row.briefId })
                        navigate('briefs')
                      }}
                    >
                      {briefs.find((b) => b.id === row.briefId)?.title ?? row.briefId}
                    </button>
                  ) : (
                    <span className="muted small">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="muted small" data-testid="per-content-note">
          Every <code>briefId</code> in the seeded rows is <code>null</code>, and it stays that
          way: these six posts predate the brief library, and the analytics store is read-only by
          contract in <code>02-data-model.md</code>. A row links back to a brief the moment one
          honestly points at one, rather than being wired up to look like it does.
        </p>
      </section>

      <TrendVersusResult briefs={briefs} trends={trends} entries={entries} />
    </>
  )
}

/**
 * Trend versus result — the loop the PRD opens, closed over real records only.
 *
 * The phase file calls this the one genuinely interesting view here, and the
 * temptation is to invent a reach number per brief so it has something to show.
 * That is refused: a number nobody observed, generated at render time, would be
 * invented data that is not even *committed* invented data — it would change on
 * every reload, and no badge makes that honest.
 *
 * So this joins only things that actually exist: briefs (written by a human or
 * an agent in this session), their trend, their status, and their schedule
 * entries. It carries no `demo data` badge because there is nothing invented in
 * it — every value is a record someone created.
 */
function TrendVersusResult({
  briefs,
  trends,
  entries,
}: {
  briefs: Brief[]
  trends: Trend[]
  entries: ScheduleEntry[]
}) {
  const byTrend = new Map<string, typeof briefs>()
  briefs.forEach((brief) => {
    const list = byTrend.get(brief.trendId) ?? []
    list.push(brief)
    byTrend.set(brief.trendId, list)
  })

  const rows = [...byTrend.entries()].map(([trendId, trendBriefs]) => {
    const briefIds = new Set(trendBriefs.map((b) => b.id))
    const scheduled = entries.filter((entry) => briefIds.has(entry.briefId))
    return {
      trend: trends.find((t) => t.id === trendId) ?? null,
      trendId,
      briefs: trendBriefs,
      published: trendBriefs.filter((b) => b.status === 'published').length,
      scheduled: scheduled.length,
      shipped: scheduled.filter((entry) => entry.status === 'published').length,
    }
  })

  return (
    <section className="card" data-testid="trend-versus-result">
      <div className="card-head">
        <h2>Trend versus result</h2>
        <span className="muted small">no badge — nothing here is invented</span>
      </div>

      {rows.length === 0 ? (
        <p className="muted" data-testid="tvr-empty">
          Nothing to show yet, and that is the honest state rather than an empty chart. This view
          joins trends to the briefs written from them and the slots those briefs occupy on the
          calendar — all three are records a human or an agent creates, and none of them are
          seeded. Write a brief on the{' '}
          <button type="button" className="link" onClick={() => navigate('briefs')}>
            Briefs
          </button>{' '}
          route and it appears here.
        </p>
      ) : (
        <ul className="rows" data-testid="tvr-list">
          {rows
            .sort((a, b) => (b.trend?.growthPct ?? 0) - (a.trend?.growthPct ?? 0))
            .map((row) => (
              <li className="row" key={row.trendId} data-testid={`tvr-row-${row.trendId}`}>
                <div className="row-main">
                  <span className="row-title">
                    <button
                      type="button"
                      className="link"
                      data-testid={`tvr-trend-link-${row.trendId}`}
                      onClick={() => {
                        dispatch({ type: 'selectTrend', trendId: row.trendId })
                        navigate('trends')
                      }}
                    >
                      {row.trend?.keyword ?? row.trendId}
                    </button>
                  </span>
                  <span className="muted small">
                    {row.briefs.length} brief{row.briefs.length === 1 ? '' : 's'} ·{' '}
                    {row.published} published · {row.scheduled} scheduled · {row.shipped} shipped
                  </span>
                </div>
                {row.trend && (
                  <span className={`growth${row.trend.growthPct < 0 ? ' is-down' : ''}`}>
                    {row.trend.growthPct > 0 ? '+' : ''}
                    {row.trend.growthPct}%
                    <DemoBadge what="Trend growth" />
                  </span>
                )}
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi" data-testid={`perf-kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  )
}
