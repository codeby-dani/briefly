/**
 * Briefs — the payoff route. Two halves:
 *
 *   Composer  — pick a trend and an offering, then fill (or have an agent fill) a
 *               brief. Picking both is what puts get_brief_context and save_brief
 *               on the surface; that registration happens in App.tsx, guarded on
 *               the same selection this component drives.
 *   Library   — every brief as a card, with its status control and its author.
 *
 * Every field is hand-editable at all times and the human can save without any
 * agent connected, per the constraint in plan/README.md: an agent-writable field
 * is also a human-editable one, or the live URL is a dead app to a judge with no
 * agent.
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import { briefStore, saveDraft, setStatus } from '../store/briefs'
import { businessProfileStore } from '../store/businessProfile'
import { trendStore } from '../store/trends'
import { dispatch, navigate, useAppState } from '../store/router'
import { libraryTools } from '../tools/briefs'
import { useTools } from '../webmcp'
import { PLATFORM_LABEL, PLATFORMS } from '../types'
import { PlatformIcon } from '../components/PlatformIcon'
import type { Brief, BriefStatus, Platform } from '../types'

/** The next legal statuses for a human control, from the machine in the store. */
const NEXT: Record<BriefStatus, { to: BriefStatus; label: string }[]> = {
  draft: [{ to: 'approved', label: 'Approve' }],
  approved: [
    { to: 'published', label: 'Publish' },
    { to: 'draft', label: 'Send back' },
  ],
  published: [],
}

interface FormState {
  title: string
  hook: string
  outline: string
  tone: string
  cta: string
  hashtags: string
  audience: string
  platform: Platform | ''
}

const EMPTY_FORM: FormState = {
  title: '',
  hook: '',
  outline: '',
  tone: '',
  cta: '',
  hashtags: '',
  audience: '',
  platform: '',
}

type ContentType = 'Educating' | 'Entertaining' | 'Promotional' | 'Community'

interface CatalogBrief {
  id: string
  title: string
  product: string
  platform: Platform
  contentType: ContentType
  status: BriefStatus
  updatedAt: string
  audience: string
}

const CATALOG_TEMPLATES: Omit<CatalogBrief, 'id' | 'updatedAt'>[] = [
  { title: 'The 60-second barrier reset', product: 'Barrier Reset Serum', platform: 'tiktok', contentType: 'Educating', status: 'published', audience: 'Sensitive-skin adults' },
  { title: 'SPF layering, simplified', product: 'Daily Cloud SPF 50', platform: 'instagram', contentType: 'Educating', status: 'approved', audience: 'Routine beginners' },
  { title: 'What a calm skin day looks like', product: 'Barrier Reset Serum', platform: 'instagram', contentType: 'Community', status: 'published', audience: 'Ingredient-conscious shoppers' },
  { title: '3 signs your cleanser is too harsh', product: 'Barrier Reset Serum', platform: 'youtube', contentType: 'Educating', status: 'draft', audience: 'Sensitive-skin adults' },
  { title: 'The no-pilling SPF check', product: 'Daily Cloud SPF 50', platform: 'tiktok', contentType: 'Entertaining', status: 'approved', audience: 'Routine beginners' },
  { title: 'Your serum order matters', product: 'Barrier Reset Serum', platform: 'x', contentType: 'Promotional', status: 'published', audience: 'Skincare regulars' },
  { title: 'Before your retinol night', product: 'Barrier Reset Serum', platform: 'instagram', contentType: 'Educating', status: 'draft', audience: 'Ingredient-conscious shoppers' },
  { title: 'A sunscreen that feels like skincare', product: 'Daily Cloud SPF 50', platform: 'youtube', contentType: 'Promotional', status: 'approved', audience: 'Daily SPF shoppers' },
  { title: 'Dry skin rescue at 3 PM', product: 'Barrier Reset Serum', platform: 'tiktok', contentType: 'Entertaining', status: 'published', audience: 'Office commuters' },
  { title: 'Minimal routine, maximum comfort', product: 'Daily Cloud SPF 50', platform: 'instagram', contentType: 'Community', status: 'approved', audience: 'Routine beginners' },
  { title: 'Is your routine doing too much?', product: 'Barrier Reset Serum', platform: 'x', contentType: 'Community', status: 'draft', audience: 'Sensitive-skin adults' },
  { title: 'Morning texture test', product: 'Daily Cloud SPF 50', platform: 'tiktok', contentType: 'Entertaining', status: 'published', audience: 'Daily SPF shoppers' },
]

/** Visual catalog only: these examples never enter the user/agent brief store. */
const CATALOG_BRIEFS: CatalogBrief[] = Array.from({ length: 67 }, (_, index) => {
  const template = CATALOG_TEMPLATES[index % CATALOG_TEMPLATES.length]
  return {
    ...template,
    id: `catalog-${String(index + 1).padStart(2, '0')}`,
    updatedAt: `2026-09-${String(28 - (index % 24)).padStart(2, '0')}`,
  }
})

const PAGE_SIZE = 8

function toList(text: string, splitter: RegExp): string[] {
  return text
    .split(splitter)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function Briefs() {
  const app = useAppState()
  const trends = trendStore.use()
  const offerings = businessProfileStore.use().offerings
  const briefs = briefStore.use()

  // The library pair is route-scoped: on the surface while Briefs is mounted,
  // off it the moment the human navigates away. The composer pair
  // (get_brief_context, save_brief) is registered in App.tsx instead, because it
  // is scoped to selection and must survive leaving this route.
  useTools(libraryTools())

  const trend = trends.find((t) => t.id === app.selectedTrendId) ?? null
  const offering = offerings.find((item) => item.id === app.selectedOfferingId) ?? null
  const bothSelected = Boolean(trend && offering)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [savedId, setSavedId] = useState<string | null>(null)

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  function handleSave() {
    if (!trend || !offering) return
    const brief = saveDraft(
      {
        title: form.title.trim() || `${trend.keyword} × ${offering.name}`,
        trendId: trend.id,
        offeringId: offering.id,
        platform: form.platform || trend.platform,
        hook: form.hook.trim(),
        outline: toList(form.outline, /\n+/),
        tone: form.tone.trim(),
        cta: form.cta.trim(),
        hashtags: toList(form.hashtags, /[\s,]+/),
        audience: form.audience.trim(),
      },
      'human',
    )
    setSavedId(brief.id)
    setForm(EMPTY_FORM)
  }

  return (
    <>
      <section className="card composer-card" data-testid="brief-composer">
        <div className="card-head">
          <h2>Compose a brief</h2>
        </div>

        <div className="composer-body">
          <div className="composer-picks">
            <label className="field">
              <span className="field-label">Trend</span>
              <select
                data-testid="composer-trend"
                value={app.selectedTrendId ?? ''}
                onChange={(e) => dispatch({ type: 'selectTrend', trendId: e.target.value || null })}
              >
                <option value="">Select a trend…</option>
                {trends.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.keyword} · {t.platform} · {t.category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Offering</span>
              <select
                data-testid="composer-offering"
                value={app.selectedOfferingId ?? ''}
                onChange={(e) =>
                  dispatch({ type: 'selectOffering', offeringId: e.target.value || null })
                }
              >
                <option value="">Select an offering…</option>
                {offerings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!bothSelected ? (
            <p className="muted small" data-testid="composer-empty">
              Pick a trend and an offering to open the form. It puts{' '}
              <code>get_brief_context</code> and <code>save_brief</code> on the agent surface — fill
              it in yourself either way.
            </p>
          ) : (
            <>
              <p className="muted small" data-testid="composer-armed">
                <code>get_brief_context</code> and <code>save_brief</code> are on the surface. Ask
                an agent, or fill it in yourself — both land a draft.
              </p>

              <div className="brief-form" data-testid="brief-form">
                <div className="brief-fields">
                <div className="field-row field-row-wide">
                  <Field id="title" label="Title">
                    <input
                      data-testid="field-title"
                      value={form.title}
                      placeholder={`${trend!.keyword} × ${offering!.name}`}
                      onChange={(e) => set({ title: e.target.value })}
                    />
                  </Field>
                  <Field id="platform" label="Platform">
                    <select
                      data-testid="field-platform"
                      value={form.platform || trend!.platform}
                      onChange={(e) => set({ platform: e.target.value as Platform })}
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field id="hook" label="Hook">
                  <input
                    data-testid="field-hook"
                    value={form.hook}
                    placeholder="The first line that stops the scroll"
                    onChange={(e) => set({ hook: e.target.value })}
                  />
                </Field>

                <div className="field-row">
                  <Field id="tone" label="Tone">
                    <input
                      data-testid="field-tone"
                      value={form.tone}
                      placeholder="Warm, direct"
                      onChange={(e) => set({ tone: e.target.value })}
                    />
                  </Field>
                  <Field id="cta" label="Call to action">
                    <input
                      data-testid="field-cta"
                      value={form.cta}
                      placeholder="Link in bio"
                      onChange={(e) => set({ cta: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="field-row">
                  <Field id="hashtags" label="Hashtags — space or comma separated">
                    <input
                      data-testid="field-hashtags"
                      value={form.hashtags}
                      placeholder="#glowup #skincare"
                      onChange={(e) => set({ hashtags: e.target.value })}
                    />
                  </Field>
                  <Field id="audience" label="Audience">
                    <input
                      data-testid="field-audience"
                      value={form.audience}
                      placeholder="Who this is for"
                      onChange={(e) => set({ audience: e.target.value })}
                    />
                  </Field>
                </div>
                </div>

                {/* The outline is the only field with more than one line in it,
                    so it takes the second column and every short field stacks in
                    the first. Stacked full-width, it was a lone tall box with
                    six one-line inputs above it. */}
                <Field id="outline" label="Outline — one beat per line">
                  <textarea
                    data-testid="field-outline"
                    value={form.outline}
                    placeholder={'Open on the problem\nShow the offering in use\nClose on the CTA'}
                    onChange={(e) => set({ outline: e.target.value })}
                  />
                </Field>
              </div>
            </>
          )}
        </div>

        {bothSelected && (
          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              data-testid="save-brief"
              onClick={handleSave}
            >
              Save as draft
            </button>
            <span className="muted small">
              Saves as a <strong>draft</strong> — approving and publishing are the human decisions
              in the library.
            </span>
          </div>
        )}
      </section>

      <section className="card library-card" data-testid="brief-library">
        <div className="card-head">
          <h2>Library</h2>
          <span className="muted small" data-testid="library-catalog-count">
            {CATALOG_BRIEFS.length + briefs.length} briefs
          </span>
        </div>
        <Library briefs={briefs} highlightId={savedId} />
      </section>
    </>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <label className="field" data-field={id}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

function Library({ briefs, highlightId }: { briefs: Brief[]; highlightId: string | null }) {
  const trends = trendStore.use()
  const offerings = businessProfileStore.use().offerings

  const [query, setQuery] = useState('')
  const [status, setStatusFilter] = useState<BriefStatus | ''>('')
  const [platform, setPlatformFilter] = useState<Platform | ''>('')
  const [page, setPage] = useState(1)

  const shownBriefs = briefs
    .filter((b) => {
      if (status && b.status !== status) return false
      if (platform && b.platform !== platform) return false
      if (query) {
        const hay = `${b.title} ${b.hook} ${b.audience}`.toLowerCase()
        if (!hay.includes(query.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const shownCatalog = CATALOG_BRIEFS.filter((brief) => {
    if (status && brief.status !== status) return false
    if (platform && brief.platform !== platform) return false
    if (!query) return true
    return `${brief.title} ${brief.product} ${brief.audience} ${brief.contentType}`.toLowerCase().includes(query.toLowerCase())
  })
  const pageCount = Math.max(1, Math.ceil(shownCatalog.length / PAGE_SIZE))
  const activePage = Math.min(page, pageCount)
  const pageCatalog = shownCatalog.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)

  function updateFilters(patch: { query?: string; status?: BriefStatus | ''; platform?: Platform | '' }) {
    if (patch.query !== undefined) setQuery(patch.query)
    if (patch.status !== undefined) setStatusFilter(patch.status)
    if (patch.platform !== undefined) setPlatformFilter(patch.platform)
    setPage(1)
  }

  return (
    <>
      <div className="library-controls">
        <input
          className="search"
          data-testid="brief-search"
          value={query}
          placeholder="Search briefs, products, or audience"
          onChange={(e) => updateFilters({ query: e.target.value })}
        />
        <select
          data-testid="brief-filter-status"
          value={status}
          onChange={(e) => updateFilters({ status: e.target.value as BriefStatus | '' })}
        >
          <option value="">Any status</option>
          <option value="draft">draft</option>
          <option value="approved">approved</option>
          <option value="published">published</option>
        </select>
        <select
          data-testid="brief-filter-platform"
          value={platform}
          onChange={(e) => updateFilters({ platform: e.target.value as Platform | '' })}
        >
          <option value="">Any platform</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {shownBriefs.length > 0 && (
        <section className="library-user-briefs" aria-label="Your briefs">
          <p className="library-section-label">Your briefs</p>
          <ul className="rows" data-testid="library-list">
            {shownBriefs.map((brief) => (
              <BriefCard
                key={brief.id}
                brief={brief}
                trendKeyword={trends.find((t) => t.id === brief.trendId)?.keyword ?? brief.trendId}
                productName={offerings.find((item) => item.id === brief.offeringId)?.name ?? brief.offeringId}
                highlight={brief.id === highlightId}
              />
            ))}
          </ul>
        </section>
      )}

      {shownCatalog.length === 0 && shownBriefs.length === 0 ? (
        <p className="muted small" data-testid="library-no-match">
          No briefs match those filters.
        </p>
      ) : (
        <>
          <div className="library-catalog-head">
            <p className="library-section-label">Skincare campaign library</p>
            <span className="muted small">{shownCatalog.length} campaign briefs</span>
          </div>
          <ul className="library-showcase-grid" data-testid="library-list">
            {pageCatalog.map((brief) => <CatalogBriefCard key={brief.id} brief={brief} />)}
          </ul>
          <nav className="library-pagination" data-testid="library-pagination" aria-label="Library pages">
            <button type="button" className="chip" disabled={activePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" className={`chip${number === activePage ? ' is-active' : ''}`} aria-current={number === activePage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>
            ))}
            <button type="button" className="chip" disabled={activePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
          </nav>
        </>
      )}
    </>
  )
}

function CatalogBriefCard({ brief }: { brief: CatalogBrief }) {
  return (
    <li className="catalog-brief" data-testid={`library-showcase-${brief.id}`}>
      <div className="catalog-brief-tags">
        <span className={`content-type content-type-${brief.contentType.toLowerCase()}`}>{brief.contentType}</span>
        <span className={`status status-${brief.status}`}>{brief.status}</span>
      </div>
      <h3>{brief.title}</h3>
      <p>{brief.audience}</p>
      <div className="catalog-brief-meta">
        <span><PlatformIcon platform={brief.platform} size={15} />{PLATFORM_LABEL[brief.platform]}</span>
        <span>{brief.product}</span>
      </div>
      <small>Updated {brief.updatedAt}</small>
    </li>
  )
}

function BriefCard({
  brief,
  trendKeyword,
  productName,
  highlight,
}: {
  brief: Brief
  trendKeyword: string
  productName: string
  highlight: boolean
}) {
  return (
    <li className={`brief-row${highlight ? ' is-new' : ''}`} data-testid={`brief-card-${brief.id}`}>
      {/* What the brief *is* on the first line — title, status, author, and the
          control that moves it on — and what it is *about* on the second. The
          pills used to lead the second line, where they sat in front of a run of
          muted text and read as part of it. */}
      <div className="brief-row-head">
        <span className="row-title">{brief.title}</span>

        <span className="brief-row-tags">
          <span
            className={`status status-${brief.status}`}
            data-testid={`brief-status-${brief.id}`}
          >
            {brief.status}
          </span>
          <span
            className={`authored authored-${brief.authoredBy}`}
            data-testid={`brief-author-${brief.id}`}
          >
            {brief.authoredBy}
          </span>
        </span>

        <div className="status-actions">
          {NEXT[brief.status].length === 0 ? (
            <span className="muted small">final</span>
          ) : (
            NEXT[brief.status].map(({ to, label }) => (
              <button
                key={to}
                type="button"
                className="chip"
                data-testid={`brief-action-${brief.id}-${to}`}
                onClick={() => setStatus(brief.id, to)}
              >
                {label}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="brief-row-meta">
        <span className="brief-row-facts">
          <button
            type="button"
            className="link"
            data-testid={`brief-trend-link-${brief.id}`}
            onClick={() => {
              dispatch({ type: 'selectTrend', trendId: brief.trendId })
              navigate('trends')
            }}
          >
            {trendKeyword}
          </button>
          {' · '}
          <button
            type="button"
            className="link"
            data-testid={`brief-product-link-${brief.id}`}
            onClick={() => {
              dispatch({ type: 'selectOffering', offeringId: brief.offeringId })
              navigate('products')
            }}
          >
            {productName}
          </button>
          {' · '}
          {brief.platform} · {brief.updatedAt.slice(0, 10)}
        </span>
      </div>
    </li>
  )
}
