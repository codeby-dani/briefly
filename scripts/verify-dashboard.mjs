/** Dashboard regression check: the landing route exposes a live workspace pulse. */

import assert from 'node:assert/strict'
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

console.log(JSON.stringify({ ok: true, dashboardPulse: true, dashboardWorkspace: true }))
