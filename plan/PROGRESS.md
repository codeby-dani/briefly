# PROGRESS — TrendDashboard

**This is the session entry point. Read this before anything else.**

Last updated: 2026-09-03 21:25 WITA · by: Phase 0 build session (Vercel switch)

---

## Where We Are Right Now

| | |
|---|---|
| **Current phase** | Phase 0 — code complete, **not deployed** |
| **Sprint start (T+0)** | 2026-09-03 17:51 WITA |
| **Hard deadline** | 2026-09-04 04:00 WITA (13:00 PDT, 2026-09-03) |
| **Time remaining at last update** | 10h 05m |
| **Deployed URL** | none yet — BLOCKING |
| **Tools registered** | 1 of 21 planned (`get_app_state`), locally verified |

## Next Task

**Deploy.** Everything Phase 0 asks for in code is written, built and verified on
`localhost:4173`; the phase cannot close because nothing is on a public origin,
and the push is yours to make.

Hosting is **Vercel**, wired to GitHub, so the deploy is a push:

```
git push origin main
```

Then, on the deployed origin: open it in the ChatGPT in-app browser and in
flagged Chrome, `curl -X POST <url>/api/analyze -d '{}'` and confirm a 503 JSON
rather than a 404 or HTML, set `GEMINI_API_KEY` in Vercel's project environment
variables, redeploy, and curl again for a 200. Record the URL in the table above
and clear B2.

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
| B8 | Vercel not confirmed on the hackathon's approved-hosting list — the plan recorded Netlify as approved | you | 0 | **open** |
| B7 | Clip corpus not yet copied from ClipBrief into `public/media/` | — | 0 | **closed** 2026-09-03 21:10 |

B6 is Phase 0 work, not pre-work, and is not fatal: without it `analyze_trend`
serves the cached summary, which degrades rather than breaks. B7 is closed — the
12 clips and the generated `src/fixtures/clips.ts` are committed, and one poster
and one mp4 were served locally (200 `image/jpeg`, 206 `video/mp4`).

B1, B2 and B3 are the ones that can end the entry. B3 is a security issue, not
a schedule issue: the key is exposed regardless of whether Stitch gets used.

## Phase Completion

| Phase | Title | Window | State | Exit criteria met |
|-------|-------|--------|-------|-------------------|
| 0 | Foundation | T+0:00 → T+1:15 | `[ ]` | 3 / 8 · rest blocked on deploy |
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
| 1 | `get_app_state` | global | 1 | `[ ]` written, registered, locally verified — not deployed |
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
