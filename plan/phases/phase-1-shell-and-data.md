# Phase 1 — Shell and Data Layer

**Window:** T+1:15 → T+2:45 · **Cuttable:** no

## Status

- [ ] Hash router with six routes — deployed bundle contains the router; deployed browser E2E pending
- [ ] Stores implemented with `localStorage` persistence — deployed; cold-browser persistence check pending
- [ ] Fixtures seeded on first run — deployed; cold-browser seed check pending
- [ ] Dashboard route renders KPI cards and recent briefs — deployed; browser visual check pending
- [ ] `get_app_state` and `navigate_to` registered globally — both are in the deployed bundle; WebMCP browser check pending
- [ ] `demo data` badge component, used on every invented value — deployed; visual audit pending
- [ ] `measured` badge component, used on every clip signal — deployed; visual audit pending
- [ ] `clips.ts` wired: every trend's `clipIds` resolve to a real clip — deployed media verified; browser playback check pending

The code is deployed, but these boxes remain open until the browser-level exit
criteria are repeated against the public origin.

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
