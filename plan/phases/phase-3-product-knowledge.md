# Phase 3 — Product Knowledge

**Window:** T+4:15 → T+5:15 · **Cuttable:** no

The "real" half of the feature split, and the context that makes briefs good.

## Status

- [ ] Product list and detail
- [ ] Create, update, delete by hand
- [ ] `list_products`, `get_product`, `create_product` on the route
- [ ] `update_product`, `delete_product` when a product is open
- [ ] Do-and-do-not lists are first-class, not a notes field

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
