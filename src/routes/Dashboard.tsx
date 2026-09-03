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
import { dispatch, navigate, useAppState } from '../store/router'
import type { Trend } from '../types'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { useToolSurface } from '../webmcp'

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
  const app = useAppState()
  const tools = useToolSurface()
  const [chartDays, setChartDays] = useState<7 | 30>(30)

  const series = analytics.followerGrowth.slice(-chartDays)
  const followersGained = analytics.followerGrowth.reduce((sum, n) => sum + n, 0)

  const top5 = [...trends].sort((a, b) => b.growthPct - a.growthPct).slice(0, 5)
  const recent = [...briefs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const selectedTrend = trends.find((trend) => trend.id === app.selectedTrendId)
  return (
    <>
      <section className="dashboard-hero" data-testid="dashboard-workspace">
        <div>
          <p className="eyebrow">Creative intelligence workspace</p>
          <h1>Turn what’s rising into your next sharp angle.</h1>
          <p className="dashboard-hero-copy">
            Trends, product context, and briefs stay in one shared room—so a great idea never
            loses its source.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <span className="dashboard-live"><span aria-hidden /> Live workspace</span>
          <button className="button button-primary" type="button" onClick={() => navigate('trends')}>
            Explore trends
          </button>
        </div>
      </section>

      <section className="workspace-pulse" data-testid="workspace-pulse" aria-label="Workspace pulse">
        <span className="pulse-icon" aria-hidden>✦</span>
        <strong>{tools.length} tools ready for the current view</strong>
        <span className="pulse-separator" aria-hidden>•</span>
        <span>{selectedTrend ? `Tracking “${selectedTrend.keyword}”` : 'Pick a trend to begin a brief'}</span>
        <span className="pulse-separator" aria-hidden>•</span>
        <span>{app.selectedOfferingId ? 'Offering context connected' : 'Add an offering when you are ready'}</span>
      </section>

      <section className="card dashboard-kpis" data-testid="kpi-cards">
        <div className="card-head">
          <div>
            <p className="eyebrow">Audience pulse</p>
            <h2>Last 30 days</h2>
          </div>
          <DemoBadge what="Every figure in this card" />
        </div>
        <div className="kpis">
          <Kpi label="Reach" value={compact(analytics.reach)} rawValue={analytics.reach} formatter={compact} note="Audience signals" icon="reach" />
          <Kpi label="Impressions" value={compact(analytics.impressions)} rawValue={analytics.impressions} formatter={compact} note="Content discovery" icon="impressions" />
          <Kpi label="Engagement rate" value={`${analytics.engagementRate}%`} rawValue={analytics.engagementRate} formatter={(v) => `${v.toFixed(1)}%`} note="Quality signal" icon="engagement" />
          <Kpi label="Followers gained" value={compact(followersGained)} rawValue={followersGained} formatter={compact} note="30-day movement" icon="followers" spark={analytics.followerGrowth.slice(-7)} />
        </div>
      </section>

      <section className="card dashboard-growth-card" data-testid="follower-chart">
        <div className="card-head">
          <div>
            <p className="eyebrow">Momentum</p>
            <h2>Follower growth</h2>
          </div>
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
        <div className="chart-foot">
          <span><i aria-hidden /> Growing audience interest</span>
          <span>Switch the window to inspect the latest momentum</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card dashboard-trends-card" data-testid="top-trends">
          <div className="card-head">
            <div>
              <p className="eyebrow">Signals to act on</p>
              <h2>Top trending</h2>
            </div>
            <DemoBadge what="Volume, growth and the spike shape" />
          </div>
          <ul className="rows" data-testid="dashboard-trend-list">
            {top5.map((trend) => (
              <TrendRow key={trend.id} trend={trend} />
            ))}
          </ul>
          <p className="muted small">
            Clip signals on the Trends page are <em>measured</em> instead — derived from the
            encoded files by a committed script.
          </p>
        </section>

        <section className="card dashboard-briefs-card" data-testid="recent-briefs">
          <div className="card-head">
            <div>
              <p className="eyebrow">Human + agent output</p>
              <h2>Recent briefs</h2>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="brief-empty">
              <span className="brief-empty-icon" aria-hidden>✦</span>
              <strong>Your first brief starts with a signal.</strong>
              <p>Choose a trend and product, then shape the idea together.</p>
              <button type="button" className="button button-primary" onClick={() => navigate('briefs')}>
                Start a brief
              </button>
            </div>
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
      </div>
    </>
  )
}

function Kpi({
  label,
  value,
  rawValue,
  formatter,
  note,
  icon,
  spark,
}: {
  label: string
  value: string
  rawValue?: number
  formatter?: (v: number) => string
  note: string
  icon: keyof typeof ICONS
  spark?: number[]
}) {
  return (
    <div className="kpi" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="kpi-topline">
        <span className="metric-icon" aria-hidden>
          <MetricIcon name={icon} />
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      <span className="kpi-value">
        {rawValue !== undefined ? (
          <AnimatedNumber value={rawValue} formatter={formatter} />
        ) : (
          value
        )}
      </span>
      <div className="kpi-foot">
        <span>{note}</span>
        {spark && <Sparkline points={spark} label={`${label}, seven-day direction`} />}
      </div>
    </div>
  )
}

const ICONS = {
  reach: 'M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  impressions: 'M4 5.5h16v13H4zM8 9.5h8M8 13h5',
  engagement: 'M12 20.5s-7-4.3-7-10.1C5 7.9 6.8 6.5 9 6.5c1.3 0 2.5.6 3 1.6.5-1 1.7-1.6 3-1.6 2.2 0 4 1.4 4 3.9 0 5.8-7 10.1-7 10.1Z',
  followers: 'M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 1.5a3 3 0 1 0 0-6M2.5 20c0-3.5 2.7-6 6-6s6 2.5 6 6m0-5.2c2.8.2 5 2.2 5 5.2',
} as const

function MetricIcon({ name }: { name: keyof typeof ICONS }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={ICONS[name]} strokeLinecap="round" strokeLinejoin="round" /></svg>
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
