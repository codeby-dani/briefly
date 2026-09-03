# Phase Runner — Prompt Template

Copy the block below into a fresh Claude Code session. Change **one line only**
(`PHASE:`) to run the next phase. Nothing else in the block ever changes.

---

## The Template

```
PHASE: 0

Run that phase of the TrendDashboard sprint, end to end.

Read first, in this order:
- plan/PROGRESS.md            (where we actually are — authority on state)
- plan/README.md              (execution constraints + cut line)
- plan/phases/phase-<PHASE>-*.md  (the phase being run — authority on scope)
- plan/01-architecture.md and plan/02-data-model.md — only the sections the
  phase file references (tool contracts, store shapes)

Rules for this run:
- Do only this phase. No work from later phases, no refactors outside scope.
- If PROGRESS.md says an earlier phase is incomplete, stop and report which
  exit criteria are unmet instead of building on top of it.
- Follow every constraint in plan/README.md "Execution Constraints" —
  zero new runtime deps, tools return structured data, data-testid during the
  build, traceId on every tool call, badges on invented vs derived numbers.
- Every tool registration must match its contract in 01-architecture.md /
  02-data-model.md exactly. If the contract is ambiguous, ask before coding.
- Run `npm run build` before declaring done. It must exit 0.

Finish by:
1. Walking the phase file's Exit Criteria one by one and stating met / not met
   with the evidence (command output, file path, or what I must verify by hand).
2. Updating plan/PROGRESS.md in the same commit as the code: phase row, tool
   surface rows, blockers, and a new Session Log entry (append, never rewrite).
3. Checking off the phase file's Status boxes — `[x]` only if deployed,
   `[~]` with an inline reason if deliberately skipped, `[ ]` otherwise.
4. Listing anything only I can do (Netlify env, ChatGPT browser check, recording).

Do not mark anything `[x]` that is not deployed. Do not report done on a phase
whose exit criteria you have not each addressed.
```

---

## Phase Line Values

| `PHASE:` | Phase file | Cuttable |
|---|---|---|
| `0` | `phase-0-foundation.md` | no |
| `1` | `phase-1-shell-and-data.md` | no |
| `2` | `phase-2-trends.md` | no |
| `3` | `phase-3-product-knowledge.md` | no |
| `4` | `phase-4-brief-generator.md` | no |
| `5` | `phase-5-calendar-performance.md` | **yes, first cut** |
| `6` | `phase-6-polish-and-e2e.md` | partly |
| `7` | `phase-7-demo-and-submission.md` | no |

## Optional Suffixes

Append one line under `PHASE:` when needed. Otherwise leave it out.

```
MODE: plan-only      # produce the step plan + file list, write no code
MODE: resume         # phase partly done; finish only unmet exit criteria
MODE: verify         # write nothing, just audit exit criteria and report
CUT: analyze_trend   # skip a named item, record it as [~] with the reason
```

## Behind Schedule

Do not improvise a cut order. Paste this instead of guessing:

```
PHASE: 5

Behind schedule. Apply plan/README.md "The Cut Line" from the top and tell me
which items to cut to land Phase 7 on time, before doing any work.
```
