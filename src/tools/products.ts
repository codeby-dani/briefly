/** Product Knowledge tools. Contracts: plan/02-data-model.md § Tool Contracts. */

import type { Product } from '../types'
import { dispatch, readAppState } from '../store/router'
import {
  createProduct,
  deleteProduct,
  readProduct,
  readProducts,
  updateProduct,
} from '../store/products'
import type { ProductDraft, ProductPatch } from '../store/products'
import type { ToolSpec } from '../webmcp'
import { traced } from './trace'

const EDITABLE_FIELDS = ['name', 'description', 'usp', 'priceIdr', 'dos', 'donts'] as const
type EditableField = (typeof EDITABLE_FIELDS)[number]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function unexpectedField(input: Record<string, unknown>, allowed: readonly string[]): string | null {
  const field = Object.keys(input).find((key) => !allowed.includes(key))
  return field ? `unexpected field: ${field}` : null
}

function validateField(field: EditableField, value: unknown): string | null {
  if (field === 'priceIdr') {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? null
      : 'priceIdr must be a non-negative number'
  }
  if (field === 'usp' || field === 'dos' || field === 'donts') {
    return isStringArray(value) ? null : `${field} must be an array of strings`
  }
  return typeof value === 'string' ? null : `${field} must be a string`
}

function parseDraft(input: unknown): ProductDraft | { reason: string } {
  if (!isRecord(input)) return { reason: 'input must be an object' }
  const unexpected = unexpectedField(input, EDITABLE_FIELDS)
  if (unexpected) return { reason: unexpected }
  for (const field of EDITABLE_FIELDS) {
    if (!(field in input)) return { reason: `${field} is required` }
    const reason = validateField(field, input[field])
    if (reason) return { reason }
  }
  return {
    name: input.name as string,
    description: input.description as string,
    usp: input.usp as string[],
    priceIdr: input.priceIdr as number,
    dos: input.dos as string[],
    donts: input.donts as string[],
  }
}

function positioning(description: string): string {
  const firstLine = description.split(/\r?\n/, 1)[0].trim()
  const firstSentence = firstLine.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim()
  return firstSentence || firstLine
}

const productProperties = {
  name: { type: 'string', description: 'Product name.' },
  description: { type: 'string', description: 'Positioning and product context; newlines are preserved.' },
  usp: { type: 'array', items: { type: 'string' }, description: 'Unique selling points.' },
  priceIdr: { type: 'number', minimum: 0, description: 'Price in Indonesian rupiah.' },
  dos: { type: 'array', items: { type: 'string' }, description: 'Claims and approaches the brand allows.' },
  donts: { type: 'array', items: { type: 'string' }, description: 'Claims and approaches the brand forbids.' },
} as const

export function listProductsTool(): ToolSpec {
  return traced({
    name: 'list_products',
    description:
      'Use on the Product Knowledge route before choosing a product for a brief or opening one to edit. ' +
      'Returns each available product id, name, and one-line positioning without changing the current selection.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input) || Object.keys(input).length > 0) {
        return { ok: false as const, reason: 'input must be an empty object' }
      }
      const products = readProducts()
      return {
        count: products.length,
        products: products.map(({ id, name, description }) => ({
          id,
          name,
          positioning: positioning(description),
        })),
      }
    },
  })
}

export function getProductTool(): ToolSpec {
  return traced({
    name: 'get_product',
    description:
      'Use after list_products when you need the complete brand context for one product before writing a brief or proposing edits. ' +
      'Returns its full record, including the allowed and forbidden claims, without changing it.',
    inputSchema: {
      type: 'object',
      properties: { productId: { type: 'string', description: 'Exact product id from list_products.' } },
      required: ['productId'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input) || typeof input.productId !== 'string') {
        return { ok: false as const, reason: 'productId must be a string' }
      }
      const unexpected = unexpectedField(input, ['productId'])
      if (unexpected) return { ok: false as const, reason: unexpected }
      const product = readProduct(input.productId)
      return product ?? { ok: false as const, reason: 'product not found' }
    },
  })
}

export function createProductTool(): ToolSpec {
  return traced({
    name: 'create_product',
    description:
      'Use on the Product Knowledge route when the human wants a new reusable product record in the shared workspace. ' +
      'Creates the record, returns its new id for later use, and does not register any additional tools.',
    inputSchema: {
      type: 'object',
      properties: productProperties,
      required: [...EDITABLE_FIELDS],
      additionalProperties: false,
    },
    execute: (input: unknown) => {
      const parsed = parseDraft(input)
      if ('reason' in parsed) return { ok: false as const, reason: parsed.reason }
      const product = createProduct(parsed)
      return { ok: true as const, productId: product.id }
    },
  })
}

export function updateProductTool(openProductId: string): ToolSpec {
  return traced({
    name: 'update_product',
    description:
      'Use while the product the human wants to revise is open. This idempotently changes only the named fields, ' +
      'leaves omitted fields untouched, and returns the fields updated.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', const: openProductId, description: 'The currently open product id.' },
        ...productProperties,
      },
      required: ['productId'],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true, idempotentHint: true },
    execute: (input: unknown) => {
      if (!isRecord(input) || typeof input.productId !== 'string') {
        return { ok: false as const, reason: 'productId must be a string' }
      }
      const unexpected = unexpectedField(input, ['productId', ...EDITABLE_FIELDS])
      if (unexpected) return { ok: false as const, reason: unexpected }
      if (input.productId !== openProductId || readAppState().selectedProductId !== openProductId) {
        return { ok: false as const, reason: 'product is not open' }
      }
      if (!readProduct(openProductId)) return { ok: false as const, reason: 'product not found' }

      const patch: ProductPatch = {}
      const updated: string[] = []
      for (const field of EDITABLE_FIELDS) {
        if (!(field in input)) continue
        const reason = validateField(field, input[field])
        if (reason) return { ok: false as const, reason }
        Object.assign(patch, { [field]: input[field] as Product[EditableField] })
        updated.push(field)
      }
      if (updated.length === 0) {
        return { ok: false as const, reason: 'at least one editable field is required' }
      }
      updateProduct(openProductId, patch)
      return { ok: true as const, updated }
    },
  })
}

export function deleteProductTool(openProductId: string): ToolSpec {
  return traced({
    name: 'delete_product',
    description:
      'Use only after the human confirms removal of the currently open product. It accepts no other product id and ' +
      'permanently deletes that record, so the action is irreversible.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', const: openProductId, description: 'The currently open product id.' },
      },
      required: ['productId'],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
    execute: (input: unknown) => {
      if (
        !isRecord(input) ||
        typeof input.productId !== 'string' ||
        input.productId !== openProductId ||
        readAppState().selectedProductId !== openProductId
      ) {
        return { ok: false as const, reason: 'product is not open' }
      }
      const unexpected = unexpectedField(input, ['productId'])
      if (unexpected) return { ok: false as const, reason: unexpected }
      if (!deleteProduct(openProductId)) {
        return { ok: false as const, reason: 'product not found' }
      }
      dispatch({ type: 'selectProduct', productId: null })
      return { ok: true as const }
    },
  })
}

export function productRouteTools(): ToolSpec[] {
  return [listProductsTool(), getProductTool(), createProductTool()]
}

export function openProductTools(openProductId: string | null): Array<ToolSpec | null> {
  return [
    openProductId ? updateProductTool(openProductId) : null,
    openProductId ? deleteProductTool(openProductId) : null,
  ]
}
