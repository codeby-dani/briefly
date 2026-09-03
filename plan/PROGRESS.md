# PROGRESS — TrendDashboard

**This is the session entry point. Read this before anything else.**

Last updated: 2026-09-03 22:40 WITA · by: Phase 2 build session, then a `todo.md` sweep

---

## Where We Are Right Now

| | |
|---|---|
| **Current phase** | Phase 2 — code complete, **not deployed**. Phases 0 and 1 also still open on deploy |
| **Sprint start (T+0)** | 2026-09-03 17:51 WITA |
| **Hard deadline** | 2026-09-04 04:00 WITA (13:00 PDT, 2026-09-03) |
| **Time remaining at last update** | 5h 25m |
| **Deployed URL** | none yet — BLOCKING |
| **Tools registered** | 12 of 21 planned — the 2 global plus all 10 on Trends, locally verified |

## Next Task

**Deploy.** Unchanged, and now blocking three phases instead of two. Phases 0, 1
and 2 are all code-complete and all verified on `localhost:4173`; none can close
because nothing is on a public origin.

Hosting is **Vercel**, wired to GitHub, so the deploy is a push:

```
git push origin main
```

Then, on the deployed origin: open it in the ChatGPT in-app browser and in
flagged Chrome, confirm the panel reads 2 on the dashboard and **12 with a trend
open on `#/trends`**, `curl -X POST <url>/api/analyze -d '{}'` and confirm a 503
JSON rather than a 404 or HTML, set `GEMINI_API_KEY` in Vercel's project
environment variables, redeploy, and curl again for a 200. Open it once in a
real private window. Record the URL in the table above and clear B2.

Phase 0's sixth exit criterion — a poster and an mp4 loading from the deployed
origin — is now checked by opening any clip-backed trend rather than by the
dashboard panel that used to do it: Phase 2 replaced that panel with the real
drawer, as its phase file instructs.

Phase 3 (Product Knowledge CRUD) can be started against localhost without
waiting. The deploy is still the highest-value ten minutes available.

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
| B9 | No committed `cached` summaries for clip-backed trends — `02-data-model.md` asks for them but defines no `Trend` field to hold one | — | 2 | **closed** 2026-09-03 22:35 |

B6 is Phase 0 work, not pre-work, and is not fatal: without it `analyze_trend`
serves the cached summary, which degrades rather than breaks — and as of Phase 2
that path is built, committed and verified, so the degradation is a tested
branch rather than a plan. B7 is closed — the
12 clips and the generated `src/fixtures/clips.ts` are committed, and one poster
and one mp4 were served locally (200 `image/jpeg`, 206 `video/mp4`).

B1, B2 and B3 are the ones that can end the entry. B3 is a security issue, not
a schedule issue: the key is exposed regardless of whether Stitch gets used.

B9 is closed. It was resolved document-first as prescribed: `02-data-model.md`
gained a `CachedAnalysis` record and a `Trend.cached` field, then `src/types.ts`,
then the fixture. One nested record rather than the two loose fields the last
entry predicted — the summary, the angles, the model id and the date have to
travel together, and splitting them is how a cached summary ends up on screen
with no date beside it. `SCHEMA_VERSION` moved 1 → 2 so a warm `localStorage`
reseeds instead of serving trends with no `cached` field.

## Phase Completion

| Phase | Title | Window | State | Exit criteria met |
|-------|-------|--------|-------|-------------------|
| 0 | Foundation | T+0:00 → T+1:15 | `[ ]` | 3 / 8 · rest blocked on deploy |
| 1 | Shell and data layer | T+1:15 → T+2:45 | `[ ]` | 7 / 7 locally · 0 verified on a deployed origin |
| 2 | Trends | T+2:45 → T+4:15 | `[ ]` | 10 / 10 locally · 0 verified on a deployed origin |
| 3 | Product Knowledge | T+4:15 → T+5:15 | `[ ]` | 0 / 5 |
| 4 | Brief generator | T+5:15 → T+6:45 | `[ ]` | 0 / 7 |
| 5 | Calendar and Performance | T+6:45 → T+7:45 | `[ ]` | 0 / 4 · **cuttable** |
| 6 | Polish and manual E2E | T+7:45 → T+8:30 | `[ ]` | 0 / 6 |
| 7 | Demo and submission | T+8:30 → T+10:00 | `[ ]` | 0 / 6 |

## Tool Surface Progress

The judged surface. 21 tools planned; see `01-architecture.md` for contracts.

| # | Tool | Scope | Phase | State |
|---|------|-------|-------|-------|
| 1 | `get_app_state` | global | 1 | `[ ]` written, registered, locally verified — not deployed |
| 2 | `navigate_to` | global | 1 | `[ ]` written, registered, locally verified — not deployed |
| 3 | `search_trends` | trends | 2 | `[ ]` written, registered, locally verified — not deployed |
| 4 | `filter_trends` | trends | 2 | `[ ]` written, registered, locally verified — not deployed |
| 5 | `sort_trends` | trends | 2 | `[ ]` written, registered, locally verified — not deployed |
| 6 | `list_visible_trends` | trends | 2 | `[ ]` written, registered, locally verified — not deployed |
| 7 | `open_trend` | trends | 2 | `[ ]` written, registered, locally verified — not deployed |
| 8 | `save_to_watchlist` | trends | 2 | `[ ]` written, registered, locally verified — not deployed |
| 9 | `get_trend_detail` | trend open | 2 | `[ ]` written, registered, locally verified — not deployed |
| 10 | `write_trend_summary` | trend open | 2 | `[ ]` written, registered, locally verified — not deployed |
| 11 | `play_clip` | trend open | 2 | `[ ]` written, registered, locally verified — not deployed |
| 12 | `analyze_trend` | trend open | 2 | `[ ]` written, registered — `cached` path locally verified; `model` path needs the deployed function and B6 |
| 13 | `list_products` | products | 3 | `[ ]` |
| 14 | `get_product` | products | 3 | `[ ]` |
| 15 | `create_product` | products | 3 | `[ ]` |
| 16 | `update_product` | product open | 3 | `[ ]` |
| 17 | `delete_product` | product open | 3 | `[ ]` |
| 18 | `get_brief_context` | brief composer | 4 | `[ ]` |
| 19 | `save_brief` | brief composer | 4 | `[ ]` |
| 20 | `search_briefs` | briefs | 4 | `[ ]` |
| 21 | `update_brief_status` | brief open | 4 | `[ ]` |
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

### 2026-09-03 22:35 WITA — Phase 2 build

Ten tools, the table, the controls and the drawer. All ten exit criteria pass on
`localhost:4173`. Nothing is deployed, so no box is `[x]` and the phase is not
closed — the same wall Phases 0 and 1 are sitting against, now with three phases
behind it.

**B9 closed, document first.** `02-data-model.md` gained `CachedAnalysis` and
`Trend.cached`, then `src/types.ts`, then the fixture — the order the last entry
prescribed, and the reason for it held: writing the field into the code first
would have put a shape in `types.ts` the data model does not describe. One
nested record, not the two loose fields predicted: the summary, the angles, the
model id and the date have to travel together, and splitting them is exactly how
a cached summary reaches the screen with no date beside it. `SCHEMA_VERSION`
moved 1 → 2 so a warm `localStorage` reseeds rather than serving trends with no
`cached` field.

**The cached summaries are not Gemini's, and the fixture says so.** The document
asked for them to be written by the same model the live path uses. B6 is open,
so there was no key, and stamping a Gemini model id on text Gemini never wrote is
precisely the dishonesty the `cached` label exists to prevent. They were written
by `claude-opus-5` from the clip transcripts, `Trend.cached.model` carries that
string, and the drawer renders it verbatim: a judge reads *"committed fallback —
not generated just now · claude-opus-5, 2026-09-03"*. The document was amended to
record this rather than left to disagree with the fixture. Twelve summaries for
the twelve clip-backed trends; the other twelve have `cached: null` and
`analyze_trend` reports the failure on them instead of inventing a paragraph.

**Registration is split on purpose.** The six route tools go through one
`useTools`; the four detail tools are four separate `useTool(open ? spec : null)`
calls. Bundling all ten into one call would tear the whole set down and rebuild
it every time the drawer opens, and the inspector would show ten tools churning
where the truth is four arriving. Exit criterion 5 is the most valuable shot in
the video, so it has to be honest: measured, closing the drawer removes exactly
`get_trend_detail`, `write_trend_summary`, `play_clip`, `analyze_trend` and adds
nothing, and the console walks 12 → 8 one line at a time.

**One selector, not two.** `visibleTrends()` in `store/trendView.ts` is what the
table renders from *and* what `list_visible_trends`, `filter_trends`,
`search_trends` and `get_app_state` answer with. If the tool and the table each
computed the visible set, they would eventually disagree, and they would disagree
on camera. View state is deliberately not persisted and has no `td:` key — the
data model lists every key this app owns, and a filter surviving a reload is a
judge opening the live URL to an inexplicably empty table.

**`play_clip` writes an intent, not a DOM reference.** `store/player.ts` holds
`{ clipId, seekS, playToken }`; the player component obeys it, and the human's
click on a clip chip goes through the same store. `playToken` exists because
"play the clip already selected" has to be a distinguishable event, or a second
call from the agent changes nothing observable and the agent has correctly called
a tool that did nothing.

**The drawer is inline, not an overlay.** `ToolSurfacePanel` is fixed to the
right edge, and the shot this phase exists for is four tools leaving that panel.
A drawer sliding over the panel would cover the thing it is there to prove.
Measured at 1280px: no card, row, field or the video intersects the panel
rectangle.

**Two departures worth recording.** The Phase 0 `CorpusCheck` panel is gone from
the dashboard, as the phase file instructs — Phase 0's sixth exit criterion is now
checked by opening any clip-backed trend, and all 24 media files behind the 12
referenced clips return 200 locally (`video/mp4`, `image/jpeg`, and `text/vtt` on
the six with captions). And `filter_trends({})` resets its own five fields but
does not clear the search term or the watchlist toggle, because those belong to
`search_trends` and to a UI control; both are reported in `activeFilters`
regardless, so an agent looking at a short list can see why it is short.

**Verified on `localhost:4173`, through `window.__td`.** Surface 8 / 12 / 2;
exactly four removed on close with nothing re-registered; `filter_trends` +
`sort_trends` moving the on-screen selects and producing a DOM row order
identical to `list_visible_trends`, `count` 2 against `total` 24;
`write_trend_summary` rendering without a reload and labelling itself `agent`;
`save_to_watchlist` twice → `alreadyPresent: true`, one entry in `td:watchlist`;
`play_clip` starting the right video at the second asked for, refusing a clip
from another trend and an unknown id with named reasons and the known list, and
clamping `seekS: 9999` to the measured 21.4s; `analyze_trend` degrading to
`cached` with the provenance on screen; a clipless `fashion` trend opening,
rendering, summarising and analysing with no player and no console error; every
badge in its own section head, none carrying both. `npm run build` exits 0.
`npx oxlint src api scripts` exits 0 with the same four pre-existing warnings in
`src/webmcp/`, which the phase files say not to rewrite.

**Fixed rather than deferred.** At 375px the six-column grid overflowed the
viewport by 105px — a horizontally scrolling page reads as broken long before
anyone works out which column did it. The row folds to two lines below 720px and
the date column drops, since it is already in the row's own subtitle. Re-measured
at 375, 860 and 1280: `scrollWidth === clientWidth` at all three.

**Prediction to check later:** `analyze_trend`'s `model` path is the only thing
in this phase that has never run. Locally there is no function, so every call
takes the 404 → `cached` branch; the 503 → `cached` branch and the 200 → `model`
branch are reasoned from the handler's code, not observed. The first real test is
the deploy, and the honest expectation is that `cached` works on the live origin
and `model` needs B6 cleared before anyone can say it works at all.
