# 04 — Observability

There is no server, so there are no server logs. Everything observable has to
be observable in the page — which turns out to be an advantage, because the
thing you most need to see is what the agent did, and that is in the page
anyway.

## The Problem This Solves

When an agent calls a tool and nothing visible happens, there are four
possibilities and no way to tell them apart from the outside: the tool was
never on the surface, the agent called it with bad input, the executor threw,
or it succeeded and the UI failed to re-render. On a three-minute demo timer,
distinguishing those by guesswork is not viable.

## Trace IDs

Every tool execution gets an id at entry:

```ts
const traceId = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
```

It appears in the console line, in the event log, and in the returned payload
under `_trace`. When something looks wrong on screen, the id on screen matches
the id in the log matches the id the agent received.

Returning it to the agent is deliberate: an agent that reports "the call
returned `t_m1x9_4k2p` but nothing changed" has given you the thread to pull.

## The Event Log

A ring buffer of the last 200 tool events in `td:events`, written by a wrapper
that every executor goes through:

```ts
interface ToolEvent {
  traceId: string
  tool: string
  at: string          // ISO timestamp
  durationMs: number
  ok: boolean
  input: unknown      // truncated to 500 chars
  output: unknown     // truncated to 500 chars
  error?: string
  network?: {         // present only on analyze_trend
    endpoint: '/api/analyze'
    status: number
    source: 'model' | 'cached'
  }
}
```

`analyze_trend` is the only tool that leaves the page, so it is the only one
that can fail for reasons the rest of the log cannot explain — a 404 from a
misrouted function, a 503 from a missing key, a 429 from an exhausted free
tier. Recording `status` and `source` on the event turns all three into one
glance instead of a devtools session, which matters at hour seven.

The wrapper is applied centrally when tools are built, not by each executor. An
executor that has to remember to log will eventually forget, and it will forget
in the one that matters.

Rendered as a collapsible tab in `ToolSurfacePanel`, next to the surface list.
Two tabs, one panel: *what the agent can do* and *what the agent did*.

## Console Convention

```
[webmcp] t_m1x9_4k2p  save_brief  ok  34ms
[webmcp] t_m1x9_7b1q  open_trend  FAIL  no such trend: tr_999
```

One line per call, prefixed `[webmcp]` so a judge or a teammate can filter for
it. Failures print the input; successes do not, to keep the console readable
during a demo.

## Registration Logging

Registration and unregistration also log, because "the agent says it cannot see
the tool" is the other half of the failure space:

```
[webmcp] + write_trend_summary  (surface: 10)
[webmcp] - write_trend_summary  (surface: 8)
```

The surface count in the line is the cheapest possible check that the state
machine in `02-data-model.md` is behaving. A count that does not match the
table there is a bug, visible without opening the panel.

## Test IDs

`data-testid` goes on during the initial build of each component. Not in a
later pass — the later pass will not happen.

| Element | testid |
|---------|--------|
| Route container | `route-{name}` |
| Trend row | `trend-row-{id}` |
| Trend detail drawer | `trend-detail` |
| AI summary block | `trend-summary` |
| Product card | `product-card-{id}` |
| Product form | `product-form` |
| Brief card | `brief-card-{id}` |
| Brief status control | `brief-status-{id}` |
| Tool surface panel | `tool-surface` |
| Tool surface row | `tool-row-{name}` |
| Event log row | `event-{traceId}` |
| Demo data badge | `demo-badge` |
| Measured badge | `measured-badge` |
| Clip player | `clip-player` |
| Clip signal row | `clip-signals-{clipId}` |
| Summary provenance label | `summary-source` |

These earn their place twice: they make a manual E2E pass scriptable in Phase
6, and they make the demo recording repeatable when the first take goes wrong.

## What To Check When The Agent Sees No Tools

In order, because this is the failure that ends demos and the order matters:

1. **Is `document.modelContext` defined?** If not, the browser is wrong.
   `UnsupportedBrowserNotice` should already be visible — if it is not, the
   support check itself is broken. This is not fatal on its own: check
   `window.__td.listTools()`, which serves the same tools to any agent that can
   run JavaScript here. If the bridge has them and `modelContext` does not, the
   problem is the browser, not the app.
2. **Does the console show `+` lines?** No lines means registration never ran;
   the tool spec is probably `null` because a state guard is wrong.
3. **Does the surface count match `02-data-model.md`?** A mismatch localises
   the bug to one route's guard.
4. **Is `document.domain` set anywhere?** Setting it disables WebMCP silently.
   Nothing in this repo sets it; a third-party script could.
5. **Is the `tools` Permissions Policy intact on the deployed origin?** It
   defaults to `self`, which is correct, but a host that sends its own
   `Permissions-Policy` header can strip it. This is why Phase 0 verifies on
   the deployed origin rather than on localhost.

## What Not To Build

No analytics, no error reporting service, no session replay. The app has one
user for ten hours and then a judge. Anything that phones home is a privacy
surface, a dependency and a deploy secret, for information that the event log
already shows better.
