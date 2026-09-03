# TrendDashboard — Implementation Plan

Start here at the beginning of every working session. Read `PROGRESS.md`
first; it is the only file that tells you where you actually are.

## Directory Organization

| Path | Contents |
|------|----------|
| `PROGRESS.md` | **Session entry point.** Completion state, next task, blockers |
| `00-prd.md` | Problem, users, hypothesis, success criteria |
| `01-architecture.md` | System design, the tool catalog, deliberate scope reductions |
| `02-data-model.md` | Store shapes, state machines, tool contracts |
| `03-hackathon-compliance.md` | Rules traceability and submission requirements |
| `04-observability.md` | Trace IDs, the event log, debug tooling, testids |
| `phases/` | Phase-by-phase execution plans with exit criteria |
| `99-demo-script.md` | The demonstration narrative, shot by shot |
| `inputs/` | Fixtures, seed data notes, external references |

`../todo.md` at the repo root is a different thing: it is the pre-coding
decision checklist. Decisions live there; execution lives here.

## Progress Tracking Rules

Three checkbox states, and only three:

- `[ ]` — not done
- `[x]` — finished, committed, **and deployed**. Not "works on my machine."
- `[~]` — deliberately skipped, with the reason appended on the same line

**Update the plan in the same commit as the code.** A checkbox that lags behind
the implementation compounds: the next session trusts it, plans against it, and
loses an hour discovering it was wrong. In a ten-hour window that is ten percent
of the project.

`[x]` requires deployment because this is a hackathon with a live-URL
requirement. Code that is merged but not on the Netlify origin does not count
toward the submission and must not be marked complete.

## Phase Structure

Eight phases across the remaining window. Times are offsets from sprint start
(T+0 = 2026-09-03 17:51 WITA), not wall-clock, so a late start shifts
everything uniformly instead of silently eating the buffer.

| Phase | Scope | Window | Cuttable |
|-------|-------|--------|----------|
| 0 | Foundation: shell deployed, tool runtime live | T+0:00 → T+1:00 | no |
| 1 | Navigation, mock data layer, dashboard | T+1:00 → T+2:30 | no |
| 2 | Trends: table, search, filter, sort, detail | T+2:30 → T+4:00 | no |
| 3 | Product Knowledge CRUD | T+4:00 → T+5:00 | no |
| 4 | Brief generator and library | T+5:00 → T+6:30 | no |
| 5 | Calendar and Performance | T+6:30 → T+7:30 | **yes, first** |
| 6 | Tool-surface polish, a11y, manual E2E pass | T+7:30 → T+8:30 | partly |
| 7 | Demo video, README, Devpost submission | T+8:30 → T+10:00 | no |

Each phase file opens with a Status block. Exit criteria are written as things
you can observe, not things you can feel — "the agent registers 6 tools on the
Trends route and 0 elsewhere", not "trends work".

## The Cut Line

If the schedule slips, cut in this order and do not improvise a different order
under pressure:

1. Phase 5 entirely — Calendar, then Performance
2. Trend detail drawer — the table alone carries the demo
3. Brief duplicate and export
4. Dashboard charts — KPI cards alone are enough

**Never cut:** Phase 0 deployment, the Phase 2–4 tool registrations, and
Phase 7. The tools are the thing being judged; the submission is the thing that
makes any of it count.

## Execution Constraints

These are architectural boundaries, not preferences. Breaking one costs more
time than it saves.

- **The agent is the model.** The page never calls an LLM. It exposes context
  and accepts writes. There is no API key anywhere in this repo, ever.
- **Every agent-writable field is also hand-editable.** A judge who opens the
  live URL in a browser without WebMCP must see a working app, not a dead one.
- **Tool registration follows app state.** A tool that cannot be executed in
  the current view must not be on the surface. An agent seeing a tool it cannot
  usefully call is the failure mode this project exists to argue against.
- **Every tool returns structured data, never prose.** The agent writes the
  prose; the page supplies facts.
- **Tools that return user-authored text carry `untrustedContentHint`.** A
  product description is data an agent reads, never an instruction it follows.
- **Mutating tools carry `destructiveHint` and are idempotent where they can
  be.** An agent will retry.
- **Zero new dependencies.** Every install is a build risk with no time to
  absorb a failure.
- **`data-testid` goes on during the initial build**, not in a later pass. The
  later pass will not happen.
- **Every tool call logs a `traceId`.** See `04-observability.md`.
