# Diagrams

Source is `.drawio`. Open in draw.io / the VS Code extension to edit — the
`.svg` and `.png` beside each are exports and should be regenerated after any
change, never edited directly.

| File | What it shows |
|------|---------------|
| `architecture.drawio` | The whole system: agent runtimes, the WebMCP layer, the tool layer, stores, routes, seed fixtures and delivery |
| `brief-flow.drawio` | The core loop from `plan/00-prd.md`, as a flowchart — columns are actors (human, page, agent), rows are time |

Both were built through the emitters in
`~/.claude/skills/drawing-architecture-diagrams` and
`~/.claude/skills/drawing-flowcharts`, with every connector explicitly routed.
If you need to restyle or extend one, rebuild it through the emitter rather
than patching the XML — a hand-edited connector loses its route and draw.io
will re-pick a path through whatever box now sits in the way.

Both files currently check clean: `0 FAIL, 0 warn`.
