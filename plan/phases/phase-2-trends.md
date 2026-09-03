# Phase 2 — Trends

**Window:** T+2:45 → T+4:15 · **Cuttable:** no

The first of the three phases that carry the judged surface.

## Status

- [ ] Trend table: keyword, volume, growth %, platform, category, sparkline
- [ ] Search, filter (platform, category, date range, min growth), sort
- [ ] Detail drawer: spike chart, clip player, samples, related keywords, summary block
- [ ] Six route-scoped tools registered
- [ ] Four more tools register when a trend is open, and unregister when it closes
- [ ] `write_trend_summary` renders into the drawer
- [ ] `play_clip` starts the drawer's player
- [ ] `analyze_trend` writes a `model` or `cached` summary, labelled as such

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
