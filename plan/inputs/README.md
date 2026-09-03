# Inputs — Corpus and Seed Notes

## The Clip Corpus

**Source:** https://github.com/aliefauzan/ClipBrief — `public/media/` and
`data/corpus.json`. Same author as this project, so there is no third-party
licence to clear.

**What the clips are.** Twelve short vertical videos. Script written by the
author, voiced with macOS `say`, over ffmpeg-generated footage. Every clip is
`cc0`. No stock footage, no scraped media, nothing downloaded.

**Weight.** 8.8MB total: 12 mp4, 12 poster jpg, 6 `.vtt` caption tracks. The
caption asymmetry is deliberate and is carried over as-is — half the corpus has
committed captions and half does not.

## Copy Procedure — Phase 0, step 9

1. Copy `public/media/*` from ClipBrief into this repo's `public/media/`.
2. Generate `src/fixtures/clips.ts` from ClipBrief's `data/corpus.json`:
   - remap `category` per the table below
   - carry `signals` through verbatim, including `measured: true`
   - inline each clip's transcript `fullText` from `data/transcripts/`
   - keep `sourceNote` unchanged — it is the provenance statement rendered
     in the UI, and paraphrasing it would weaken the claim
3. Commit the media. It ships with the build; nothing is fetched at runtime.

## Category Mapping

| ClipBrief | Clips | TrendDashboard |
|-----------|-------|----------------|
| skincare | 4 | `beauty` |
| coffee | 3 | `food` |
| fitness | 3 | `fitness` |
| gadgets | 2 | `tech` |

`fashion` and `finance` trends carry no clips, on purpose. The drawer must
render for a trend with nothing to play, and shipping trends in that state is
the only way to guarantee that branch is built rather than assumed.

## Clip Inventory

| id | ClipBrief category | Captions |
|----|--------------------|----------|
| `glow-serum-3am` | skincare | yes |
| `barrier-repair-myth` | skincare | no |
| `spf-indoors` | skincare | yes |
| `three-step-routine` | skincare | no |
| `grind-size-fix` | coffee | yes |
| `cold-brew-ratio` | coffee | no |
| `cheap-beans-test` | coffee | yes |
| `desk-neck-fix` | fitness | no |
| `protein-math` | fitness | yes |
| `ten-minute-lie` | fitness | no |
| `cable-drawer` | gadgets | yes |
| `laptop-stand-test` | gadgets | no |

## What The Corpus Does Not Have

No views, likes, comments or shares. These clips were never published anywhere,
so any such number could only be invented — and an invented view count sitting
beside a measured word rate with no visual difference makes both meaningless.

Invented engagement numbers exist only on `Trend.samples[].engagement`, where
they are badged `demo data`. See the two-badge rule in `../02-data-model.md`.

## Seed Fixtures

| Fixture | Count | Badge |
|---------|-------|-------|
| Trends | 24 | `demo data` |
| Clips | 12 | `measured` |
| Products | 4 — one per clip-backed category | none; user-owned |
| Briefs | 0 — the agent's `save_brief` is the first row | — |
| Analytics | 30 days | `demo data` |
| Cached summaries | one per clip-backed trend | labelled `cached` in the UI |

The cached summaries are the tier-3 fallback for `analyze_trend`. Generate them
once with the same model the live path uses, and record the model id and
timestamp alongside each — a fallback that cannot say when it was written is
indistinguishable from a fresh answer, which is the thing the label exists to
prevent.
