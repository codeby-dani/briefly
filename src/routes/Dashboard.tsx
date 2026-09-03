/**
 * The landing route, and therefore the first thing a judge sees.
 *
 * Everything on it is invented — it reads from the seeded analytics record and
 * the seeded trends — so every section carries a `demo data` badge next to its
 * heading. The badge sits on the section rather than on each individual figure
 * on purpose: a badge repeated eleven times inside one card stops being read,
 * and the claim being made is about the whole card.
 */

import { useState } from 'react'
import { DemoBadge } from '../components/Badge'
import { LineChart } from '../components/LineChart'
import { Sparkline } from '../components/Sparkline'
import { analyticsStore } from '../store/analytics'
import { briefStore } from '../store/briefs'
import { trendStore } from '../store/trends'
import { dispatch, navigate } from '../store/router'
import type { Trend } from '../types'

const ID = new Intl.NumberFormat('en-US')

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return ID.format(value)
}

function growth(value: number): string {
  return `${value > 0 ? '+' : ''}${value}%`
}

export function Dashboard() {
  const analytics = analyticsStore.use()
  const trends = trendStore.use()
  const briefs = briefStore.use()
  const [chartDays, setChartDays] = useState<7 | 30>(30)

  const series = analytics.followerGrowth.slice(-chartDays)
  const followersGained = analytics.followerGrowth.reduce((sum, n) => sum + n, 0)

  const top5 = [...trends].sort((a, b) => b.growthPct - a.growthPct).slice(0, 5)
  const recent = [...briefs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)

  return (
    <>
      <section className="card" data-testid="kpi-cards">
        <div className="card-head">
          <h2>Last 30 days</h2>
          <DemoBadge what="Every figure in this card" />
        </div>
        <div className="kpis">
          <Kpi label="Reach" value={compact(analytics.reach)} />
          <Kpi label="Impressions" value={compact(analytics.impressions)} />
          <Kpi label="Engagement rate" value={`${analytics.engagementRate}%`} />
          <Kpi label="Followers gained" value={compact(followersGained)} />
        </div>
      </section>

      <section className="card" data-testid="follower-chart">
        <div className="card-head">
          <h2>Follower growth</h2>
          <DemoBadge what="This series" />
          <div className="toggle" role="group" aria-label="Chart window">
            {([7, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                className={`chip${chartDays === days ? ' is-current' : ''}`}
                aria-pressed={chartDays === days}
                onClick={() => setChartDays(days)}
                data-testid={`chart-window-${days}`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        <LineChart points={series} label={`Follower growth, last ${chartDays} days`} />
      </section>

      <section className="card" data-testid="top-trends">
        <div className="card-head">
          <h2>Top trending</h2>
          <DemoBadge what="Volume, growth and the spike shape" />
        </div>
        <ul className="rows">
          {top5.map((trend) => (
            <TrendRow key={trend.id} trend={trend} />
          ))}
        </ul>
        <p className="muted small">
          Clip signals on the Trends page are <em>measured</em> instead — derived from the
          encoded files by a committed script. The two badges make two different claims.
        </p>
      </section>

      <section className="card" data-testid="recent-briefs">
        <div className="card-head">
          <h2>Recent briefs</h2>
        </div>
        {recent.length === 0 ? (
          <p className="muted">
            No briefs yet — and none are seeded. A brief is the thing the human and the
            agent make together, so shipping pre-written ones would hide the only moment in
            this app that matters. The brief composer and <code>save_brief</code> arrive in
            Phase 4.
          </p>
        ) : (
          <ul className="rows">
            {recent.map((brief) => (
              <li className="row" key={brief.id} data-testid={`brief-card-${brief.id}`}>
                <div className="row-main">
                  <span className="row-title">{brief.title}</span>
                  <span className="muted small">
                    {brief.platform} · updated {brief.updatedAt.slice(0, 10)}
                  </span>
                </div>
                <span className={`status status-${brief.status}`} data-testid={`brief-status-${brief.id}`}>
                  {brief.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  )
}

function TrendRow({ trend }: { trend: Trend }) {
  return (
    <li className="row" data-testid={`trend-row-${trend.id}`}>
      <div className="row-main">
        <span className="row-title">{trend.keyword}</span>
        <span className="muted small">
          {trend.platform} · {trend.category} · {ID.format(trend.volume)} mentions
        </span>
      </div>

      <Sparkline points={trend.spike} label={`${trend.keyword}, 14-day spike`} />

      <span className={`growth${trend.growthPct < 0 ? ' is-down' : ''}`}>{growth(trend.growthPct)}</span>

      <button
        type="button"
        className="chip"
        data-testid={`generate-brief-${trend.id}`}
        title="Selects this trend for the brief composer. Picking a product is the other half; the composer itself lands in Phase 4."
        onClick={() => {
          dispatch({ type: 'selectTrend', trendId: trend.id })
          navigate('trends')
        }}
      >
        Generate brief
      </button>
    </li>
  )
}
