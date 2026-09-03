# Phase 4 — Brief Generator and Library

**Window:** T+5:15 → T+6:45 · **Cuttable:** no

The product. Everything before this exists to make this phase possible.

## Status

- [ ] Composer: trend picker + product picker + brief form
- [ ] `get_brief_context` and `save_brief` register on selection, not on route
- [ ] Library: search, filter by status/platform/date, sort
- [ ] Status machine enforced: `draft → approved → published`, forward only
- [ ] `save_brief` always lands as `draft`
- [ ] Empty state explains the no-agent path and stays hand-editable

## Tasks

1. **Composer.** Two selects (trend, product) and a brief form with hook,
   outline (list), tone, CTA, hashtags (list), audience, platform. Every field
   hand-editable at all times.
2. **Selection-scoped tools.** `get_brief_context` and `save_brief` register
   when `selectedTrendId && selectedProductId`, regardless of route. They must
   survive the human navigating to Products mid-composition.
3. **`get_brief_context`.** Bundles the trend, the full product record, the
   platform, and existing briefs for the same pair so the agent does not repeat
   an angle.
4. **`save_brief`.** Writes a `draft`, sets `authoredBy: 'agent'`, returns the
   id. Cannot set any other status — enforce in the executor, not the schema.
5. **Library.** Cards with status chip, trend link, product link.
   `search_briefs` and `update_brief_status`.
6. **Status control.** A human control; transitions validated against the
   machine in `02-data-model.md`. Rejections say what the current status is.

## Exit Criteria

1. Selecting a trend and a product adds exactly two tools to the surface,
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
