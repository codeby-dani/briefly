# Phase 2 — Trends

**Window:** T+2:45 → T+4:15 · **Cuttable:** no

The first of the three phases that carry the judged surface.

## Status

`[x]` means deployed, per `plan/README.md`. B2 is closed — a live URL exists —
but **this phase is not on it.** The deployed bundle predates Phase 2: measured
on the public origin 2026-09-03 23:00, `/trends` renders the Pending placeholder,
the surface stays at 2, and `td:version` is still `1`. So every box below is
still `[ ]`, and the reason has changed from "nothing is deployed" to "this is
the one thing that has not been".

All eight are code-complete and re-verified on `localhost:4173` at 23:05, after
the cross-branch merge repair. That repair matters here: the merge had dropped
`App.tsx`'s `trends` branch entirely, so `Trends.tsx` and `TrendDetail.tsx` were
compiled out of the app and nothing on this list was reachable at all.

- [ ] Trend table: keyword, volume, growth %, platform, category, sparkline —
      *built (`src/routes/Trends.tsx`), not deployed*
- [ ] Search, filter (platform, category, date range, min growth), sort —
      *built, agent and human write the same view state, not deployed*
- [ ] Detail drawer: spike chart, clip player, samples, related keywords,
      summary block — *built (`src/routes/TrendDetail.tsx`), not deployed*
- [ ] Six route-scoped tools registered — *surface is 8 on Trends, verified,
      not deployed*
- [ ] Four more tools register when a trend is open, and unregister when it
      closes — *12 open / 8 closed / 2 off-route, verified, not deployed*
- [ ] `write_trend_summary` renders into the drawer — *verified without a
      reload, not deployed*
- [ ] `play_clip` starts the drawer's player — *verified, including the refusal
      and the seek clamp, not deployed*
- [ ] `analyze_trend` writes a `model` or `cached` summary, labelled as such —
      *`cached` re-verified locally 23:05, returning `source: 'cached'` and
      `model: 'claude-opus-5'` on a 404 from the absent local function. The
      `model` path has still never executed anywhere; B6 now reads as a Vercel
      runtime mismatch rather than a missing key, so this is unverified end to
      end and may stay that way*

## Tasks

1. **Table.** Sortable headers, sparkline per row from `Trend.spike`,
   `data-testid="trend-row-{id}"`. Growth is colour-coded; the colour is not the
   only signal — the sign is in the text.
2. **Controls.** Search input, four filter controls, sort select. All of them
   read and write the same view state that the tools drive, so an agent
   filtering and a human filtering are the same operation.
3. **Drawer.** Opens on row click and on `open_trend`. Spike chart, sample
   content, related keyword chips, and a summary block with two states: empty
   ("ask a connected agent why this is rising, run the analysis, or write it
   yourself") and filled.
4. **Clip player.** `<video>` with `preload="none"`, `poster` set, `controls`,
   and the `.vtt` track where one exists. Below it: creator handle, the
   `measured` signal row (duration · words · WPM · hook ends at Ns), and
   `sourceNote` in small text. `data-testid="clip-player"`.
   Trends with `clipIds: []` render the samples list alone — build that branch
   first, since `fashion` and `finance` ship in that state and it is the branch
   most likely to be left broken.
5. **Route tools.** `search_trends`, `filter_trends`, `sort_trends`,
   `list_visible_trends`, `open_trend`, `save_to_watchlist`.
6. **Conditional tools.** `get_trend_detail`, `write_trend_summary`,
   `play_clip` and `analyze_trend`, all guarded on `openTrendId`.
   `get_trend_detail` returns the clips' full transcripts — that payload is
   what makes any analysis over this corpus real rather than decorative.
7. **Summary provenance.** The block renders its `aiSummarySource`: `agent`,
   `model` (with the model id and timestamp), `cached`, or `human`. A `cached`
   summary must not look like a fresh one.
8. **Watchlist.** A star per row, plus a watchlist filter.

## Exit Criteria

1. Surface count is 8 on the Trends route with no trend open, 12 with one open,
   and 2 immediately after navigating away.
2. An agent asked to "show me TikTok beauty trends growing over 100%, sorted by
   growth" produces the same table the human would have produced by hand — and
   the human sees the controls move.
3. `list_visible_trends` returns exactly the rows on screen, with `total`
   reflecting the unfiltered count.
4. `write_trend_summary` puts text into `trend-summary` without a reload.
5. Closing the drawer removes exactly four tools from the panel, visibly.
6. Every invented number carries a `demo data` badge; every clip signal carries
   a `measured` badge. No surface shows both on the same value.
7. `save_to_watchlist` called twice reports `alreadyPresent: true` and does not
   duplicate.
8. `play_clip` starts the video the human is looking at, and refuses a clip id
   belonging to a different trend with a named reason.
9. `analyze_trend` writes a summary whose label says `model` or `cached`, and
   a judge can tell which without opening devtools.
10. A trend with no clips opens, renders and summarises without a player and
    without a console error.

## Demo Weight

Exit criterion 5 is the single most valuable shot in the video. Criterion 8 is
the second: the agent starting the video the human is watching is the clearest
one-second proof that both parties are on the same surface.

## If This Runs Long

Cut `analyze_trend` before anything else in this phase — it is the no-agent
floor, and the demo is recorded on the agent path. `play_clip` is cheap and
stays. The player itself stays: a drawer with no video is a text list, and the
corpus is the reason the analysis is worth anything. Make the
unregistration animation legible: the panel already ghosts removed tools
struck-through for 1.1s. Do not shorten that.
