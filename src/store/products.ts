/** User-owned products, persisted locally and writable by people and agents. */

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

export type ProductDraft = Pick<
  Product,
  'name' | 'description' | 'usp' | 'priceIdr' | 'dos' | 'donts'
>

export type ProductPatch = Partial<ProductDraft>

function productId(): string {
  return `prd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function createProduct(draft: ProductDraft): Product {
  const product: Product = {
    id: productId(),
    ...draft,
    updatedAt: new Date().toISOString(),
  }
  productStore.set((products) => [...products, product])
  return product
}

export function updateProduct(productId: string, patch: ProductPatch): Product | undefined {
  let updated: Product | undefined
  productStore.set((products) =>
    products.map((product) => {
      if (product.id !== productId) return product
      const changed = Object.entries(patch).some(([field, value]) => {
        const current = product[field as keyof Product]
        return Array.isArray(current) && Array.isArray(value)
          ? current.length !== value.length || current.some((item, index) => item !== value[index])
          : current !== value
      })
      if (!changed) {
        updated = product
        return product
      }
      updated = { ...product, ...patch, updatedAt: new Date().toISOString() }
      return updated
    }),
  )
  return updated
}

export function deleteProduct(productId: string): boolean {
  const products = productStore.read()
  if (!products.some((product) => product.id === productId)) return false
  productStore.set(products.filter((product) => product.id !== productId))
  return true
}
