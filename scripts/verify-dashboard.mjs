/** Dashboard regression check: the landing route exposes a live workspace pulse. */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

class MemoryStorage {
  values = new Map()

  getItem(key) {
    return this.values.get(key) ?? null
  }

  setItem(key, value) {
    this.values.set(key, value)
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage() })
Object.defineProperty(globalThis, 'location', { value: { hash: '#/dashboard' } })

const { Dashboard } = await import('../src/routes/Dashboard.tsx')
const { safeChartIndex } = await import('../src/components/chartMath.ts')
const markup = renderToStaticMarkup(createElement(Dashboard))

assert.match(markup, /data-testid="workspace-pulse"/)
assert.match(markup, /data-testid="dashboard-workspace"/)
assert.match(markup, /data-testid="dashboard-trend-list"/)
assert.match(markup, /Followers gained, illustrative demo direction/)
assert.match(markup, /Reach, illustrative demo direction/)
assert.match(markup, /data-testid="chart-grid"/)
assert.match(markup, /data-testid="chart-series-primary"/)
assert.match(markup, /data-testid="chart-series-baseline"/)
assert.match(markup, /data-testid="chart-tooltip"/)
assert.match(markup, /Follower growth/)
assert.match(markup, /Trend baseline/)
assert.equal(safeChartIndex(29, 7), 6)
assert.match(markup, /Add an offering when you are ready/)
assert.equal((markup.match(/data-testid="kpi-spark-/g) ?? []).length, 4)

const shell = readFileSync('src/App.tsx', 'utf8')
assert.match(shell, /data-testid="topbar-notifications"/)
assert.match(shell, /data-testid="topbar-profile"/)
assert.match(shell, /className="topbar-profile-avatar"/)
assert.match(shell, /data-testid="workspace-switcher"/)
assert.match(shell, /Growth Team/)
assert.match(shell, /Content Lab/)
assert.match(shell, /data-testid="sidebar-settings"/)
assert.match(shell, /data-testid="sidebar-help"/)

const css = readFileSync('src/App.css', 'utf8')
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.dashboard-grid/)
assert.match(css, /prefers-reduced-motion: reduce/)
assert.match(css, /\.topbar-profile-avatar \{[\s\S]*width: 26px/)

const tokens = readFileSync('src/index.css', 'utf8')
assert.match(tokens, /--bg: #e6eed6/)
assert.match(tokens, /--surface: #edf1dc/)
assert.match(tokens, /--surface-high: #dde2c6/)
assert.match(tokens, /--accent: #a72608/)
assert.match(tokens, /--text-h: #090c02/)

console.log(JSON.stringify({ ok: true, dashboardPulse: true, dashboardWorkspace: true, responsive: true, chart: true }))
