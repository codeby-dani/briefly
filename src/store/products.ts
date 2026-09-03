/** User-owned products. Full CRUD arrives in Phase 3; the store lands now. */

import { PRODUCTS } from '../fixtures/products'
import type { Product } from '../types'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const productStore = createStore<Product[]>(KEYS.products, () => PRODUCTS)

export function readProducts(): Product[] {
  return productStore.read()
}

export function readProduct(productId: string): Product | undefined {
  return productStore.read().find((product) => product.id === productId)
}
