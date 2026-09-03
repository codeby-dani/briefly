# Phase 2 — Trends

**Window:** T+2:30 → T+4:00 · **Cuttable:** no

The first of the three phases that carry the judged surface.

## Status

- [ ] Trend table: keyword, volume, growth %, platform, category, sparkline
- [ ] Search, filter (platform, category, date range, min growth), sort
- [ ] Detail drawer: spike chart, samples, related keywords, summary block
- [ ] Six route-scoped tools registered
- [ ] Two more tools register when a trend is open, and unregister when it closes
- [ ] `write_trend_summary` renders into the drawer

## Tasks

1. **Table.** Sortable headers, sparkline per row from `Trend.spike`,
   `data-testid="trend-row-{id}"`. Growth is colour-coded; the colour is not the
   only signal — the sign is in the text.
2. **Controls.** Search input, four filter controls, sort select. All of them
   read and write the same view state that the tools drive, so an agent
   filtering and a human filtering are the same operation.
3. **Drawer.** Opens on row click and on `open_trend`. Spike chart, sample
   content, related keyword chips, and a summary block with two states: empty
   ("ask a connected agent why this is rising, or write it yourself") and
   filled.
4. **Route tools.** `search_trends`, `filter_trends`, `sort_trends`,
   `list_visible_trends`, `open_trend`, `save_to_watchlist`.
5. **Conditional tools.** `get_trend_detail` and `write_trend_summary`, guarded
   on `openTrendId`.
6. **Watchlist.** A star per row, plus a watchlist filter.

## Exit Criteria

1. Surface count is 8 on the Trends route with no trend open, 10 with one open,
   and 2 immediately after navigating away.
2. An agent asked to "show me TikTok beauty trends growing over 100%, sorted by
   growth" produces the same table the human would have produced by hand — and
   the human sees the controls move.
3. `list_visible_trends` returns exactly the rows on screen, with `total`
   reflecting the unfiltered count.
4. `write_trend_summary` puts text into `trend-summary` without a reload.
5. Closing the drawer removes exactly two tools from the panel, visibly.
6. Every trend surface carries a `demo data` badge.
7. `save_to_watchlist` called twice reports `alreadyPresent: true` and does not
   duplicate.

## Demo Weight

Exit criterion 5 is the single most valuable shot in the video. Make the
unregistration animation legible: the panel already ghosts removed tools
struck-through for 1.1s. Do not shorten that.
