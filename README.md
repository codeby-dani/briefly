# Briefly

![License](https://img.shields.io/badge/License-MIT-7b2cbf?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![WebMCP](https://img.shields.io/badge/AI%20surface-WebMCP-a855f7?style=flat-square)
![Gemini](https://img.shields.io/badge/Analysis-Gemini-4285f4?style=flat-square&logo=googlegemini&logoColor=white)
![Live demo](https://img.shields.io/badge/Live%20demo-Vercel-111111?style=flat-square&logo=vercel&logoColor=white)
![Challenge](https://img.shields.io/badge/Google%20x%20Devpost-WebMCP%20Challenge-0f7490?style=flat-square)

<p align="center">
  <img src="public/brand/briefly-readme-banner.png" alt="Briefly — Smart content. Faster." width="100%" />
</p>

> **briefly** · Turn trend research and business context into grounded content briefs.

Briefly is a content-marketing workspace where trend research, a business profile,
and brief writing happen in one place — and where a connected AI agent works the
same surface the human does, over [WebMCP](https://github.com/webmachinelearning/webmcp).

The page does not do the reasoning. It exposes what the human is looking at as
tools, and the agent reads that context and writes results back into the app:
the brief lands in the library, not in a chat transcript.

Built for [The WebMCP Challenge](https://webmcp.devpost.com).

Live app: [trend-lake.vercel.app](https://trend-lake.vercel.app)

Briefly was created during the WebMCP Challenge submission window. Its git
history begins on 2026-09-03 with commit `ebe1b8a`; the application, WebMCP tool
surface, and every line under `src/` are new work from that window. The only
reused material is the author's own cc0 clip corpus described under
[Media](#media), not application code or a pre-existing product.

> **Status: Phases 1–5 of 7 are built; the live URL is behind them.** Trends,
> Product Knowledge, the brief composer and library, and now the Calendar and
> Performance routes all exist, and all 37 tools are written and driven. The
> deployed bundle currently predates Trends and Products, so several routes show
> older content on the live URL until the next deploy. Phase 5 was
> pre-designated as cuttable and was not cut. The last ten tools are a parity
> pass rather than new features: every one of them is a control the human
> already had on screen and the agent could not reach — taking a trend off the
> watchlist, reading the watchlist at all, the watchlist-only chip, the view
> reset, clearing a summary, stopping a clip, the calendar's status chips and
> its remove button, the CSV export, and the tool log the inspector panel shows.
> Progress and what is actually done live in
> [plan/PROGRESS.md](plan/PROGRESS.md) — that file, not this one, is the
> authority on state.

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
corner renders whichever surface is live, and every tool row in it carries a
paste-ready `callTool` line with a copy button — the required arguments are
filled in from the tool's own schema, so driving the app from the DevTools
console needs no hand-assembly from JSON Schema.

## Running it

```bash
npm ci
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

## Design

The palette, type and radii come from a [Stitch](https://stitch.withgoogle.com)
design system — *Briefly Dark*: dark mode, Inter, 8px corners, generated
from a `#aa3bff` seed with `#16171d` pinned as the neutral. A Dashboard screen
was generated from it and the layout in `src/routes/` is built against that
screen.

What is in the repo is the **token set, not the markup**. Stitch emits Tailwind;
this project ships zero runtime dependencies, so the hex values the Stitch API
resolved were transcribed into the custom properties at the top of
`src/index.css` and everything else references those. Nothing in `App.css` names
a colour directly.

Two deliberate departures, both to avoid shipping something nobody has looked
at:

- **Dark only.** The design system is dark and has no light counterpart. A
  `prefers-color-scheme` fork would have meant inventing a light palette Stitch
  never produced, so the page declares `color-scheme: dark` and commits.
- **Inter is asked for, never fetched.** The font stack requests Inter and falls
  through to the platform UI font. Pulling it from a font CDN would put a
  third-party request on the critical path of a page a judge opens once, on an
  unknown connection.

The inspector panel reads the same tokens through its own `--panel-*` custom
properties, so it shares the palette rather than looking bolted on.

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
| `src/store/` | Hash router, selection state, and one store per domain |
| `src/routes/` | One file per route |
| `src/components/` | Badges and the hand-rolled SVG charts |
| `src/fixtures/` | Seeded data and the generated clip corpus |
| `api/` | `/api/analyze`, the only server-side code |
| `plan/` | The sprint plan. `PROGRESS.md` first |

Licence: [MIT](LICENSE).
