# TrendDashboard

A content-marketing workspace where trend research, product knowledge and brief
writing happen in one place — and where a connected AI agent works the same
surface the human does, over [WebMCP](https://github.com/webmachinelearning/webmcp).

The page does not do the reasoning. It exposes what the human is looking at as
tools, and the agent reads that context and writes results back into the app:
the brief lands in the library, not in a chat transcript.

Built for [The WebMCP Challenge](https://webmcp.devpost.com).

> **Status: Phase 0 of 7.** The shell, the clip corpus and the first tool are in.
> Routes, stores and the remaining twenty tools land in Phases 1–5. Progress and
> what is actually done live in [plan/PROGRESS.md](plan/PROGRESS.md) — that file,
> not this one, is the authority on state.

## Trying it with an agent

`document.modelContext` is a Chrome 149+ feature. It ships enabled in exactly one
place today, so the tools are reachable three ways rather than one:

| Environment | How | Needs a flag |
|---|---|---|
| **ChatGPT desktop app** | Open the URL in its built-in browser and ask what it can do here. | no |
| **Chrome 149+** | `chrome://flags/#enable-webmcp-testing` → Enabled → restart. | yes |
| **Claude, or any agent that can run JavaScript on the page** | `window.__td` — see below. | no |

### The bridge, for Claude and everything else

Claude has no WebMCP-native browser today, so waiting for one would mean the
tools are unreachable for it. Instead every tool registers twice: with
`document.modelContext` where that exists, and always with a small local registry
exposed at `window.__td`.

```js
window.__td.describe()                     // what this surface is
window.__td.listTools()                    // name, description, schema, annotations
await window.__td.callTool('get_app_state', {})
window.__td.onChange(fn)                   // fires when the surface changes
```

Same names, same schemas, and the *same executor functions* as the WebMCP path —
one definition, two doors, so the two cannot drift apart. It is not a WebMCP
implementation and does not pretend to be one: a browser that has the real API
uses the real API, and the bridge is what everyone else gets.

That also makes the app inspectable with no agent at all. The panel in the
corner renders whichever surface is live.

## Running it

```bash
npm install
npm run dev
```

`npm run build` must exit 0 before anything is called done.

### The one server-side endpoint

`/api/analyze` is a Vercel Function backing a single tool, `analyze_trend`, so a
visitor with no agent connected still sees an analysis happen instead of an empty
field. It calls Gemini's free tier.

```bash
cp .env.example .env.local   # then put GEMINI_API_KEY in it
```

On Vercel the key goes in the project's environment variables and **never** in a
committed file. With no key the endpoint returns a structured `503 llm_unavailable` and the
tool falls back to a committed summary labelled `cached` — nothing becomes a dead
button. Brief generation deliberately has no model path at all: `save_brief` is
agent-only.

## Two badges

Numbers on screen are labelled by where they came from, and the two claims are
never blurred:

- **`demo data`** — invented for the demo. Trend volumes, growth rates,
  engagement, all analytics. Nobody observed these.
- **`measured`** — derived from a file in this repo by a committed script
  (`scripts/generate-clips.mjs`, over ClipBrief's measurements). Clip duration,
  word count, speaking rate, hook length.

## Media

The 12 clips in `public/media/` come from
[ClipBrief](https://github.com/aliefauzan/ClipBrief), a public repo by the same
author. Every clip is `cc0` and self-generated — script written by the author,
voiced with macOS text-to-speech, over generated footage. No third-party media
is used anywhere in this project.

## Layout

| Path | What |
|---|---|
| `src/webmcp/` | Registration, lifecycle, the bridge, the live surface panel |
| `src/tools/` | Tool definitions — schemas, executors, trace wrapper |
| `src/fixtures/` | Seeded data and the generated clip corpus |
| `api/` | `/api/analyze`, the only server-side code |
| `plan/` | The sprint plan. `PROGRESS.md` first |

Licence: [MIT](LICENSE).
