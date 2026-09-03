/** Briefly branding regression check. */

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const app = readFileSync('src/App.tsx', 'utf8')
const document = readFileSync('index.html', 'utf8')
const bridge = readFileSync('src/webmcp/bridge.ts', 'utf8')

assert.match(app, /src="\/brand\/briefly-logo\.png"/)
assert.match(app, />Briefly<\/span>/)
assert.match(app, />Briefly Studio<\/strong>/)
assert.match(document, /Briefly turns trend research/)
assert.match(document, /<title>Briefly — trends into briefs<\/title>/)
assert.match(document, /href="\/brand\/briefly-mark\.png"/)
assert.match(bridge, /app: 'Briefly'/)
assert.ok(existsSync('public/brand/briefly-logo.png'))
assert.ok(existsSync('public/brand/briefly-mark.png'))

console.log(JSON.stringify({ ok: true, brand: 'Briefly' }))
