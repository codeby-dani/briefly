# PROGRESS — TrendDashboard

**This is the session entry point. Read this before anything else.**

Last updated: 2026-09-03 17:51 WITA · by: planning session

---

## Where We Are Right Now

| | |
|---|---|
| **Current phase** | Phase 0 — not started |
| **Sprint start (T+0)** | 2026-09-03 17:51 WITA |
| **Hard deadline** | 2026-09-04 04:00 WITA (13:00 PDT, 2026-09-03) |
| **Time remaining at last update** | 10h 05m |
| **Deployed URL** | none yet — BLOCKING |
| **Tools registered** | 0 of 19 planned |

## Next Task

Phase 0, step 1: get an empty-but-real app onto a Netlify URL and confirm
`document.modelContext` is reachable from that origin in the ChatGPT in-app
browser. Nothing else matters until a judge-visitable URL exists.

Do not start Phase 1 features before the URL is live. Every hour that the
deploy path stays unproven is an hour of unbounded risk.

## Blockers

| # | Blocker | Owner | Phase | State |
|---|---------|-------|-------|-------|
| B1 | Devpost registration not confirmed | you | pre | **open** |
| B2 | No live URL | you | 0 | **open** |
| B3 | Stitch API key compromised (pasted in chat) — revoke before use | you | pre | **open** |
| B4 | Screen recorder not tested | you | 7 | open |
| B5 | Repo still private | you | 7 | open |

B1, B2 and B3 are the ones that can end the entry. B3 is a security issue, not
a schedule issue: the key is exposed regardless of whether Stitch gets used.

## Phase Completion

| Phase | Title | Window | State | Exit criteria met |
|-------|-------|--------|-------|-------------------|
| 0 | Foundation | T+0:00 → T+1:00 | `[ ]` | 0 / 5 |
| 1 | Shell and data layer | T+1:00 → T+2:30 | `[ ]` | 0 / 6 |
| 2 | Trends | T+2:30 → T+4:00 | `[ ]` | 0 / 7 |
| 3 | Product Knowledge | T+4:00 → T+5:00 | `[ ]` | 0 / 5 |
| 4 | Brief generator | T+5:00 → T+6:30 | `[ ]` | 0 / 7 |
| 5 | Calendar and Performance | T+6:30 → T+7:30 | `[ ]` | 0 / 4 · **cuttable** |
| 6 | Polish and manual E2E | T+7:30 → T+8:30 | `[ ]` | 0 / 6 |
| 7 | Demo and submission | T+8:30 → T+10:00 | `[ ]` | 0 / 6 |

## Tool Surface Progress

The judged surface. 19 tools planned; see `01-architecture.md` for contracts.

| # | Tool | Scope | Phase | State |
|---|------|-------|-------|-------|
| 1 | `get_app_state` | global | 1 | `[ ]` |
| 2 | `navigate_to` | global | 1 | `[ ]` |
| 3 | `search_trends` | trends | 2 | `[ ]` |
| 4 | `filter_trends` | trends | 2 | `[ ]` |
| 5 | `sort_trends` | trends | 2 | `[ ]` |
| 6 | `list_visible_trends` | trends | 2 | `[ ]` |
| 7 | `open_trend` | trends | 2 | `[ ]` |
| 8 | `save_to_watchlist` | trends | 2 | `[ ]` |
| 9 | `get_trend_detail` | trend open | 2 | `[ ]` |
| 10 | `write_trend_summary` | trend open | 2 | `[ ]` |
| 11 | `list_products` | products | 3 | `[ ]` |
| 12 | `get_product` | products | 3 | `[ ]` |
| 13 | `create_product` | products | 3 | `[ ]` |
| 14 | `update_product` | product open | 3 | `[ ]` |
| 15 | `delete_product` | product open | 3 | `[ ]` |
| 16 | `get_brief_context` | brief composer | 4 | `[ ]` |
| 17 | `save_brief` | brief composer | 4 | `[ ]` |
| 18 | `search_briefs` | briefs | 4 | `[ ]` |
| 19 | `update_brief_status` | brief open | 4 | `[ ]` |
| 20 | `schedule_brief` | calendar | 5 | `[ ]` cuttable |
| 21 | `list_schedule` | calendar | 5 | `[ ]` cuttable |

## Submission Checklist

The four required artifacts. All four, or the entry does not count.

- [ ] Live URL, verified in ChatGPT in-app browser
- [ ] Live URL, verified in Chrome 149+ with the testing flag
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
