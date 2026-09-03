# PROGRESS — TrendDashboard

**This is the session entry point. Read this before anything else.**

Last updated: 2026-09-03 22:40 WITA · by: Phase 4 build session (on branch `phase4`, out of order)

---

## Where We Are Right Now

| | |
|---|---|
| **Current phase** | Phase 1 — code complete, **not deployed**. Phase 0 also still open on deploy |
| **Sprint start (T+0)** | 2026-09-03 17:51 WITA |
| **Hard deadline** | 2026-09-04 04:00 WITA (13:00 PDT, 2026-09-03) |
| **Time remaining at last update** | 10h 05m |
| **Deployed URL** | none yet — BLOCKING |
| **Tools registered** | 2 of 21 planned (`get_app_state`, `navigate_to`), locally verified |

## Next Task

**Deploy.** This has not moved since the last session and it is now blocking two
phases instead of one. Phases 0 and 1 are both code-complete and both verified
on `localhost:4173`; neither can close because nothing is on a public origin.

Hosting is **Vercel**, wired to GitHub, so the deploy is a push:

```
git push origin main
```

Then, on the deployed origin: open it in the ChatGPT in-app browser and in
flagged Chrome and confirm the panel reads 2, `curl -X POST <url>/api/analyze -d
'{}'` and confirm a 503 JSON rather than a 404 or HTML, set `GEMINI_API_KEY` in
Vercel's project environment variables, redeploy, and curl again for a 200. Open
it once in a real private window. Record the URL in the table above and clear B2.

Phase 2 can be started against localhost without waiting — the Trends table does
not depend on the origin — but the deploy is still the highest-value thing you
can do with ten minutes, because every hour it stays unproven is an hour of
unbounded risk on the one requirement the submission cannot survive missing.

## Blockers

| # | Blocker | Owner | Phase | State |
|---|---------|-------|-------|-------|
| B1 | Devpost registration not confirmed | you | pre | **open** |
| B2 | No live URL | you | 0 | **open** |
| B3 | Stitch API key compromised (pasted in chat) — revoke before use | you | pre | **open** · no longer blocks design (MCP connector used, no key needed) but the key is still exposed |
| B4 | Screen recorder not tested | you | 7 | open |
| B5 | Repo still private | you | 7 | open |
| B6 | `GEMINI_API_KEY` not obtained (free tier, aistudio.google.com/apikey) | you | 0 | **open** |
| B8 | Vercel not confirmed on the hackathon's approved-hosting list — the plan recorded Netlify as approved | you | 0 | **open** |
| B7 | Clip corpus not yet copied from ClipBrief into `public/media/` | — | 0 | **closed** 2026-09-03 21:10 |
| B9 | No committed `cached` summaries for clip-backed trends — `02-data-model.md` asks for them but defines no `Trend` field to hold one | — | 2 | open |
| B10 | Phase 4 built on branch `phase4` ahead of Phases 2 & 3 — Trends/Products routes still `Pending.tsx`, brief cross-links land on placeholders, full surface-count picture incomplete until 2–3 land. Reconcile at merge | you | 4 | **open** |

B6 is Phase 0 work, not pre-work, and is not fatal: without it `analyze_trend`
serves the cached summary, which degrades rather than breaks. B7 is closed — the
12 clips and the generated `src/fixtures/clips.ts` are committed, and one poster
and one mp4 were served locally (200 `image/jpeg`, 206 `video/mp4`).

B1, B2 and B3 are the ones that can end the entry. B3 is a security issue, not
a schedule issue: the key is exposed regardless of whether Stitch gets used.

B9 is new and is not urgent: it only bites `analyze_trend`, which is itself the
pre-designated first cut inside Phase 2. Resolve it by adding two fields to
`Trend` in `02-data-model.md` first and then to the fixture — not the other way
round, or the type and the document drift on the one file that exists to stop
exactly that.

## Phase Completion

| Phase | Title | Window | State | Exit criteria met |
|-------|-------|--------|-------|-------------------|
| 0 | Foundation | T+0:00 → T+1:15 | `[ ]` | 3 / 8 · rest blocked on deploy |
| 1 | Shell and data layer | T+1:15 → T+2:45 | `[ ]` | 7 / 7 locally · 0 verified on a deployed origin |
| 2 | Trends | T+2:45 → T+4:15 | `[ ]` | 0 / 10 |
| 3 | Product Knowledge | T+4:15 → T+5:15 | `[ ]` | 0 / 5 |
| 4 | Brief generator | T+5:15 → T+6:45 | `[ ]` | 6 / 7 locally on branch `phase4` · criterion 2 needs a live agent · 0 deployed |
| 5 | Calendar and Performance | T+6:45 → T+7:45 | `[ ]` | 0 / 4 · **cuttable** |
| 6 | Polish and manual E2E | T+7:45 → T+8:30 | `[ ]` | 0 / 6 |
| 7 | Demo and submission | T+8:30 → T+10:00 | `[ ]` | 0 / 6 |

## Tool Surface Progress

The judged surface. 21 tools planned; see `01-architecture.md` for contracts.

| # | Tool | Scope | Phase | State |
|---|------|-------|-------|-------|
| 1 | `get_app_state` | global | 1 | `[ ]` written, registered, locally verified — not deployed |
| 2 | `navigate_to` | global | 1 | `[ ]` written, registered, locally verified — not deployed |
| 3 | `search_trends` | trends | 2 | `[ ]` |
| 4 | `filter_trends` | trends | 2 | `[ ]` |
| 5 | `sort_trends` | trends | 2 | `[ ]` |
| 6 | `list_visible_trends` | trends | 2 | `[ ]` |
| 7 | `open_trend` | trends | 2 | `[ ]` |
| 8 | `save_to_watchlist` | trends | 2 | `[ ]` |
| 9 | `get_trend_detail` | trend open | 2 | `[ ]` |
| 10 | `write_trend_summary` | trend open | 2 | `[ ]` |
| 11 | `play_clip` | trend open | 2 | `[ ]` |
| 12 | `analyze_trend` | trend open | 2 | `[ ]` cut first if Phase 2 slips |
| 13 | `list_products` | products | 3 | `[ ]` |
| 14 | `get_product` | products | 3 | `[ ]` |
| 15 | `create_product` | products | 3 | `[ ]` |
| 16 | `update_product` | product open | 3 | `[ ]` |
| 17 | `delete_product` | product open | 3 | `[ ]` |
| 18 | `get_brief_context` | brief composer | 4 | `[ ]` written, registered on selection, locally verified — not deployed |
| 19 | `save_brief` | brief composer | 4 | `[ ]` written, registered on selection, always lands `draft`, locally verified — not deployed |
| 20 | `search_briefs` | briefs | 4 | `[ ]` written, registered on briefs route, locally verified — not deployed |
| 21 | `update_brief_status` | briefs | 4 | `[ ]` written, registered on briefs route, status machine enforced, locally verified — not deployed |
| 22 | `schedule_brief` | calendar | 5 | `[ ]` cuttable |
| 23 | `list_schedule` | calendar | 5 | `[ ]` cuttable |

## Submission Checklist

The four required artifacts. All four, or the entry does not count.

- [ ] Live URL, verified in ChatGPT in-app browser
- [ ] Live URL, verified in Chrome 149+ with the testing flag
- [ ] Live URL, tools reachable by Claude via `window.__td` — *not a rules
      requirement; does not substitute for either line above*
- [ ] Public repo with visible open-source licence
- [ ] Demo video under 3:00 with audio, public on YouTube
- [ ] Text description: WebMCP fit, UX gain, human–agent collaboration
- [ ] Devpost form submitted by **T+9:30**, not at the deadline

## Session Log

Append one entry per working session. Never rewrite an earlier entry — a wrong
prediction that was later corrected is more useful than a tidy history.

### 2026-09-03 17:51 WITA — planning

Discovered the deadline is 10h out, not 13 days. Rebuilt the plan as a
ten-hour sprint. Froze scope: Product Knowledge, search/filter/sort, brief
generation and trend summaries are real; scraping and account analytics are
seeded fixtures with visible `demo data` badges.

Settled the central architecture question: the page does not call an LLM. It
exposes `get_brief_context` and accepts `save_brief`, and the connected agent
composes the brief. No API key, no backend, no hosting cost, and a much better
answer to "why WebMCP" than a static site phoning an LLM would be.

Repo state at handoff: React 19 + Vite scaffold, Vite starter page still in
`App.tsx`, and a complete WebMCP layer already written under `src/webmcp/` —
`useTool`, `useTools`, `useToolSurface`, `ToolSurfacePanel`,
`UnsupportedBrowserNotice`. Phase 0 is therefore mostly deployment, not
plumbing.

### 2026-09-03 19:50 WITA — corpus and model-path revision

Reversed one central decision and tightened another.

**Reversed:** the page may now call a model, in exactly one place. A Netlify
Function at `/api/analyze` backs a new tool, `analyze_trend`, so a judge with no
agent connected still watches an analysis appear rather than reading a note
about what the field is waiting for. The brief generator was explicitly kept off
this path — `save_brief` stays agent-only, because a page that writes its own
briefs and also exposes `save_brief` is the failure the original decision named,
and that argument still holds. Three tiers: agent, live model, committed
fallback. Nothing is ever a dead button.

**Added:** a real clip corpus. 12 cc0 clips copied from
github.com/aliefauzan/ClipBrief — same author, self-generated with TTS over
generated footage, no third-party media, 8.8MB. Trend detail now plays video,
`get_trend_detail` returns full transcripts, and a new `play_clip` tool lets the
agent start the video the human is watching. That last one is a one-second proof
that both parties are on the same surface, and it was nearly free.

**Tightened:** two badges instead of one. `demo data` on invented numbers
(volume, growth, engagement, all analytics); `measured` on clip signals derived
from the encoded files by a committed script. The one-badge version made a
mocked dashboard read as a mockup; the two-badge version makes the fiction
legible and bounded. The corpus has no view or like counts at all, because a
video that was never published cannot have them.

Tool count 19 → 21. Phase 0 widened by 15 minutes for the corpus copy and a
function smoke test, taken out of Phase 6. `analyze_trend` is pre-designated as
the first cut inside Phase 2 if that phase slips — the demo is recorded on the
agent path, which needs no key and no function.

New blockers: B6 (Gemini free-tier key) and B7 (corpus copy). Neither is fatal;
both degrade to a working app.

### 2026-09-03 21:10 WITA — Phase 0 build

Everything Phase 0 asks for in code is written and verified locally. Nothing is
deployed, so no box is `[x]` and the phase is not closed.

**Built.** `App.tsx` stripped to a shell — header, inert nav, main slot — with
`UnsupportedBrowserNotice` at the top and `ToolSurfacePanel` at the root.
`get_app_state` registers and returns the contract shape from `02-data-model.md`
with zeroed counts; the shape is the contract and does not change when Phase 1
makes the numbers real. `src/tools/trace.ts` wraps every executor centrally: a
`traceId` per call, the `[webmcp]` console line, and the 200-entry `td:events`
ring buffer, so the observability layer is in from the first tool rather than
retrofitted at hour seven.

**Corpus.** 12 clips, 30 files, 8.8MB copied from ClipBrief into `public/media/`,
and `src/fixtures/clips.ts` generated by a committed script
(`scripts/generate-clips.mjs`) rather than hand-written, so the fixture can be
rebuilt instead of maintained. Category remap holds: 4 beauty, 3 food, 3 fitness,
2 tech; 6 of 12 carry captions. B7 closed.

**Function.** `netlify/functions/analyze.ts`, Netlify Functions v2, no SDK. Its
five paths were driven directly in Node — no key → 503 `llm_unavailable` with the
`write_trend_summary` hint; GET → 405; provider unreachable → 502; 429 →
`llm_rate_limited`; happy path → 200 with `source: 'model'`. Routed twice on
purpose, by `config.path` and by a toml redirect above the SPA catch-all, because
a 404 discovered in Phase 2 costs more than a duplicated route now.

**Reversed, on your instruction.** The function briefly had two providers,
Anthropic and Gemini. It is Gemini only again. One key, one path, one thing to
configure in the Netlify UI.

**Added, on your instruction — the bridge.** `document.modelContext` ships
enabled in one browser, which meant Claude had no way to reach this app at all.
So `useTool` now registers each spec twice: into `modelContext` where it exists,
and always into a local registry at `window.__td`. Same names, same schemas, the
same `execute` closure, the same trace wrapper — one definition and two doors, so
they cannot drift. Verified end to end in a plain browser: `listTools()` returns
`get_app_state`, `callTool` returns the payload with its `_trace`, and an unknown
name comes back as `{ ok: false, reason, known: [...] }` rather than a throw.

This is not a WebMCP implementation and the docs say so in three places. It does
not satisfy compliance requirements 1 or 2, and must never be reported as if it
did. It pays for itself twice anyway: the panel renders the bridge registry when
WebMCP is off, so a judge in ordinary Chrome sees the real surface instead of an
empty box, and Phase 6's E2E pass can drive every tool without a flagged browser.

**Prediction to check later:** the riskiest thing in this commit is the double
routing on `/api/analyze`. If Netlify resolves `config.path` and the toml
redirect differently the endpoint could 404 despite both, and that is exactly the
failure the phase file says to find now rather than in Phase 2. Curl it the
moment the deploy is up.

`npm run build` exits 0. `npx oxlint` exits 0 — four warnings, all pre-existing
in `src/webmcp/`, which the phase file says not to rewrite.

### 2026-09-03 21:25 WITA — host changed to Vercel

Netlify out, Vercel in, deployed from GitHub. The push is the deploy.

**Moved.** `netlify/functions/analyze.ts` → `api/analyze.ts`; `netlify.toml` →
`vercel.json`. Not one line of the handler's logic changed, because it was
written against web-standard `Request`/`Response` with no SDK and no imports —
the constraint that was there to avoid a dependency turned out to be what made
the host swap free. Re-drove all five paths in Node after the move: unchanged.

**Simpler in one way.** The routing risk flagged in the last entry is gone.
Netlify needed the endpoint declared twice, by `config.path` and by a toml
redirect ordered above the SPA catch-all, and a disagreement between them would
have surfaced as a 404 in Phase 2. On Vercel the path is the file path, and the
SPA rewrite is a single rule that excludes `/api/`. One less thing that can be
wrong on an origin nobody has looked at yet.

**Newly at risk.** `plan/03-hackathon-compliance.md` recorded Netlify as an
approved host and named its $500 sponsor prize. Changing host drops that prize
and re-opens the approval question, which is now **B8** and is not a detail to
discover on the submission form. If Vercel turns out not to be approved, the
port back is the same two moves in reverse and the handler again moves unchanged.

**Checkboxes swept**, at your ask. Everything Phase 0 built is still `[ ]`,
because `plan/README.md` defines `[x]` as deployed and nothing is deployed —
each box now carries an inline note saying whether it is code-complete or waiting
on you. What did move: three media-provenance boxes in the compliance file are
`[x]` (README credits ClipBrief, `sourceNote` renders beside the player,
per-clip `cc0` recorded), the no-secret-in-the-bundle constraint is `[x]` — the
built bundle greps clean for `GEMINI`, `AIza` and `apiKey` — and the README
rewrite is `[x]` in `todo.md`. The `data-testid` line is annotated rather than
checked: on for everything built so far, not for components that do not exist.

Session log entries above this one still say Netlify. They are left alone on
purpose — a superseded decision with its reasoning intact is worth more than a
tidy history, and the reasoning in the corpus-revision entry is what made this
swap cheap.

### 2026-09-03 21:45 WITA — Phase 1 build

Router, five stores, three fixtures, the dashboard and the second global tool.
All seven exit criteria pass on `localhost:4173`. Nothing is deployed, so no box
is `[x]` and the phase is not closed — the same wall Phase 0 is still sitting
against, now with two phases behind it.

**Router.** `src/store/router.ts` — one reducer over `location.hash` plus the
three selection fields, at module level rather than inside a component. That
placement is the whole design: `plan/01-architecture.md` requires executors to
read current state without going through render scope, because an agent can call
a tool between a render and its commit. A `useReducer` inside `App` would have
satisfied the task line and broken the constraint. `navigate()` writes the hash
after dispatching, so a hash typed by hand and a `navigate_to` call from an agent
take the identical path through the same reducer — there is no second code path
that could disagree with the first.

**Stores.** `createStore` over `useSyncExternalStore`, one module per store, each
exposing a plain `read()` alongside the hook. Same reason. Every read and write
is wrapped in try/catch: a private window with storage disabled has to degrade to
an in-memory app rather than a white screen, and that is a real judging
environment.

**Fixtures.** 24 trends across four platforms and all six categories, growth from
-12% to +680%, 14-point spike series shaped so a +680% trend actually draws a
hockey stick and a -12% one drifts down — a sparkline that contradicts the number
beside it makes the whole dashboard read as noise. All 12 clips are referenced,
`fashion` and `finance` carry none by design, and the trend store asserts at seed
time that every `clipId` resolves. 4 products; `prd_sudut` is deliberately the
wrong product for the top trend, so the demo has a moment where the agent can
decline an angle. 30 days of analytics with a weekday/weekend rhythm and an
evening posting peak.

**Badges.** Amber `demo data`, teal `measured`, different words and visibly
different colour. Placed per section rather than per figure: a badge repeated
eleven times inside one card stops being read, and the claim being made is about
the whole card. The dashboard carries three `demo data` and the corpus panel one
`measured`.

**Tools.** `navigate_to` joins `get_app_state`, both registered unconditionally
at the root. Neither takes state as an argument — they read the stores directly.
`navigate_to` validates its own input and returns `{ ok: false, reason, known }`
for a bad route rather than throwing, because the schema is a hint to the agent,
not a guarantee about what arrives.

**Verified on `localhost:4173`, through `window.__td`.** All six routes by
`navigate_to` and by typed hash, with the on-screen `route-*` testid, the hash
and `get_app_state().route` agreeing every time; surface count exactly 2 on all
six; a bad route rejected with the six known names; hard reload preserving a
hand-edited product and a planted brief while `td:trends` stayed byte-identical;
cleared storage reseeding to a byte-identical fixture and a populated dashboard;
all 24 media files behind the referenced clips returning 200. `npm run build`
exits 0. `npx oxlint` exits 0 with the same four pre-existing warnings in
`src/webmcp/`, which the phase files say not to rewrite.

**Deferred, and it is a contract question rather than a shortcut.**
`02-data-model.md` § Seed Data asks for one committed summary per clip-backed
trend, for `analyze_trend`'s no-key fallback. The `Trend` interface in that same
document has no field to put it in — `aiSummary` is the live field and correctly
starts `null`. Inventing `cachedSummary` here would have put a field in the code
that the data model does not describe, which is the exact drift `src/types.ts`
opens by promising not to do. Logged as B9, to be fixed in the document first.

**Phase 0 scaffolding kept.** The clip player moved to
`src/routes/CorpusCheck.tsx` and still renders under the dashboard, because Phase
0's sixth exit criterion — a poster and an mp4 loading from the *deployed*
origin — has not been checked yet and that panel is how it gets checked. Phase 2
replaces it with the real drawer.

**Prediction to check later:** `ToolSurfacePanel` is fixed to the right edge and
at an 800px viewport it covers the fourth KPI card. Harmless on a wide screen and
invisible in the demo, but a judge on a laptop will see a clipped card. It is a
Phase 6 polish item and it is written down here so Phase 6 does not have to
rediscover it — the panel itself is not to be rewritten during the sprint.

### 2026-09-03 22:05 WITA — design source settled, on your instruction

`todo.md` §7 has been carrying an undecided question since planning: Stitch
screens or hand-built CSS. Decided: Stitch, and it cost about twenty minutes.

**The key question dissolved.** The plan assumed Stitch meant an API key, which
is why B3 sat on the critical path. It does not — Stitch has an MCP connector,
already authorised in this session, so no key was needed, none was requested and
none is in the repo. **B3 does not close.** The previously pasted key is exposed
whether or not this project ever used it, and reaching Stitch by a different door
is not revocation.

**What was made.** A Stitch project and a design system, *TrendDashboard Dark* —
dark, Inter, 8px radii, seeded from `#aa3bff` with `#16171d` pinned as the
neutral, and a design brief in `designMd` carrying the constraints that actually
matter here: no component library, no icon font, hand-rolled SVG charts, a
reserved right-hand gutter for the inspector, and the two badge colours spelled
out. A Dashboard screen was generated from it, describing the real Phase 1
layout card by card rather than a generic dashboard.

**What landed in the repo is the token set, not the markup.** Stitch emits
Tailwind and `plan/README.md` forbids new runtime dependencies, so the hex values
the Stitch API resolved were transcribed into custom properties at the top of
`src/index.css` and every rule in `App.css` now references those — the file names
no colour of its own. Page `#0d0e14`, cards `#181921`, inner tiles `#1d1f29`,
text `#a9aab8` over `#e4e4f4`, accent `#c890ff`. The layout was hand-built
against the generated screen.

**Two departures from the design system, both deliberate.** It is dark-only, so
the `prefers-color-scheme` fork is gone and the page declares `color-scheme:
dark` — keeping the fork would have meant inventing a light palette Stitch never
produced and shipping a second look nobody has looked at. And Inter is requested
in the font stack but never fetched: a font CDN would put a third-party request
on the critical path of a page a judge opens once on an unknown connection.

**Free win.** `ToolSurfacePanel` styles itself through `var(--panel-bg, …)`
fallbacks, so defining `--panel-bg`, `--panel-fg` and `--panel-line` in
`index.css` pulled the inspector into the same palette without editing a file the
sprint rules say not to touch. That was the stated goal of the `todo.md` line
about the panel not looking bolted on, and it turned out to be three
declarations.

**Prediction from the last entry, closed.** The panel overlapping the fourth KPI
card is fixed rather than deferred to Phase 6 — the Stitch brief had already
called for a 300px right-hand gutter, so `.app-main` takes 312px of right padding
in the 1025–1680px band where the overlap actually occurs. Verified at 1280px:
no card rectangle intersects the panel rectangle, and all four KPI cards are
visible.

Verified after the change: computed styles match the transcribed tokens on the
card, tile, both badges, the nav and the panel; `get_app_state` and `navigate_to`
still register and answer, surface count still 2. `npm run build` exits 0.
`npx oxlint` exits 0 with the same four pre-existing `src/webmcp/` warnings.

README gained a Design section recording the provenance, alongside the existing
one for the media corpus. Its status line moved to Phase 1.

### 2026-09-03 22:40 WITA — Phase 4 build, out of order on branch `phase4`

Ran Phase 4 in full on branch `phase4` (cut from the `phase 1` commit) on the
user's instruction to build everything Phase 4 can do now and reconcile at
merge, rather than run Phases 2 and 3 first. Phases 2 and 3 are still 0/n and
their routes are still `Pending.tsx`. This is logged as **B10** and it is a real
gap, not a papered-over one — the surface-count story is only complete once
2–3 register their own tools, and the brief cross-links currently land on the
placeholders. Nothing here is deployed, so no box is `[x]`.

**Why it stands alone.** The composer reads the trend and product *stores*
directly — both seeded in Phase 1 — not the Trends or Products routes. So it
needed nothing from the missing phases: two `<select>` pickers over the stores,
and the same `useTool` plumbing Phase 0/1 already ship. No new runtime
dependency; `npm run build` and `npx oxlint` unchanged (build exits 0, oxlint
0 errors with the same four pre-existing `src/webmcp/` warnings, none in new
files).

**Built.** Four tools in `src/tools/briefs.ts`, in two scopes that answer to two
different pieces of state exactly as `02-data-model.md` § Tool surface draws it:
`get_brief_context` + `save_brief` guarded on *selection* (registered at the App
root so they survive navigating to Products mid-composition), `search_briefs` +
`update_brief_status` guarded on the briefs *route*. The status machine and the
draft-only write live in `src/store/briefs.ts`, shared by the tool executors and
the UI so the human control and the agent tool cannot disagree about a legal
transition. `src/routes/Briefs.tsx` is the composer (two pickers, a fully
hand-editable form, human Save) and the library (search/status/platform filters,
status control, `authoredBy` chip). Added `PLATFORMS`/`isPlatform` and
`BRIEF_STATUSES`/`isBriefStatus` to `types.ts`, mirroring the existing `ROUTES`
pattern.

**Contract note resolved.** `02-data-model.md` § Tool surface reads
`route=briefs → 2 tools + 2 global (+1 when a brief is open)`, but the document
defines only four brief tools and no fifth for an open brief. Rather than invent
a tool with no contract, both library tools register on the route (surface 4 on
briefs with nothing selected), and the status control is a plain human control
that needs no open-gated tool. Flagged here so a later pass either adds the
missing contract or strikes the `+1`.

**Verified on `localhost:5173` through `window.__td`.** Surface 4 on the briefs
route with no selection; 6 the instant both pickers are set (adds
`get_brief_context`, `save_brief`); still 6 after `navigate_to products`
mid-composition; back to 4 the instant either is deselected. `get_brief_context`
returns the full trend, the full product (USP and a 3-item do-not list),
`platform`, and `existingBriefs` for the pair. `save_brief` with
`status:'published'` injected landed a `draft`. The status machine passed every
legal move including `approved→draft` revise, and rejected `published→draft`
with `{ ok:false, currentStatus:'published' }` and an unknown id with a `known`
list. A human filled every field with no agent and saved a `human`/`draft`
brief that appeared in the library without a reload, its `authoredBy` chip
visibly distinct from the agent-written one. Every tool result carried its
`_trace`. Screenshots came back blank (a Browser-pane capture quirk — viewport
0×0, no console errors), so the run was verified with `get_page_text` and the
bridge, which is the text-first path the tooling prefers anyway.

**The one criterion not machine-checkable here:** exit criterion 2 — "an agent
given only *write me a brief for this* produces a brief that references the
product's USP and respects its do-not list." The page's half is verified
(`get_brief_context` hands over `usp` and `donts`); the agent's half needs a
real connected agent and is a manual check for the demo pass.
