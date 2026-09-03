# 01 — Architecture

## Shape

A single-page React app, plus one serverless function. No database.

```
ChatGPT in-app browser  ──┐
                          ├─► document.modelContext ─► React tool layer ─┬─► stores ─► localStorage
Chrome 149+ (flag on)  ───┘                                              │      ▲
                                                                         │      └── UI reads/writes
                                                      analyze_trend only │
                                                                         ▼
                                                  /api/analyze (Netlify Function)
                                                                         │
                                              key set ──► Gemini free tier ──► summary
                                              no key  ──► 503 ──► committed summary in fixtures
```

The connected agent talks to the page through `document.modelContext`. The page
talks to itself through a small set of stores. Exactly one path crosses a
network boundary after the initial asset load: `analyze_trend`, and only when
called.

See `../docs/diagrams/architecture.drawio` for the drawn version, and
`../docs/diagrams/brief-flow.drawio` for the human–agent loop.

## The Central Decision: The Agent Is The Model, And There Is A Floor Under It

The connected agent does the reasoning. That is the premise of the standard and
it is what the tool surface is designed around:

- `get_brief_context` returns the selected trend and the full product record.
- `save_brief` accepts a structured brief and writes it into the library.
- `write_trend_summary` accepts an analysis and renders it next to the chart.

The page supplies capability, the agent supplies reasoning. No key is needed for
any of it, and this is the path the demo shows.

**The floor.** A judge who opens the live URL in ordinary Chrome has no agent.
Under the original plan that judge saw empty fields with a note explaining what
they were waiting for — honest, but it makes the central feature unobservable
to whoever is scoring Execution. So one tool, `analyze_trend`, posts the trend
and its clip transcripts to a Netlify Function that calls Gemini's free tier and
writes a real analysis back into the page.

This is the reversal of the earlier decision, and it is worth being precise
about what is and is not being given up:

| | Original | Now |
|---|---|---|
| Agent path needs a key | no | no |
| Brief generation calls a model server-side | no | **still no** |
| Trend analysis has a no-agent fallback | no | yes, `analyze_trend` |
| Secret in the deploy | none | one, `GEMINI_API_KEY` |
| App still works with the function dead | n/a | yes — cached summary, and the agent path is untouched |

The brief composer is deliberately *not* wired to the function. `save_brief`
stays agent-only, because a page that writes its own briefs and also exposes
`save_brief` is the "two products stapled together" failure the original
decision named, and that argument was right. The concession is scoped to trend
analysis, where the alternative is a blank panel in front of a judge.

**Three tiers, and nothing is ever a dead button:**

1. Agent connected → `write_trend_summary`. No key, no network, no latency.
2. No agent, key configured → `analyze_trend` → live Gemini call over the
   seeded corpus. Labelled `model`, with the model id and timestamp shown.
3. No agent, no key → the fixture's committed summary. Labelled `cached`, and
   the label says so in the UI rather than passing it off as fresh.

Every AI-authored field remains a plain editable field on top of all three,
labelled `human` when typed. A judge in vanilla Chrome with a dead function
still sees a working editor.

**Cost and blast radius.** Gemini's free tier is 20 requests per day per model
and needs no card. The function is one file, ~60 lines, and every failure mode
in it returns a structured `{ ok: false, error, hint }` that degrades to tier 3.
If Netlify Functions turn out to misbehave on the deploy, the mitigation is to
delete the function and ship tiers 1 and 3 — which is the original architecture,
intact.

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| WebMCP runtime | `src/webmcp/` | Registration, lifecycle, the live surface panel |
| Tool definitions | `src/tools/` | One file per route's tools; schemas and executors |
| Stores | `src/store/` | Typed state + `localStorage` persistence |
| Routes | `src/routes/` | Dashboard, Trends, Products, Briefs, Calendar, Performance |
| Fixtures | `src/fixtures/` | Seeded trends and analytics (`demo data`); the clip corpus (`measured`) |
| Media | `public/media/` | 12 cc0 clips: mp4, poster, 6 caption tracks. 8.8MB |
| Function | `netlify/functions/analyze.ts` | The only server-side code. Gemini call, or 503 |

`src/webmcp/` already exists and is complete. It is not to be rewritten during
the sprint.

## Tool Lifecycle

`useTool(spec | null)` is the whole mechanism. Passing `null` unregisters.

```ts
useTool(openTrendId ? {
  name: 'write_trend_summary',
  description: '...',
  inputSchema: { /* ... */ },
  execute: (input) => { /* ... */ },
} : null)
```

Three properties of the hook that the tool files depend on:

- **`execute` is read through a ref.** It always sees current state and never
  causes re-registration. Executors may close over anything.
- **Re-registration is keyed on the agent-visible surface only** — name,
  description, schema, annotations. A changing schema tears down and
  re-registers, so an agent never sees a schema that disagrees with the screen.
- **Unregistration is `AbortController.abort()`**, per the spec. There is no
  `unregisterTool`.

## The Tool Catalog

21 tools, plus 2 more if Phase 5 survives. Scope column is the condition under
which the tool is on the surface.

### Global — always registered

| Tool | Annotations | Returns |
|------|-------------|---------|
| `get_app_state` | `readOnly` | Current route, selected trend, selected product, counts |
| `navigate_to` | `idempotent` | The route landed on |

`get_app_state` is what makes the rest coherent. An agent that has just
connected calls it first and learns what the human is looking at.

### Trends route

| Tool | Annotations | Notes |
|------|-------------|-------|
| `search_trends` | `readOnly` | Full-text over keyword and category |
| `filter_trends` | `idempotent` | platform, category, date range, min growth |
| `sort_trends` | `idempotent` | volume · growth · recency, asc/desc |
| `list_visible_trends` | `readOnly`, `untrustedContent` | Exactly what is on screen after search+filter+sort |
| `open_trend` | `idempotent` | Opens the detail drawer; registers two more tools |
| `save_to_watchlist` | `idempotent` | Idempotent by design — an agent will retry |

`filter_trends` and `sort_trends` mutate view state, which the human sees
happen. That visibility is the point: the agent is driving the same controls,
not a shadow copy of them.

`list_visible_trends` carries `untrustedContentHint` because trend keywords and
sample captions are third-party text. An agent must treat them as data.

### Trend detail open

| Tool | Annotations | Notes |
|------|-------------|-------|
| `get_trend_detail` | `readOnly`, `untrustedContent` | Spike series, related keywords, samples, and full clip transcripts |
| `write_trend_summary` | — | Agent writes the "why is this rising" analysis into the page |
| `play_clip` | `idempotent` | Starts a clip in the drawer's player, in front of the human |
| `analyze_trend` | — | Live model call through `/api/analyze`; the no-agent floor |

`write_trend_summary` is the first of the two moments that only WebMCP enables.
The analysis appears on the page, next to the chart the human is looking at.

`play_clip` is small and carries more weight than its size. The agent is
driving the same video player the human would click, on the same screen, and
the human watches it happen. It is the cheapest possible demonstration of the
claim the whole project makes, and it is refused for any clip not attached to
the open trend.

`analyze_trend` is the floor described above, not the headline. Its
`description` says so: use it when no agent can do the reasoning directly.

### Products route

| Tool | Annotations | Notes |
|------|-------------|-------|
| `list_products` | `readOnly` | id, name, one-line positioning |
| `get_product` | `readOnly`, `untrustedContent` | Full record including do-and-do-not |
| `create_product` | — | Returns the new id |

### Product open

| Tool | Annotations | Notes |
|------|-------------|-------|
| `update_product` | `destructive`, `idempotent` | Overwrites named fields only |
| `delete_product` | `destructive` | Requires the id currently open — never a bare name |

`delete_product` deliberately takes only the open product's id. An agent cannot
delete something the human is not looking at. This is a small constraint that
removes a large category of accident.

### Brief composer — registered only when a trend and a product are both selected

| Tool | Annotations | Notes |
|------|-------------|-------|
| `get_brief_context` | `readOnly`, `untrustedContent` | Trend + full product record, bundled |
| `save_brief` | — | hook, outline[], tone, cta, hashtags[], audience |

This pair is the product. Registering them only when both selections exist is
the clearest demonstration in the app that the surface tracks state — the human
picks a product on camera and two tools appear.

### Briefs library

| Tool | Annotations | Notes |
|------|-------------|-------|
| `search_briefs` | `readOnly` | query + status/platform/date filters |
| `update_brief_status` | `idempotent` | `draft → approved → published`, forward only |

### Calendar — Phase 5, cuttable

| Tool | Annotations |
|------|-------------|
| `schedule_brief` | `idempotent` |
| `list_schedule` | `readOnly` |

## Tool Design Rules

Rules the tool files must follow, derived from what goes wrong otherwise.

**Return structured data, never prose.** The agent writes the prose. A tool
that returns a sentence has made a formatting decision that belongs to the
agent and is harder to reason over.

**Name tools as verbs on this app's nouns.** `search_trends`, not `search`. An
agent may have tools from several origins on its surface at once.

**Descriptions say when to use the tool, not what it does.** "Use after the
human has opened a trend, to explain why it is rising" beats "writes a summary".

**Mark every user-authored return `untrustedContentHint`.** Product
descriptions, trend keywords and sample captions are text a person or a third
party wrote. An agent reads them; it does not obey them.

**Mutating tools are idempotent where the semantics allow.** Agents retry.
`save_to_watchlist` called twice is called once.

**Every executor validates its own input.** The schema is a hint to the agent,
not a guarantee about what arrives. Reject unknown ids with a clear message
rather than writing a dangling reference.

**Every executor is honest in failure.** Returning `{ ok: false, reason }`
teaches the agent to correct itself; throwing an opaque error does not.

## Scope Reductions, Deliberate

| Reduction | Instead | Why |
|-----------|---------|-----|
| No backend except one function | `localStorage` + `netlify/functions/analyze.ts` | No accounts, no privacy surface. One secret, scoped to one endpoint, degrading to a committed fallback |
| No router library | Hash route in a reducer | Zero deps; six routes do not need more |
| No chart library | Hand-rolled SVG sparklines and bars | A chart lib is ~100KB and an hour of API learning |
| No component library | The existing CSS plus the panel's tokens | Consistency with the inspector matters more than breadth |
| No real scraper | Seeded fixtures, badged `demo data` | Not judged; would consume the window |
| No stock-footage sourcing | 12 cc0 clips copied from ClipBrief | Same author, no licence to clear, already encoded and measured |
| No auth | Single user | Nothing to protect |

Each of these is reversible after the deadline. None of them is load-bearing on
the WebMCP story, which is the point of choosing them.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Netlify origin strips or overrides the `tools` Permissions-Policy | Fatal — no tools | Verify on the deployed origin in Phase 0, not Phase 6 |
| ChatGPT in-app browser behaves differently from flagged Chrome | Demo fails on camera | Phase 0 exit criteria require both, before any feature work |
| `localStorage` empty on the judge's first visit | App looks broken | Seed fixtures on first run; verify in a private window |
| Agent calls tools faster than React commits | Torn reads | Executors read from the store, never from render-scope state |
| Schedule slips past T+8:30 | No submission | Phase 5 is pre-designated as the cut; PROGRESS.md tracks it hourly |
| Netlify Function fails to deploy or `GEMINI_API_KEY` is unset | `analyze_trend` dead | Tier 3 fallback returns the committed summary; the agent path never touched the function. Verify in Phase 0 |
| Gemini free-tier quota exhausted mid-demo (20/day/model) | Live call 429s | `lib/llm` retries with backoff, then degrades to `cached`. Do the demo take on the agent path, which needs no quota |
| `GEMINI_API_KEY` committed to the repo by accident | Key leak in a public repo | Key lives only in Netlify's env UI. `.env.local` is gitignored before the function is written, not after |
| 8.8MB of media slows first paint on the judge's connection | App looks broken | Posters are jpg and load eagerly; mp4 is `preload="none"` and only fetched on `play_clip` or a click |
