# Phase 1 — Shell and Data Layer

**Window:** T+1:15 → T+2:45 · **Cuttable:** no

## Status

- [x] Hash router with six routes — **driven on the deployed origin** 2026-09-03 22:50: all six reached by `navigate_to`, each agreeing with its on-screen `route-*` testid
- [x] Stores implemented with `localStorage` persistence — **verified on the deployed origin**: `td:trends`, `td:products`, `td:briefs`, `td:watchlist`, `td:analytics`, `td:version`, `td:events` all present
- [x] Fixtures seeded on first run — **verified on the deployed origin**: 24 trends and 4 products from a cold seed
- [x] Dashboard route renders KPI cards and recent briefs — **verified on the deployed origin**
- [x] `get_app_state` and `navigate_to` registered globally — **verified on the deployed origin**: surface is exactly 2 on every route that has no route tools, and `get_app_state().route` tracks the hash
- [x] `demo data` badge component, used on every invented value — **verified on the deployed origin**, four instances on the dashboard
- [x] `measured` badge component, used on every clip signal — **verified on the deployed origin**, three instances
- [ ] `clips.ts` wired: every trend's `clipIds` resolve to a real clip — media returns `200` / `206` from the deployed origin and playback runs locally, but the drawer that plays it is not on the deployed bundle yet

Seven of eight are now closed against the public origin — this is the first
phase to have any. The eighth waits on the same deploy everything else does.

**Note on exit criterion 6**, "tool surface count is exactly 2 on every route":
that was written when Phase 1 was the whole app, and Phases 2–4 have since
deliberately added route-scoped tools. Read it as *2 on every route with no
route-scoped tools of its own* — dashboard, calendar and performance. The
current reference counts are 2 / 8 / 5 / 4 / 2 / 2 across the six routes.

**Deferred out of this phase, on purpose:** `plan/02-data-model.md` § Seed Data
asks for "one committed summary per clip-backed trend", used as the `cached`
fallback when `analyze_trend` runs without a key. There is no field on `Trend`
for it in that document's type — `aiSummary` is the live field and starts
`null` — so writing one now would mean inventing a contract the plan does not
define. It moves to Phase 2 alongside the tool that consumes it. Tracked as B9.

## Tasks

1. **Router.** A `useReducer` over `location.hash`, six routes. No library.
   Selection state (`selectedTrendId`, `selectedProductId`, `openBriefId`)
   lives in the same reducer, because the tool guards read it.
2. **Stores.** One module per store in `src/store/`, each exposing a hook plus
   a non-React read function. Executors call the read function — never
   render-scope state — so an agent calling faster than React commits gets a
   consistent read.
3. **Fixtures.** Write `src/fixtures/trends.ts`, `products.ts`, `analytics.ts`
   per the counts in `02-data-model.md`. Seed on missing or stale `td:version`.
   `clips.ts` already exists from Phase 0 — it is a static import, not a store,
   and it is never seeded or reseeded. Populate `Trend.clipIds` against it and
   assert at seed time that every id resolves; a dangling clip id surfaces as a
   blank player in Phase 2 and is expensive to trace back from there.
4. **Badges.** Two components, and the distinction is not cosmetic:
   `DemoBadge` (`data-testid="demo-badge"`) wherever `demo: true` data is
   displayed, `MeasuredBadge` (`data-testid="measured-badge"`) wherever a
   `ClipSignals` field is. See the two-badge table in `02-data-model.md`.
   Give them visibly different colour and wording — if a viewer has to read
   carefully to tell them apart, they do no work.
5. **Dashboard.** Four KPI cards (badged), a 7/30-day toggle over a hand-rolled
   SVG line, top-5 trending list with a "Generate Brief" action, and recent
   briefs with status chips.
6. **Global tools.** `get_app_state` and `navigate_to`, registered
   unconditionally at the app root via `useTools`.

## Exit Criteria

1. All six routes reachable by hash, and by `navigate_to` from an agent.
2. `get_app_state` returns a route that matches what is on screen.
3. A hard reload preserves products and briefs; trends reseed identically.
4. A private window seeds cleanly and shows a populated dashboard.
5. Every invented number on the dashboard sits next to a `demo data` badge.
6. Tool surface count is exactly 2 on every route.
7. Every `Trend.clipIds` entry resolves to a clip in `clips.ts`, and every clip
   file it names exists in `public/media/`.

## Notes

The dashboard is the landing route and therefore the first thing a judge sees.
It is worth the extra fifteen minutes to make it look finished — but not worth
the extra hour. If the chart fights you, ship the KPI cards and the lists.
