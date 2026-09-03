# Phase 3 — Business Profile

**Window:** T+4:15 → T+5:15 · **Cuttable:** no

The durable business context that makes briefs good: one profile, shared claim guardrails, and structured offerings.

## Status

- [x] Editable business profile with structured offerings
- [x] `get_business_profile` available on Profile; write tools only while editing
- [x] Shared and offering-specific claim guardrails are first-class fields

## Tasks

1. **Profile.** Identity, quality summary, facts, chips, offerings, and shared guardrails.
2. **Editor.** One panel manages shared fields and detailed offerings.
3. **Route tools.** `get_business_profile` is read-only and returns untrusted content.
4. **Conditional tools.** Profile and offering write tools register only while editing.

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
