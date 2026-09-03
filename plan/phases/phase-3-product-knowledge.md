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

1. Surface count is 3 on Profile and 7 while its editor is open.
2. Editing shared fields updates facts, chips, guardrails, and offering cards without reload.
3. Offering create, patch, and removal work through both UI and bridge tools.
4. Unknown fields, empty patches, and missing offering ids return structured failures without changing data.
5. `get_business_profile` carries `untrustedContentHint` and returns the full structured profile.

## Why Claim Guardrails Matter

They are the part of business context that never survives a copy-paste into a
chat window, and make an agent-written brief usable without a rewrite. Shared
guardrails apply to every brief; offering-level guardrails preserve the nuances
of the thing being promoted.

Seed at least one offering whose prohibited claims visibly constrain a brief.
