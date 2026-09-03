# 02 — Data Model

All state lives in `localStorage` under the `td:` prefix, one key per store.
Everything is plain JSON. No migrations — a version mismatch reseeds.

```
td:version      schema version, integer
td:trends       Trend[]        seeded, read-only to the user
td:business-profile  BusinessProfile  one user-owned profile with structured offerings
td:briefs       Brief[]        user- and agent-owned
td:watchlist    string[]       trend ids
td:schedule     ScheduleEntry[]  Phase 5, cuttable
td:analytics    Analytics      seeded, read-only
td:events       ToolEvent[]    ring buffer, 200 entries, see 04-observability.md
```

The clip corpus is **not** in `localStorage`. It is 12 immutable records paired
with files in `public/media/` that ship with the build, so it is a static
module — `src/fixtures/clips.ts` — imported directly. Nothing writes to it and
nothing reseeds it. Keeping it out of the store also keeps ~40KB of transcript
text out of every `localStorage` read.

## Types

```ts
type Platform = 'tiktok' | 'instagram' | 'youtube' | 'x'
type Category = 'beauty' | 'food' | 'fashion' | 'tech' | 'fitness' | 'finance'

interface Trend {
  id: string
  keyword: string
  volume: number            // mentions in the last 24h — invented, badged `demo data`
  growthPct: number         // vs the previous 24h — invented, badged `demo data`
  platform: Platform
  category: Category
  firstSeen: string         // ISO date
  spike: number[]           // 14 daily points, for the sparkline — invented
  relatedKeywords: string[]
  samples: Sample[]
  clipIds: string[]         // clips in the corpus that belong to this trend; may be empty
  aiSummary: string | null  // null until something writes it
  aiSummarySource: SummarySource
  suggestedAngles: string[] // written alongside aiSummary; [] until then
  demo: true                // every trend is seeded; the badge reads from this
}

interface Sample {
  author: string
  text: string
  engagement: number        // invented, badged `demo data`
  clipId?: string           // present when this sample is backed by a real playable clip
}

type SummarySource =
  | null        // nothing has written a summary yet
  | 'agent'     // a connected agent called write_trend_summary
  | 'model'     // analyze_trend made a live model call through /api/analyze
  | 'cached'    // the fixture's committed summary, shown because no key and no agent
  | 'human'     // typed into the drawer by hand

interface ClipSignals {     // every field measured from the encoded file and its
  durationS: number         // transcript by scripts/measure-clips.mjs. Nothing invented.
  fileBytes: number
  words: number
  wordsPerMinute: number
  segments: number
  hookEndS: number          // second at which the opening line ends
  hookWords: number
  avgSegmentS: number
  transcriptSource: 'caption' | 'stt'
  measured: true
}

interface Clip {
  id: string                // slug, stable: "glow-serum-3am"
  title: string
  creator: string           // display handle, e.g. "@lumen.skin"
  src: string               // "/media/glow-serum-3am.mp4"
  poster: string            // "/media/glow-serum-3am.jpg"
  captionTrack?: string     // "/media/glow-serum-3am.vtt" — absent on half the corpus
  license: 'cc0'
  sourceNote: string        // provenance in plain words; rendered in the UI
  category: Category
  hashtags: string[]
  transcript: string        // full text, committed
  signals: ClipSignals
}

interface BusinessOffering {
  id: string
  name: string
  positioning: string
  usp: string[]
  priceIdr: number
  approvedClaims: string[]
  prohibitedClaims: string[]
}

interface BusinessProfile {
  name: string
  description: string
  industry: string
  targetAudiences: string[]
  brandVoices: string[]
  contentGoals: string[]
  approvedClaims: string[]
  prohibitedClaims: string[]
  offerings: BusinessOffering[]
  updatedAt: string
}

type BriefStatus = 'draft' | 'approved' | 'published'

interface Brief {
  id: string
  title: string
  trendId: string
  offeringId: string
  platform: Platform
  status: BriefStatus
  hook: string
  outline: string[]
  tone: string
  cta: string
  hashtags: string[]
  audience: string
  authoredBy: 'agent' | 'human'
  createdAt: string
  updatedAt: string
}

interface ScheduleEntry {   // Phase 5, cuttable
  id: string
  briefId: string
  date: string              // ISO date, day precision
  platform: Platform
  pic: string
  status: 'planned' | 'in_progress' | 'published'
}

interface Analytics {       // seeded fixture
  demo: true
  reach: number
  impressions: number
  engagementRate: number
  followerGrowth: number[]  // 30 daily points
  perContent: {
    briefId: string | null
    title: string
    platform: Platform
    postedAt: string
    reach: number
    engagement: number
  }[]
  bestPostingHours: number[]  // 24 buckets, relative score
}
```

`Trend.demo` and `Analytics.demo` are literal `true`, not booleans. They exist
so the badge cannot be forgotten: a surface rendering seeded data has the flag
in hand and the linter cannot let an unbadged path through review.
`ClipSignals.measured` is the same trick pointing the other way.

## Two Badges, Two Claims

The app makes two different claims about its numbers and must not blur them.

| Badge | Flag | Means | Applies to |
|-------|------|-------|------------|
| `demo data` | `demo: true` | Invented for the demo. Nobody observed this. | `Trend.volume`, `growthPct`, `spike`, `Sample.engagement`, all of `Analytics` |
| `measured` | `measured: true` | Derived from a file in this repo by a committed script. Re-runnable. | every field of `ClipSignals` |

The distinction is load-bearing for the Execution criterion. A dashboard that
badges *everything* `demo data` reads as a mockup; one that badges everything
`measured` is lying about its view counts. Two badges, honestly applied, read
as a scoped decision — which is what it is.

A clip corpus that has never been published anywhere cannot have view counts,
likes or shares, so `Clip` has none. Engagement numbers exist only on `Sample`,
where they are explicitly invented and badged. This rule is inherited from
ClipBrief and is worth keeping: the moment a fake view count sits next to a
measured word rate with no visual difference, both stop meaning anything.

## State Machines

### Brief status

```
draft ──approve──► approved ──publish──► published
  ▲                    │
  └────── revise ──────┘
```

Forward transitions only, except `approved → draft` for a revision. Nothing
returns from `published` — a published brief is a record of what shipped, and
editing it would rewrite history the Performance page reads against.

`update_brief_status` rejects any transition not on this diagram and returns
`{ ok: false, reason }` naming the current status. An agent that guesses wrong
gets told what the actual state is and can correct itself.

### Schedule status

```
planned ──► in_progress ──► published
```

Free movement in both directions. Real teams move things back.

### Tool surface

Not stored, but it is a state machine and the whole product depends on it:

```
route=trends                 ─► 6 tools + 2 global
route=trends & trendOpen     ─► 10 tools + 2 global
route=products               ─► 1 tool + 2 global
route=products & profileEdit ─► 5 tools + 2 global
trendSelected & offeringSelected ─► + get_brief_context, save_brief
route=briefs                 ─► 2 tools + 2 global (+1 when a brief is open)
```

`get_brief_context` and `save_brief` are conditioned on *selection*, not route,
so they survive navigating between Trends and Profile while composing.

## Tool Contracts

Input schemas abbreviated; the full JSON Schema lives beside each tool.

### `get_app_state` → readOnly

```
in:  {}
out: { route, selectedTrendId, selectedOfferingId, openBriefId,
       counts: { trends, offerings, briefs, watchlist },
       visibleTrendCount, activeFilters }
```

### `navigate_to` → idempotent

```
in:  { route: 'dashboard'|'trends'|'products'|'briefs'|'calendar'|'performance' }
out: { ok: true, route }
```

### `search_trends` → readOnly

```
in:  { query: string }
out: { count, trends: [{ id, keyword, volume, growthPct, platform, category }] }
```

Sets the visible search term as a side effect, so the human sees the same
result set. A read-only tool that also drives the UI is not a contradiction here:
it does not mutate stored data, and the visible change is the feature.

### `filter_trends` → idempotent

```
in:  { platform?, category?, from?, to?, minGrowthPct? }
out: { count, activeFilters }
```

Omitted fields clear that filter. Passing `{}` resets everything — say so in the
description, or an agent will assume omission means "leave unchanged" and the
two of you will disagree about state.

### `sort_trends` → idempotent

```
in:  { field: 'volume'|'growth'|'recency', direction?: 'asc'|'desc' }
out: { ok: true, field, direction }
```

### `list_visible_trends` → readOnly, untrustedContent

```
in:  { limit?: number }   // default 20
out: { count, total, trends: [...] }
```

Returns what is on screen *after* search, filter and sort. `total` is the
unfiltered count, so an agent can tell "3 results" from "3 of 200".

### `open_trend` → idempotent

```
in:  { trendId: string }
out: { ok: true, trend: {...} } | { ok: false, reason: 'no such trend', known: [ids] }
```

### `save_to_watchlist` → idempotent

```
in:  { trendId: string }
out: { ok: true, watchlistSize, alreadyPresent: boolean }
```

### `get_trend_detail` → readOnly, untrustedContent

```
in:  { trendId?: string }   // defaults to the open trend
out: { trend, spike, relatedKeywords, samples, demo: true,
       clips: [{ id, title, creator, category, hashtags,
                 transcript, signals, sourceNote }] }
```

`clips` carries the full transcript of every clip attached to the trend. That
is what makes the analysis real rather than decorative: an agent reading this
tool has the actual words spoken in the videos, not a summary of them. It is
also why the tool is `untrustedContentHint` — transcripts are authored text.

Trends with no clips return `clips: []`. `fashion` and `finance` trends are
deliberately in that state, so both branches of the drawer get exercised
before the demo rather than during it.

### `play_clip` → idempotent

```
in:  { clipId: string, seekS?: number }
out: { ok: true, clipId, playing: true, seekS }
   | { ok: false, reason: 'no such clip' | 'clip not on the open trend', known: [ids] }
```

Starts the clip in the drawer's player, in front of the human. The agent is
driving the same player the human would click, which is the whole argument of
the project applied to one small control. `seekS` is clamped to the clip's
measured duration; out-of-range is not an error, it is a clamp.

Refuses a clip that is not attached to the currently open trend. Same
constraint as `delete_product`, same reason: an agent cannot act on something
the human is not looking at.

### `analyze_trend`

```
in:  { trendId?: string, force?: boolean }
out: { ok: true, summary, suggestedAngles: string[],
       source: 'model' | 'cached', model?: string, generatedAt }
   | { ok: false, error: 'llm_unavailable', message, hint }
```

Posts the trend and its clips' transcripts to `/api/analyze` and writes the
result into `Trend.aiSummary` with `aiSummarySource: 'model'`. This is a real
model call over the seeded corpus — the data is invented, the reasoning is not.

Without a configured key the function returns `503 llm_unavailable`; the tool
then falls back to the fixture's committed summary and reports
`source: 'cached'`. `force: true` skips the cache and requires the key.

The `hint` on failure names `write_trend_summary` as the alternative. An agent
told only that something failed retries it; an agent told what to do instead
does that.

### `write_trend_summary`

```
in:  { trendId?: string, summary: string, suggestedAngles: string[] }
out: { ok: true, renderedAt }
```

Writes to `Trend.aiSummary` with `aiSummarySource: 'agent'` and re-renders the
drawer. Cap `summary` at 800 characters — an agent given no limit will write an
essay into a 300px panel.

This is the no-key path and it stays the headline. `analyze_trend` exists so a
judge with no agent connected still sees the analysis happen; this tool exists
because an agent that is already connected should not be asked to wait on a
second model round-trip through a serverless function it does not need.

### `get_business_profile` → readOnly, untrustedContent

```
in:  {}
out: { ...BusinessProfile } // including structured offerings
```

### `update_business_profile`

```
in:  { ...partial shared profile fields }
out: { ok: true, updated: [field names] }
```

### `add_business_offering`

```
in:  { name, positioning, priceIdr, usp[], approvedClaims[], prohibitedClaims[] }
out: { ok: true, offeringId }
```

### `update_business_offering`

```
in:  { offeringId, ...partial offering fields }
out: { ok: true, updated: [field names] }
```

### `remove_business_offering`

```
in:  { offeringId }
out: { ok: true } | { ok: false, reason: 'offering not found' }
```

### `get_brief_context` → readOnly, untrustedContent

```
in:  {}
out: { trend: {...}, businessProfile: {...}, offering: {...}, platform, existingBriefs: [{id,title,hook}] }
```

`existingBriefs` for the same trend+offering pair is included so the agent can
avoid repeating an angle already in the library.

### `save_brief`

```
in:  { title, hook, outline: string[], tone, cta, hashtags: string[],
       audience, platform }
out: { ok: true, briefId, status: 'draft' }
```

Always lands as `draft`. An agent cannot publish. That is a human decision and
the constraint should be structural, not advisory.

### `search_briefs` → readOnly

```
in:  { query?, status?, platform?, from?, to? }
out: { count, briefs: [{ id, title, status, platform, trendId, updatedAt }] }
```

### `update_brief_status` → idempotent

```
in:  { briefId, status: 'draft'|'approved'|'published' }
out: { ok: true, from, to } | { ok: false, reason, currentStatus }
```

## Seed Data

`src/fixtures/` ships:

- **24 trends** across four platforms and six categories, with growth from
  -12% to +680%, so filter and sort have something to actually do. Spike series
  are shaped, not random — a trend with +680% growth has a visible hockey stick.
- **12 clips** in `clips.ts`, with their media in `public/media/`. See the
  corpus section below.
- **One business profile** with shared guardrails and detailed, editable offerings.
- **30 days of analytics** with a weekday/weekend rhythm, so "best posting time"
  shows a real shape rather than noise.
- **One committed summary per clip-backed trend**, used as the `cached`
  fallback when `analyze_trend` runs without a key. Written by the same model
  the live path uses, recorded with its model id and date.

## The Clip Corpus

The 12 clips come from [ClipBrief](https://github.com/aliefauzan/ClipBrief),
`public/media/`. Same author, so there is no third-party licence to clear.
Provenance, verbatim from that repo's `sourceNote`:

> Script written by us, voiced with macOS text-to-speech, over generated
> footage. No third-party media.

Every clip is `cc0`. Total weight is 8.8MB — mp4 plus poster jpg for all 12,
plus a `.vtt` caption track for 6 of them. That asymmetry is kept on purpose:
half the corpus has committed captions and half does not, which is the same
split that exercises both transcript paths.

Category mapping into this app's six categories:

| ClipBrief category | Clips | TrendDashboard category |
|--------------------|-------|-------------------------|
| skincare | 4 | `beauty` |
| coffee | 3 | `food` |
| fitness | 3 | `fitness` |
| gadgets | 2 | `tech` |

`fashion` and `finance` trends carry no clips. This is a decision, not a gap:
the drawer must render correctly for a trend with nothing to play, and the only
reliable way to guarantee that is to ship trends in that state.

Copying is a one-time step in Phase 0 — `public/media/` plus a generated
`clips.ts`. No download at runtime, no network call after the initial asset
load, nothing to re-fetch if the source repo moves.

Seeding runs on first load when `td:version` is absent or stale. Verify in a
private window during Phase 0 — an app that only works because your own
`localStorage` is warm is the classic way to ship a broken live URL.
