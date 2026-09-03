/** Regression check: useSyncExternalStore snapshots must be Object.is-stable. */

import assert from 'node:assert/strict'

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

const { EVENTS_KEY, readEvents } = await import('../src/tools/trace.ts')

assert.strictEqual(readEvents(), readEvents(), 'empty event snapshots must be stable')
localStorage.setItem(EVENTS_KEY, JSON.stringify([{ traceId: 't_test', tool: 'test' }]))
assert.strictEqual(readEvents(), readEvents(), 'unchanged event snapshots must be stable')

console.log(JSON.stringify({ ok: true, stableSnapshots: true }))
