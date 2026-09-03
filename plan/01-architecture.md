# 01 — Architecture

## Shape

A static single-page React app. No server, no database, no model calls.

```
ChatGPT in-app browser  ──┐
                          ├─► document.modelContext ─► React tool layer ─► stores ─► localStorage
Chrome 149+ (flag on)  ───┘                                   ▲                          │
                                                              └────── UI reads/writes ───┘
```

The connected agent talks to the page through `document.modelContext`. The page
talks to itself through a small set of stores. Nothing else crosses a network
boundary after the initial asset load.

See `../docs/diagrams/architecture.drawio` for the drawn version, and
`../docs/diagrams/brief-flow.drawio` for the human–agent loop.

## The Central Decision: The Agent Is The Model

The page never calls an LLM.

The obvious build for "AI generates a brief" is a hosted function holding an
API key. That costs money, needs a backend, puts a secret in the deploy, adds a
failure mode the demo cannot survive, and — the part that actually matters —
produces a *worse* WebMCP story. An app that calls its own LLM and also exposes
tools is two products stapled together.

Instead the page exposes what it knows and accepts what it is told:

- `get_brief_context` returns the selected trend and the full product record.
- `save_brief` accepts a structured brief and writes it into the library.

The agent already connected to the page does the writing. This is the entire
premise of the standard — the page supplies capability, the agent supplies
reasoning — and following it removes the key, the backend and the cost at the
same time.

**Consequence to handle:** with no agent connected there is no generated brief.
Every AI-authored field is therefore also a plain editable field, with an empty
state that says which one it is waiting for. A judge in vanilla Chrome sees a
working brief editor, not a broken button.

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| WebMCP runtime | `src/webmcp/` | Registration, lifecycle, the live surface panel |
| Tool definitions | `src/tools/` | One file per route's tools; schemas and executors |
| Stores | `src/store/` | Typed state + `localStorage` persistence |
| Routes | `src/routes/` | Dashboard, Trends, Products, Briefs, Calendar, Performance |
| Fixtures | `src/fixtures/` | Seeded trends and analytics, marked `demo data` |

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

19 tools, plus 2 more if Phase 5 survives. Scope column is the condition under
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
| `get_trend_detail` | `readOnly`, `untrustedContent` | Spike series, related keywords, sample content |
| `write_trend_summary` | — | Agent writes the "why is this rising" analysis into the page |

`write_trend_summary` is the first of the two moments that only WebMCP enables.
The analysis appears on the page, next to the chart the human is looking at.

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
| No backend | `localStorage` | No accounts to build, no privacy surface, no deploy secrets |
| No router library | Hash route in a reducer | Zero deps; six routes do not need more |
| No chart library | Hand-rolled SVG sparklines and bars | A chart lib is ~100KB and an hour of API learning |
| No component library | The existing CSS plus the panel's tokens | Consistency with the inspector matters more than breadth |
| No real scraper | Seeded fixtures, badged `demo data` | Not judged; would consume the window |
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
