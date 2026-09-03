# Phase 3 — Product Knowledge

**Window:** T+4:15 → T+5:15 · **Cuttable:** no

The "real" half of the feature split, and the context that makes briefs good.

## Status

- [ ] Product list and detail — implemented; re-verified in a real browser 2026-09-03 23:05, four seeded cards, editor opens on click. Not deployed
- [ ] Create, update, delete by hand — implemented; the agent-side round trip runs 4 → 5 → 4 in a browser. Not deployed
- [ ] `list_products`, `get_product`, `create_product` on the route — surface is 5 on Products, verified in a browser. Not deployed
- [ ] `update_product`, `delete_product` when a product is open — both appear on open and disappear on close, verified in a browser. Not deployed
- [ ] Do-and-do-not lists are first-class, not a notes field — `product-usp-{n}` / `product-dos-{n}` row controls render, and `get_brief_context` hands the do-not list to the agent as an array. Not deployed

The earlier verification here was `scripts/verify-phase3.mjs`, an isolated Vite
SSR harness, because no browser was available that session. It has now been
confirmed the ordinary way, in a browser against the production build, and the
two agree. One thing the harness could not have caught: the merge that brought
this phase into `main` also dropped `App.tsx`'s `trends` and `briefs` branches
and a type guard, leaving the tree unable to compile — the products route was
correct and the app around it was not.

## Tasks

1. **List.** Cards with name, positioning line, price, USP count.
   `data-testid="product-card-{id}"`.
2. **Detail and form.** One component in two modes. Fields: name,
   description, USP list, price, dos list, donts list. List fields are
   add/remove rows, not comma-separated text — the agent reads them as arrays
   and a free-text field would force a parse.
3. **Delete.** Confirmation required in the UI. `delete_product` accepts only
   the currently open id.
4. **Route tools.** `list_products`, `get_product`, `create_product`.
5. **Conditional tools.** `update_product`, `delete_product`, guarded on
   `openProductId`, both annotated `destructiveHint`.

## Exit Criteria

1. Surface count is 5 on the route, 7 with a product open.
2. A product created by an agent appears in the list without a reload.
3. `update_product` with a subset of fields leaves the others untouched.
4. `delete_product` with an id that is not open returns
   `{ ok: false, reason: 'product is not open' }` and deletes nothing.
5. `get_product` output carries `untrustedContentHint` and the description round
   -trips exactly, including newlines.

## Why The Do-Not List Matters

It is the part of product knowledge that never survives a copy-paste into a
chat window, and it is the part that makes an agent-written brief usable
without a rewrite. It is also the most legible thing to demo: ask the agent for
a brief, and watch it avoid a claim because the product record forbids it.

Seed at least one product whose `donts` will visibly constrain the brief the
agent writes for the top trend. Without that, the field is invisible on camera.
