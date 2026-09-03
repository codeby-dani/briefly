/** Deterministic Phase 3 contract checks, bundled for Node with Vite SSR. */

import assert from 'node:assert/strict'

class MemoryStorage {
  values = new Map()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key) {
    return this.values.get(key) ?? null
  }

  key(index) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key) {
    this.values.delete(key)
  }

  setItem(key, value) {
    this.values.set(key, value)
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage() })
Object.defineProperty(globalThis, 'location', { value: { hash: '#/products' } })

const { dispatch } = await import('../src/store/router.ts')
const { readProduct, readProducts } = await import('../src/store/products.ts')
const { createElement } = await import('react')
const { renderToStaticMarkup } = await import('react-dom/server')
const { Products } = await import('../src/routes/Products.tsx')
const {
  createProductTool,
  deleteProductTool,
  getProductTool,
  openProductTools,
  productRouteTools,
  updateProductTool,
} = await import('../src/tools/products.ts')

const context = { signal: new AbortController().signal }
const execute = async (tool, input) => await tool.execute(input, context)
const assertTraced = (result) => assert.match(String(result._trace), /^t_[a-z0-9]+_[a-z0-9]{4}$/)

assert.equal(2 + productRouteTools().length, 5)
assert.equal(2 + productRouteTools().length + openProductTools('prd_lumen').filter(Boolean).length, 7)

const multiline = 'First positioning line.\nSecond line stays byte-for-byte.'
const createResult = await execute(createProductTool(), {
  name: 'Phase Three Product',
  description: multiline,
  usp: ['A precise USP'],
  priceIdr: 123000,
  dos: ['Use the supported claim'],
  donts: ['Do not invent an endorsement'],
})
assert.equal(createResult.ok, true)
assertTraced(createResult)
const createdId = String(createResult.productId)
assert.equal(readProduct(createdId)?.description, multiline)
const createdMarkup = renderToStaticMarkup(createElement(Products))
assert.match(createdMarkup, new RegExp(`data-testid="product-card-${createdId}"`))

const listResult = await execute(productRouteTools()[0], {})
assert.equal(listResult.count, 5)
assert.equal(listResult.products.some(({ id }) => id === createdId), true)
assertTraced(listResult)

const getTool = getProductTool()
assert.equal(getTool.annotations?.readOnlyHint, true)
assert.equal(getTool.annotations?.untrustedContentHint, true)
const getResult = await execute(getTool, { productId: createdId })
assert.equal(getResult.description, multiline)
assertTraced(getResult)

dispatch({ type: 'selectProduct', productId: createdId })
const openMarkup = renderToStaticMarkup(createElement(Products))
assert.match(openMarkup, /data-testid="product-editor"/)
assert.match(openMarkup, /data-testid="product-usp-0"/)
assert.match(openMarkup, /data-testid="product-dos-0"/)
assert.match(openMarkup, /data-testid="product-donts-0"/)
const before = readProduct(createdId)
assert.ok(before)
const updateTool = updateProductTool(createdId)
assert.equal(updateTool.annotations?.destructiveHint, true)
assert.equal(updateTool.annotations?.idempotentHint, true)
const updateResult = await execute(updateTool, {
  productId: createdId,
  name: 'Renamed Product',
})
assert.deepEqual(updateResult.updated, ['name'])
assert.equal(readProduct(createdId)?.name, 'Renamed Product')
assert.equal(readProduct(createdId)?.description, before.description)
assert.deepEqual(readProduct(createdId)?.donts, before.donts)
assertTraced(updateResult)
const firstUpdateTimestamp = readProduct(createdId)?.updatedAt
const repeatedUpdate = await execute(updateTool, { productId: createdId, name: 'Renamed Product' })
assert.equal(readProduct(createdId)?.updatedAt, firstUpdateTimestamp)
assertTraced(repeatedUpdate)

const countBeforeRefusal = readProducts().length
const deleteTool = deleteProductTool(createdId)
assert.equal(deleteTool.annotations?.destructiveHint, true)
const refused = await execute(deleteTool, { productId: 'prd_kopi' })
assert.deepEqual({ ok: refused.ok, reason: refused.reason }, { ok: false, reason: 'product is not open' })
assert.equal(readProducts().length, countBeforeRefusal)
assert.ok(readProduct('prd_kopi'))
assertTraced(refused)

const deleted = await execute(deleteTool, { productId: createdId })
assert.equal(deleted.ok, true)
assert.equal(readProduct(createdId), undefined)
assert.equal(readProducts().length, 4)
assertTraced(deleted)

console.log(JSON.stringify({
  ok: true,
  surface: { products: 5, productOpen: 7 },
  createdWithoutReload: true,
  partialUpdatePreservedFields: true,
  updateIsIdempotent: true,
  guardedDelete: true,
  multilineRoundTrip: true,
  productEditorRendered: true,
  traceIdOnEveryCall: true,
}))
