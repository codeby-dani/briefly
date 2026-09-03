# Phase 1 — Shell and Data Layer

**Window:** T+1:00 → T+2:30 · **Cuttable:** no

## Status

- [ ] Hash router with six routes
- [ ] Stores implemented with `localStorage` persistence
- [ ] Fixtures seeded on first run
- [ ] Dashboard route renders KPI cards and recent briefs
- [ ] `get_app_state` and `navigate_to` registered globally
- [ ] `demo data` badge component, used on every seeded surface

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
4. **`DemoBadge`.** A small labelled pill, `data-testid="demo-badge"`. Rendered
   wherever `demo: true` data is displayed.
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
5. Every seeded number on the dashboard sits next to a `demo data` badge.
6. Tool surface count is exactly 2 on every route.

## Notes

The dashboard is the landing route and therefore the first thing a judge sees.
It is worth the extra fifteen minutes to make it look finished — but not worth
the extra hour. If the chart fights you, ship the KPI cards and the lists.
