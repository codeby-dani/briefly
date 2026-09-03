# Phase 5 — Calendar and Performance

**Window:** T+6:30 → T+7:30 · **Cuttable: YES — this is the first cut**

Everything here is worth having and none of it is worth the submission. If
Phase 4 runs past T+6:30, skip straight to Phase 6 and mark this `[~]` with the
reason. Do not partially build it — a half-finished calendar looks worse than
no calendar.

## Status

- [ ] Monthly calendar grid, briefs placed by date
- [ ] Assign a brief to date + platform + PIC
- [ ] Performance route: overview cards, per-content table, best posting time
- [ ] `schedule_brief` and `list_schedule`

## Tasks — Calendar

1. Month grid, current month, previous/next. Weekly view only if it is free.
2. Click a day to assign a brief. **Drag and drop is cut** — it is an hour of
   pointer-event handling for a feature a click already delivers, and it does
   not record on video any better.
3. Status chips: planned, in progress, published.
4. `schedule_brief` (idempotent by briefId+date) and `list_schedule`.

## Tasks — Performance

1. Overview: reach, impressions, engagement rate, follower growth. All badged.
2. Per-content table, sortable, with a link back to the originating brief.
3. Trend-versus-result: for a brief made from trend X, show how it did. This is
   the one genuinely interesting view here, because it closes the loop the PRD
   opens. If only one Performance feature survives, make it this one.
4. Best posting time as 24 bars. Format breakdown as a small stacked bar.
5. CSV export. **PDF export is cut.**

## Exit Criteria

1. A brief scheduled by an agent appears on the calendar without a reload.
2. Surface count is 4 on the Calendar route.
3. Every seeded metric carries a `demo data` badge.
4. CSV downloads and opens in a spreadsheet without mangling.

## If Cut

Mark `[~] SKIPPED — cut at the Phase 5 line to protect submission time` in
`PROGRESS.md`, remove the Calendar and Performance entries from the nav, and
delete their tool rows from the tool table. Do not leave dead nav items; a
route that renders nothing reads as a bug, and it costs a point under Execution
for no gain.
