import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Product } from '../types'
import { DemoBadge } from '../components/Badge'
import { PRODUCTS } from '../fixtures/products'
import {
  createProduct,
  deleteProduct,
  productStore,
  updateProduct,
} from '../store/products'
import type { ProductDraft } from '../store/products'
import { dispatch, useAppState } from '../store/router'
import { openProductTools, productRouteTools } from '../tools/products'
import { useTools } from '../webmcp'

const IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const SEEDED_UPDATED_AT = new Map(PRODUCTS.map((product) => [product.id, product.updatedAt]))

const EMPTY_DRAFT: ProductDraft = {
  name: '',
  description: '',
  usp: [''],
  priceIdr: 0,
  dos: [''],
  donts: [''],
}

function asDraft(product: Product | null): ProductDraft {
  if (!product) return { ...EMPTY_DRAFT, usp: [''], dos: [''], donts: [''] }
  return {
    name: product.name,
    description: product.description,
    usp: [...product.usp],
    priceIdr: product.priceIdr,
    dos: [...product.dos],
    donts: [...product.donts],
  }
}

function positioning(description: string): string {
  const line = description.split(/\r?\n/, 1)[0].trim()
  return line.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || line
}

export function Products() {
  const products = productStore.use()
  const { selectedProductId } = useAppState()
  const [creating, setCreating] = useState(false)
  const openProduct = products.find((product) => product.id === selectedProductId) ?? null

  useTools([...productRouteTools(), ...openProductTools(openProduct?.id ?? null)])

  const open = (productId: string) => {
    setCreating(false)
    dispatch({ type: 'selectProduct', productId })
  }

  const close = () => {
    setCreating(false)
    dispatch({ type: 'selectProduct', productId: null })
  }

  return (
    <section className="products-workspace" aria-labelledby="products-title">
      <div className="workspace-head">
        <div>
          <p className="eyebrow">Brand context</p>
          <h2 id="products-title">Product Knowledge</h2>
          <p className="muted">
            Keep claims, positioning, and hard boundaries together before a brief is written.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          data-testid="create-product"
          onClick={() => {
            dispatch({ type: 'selectProduct', productId: null })
            setCreating(true)
          }}
        >
          New product
        </button>
      </div>

      <div className={`products-layout${creating || openProduct ? ' has-editor' : ''}`}>
        <div className="product-list" data-testid="product-list">
          {products.length === 0 ? (
            <div className="empty-state" data-testid="products-empty">
              <h3>No products yet</h3>
              <p>Add brand context by hand, or ask an agent to create a product record.</p>
            </div>
          ) : (
            products.map((product) => (
              <button
                type="button"
                className={`product-card${product.id === openProduct?.id ? ' is-open' : ''}`}
                key={product.id}
                data-testid={`product-card-${product.id}`}
                aria-pressed={product.id === openProduct?.id}
                onClick={() => open(product.id)}
              >
                <span className="product-card-topline">
                  <strong>{product.name}</strong>
                  <span className="product-price-group">
                    {SEEDED_UPDATED_AT.get(product.id) === product.updatedAt && (
                      <DemoBadge what="This seeded product price" />
                    )}
                    <span className="product-price">{IDR.format(product.priceIdr)}</span>
                  </span>
                </span>
                <span className="product-positioning">{positioning(product.description)}</span>
                <span className="product-meta">
                  {product.usp.length} {product.usp.length === 1 ? 'USP' : 'USPs'}
                </span>
              </button>
            ))
          )}
        </div>

        {(creating || openProduct) && (
          <ProductEditor
            key={creating ? 'create' : openProduct?.id}
            mode={creating ? 'create' : 'edit'}
            product={creating ? null : openProduct}
            onClose={close}
            onCreated={(productId) => {
              setCreating(false)
              dispatch({ type: 'selectProduct', productId })
            }}
          />
        )}
      </div>
    </section>
  )
}

interface ProductEditorProps {
  mode: 'create' | 'edit'
  product: Product | null
  onClose: () => void
  onCreated: (productId: string) => void
}

function ProductEditor({ mode, product, onClose, onCreated }: ProductEditorProps) {
  const [draft, setDraft] = useState<ProductDraft>(() => asDraft(product))

  const setList = (field: 'usp' | 'dos' | 'donts', value: string[]) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const clean: ProductDraft = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description,
      usp: draft.usp.map((item) => item.trim()).filter(Boolean),
      dos: draft.dos.map((item) => item.trim()).filter(Boolean),
      donts: draft.donts.map((item) => item.trim()).filter(Boolean),
    }

    if (mode === 'create') {
      const created = createProduct(clean)
      onCreated(created.id)
      return
    }
    if (product) updateProduct(product.id, clean)
  }

  const remove = () => {
    if (!product) return
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return
    deleteProduct(product.id)
    onClose()
  }

  return (
    <aside className="product-editor card" data-testid="product-editor" aria-label={mode === 'create' ? 'Create product' : `Edit ${product?.name}`}>
      <div className="editor-head">
        <div>
          <p className="eyebrow">{mode === 'create' ? 'New record' : 'Open product'}</p>
          <h3>{mode === 'create' ? 'Add product knowledge' : product?.name}</h3>
        </div>
        <button type="button" className="icon-button" aria-label="Close product" data-testid="close-product" onClick={onClose}>
          ×
        </button>
      </div>

      <form className="product-form" data-testid={`product-form-${mode}`} onSubmit={submit}>
        <label>
          <span>Name</span>
          <input
            required
            value={draft.name}
            data-testid="product-name"
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
        </label>

        <label>
          <span>Description and positioning</span>
          <textarea
            required
            rows={5}
            value={draft.description}
            data-testid="product-description"
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
        </label>

        <label>
          <span>Price (IDR)</span>
          <input
            required
            type="number"
            min="0"
            step="1000"
            value={draft.priceIdr}
            data-testid="product-price"
            onChange={(event) => setDraft((current) => ({ ...current, priceIdr: Number(event.target.value) }))}
          />
        </label>

        <ArrayField label="Unique selling points" field="usp" values={draft.usp} onChange={(value) => setList('usp', value)} />

        <div className="guardrails-grid">
          <ArrayField label="Do say" field="dos" values={draft.dos} onChange={(value) => setList('dos', value)} />
          <ArrayField label="Do not say" field="donts" values={draft.donts} onChange={(value) => setList('donts', value)} />
        </div>

        <div className="editor-actions">
          {mode === 'edit' && (
            <button type="button" className="button button-danger" data-testid="delete-product" onClick={remove}>
              Delete product
            </button>
          )}
          <button type="submit" className="button button-primary" data-testid="save-product">
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </button>
        </div>
      </form>
    </aside>
  )
}

interface ArrayFieldProps {
  label: string
  field: 'usp' | 'dos' | 'donts'
  values: string[]
  onChange: (values: string[]) => void
}

function ArrayField({ label, field, values, onChange }: ArrayFieldProps) {
  return (
    <fieldset className={`array-field array-${field}`} data-testid={`product-${field}`}>
      <legend>{label}</legend>
      {values.map((value, index) => (
        <div className="array-row" key={`${field}-${index}`}>
          <input
            value={value}
            aria-label={`${label} ${index + 1}`}
            data-testid={`product-${field}-${index}`}
            onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            data-testid={`remove-${field}-${index}`}
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-button"
        data-testid={`add-${field}`}
        onClick={() => onChange([...values, ''])}
      >
        + Add row
      </button>
    </fieldset>
  )
}
