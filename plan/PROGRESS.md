# PROGRESS — TrendDashboard

**This is the session entry point. Read this before anything else.**

Last updated: 2026-09-03 20:35 WITA · by: Phase 0 build session

---

## Where We Are Right Now

| | |
|---|---|
| **Current phase** | Phase 0 — code complete, **blocked on the deploy** |
| **Sprint start (T+0)** | 2026-09-03 17:51 WITA |
| **Hard deadline** | 2026-09-04 04:00 WITA (13:00 PDT, 2026-09-03) |
| **Time remaining at last update** | 10h 05m |
| **Deployed URL** | none yet — BLOCKING |
| **Tools registered** | 1 of 21 in code (`get_app_state`); 0 verified on a live origin |

## Next Task

**Deploy.** Everything Phase 0 can build without a Netlify account is built and
committed: the shell, `get_app_state`, the 12-clip corpus, and the function.
`npm run build` exits 0 and the whole routing surface — SPA fallback, `/media/*`,
and `/api/analyze` returning its structured 503 — was verified end to end
through `netlify dev`. None of that counts, because none of it is on an origin.

The Netlify CLI on this machine is not authenticated, so the deploy is a human
step, not an agent step:

```
netlify login
netlify init          # or `netlify link` if the site already exists
netlify deploy --prod
```

Then, in order: record the URL here and close B2; open it in the ChatGPT
in-app browser and ask the agent to list its tools; open it in flagged Chrome
and check the panel reads a green dot and `1`; open a private window; `curl -X
POST <url>/api/analyze -d '{}'` and confirm the 503 JSON rather than a 404 or
HTML; set `GEMINI_API_KEY` and `curl` again for the 200.

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
| B7 | Clip corpus not yet copied from ClipBrief into `public/media/` | you | 0 | **closed 20:35** |
| B8 | Netlify CLI on this machine is not authenticated — no agent can deploy | you | 0 | **open** |

B6 is Phase 0 work, not pre-work, and it is not fatal: without it
`analyze_trend` serves the cached summary. It degrades rather than breaks.

B7 is closed. 12 clips (12 mp4, 12 jpg, 6 vtt, 8.8MB) are committed under
`public/media/` and `src/fixtures/clips.ts` is generated from ClipBrief's
`data/corpus.json` and `data/transcripts/`.

B8 is new and it is now the only thing standing between the repo and every
remaining Phase 0 exit criterion. `netlify login` opens a browser OAuth flow, so
it has to be you.

B1, B2, B3 and B8 are the ones that can end the entry. B3 is a security issue,
not a schedule issue: the key is exposed regardless of whether Stitch gets used.

## Phase Completion

| Phase | Title | Window | State | Exit criteria met |
|-------|-------|--------|-------|-------------------|
| 0 | Foundation | T+0:00 → T+1:15 | `[ ]` | 2 / 8 · 5 and 8 met; 1–4, 6, 7 need the deploy |
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
| 1 | `get_app_state` | global | 1 | `[ ]` written and registered in `src/tools/global.ts`; not deployed, not yet seen by an agent |
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

### 2026-09-03 20:35 WITA — Phase 0 build

Built everything Phase 0 can build without a Netlify account, and stopped
exactly where the account is required.

**Shipped into the tree.** `App.tsx` is a real shell — header, six-route nav
placeholder, main slot — with `UnsupportedBrowserNotice` mounted above the app
in `main.tsx` and `ToolSurfacePanel` at the root. `get_app_state` is registered
from `src/tools/global.ts`, returning the contract's shape from
`02-data-model.md` with honest zeros: Phase 1 owns the stores, so the counts
are zero because there is nothing to count, not because the tool is a stub that
will need rewriting. `navigate_to` was deliberately **not** registered — there
is no router until Phase 1, and putting a tool on the surface that cannot do
anything is the exact failure this project argues against.

**The trace wrapper went in first, not last.** `src/tools/trace.ts` wraps every
executor centrally: trace id, console line, a 200-entry ring buffer in
`td:events`, and `_trace` on the returned payload. `useSurfaceLogging()` prints
the `+`/`-` registration lines with the surface count. Doing this at one tool
costs nothing; doing it at twenty-one costs an hour and gets skipped.

**Corpus.** B7 closed. 12 clips, 8.8MB, `public/media/`. `src/fixtures/clips.ts`
is generated, not hand-written: categories remapped skincare→beauty,
coffee→food, fitness→fitness, gadgets→tech, signals carried through verbatim,
transcripts inlined from `data/transcripts/*.json`. The four-category split
lands as 4/3/3/2, so `fashion` and `finance` genuinely have no clips and the
Phase 2 drawer will be forced to handle that.

**Function.** `netlify/functions/analyze.ts` is a v2 fetch handler — no SDK, no
dependency, zero new runtime deps held. It claims `/api/analyze` through its own
`config.path`, and `netlify.toml` also redirects `/api/*` above the SPA
catch-all. That redundancy is deliberate: if the path config were ever ignored,
the catch-all would answer `/api/analyze` with `index.html` and a **200**, which
looks like success and is the most confusing possible way for this endpoint to
break.

**Verified locally through `netlify dev`**, which runs the real redirect engine
rather than Vite's: `POST /api/analyze` → 503 with
`{ok:false,error:"llm_unavailable",…}`; `GET` → 405; `/` → HTML; the poster →
200 image/jpeg; the mp4 → 206 video/mp4, and it plays with its caption track.
`npm run build` exits 0.

**Where it stopped: B8.** The Netlify CLI here is not logged in and `netlify
login` is a browser OAuth flow, so the deploy is not something this session can
do. That single gap holds six of the eight exit criteria — the URL, both browser
checks, the private window, the media-from-origin check and the deployed `curl`.
Criteria 5 (build exits 0) and 8 (no key material in the repo) are met.

**Prediction, recorded so it can be wrong.** The `tools` Permissions-Policy risk
is the one worth watching on first deploy: nothing in `netlify.toml` sends a
`Permissions-Policy` header, so the default `self` should survive. If flagged
Chrome shows the notice instead of a green dot on the live origin, that header
is the first thing to check — not the registration code, which is now proven to
run.

**Not done, deliberately.** The event log has no UI yet — the ring buffer is
written and readable via `readEvents()`, but `04-observability.md` wants it as a
second tab in `ToolSurfacePanel` and that panel is not Phase 0's to rewrite. Two
`data-testid` attributes were added to it (`tool-surface`, `tool-row-{name}`)
and nothing else. `scripts/measure-clips.mjs` also does not exist in this repo:
the `measured` badge is currently backed by ClipBrief's committed numbers rather
than by a script that can be re-run here. That is a small honesty debt worth
paying in Phase 6 if there is room, and worth naming now rather than discovering
during judging.
