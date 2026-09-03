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
const markup = renderToStaticMarkup(createElement(Dashboard))

assert.match(markup, /data-testid="workspace-pulse"/)
assert.match(markup, /data-testid="dashboard-workspace"/)
assert.match(markup, /data-testid="dashboard-trend-list"/)
assert.match(markup, /Followers gained, seven-day direction/)
assert.doesNotMatch(markup, /Reach, seven-day direction/)

const css = readFileSync('src/App.css', 'utf8')
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.dashboard-grid/)
assert.match(css, /prefers-reduced-motion: reduce/)

console.log(JSON.stringify({ ok: true, dashboardPulse: true, dashboardWorkspace: true, responsive: true }))
