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
import { PLATFORMS } from '../types'
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
          <span className="muted small">
            {briefs.length} brief{briefs.length === 1 ? '' : 's'}
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

  const shown = briefs
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

  if (briefs.length === 0) {
    return (
      <p className="muted" data-testid="library-empty">
        No briefs yet — none are seeded, on purpose. A brief is what the human and the agent make
        together, so the first one in here will be one you or an agent just wrote. Compose one above.
      </p>
    )
  }

  return (
    <>
      <div className="library-controls">
        <input
          className="search"
          data-testid="brief-search"
          value={query}
          placeholder="Search title, hook, audience"
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          data-testid="brief-filter-status"
          value={status}
          onChange={(e) => setStatusFilter(e.target.value as BriefStatus | '')}
        >
          <option value="">Any status</option>
          <option value="draft">draft</option>
          <option value="approved">approved</option>
          <option value="published">published</option>
        </select>
        <select
          data-testid="brief-filter-platform"
          value={platform}
          onChange={(e) => setPlatformFilter(e.target.value as Platform | '')}
        >
          <option value="">Any platform</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {shown.length === 0 ? (
        <p className="muted small" data-testid="library-no-match">
          No briefs match those filters.
        </p>
      ) : (
        <ul className="rows" data-testid="library-list">
          {shown.map((brief) => (
            <BriefCard
              key={brief.id}
              brief={brief}
              trendKeyword={trends.find((t) => t.id === brief.trendId)?.keyword ?? brief.trendId}
              productName={offerings.find((item) => item.id === brief.offeringId)?.name ?? brief.offeringId}
              highlight={brief.id === highlightId}
            />
          ))}
        </ul>
      )}
    </>
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
