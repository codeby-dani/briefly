# PROGRESS — TrendDashboard

**This is the session entry point. Read this before anything else.**

Last updated: 2026-09-03 19:50 WITA · by: planning session (corpus revision)

---

## Where We Are Right Now

| | |
|---|---|
| **Current phase** | Phase 0 — not started |
| **Sprint start (T+0)** | 2026-09-03 17:51 WITA |
| **Hard deadline** | 2026-09-04 04:00 WITA (13:00 PDT, 2026-09-03) |
| **Time remaining at last update** | 10h 05m |
| **Deployed URL** | none yet — BLOCKING |
| **Tools registered** | 0 of 21 planned |

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
| B6 | `GEMINI_API_KEY` not obtained (free tier, aistudio.google.com/apikey) | you | 0 | **open** |
| B7 | Clip corpus not yet copied from ClipBrief into `public/media/` | you | 0 | **open** |

B6 and B7 are Phase 0 work, not pre-work, and neither is fatal: B7 missing
means no clip player, B6 missing means `analyze_trend` serves the cached
summary. Both degrade rather than break.

B1, B2 and B3 are the ones that can end the entry. B3 is a security issue, not
a schedule issue: the key is exposed regardless of whether Stitch gets used.

## Phase Completion

| Phase | Title | Window | State | Exit criteria met |
|-------|-------|--------|-------|-------------------|
| 0 | Foundation | T+0:00 → T+1:15 | `[ ]` | 0 / 8 |
| 1 | Shell and data layer | T+1:15 → T+2:45 | `[ ]` | 0 / 6 |
| 2 | Trends | T+2:45 → T+4:15 | `[ ]` | 0 / 10 |
| 3 | Product Knowledge | T+4:15 → T+5:15 | `[ ]` | 0 / 5 |
| 4 | Brief generator | T+5:15 → T+6:45 | `[ ]` | 0 / 7 |
| 5 | Calendar and Performance | T+6:45 → T+7:45 | `[ ]` | 0 / 4 · **cuttable** |
| 6 | Polish and manual E2E | T+7:45 → T+8:30 | `[ ]` | 0 / 6 |
| 7 | Demo and submission | T+8:30 → T+10:00 | `[ ]` | 0 / 6 |

## Tool Surface Progress

The judged surface. 21 tools planned; see `01-architecture.md` for contracts.

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
| 11 | `play_clip` | trend open | 2 | `[ ]` |
| 12 | `analyze_trend` | trend open | 2 | `[ ]` cut first if Phase 2 slips |
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
