# Devpost Submission — Anglebook

Paste this into the Devpost form. Fields marked **Fill in** need entrant-only
evidence and are intentionally blank.

## Project details

| Field | Value |
|---|---|
| Project name | Anglebook |
| Tagline | Content research and brief writing, with an AI agent that works the exact surface a human is viewing. |
| Live app | https://trend-lake.vercel.app |
| Source code | https://github.com/codeby-dani/TrendDashboard |
| Demo video | **Fill in:**  |
| Devpost project URL | **Fill in:**  |

## Elevator pitch

Anglebook is a content-marketing workspace where a human researches trends,
manages business context, and reviews briefs while an AI agent can read the
same view state and write structured results directly back into the app through
WebMCP. Instead of rebuilding context through copy-paste, the agent gets only
the tools that make sense for the screen the human is currently using.

## Description

### The problem

Content teams lose context when moving between a trend dashboard, product
notes, an AI chat, and a brief document. A person must repeatedly copy the
trend, find the relevant product details, restate brand constraints, and paste
the result back somewhere useful. That is slow, error-prone, and makes human
review happen after the important context has already been lost.

### The solution

Anglebook keeps trend research, a business profile, content briefs, a calendar,
and performance context in one workspace. A connected agent works alongside
the person rather than beside the product: it can inspect the selected trend,
read the brand's offerings and do-not-say guidance, and save a drafted brief
into the library. The human selects the trend and product, edits the result, and
controls publishing.

### Why WebMCP

The useful context is view state: the trend currently open, the business
offering currently selected, and the brief's current workflow state. WebMCP
exposes that state as structured tools instead of requiring the human to
reconstruct it in a prompt. The tool surface is state-dependent: the dashboard
has the two global tools; Trends adds its trend tools; opening a trend adds
detail, playback, and summary tools; and brief-composer tools appear only when
both a trend and offering are selected. Closing that context removes those
tools again.

This makes the collaboration legible. The page provides grounded facts and
capabilities, the agent supplies reasoning and draft content, and the human
remains accountable for the final decision. In particular, `save_brief` creates
a draft and cannot publish it.

### Honest demo data

Anglebook separates demonstration data from measured evidence. Trend volumes,
growth, engagement, and analytics are invented for the demo and carry a `demo
data` badge. The 12 cc0 clips are self-generated and their duration, word
count, speaking rate, and hook length are derived from the encoded files by a
committed script; those values carry a `measured` badge. The app does not present
invented metrics as observed data.

## How it was built

- React 19 and TypeScript for the single-page application
- Vite 8 for local development and production builds
- WebMCP through `document.modelContext`, with `AbortSignal` lifecycles so tools
  register and disappear with app state
- A local `window.__td` bridge exposing the same schemas and executors for
  JavaScript-capable agents without native WebMCP support
- Local React-compatible stores persisted in browser `localStorage`; no database
- Vercel hosting and a same-origin serverless `/api/analyze` endpoint
- Gemini, called only from that server endpoint for the optional trend-analysis
  path; brief generation remains agent-authored
- CSS custom properties based on the TrendDashboard Dark Stitch design system;
  no new runtime UI dependencies
- A committed clip-measurement script and 12 cc0 clips from the author's
  ClipBrief corpus

## Key implementation details

- Tool calls return structured data, never prose, and each call receives a
  trace ID recorded in a bounded local event log.
- User-authored fields are marked as untrusted content for agents.
- Mutating tools are designed to be idempotent where their semantics permit it.
- The app works manually without an agent: agent-writable fields are also
  editable in the UI.
- The deployment sends `Permissions-Policy: tools=(self)`.

## Challenges

The main design challenge was avoiding a static, overloaded agent tool list.
The implementation ties registration to route and selection state so an agent
is not offered an operation that cannot succeed. A second challenge was being
honest about a seeded hackathon dataset without making the experience feel like
a mockup; the separate `demo data` and `measured` badges make the boundary
visible.

## What we learned

WebMCP is most useful when it represents what a person is doing now, not when
it mirrors a generic backend API. State-scoped tools reduce agent ambiguity,
and writing agent output into the product's existing workflow makes the result
reviewable and durable.

## What is next

- Replace seeded trend metrics with a transparent, consented data source.
- Add account connections and real performance ingestion.
- Expand collaboration history so teams can review agent actions and human
  edits together.
- Validate the WebMCP flow across more native agent browsers as support grows.

## Submission evidence to add manually

| Item | Value |
|---|---|
| Public YouTube URL | **Fill in:**  |
| Video duration | **Fill in:**  |
| Audio playback checked | **Fill in:** yes / no |
| Signed-out video check | **Fill in:** yes / no |
| ChatGPT in-app browser check | **Fill in:** date and result |
| Chrome 149+ testing-flag check | **Fill in:** date and result |
| Devpost submission confirmation | **Fill in:** URL or confirmation text |
| Entrant eligibility confirmations | **Fill in:**  |

## Licence and provenance

The application is MIT licensed. The project was created during the WebMCP
Challenge submission window. The clip corpus is reused media from the author's
own public ClipBrief repository: each clip is recorded as cc0 and self-generated
(author-written script, macOS text-to-speech, generated footage). No
third-party media is used.
