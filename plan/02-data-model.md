# 02 — Data Model

All state lives in `localStorage` under the `td:` prefix, one key per store.
Everything is plain JSON. No migrations — a version mismatch reseeds.

```
td:version      schema version, integer
td:trends       Trend[]        seeded, read-only to the user
td:products     Product[]      user-owned, full CRUD
td:briefs       Brief[]        user- and agent-owned
td:watchlist    string[]       trend ids
td:schedule     ScheduleEntry[]  Phase 5, cuttable
td:analytics    Analytics      seeded, read-only
td:events       ToolEvent[]    ring buffer, 200 entries, see 04-observability.md
```

## Types

```ts
type Platform = 'tiktok' | 'instagram' | 'youtube' | 'x'
type Category = 'beauty' | 'food' | 'fashion' | 'tech' | 'fitness' | 'finance'

interface Trend {
  id: string
  keyword: string
  volume: number            // mentions in the last 24h
  growthPct: number         // vs the previous 24h
  platform: Platform
  category: Category
  firstSeen: string         // ISO date
  spike: number[]           // 14 daily points, for the sparkline
  relatedKeywords: string[]
  samples: { author: string; text: string; engagement: number }[]
  aiSummary: string | null  // written by write_trend_summary; null until an agent writes it
  demo: true                // every trend is seeded; the badge reads from this
}

interface Product {
  id: string
  name: string
  description: string
  usp: string[]
  priceIdr: number
  dos: string[]             // things the brand will say
  donts: string[]           // things the brand will not say
  updatedAt: string
}

type BriefStatus = 'draft' | 'approved' | 'published'

interface Brief {
  id: string
  title: string
  trendId: string
  productId: string
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
route=trends & trendOpen     ─► 8 tools + 2 global
route=products               ─► 3 tools + 2 global
route=products & productOpen ─► 5 tools + 2 global
trendSelected & productSelected ─► + get_brief_context, save_brief
route=briefs                 ─► 2 tools + 2 global (+1 when a brief is open)
```

`get_brief_context` and `save_brief` are conditioned on *selection*, not route,
so they survive navigating between Trends and Products while composing.

## Tool Contracts

Input schemas abbreviated; the full JSON Schema lives beside each tool.

### `get_app_state` → readOnly

```
in:  {}
out: { route, selectedTrendId, selectedProductId, openBriefId,
       counts: { trends, products, briefs, watchlist },
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
out: { trend, spike, relatedKeywords, samples, demo: true }
```

### `write_trend_summary`

```
in:  { trendId?: string, summary: string, suggestedAngles: string[] }
out: { ok: true, renderedAt }
```

Writes to `Trend.aiSummary` and re-renders the drawer. Cap `summary` at 800
characters — an agent given no limit will write an essay into a 300px panel.

### `list_products` / `get_product` → readOnly

```
list: {} → { count, products: [{ id, name, positioning }] }
get:  { productId } → { ...Product }   // untrustedContent
```

### `create_product`

```
in:  { name, description, usp[], priceIdr, dos[], donts[] }
out: { ok: true, productId }
```

### `update_product` → destructive, idempotent

```
in:  { productId, ...partial fields }
out: { ok: true, updated: [field names] }
```

Named fields only. An omitted field is left alone — the opposite of
`filter_trends`, and both descriptions must say which they are.

### `delete_product` → destructive

```
in:  { productId }   // must equal the currently open product
out: { ok: true } | { ok: false, reason: 'product is not open' }
```

### `get_brief_context` → readOnly, untrustedContent

```
in:  {}
out: { trend: {...}, product: {...}, platform, existingBriefs: [{id,title,hook}] }
```

`existingBriefs` for the same trend+product pair is included so the agent can
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
- **4 products** with genuinely different positioning, including a full
  do-and-do-not list. One of them is deliberately a poor fit for the top trend,
  so the demo can show the agent declining an angle rather than always agreeing.
- **30 days of analytics** with a weekday/weekend rhythm, so "best posting time"
  shows a real shape rather than noise.

Seeding runs on first load when `td:version` is absent or stale. Verify in a
private window during Phase 0 — an app that only works because your own
`localStorage` is warm is the classic way to ship a broken live URL.
