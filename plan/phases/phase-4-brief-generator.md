# Phase 4 — Brief Generator and Library

**Window:** T+5:15 → T+6:45 · **Cuttable:** no

The product. Everything before this exists to make this phase possible.

## Status

- [ ] Composer: trend picker + product picker + brief form — **live on the deployed origin**, both pickers populated (24 trends, 4 products) and driven there 2026-09-03 22:55
- [ ] `get_brief_context` and `save_brief` register on selection, not on route — **verified on the deployed origin**: surface 4 → 6 on setting both pickers; `get_brief_context` returned the trend, the product USP and its three do-nots
- [ ] Library: search, filter by status/platform/date, sort — `search_briefs` registered on the deployed origin; the filter behaviour re-verified locally, sorted newest-first
- [ ] Status machine enforced: `draft → approved → published`, forward only — re-verified locally 23:05: draft → approved → published all pass; `draft → published` and `published → draft` both refused with `currentStatus` attached
- [ ] `save_brief` always lands as `draft` — re-verified locally 23:05, injected `status:'published'` still landed `draft`
- [ ] Empty state explains the no-agent path and stays hand-editable — done in code, human filled every field and saved a `human`/`draft` brief with no agent

Every box stays `[ ]` because `plan/README.md` defines `[x]` as *deployed* and
this phase is only half-deployed: it is on the live bundle, but that bundle
predates Phases 2 and 3, so the composer's trend cross-links still land on a
placeholder route. The annotations say what was verified and where.

**Phase 4 is, by accident, the only phase with deployed evidence.** It reached
`main` before Phase 2 did, so the last build that succeeded contains it and not
them. That is worth stating plainly rather than reading as a quality signal:
this phase is not further along than Phase 2, it is just luckier about merge
order.

**Built out of order, on instruction.** Phase 4 was run on branch `phase4`
(cut from the `phase 1` commit) before Phases 2 and 3 exist, on the user's call
to do everything Phase 4 can do now and reconcile at merge. The composer reads
the trend and product stores directly (both seeded in Phase 1), so it is
self-contained: it needs no Trends or Products *route*, only the stores. What
still depends on the missing phases is spelled out in PROGRESS.md — the Trends
and Products routes are still `Pending.tsx`, so the brief cross-links land on
placeholders, and the surface-count picture is only complete once Phases 2–3
register their own tools.

## Tasks

1. **Composer.** Two selects (trend, offering) and a brief form with hook,
   outline (list), tone, CTA, hashtags (list), audience, platform. Every field
   hand-editable at all times.
2. **Selection-scoped tools.** `get_brief_context` and `save_brief` register
   when `selectedTrendId && selectedOfferingId`, regardless of route. They must
   survive the human navigating to Profile mid-composition.
3. **`get_brief_context`.** Bundles the trend, business profile, selected offering, the
   platform, and existing briefs for the same pair so the agent does not repeat
   an angle.
4. **`save_brief`.** Writes a `draft`, sets `authoredBy: 'agent'`, returns the
   id. Cannot set any other status — enforce in the executor, not the schema.
5. **Library.** Cards with status chip, trend link, offering link.
   `search_briefs` and `update_brief_status`.
6. **Status control.** A human control; transitions validated against the
   machine in `02-data-model.md`. Rejections say what the current status is.

## Exit Criteria

1. Selecting a trend and an offering adds exactly two tools to the surface,
   visibly, and deselecting either removes them.
2. An agent given only "write me a brief for this" produces a brief that
   references the product's USP and respects its do-not list.
3. The brief appears in the library as a draft without a reload.
4. `save_brief` with `status: 'published'` in the input is ignored — the brief
   is still a draft.
5. `update_brief_status` from `published` to `draft` returns
   `{ ok: false, currentStatus: 'published' }`.
6. With no agent connected, a human can fill every field and save a brief.
7. `authoredBy` is visible on the card, so agent-written and human-written
   briefs are distinguishable.

## Demo Weight

This is the payoff shot. The sequence — pick product, two tools appear, ask,
brief lands in the library — is the whole argument in about twenty seconds.
Rehearse it before recording; the pickers should already be one click away.
