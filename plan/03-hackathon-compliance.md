# 03 — Hackathon Compliance

Traceability from each rule to the thing in this repo that satisfies it.
Every row must be `[x]` before submitting.

Source: https://webmcp.devpost.com and https://webmcp.devpost.com/rules

> **Current-state guard:** the deployed app is at Phase 1 with two tools. The
> judging narrative and Devpost description below describe the intended
> submission state; reconcile their tool count and feature claims against the
> deployed build before pasting them into a submission.

## Deadlines

| Event | When | Local (WITA) |
|-------|------|--------------|
| Submission closes | 2026-09-03 13:00 PDT | **2026-09-04 04:00** |
| Judging | 2026-09-04 → 09-21 | — |
| Winners announced | 2026-09-23 | — |

**Submit by T+9:30 (03:30 WITA), not at the deadline.** Devpost forms have
rejected uploads at the wire before, and there is no appeal.

## Required Artifacts

| # | Requirement | Satisfied by | State |
|---|-------------|--------------|-------|
| 1 | Working live URL, reachable in ChatGPT's in-app browser | `https://trend-lake.vercel.app`; origin returns 200, required browser check still pending. **The live bundle is stale** — see the note below | `[ ]` |
| 2 | Same URL working in Chrome 149+ with `#enable-webmcp-testing` | Same deploy; required browser check still pending. `document.modelContext` was absent in every browser available so far | `[ ]` |
| 2b | *Not required by the rules:* same tools reachable by Claude and any other JS-capable agent | `window.__td` bridge, `src/webmcp/bridge.ts`. **Exercised end to end on the live origin 2026-09-03 22:55**: `listTools()` answered, `navigate_to` drove all six routes, and `get_brief_context` returned a product USP with its three do-nots | `[x]` |
| 3 | Public repo on GitHub/GitLab/Bitbucket | `https://github.com/codeby-dani/TrendDashboard`, GitHub API reports `visibility: public` | `[x]` |
| 4 | Open-source licence, visible | `LICENSE` at repo root | `[x]` |
| 5 | Demo video under 3:00, **with audio**, public on YouTube | `99-demo-script.md` | `[ ]` |
| 6 | Text description: WebMCP fit, UX gain, collaboration | Draft below | `[ ]` |

Audio is required by the rules. Captions alone do not satisfy requirement 5.

**The live URL currently under-sells the entry, and that is a submission risk,
not just a deploy chore.** Measured on the public origin 2026-09-03 23:00, the
deployed bundle predates Phase 2: `/trends` and `/products` render "coming in
Phase 2 / Phase 3" placeholders and the tool surface stays at 2 there. A judge
following requirement 1 or 2 today would find 6 of the 21 tools and two of the
five real features. Phases 2 and 3 exist and are verified locally; they are
simply not on the origin, because the merged `main` could not compile until the
repair recorded in `PROGRESS.md`. Deploy before doing either browser check —
performing them against this bundle would burn the checks on the wrong build.

## Eligibility

| Requirement | State |
|-------------|-------|
| At least the age of majority | `[ ]` confirm |
| Resident of a country with OpenAI API access — Indonesia qualifies | `[ ]` confirm |
| Not an employee of OpenAI, Devpost, or a judge; not immediate family | `[ ]` confirm |
| Not an organization involved in running the hackathon | `[x]` |
| Registered on Devpost | `[ ]` **BLOCKING** |

## Provenance

The rules require the project to be created during the submission window, or a
pre-existing project *meaningfully extended* with WebMCP and clearly documented
as such.

- [x] Repo history begins at `ebe1b8a Initial commit: TrendDashboard`, within
      the window. No prior work exists to disambiguate.
- [ ] README states this explicitly, so a judge is not left to infer it. The
      wording is complete on `feat/hackathon-compliance`; check this only after
      the branch is merged and the README is visible on the public repo.

### Media provenance

The 12 clips in `public/media/` are copied from
[ClipBrief](https://github.com/aliefauzan/ClipBrief), a public repo by the same
author. Every clip is `cc0` and self-generated: script written by the author,
voiced with macOS text-to-speech, over generated footage. **No third-party
media is used anywhere in this project.**

- [x] README credits ClipBrief as the corpus source with a link; the public repo
      and detected MIT licence were verified on 2026-09-03
- [x] `Clip.sourceNote` renders in the UI beside every player, not only in JSON —
      `.source-note` in the clip card, Phase 0
- [x] `LICENSE` covers the repo; clip licence is recorded per-clip as `cc0` —
      every record in `src/fixtures/clips.ts` carries `license: 'cc0'`

Reusing the author's own prior corpus is asset reuse, not project reuse. The
application, the tool surface and every line of `src/` are new work inside the
window. Say this in the README rather than leaving a judge to check commit
dates against a second repo.

## Judging Criteria — What Answers Each

The four criteria carry equal weight. Each needs a specific answer, not a
general claim of quality.

### WebMCP Leverage

> "Thoroughness and skill in using WebMCP with genuine, non-trivial
> implementation."

The answer is the state-dependent tool surface. 21 tools that register and
unregister as the human navigates and selects, driven by `AbortSignal`
lifecycles, rendered live from the `toolchange` event. Not a fixed list bolted
on at page load.

Supporting evidence a judge can see without reading code:

- `ToolSurfacePanel` shows the surface changing in real time
- Tools carry correct annotations — `untrustedContentHint` on every
  user-authored return, `destructiveHint` on the two tools that destroy work
- `delete_product` is structurally constrained to the open product
- `save_brief` cannot publish; only a human can

### Execution

> "A functional, complete product experience beyond proof-of-concept."

The app works entirely by hand with no agent connected. Real and seeded
surfaces are visibly labelled. Six routes, full CRUD on Product Knowledge, and
a brief library with a real status machine.

The badging matters here specifically: a judge who discovers on their own that
the "live" trend data is fake scores execution down. A judge who is told up
front scores it as a scoped decision. Two badges do this work — `demo data` on
every invented number, `measured` on every value derived from a file in the
repo — and the difference between them is visible without reading code.

### Potential Impact

> "A credible case for solving real problems for real audiences."

The copy-paste loop between a content dashboard and a chat window is a real
daily cost for content teams, and the product knowledge that would make briefs
good is exactly the context that never survives the copy-paste. `00-prd.md`
carries the argument.

### Creativity and Ambition

> "Novel concepts differing from existing solutions."

The claim: a tool surface derived from view state rather than declared at load,
and a division of labour where the connected agent does the reasoning while the
page supplies capability and receives results. The brief generator has no model
behind it at all — if no agent is connected, no brief is written, by design.

The second claim is about honesty under mocking. The dataset is entirely
fictional and says so, while the processing over it is real: a live model call
reading committed transcripts, and clip signals measured from the encoded files
by a re-runnable script. Most demos blur invented and derived numbers together.
Separating them into two badges is a position about how a mocked demo should
present itself.

## Technical Constraints From the Spec

| Constraint | Handled |
|------------|---------|
| WebMCP disabled if `document.domain` is set | `[x]` never set |
| Origin isolation required | `[x]` single origin, static deploy |
| Gated by the `tools` Permissions Policy, default `self` | `[x]` deployed response does not override the default; `vercel.json` also sets `tools=(self)` explicitly for the next deploy |
| Function and page share one origin — no CORS, no cross-origin fetch from a tool | `[ ]` route is same-origin, but the function never answers. Re-measured 23:00: `GET` and `POST` both abort at 12s with no response, and `GET` should be an immediate `405`. Diagnosed in B6 as a Vercel runtime mismatch — a web-standard `Request`/`Response` default export with no `runtime: 'edge'` declaration — not a provider timeout and not a missing key |
| No secret reachable from the client bundle | `[x]` re-scanned 23:00: `GEMINI_API_KEY`, `AIza` and `apiKey` are all absent from the live production bundle. The name `GEMINI_API_KEY` appears only in `.env.example` and in `api/analyze.ts`, which is server-side; no key value is anywhere in the repo |
| Chrome needs 149+ and the testing flag | `[x]` `UnsupportedBrowserNotice` explains all three paths |
| WebMCP reaches only ChatGPT's browser and flagged Chrome | `[x]` `window.__td` bridge carries the same tools to Claude and any other JS-capable agent — additive, never a substitute for requirements 1 and 2 |
| `getTools()` returns `inputSchema` as a JSON string | `[x]` `parseSchema()` |
| No `unregisterTool` — abort the signal | `[x]` `useTool` uses `AbortController` |

## Hosting

**Vercel**, deployed from GitHub: a push to `main` is the deploy. `vercel.json`
is committed — SPA rewrite that excludes `/api`, and immutable cache headers on
`/media`. The function is `api/analyze.ts`, routed by its file path.

- [x] **Vercel is allowed.** Verified against the official rules on 2026-09-03:
      Submission Requirements explicitly list ChatGPT Sites, Cloudflare,
      Vercel, Render, Netlify, or any other provider of the entrant's choice.
      Vercel is also listed among the hackathon sponsors.

The single secret, `GEMINI_API_KEY`, lives in Vercel's project environment
variables and never in the repo.

## Text Description — Draft

To be pasted into the Devpost form. Refine in Phase 7; having a draft now means
the deadline never arrives with a blank field.

> **What it is.** Anglebook is a content-marketing workspace where the
> trend research, the product knowledge and the brief writing happen in one
> place — and where a connected AI agent works the same surface the human does.
>
> **Why WebMCP fits.** The context that makes a good content brief is on
> screen, not in a database: which trend the human has open, which product they
> are thinking about, and what the brand has decided it will not say. WebMCP
> exposes that view state as tools. And the output belongs back in the app, not
> in a chat transcript — so the agent writes the brief into the library, where
> it gets a status and a trend link.
>
> **What it changes for the user.** The loop today is: copy the trend into a
> chat window, paste in whatever product notes you can find, get prose back,
> paste it into a doc. Every hand-off rebuilds the context from scratch. Here
> the agent reads `get_brief_context` and writes `save_brief`, and the human
> watches the brief appear in front of them.
>
> **How human and agent collaborate.** Neither runs the loop alone. The human
> picks the trend, because they know the brand. The agent drafts, because it is
> faster. The human approves, because they are accountable — and `save_brief`
> is structurally unable to publish, so that stays true.
>
> **The implementation.** The tool surface is derived from app state rather
> than declared at page load. Twenty-one tools register and unregister through
> `AbortSignal` lifecycles as the human navigates and selects; an agent is never
> offered a tool that cannot currently succeed. A live inspector panel renders
> the surface from the spec's `toolchange` event, so you can watch it follow the
> human's selection rather than take our word for it.
>
> Every tool is also reachable at `window.__td` for agents without a WebMCP
> browser — Claude among them — from the same definition and the same executor,
> so the two paths cannot drift. The spec path is the real one where it exists;
> the bridge is what keeps the argument from depending on which agent the visitor
> happens to have.
>
> **Scope, stated honestly.** The dataset is fictional and labelled as such.
> Trend volumes, growth rates and account analytics are invented and carry a
> `demo data` badge everywhere they appear. The 12 clips are cc0 and
> self-generated — no third-party media — and their signals (duration, word
> count, speaking rate, hook length) are measured from the files by a committed
> script, so they carry a `measured` badge instead.
>
> The processing is real. Trend analysis is a model reading the actual
> transcripts of those clips at the moment it is asked. Brief generation has no
> model behind it at all: the connected agent writes every brief through
> `save_brief`, and there is no server path that does it instead. One tool,
> `analyze_trend`, makes a server-side model call so a judge with no agent
> connected still sees the analysis happen — and it labels its own output
> `model` or `cached` rather than passing a fixture off as fresh.
