# 03 — Hackathon Compliance

Traceability from each rule to the thing in this repo that satisfies it.
Every row must be `[x]` before submitting.

Source: https://webmcp.devpost.com and https://webmcp.devpost.com/rules

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
| 1 | Working live URL, reachable in ChatGPT's in-app browser | Netlify deploy, Phase 0 | `[ ]` |
| 2 | Same URL working in Chrome 149+ with `#enable-webmcp-testing` | Same deploy, verified separately | `[ ]` |
| 3 | Public repo on GitHub/GitLab/Bitbucket | This repo, made public in Phase 7 | `[ ]` |
| 4 | Open-source licence, visible | `LICENSE` at repo root | `[x]` |
| 5 | Demo video under 3:00, **with audio**, public on YouTube | `99-demo-script.md` | `[ ]` |
| 6 | Text description: WebMCP fit, UX gain, collaboration | Draft below | `[ ]` |

Audio is required by the rules. Captions alone do not satisfy requirement 5.

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
- [ ] README states this explicitly, so a judge is not left to infer it.

### Media provenance

The 12 clips in `public/media/` are copied from
[ClipBrief](https://github.com/aliefauzan/ClipBrief), a public repo by the same
author. Every clip is `cc0` and self-generated: script written by the author,
voiced with macOS text-to-speech, over generated footage. **No third-party
media is used anywhere in this project.**

- [ ] README credits ClipBrief as the corpus source with a link
- [ ] `Clip.sourceNote` renders in the UI beside every player, not only in JSON
- [ ] `LICENSE` covers the repo; clip licence is recorded per-clip as `cc0`

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
| Gated by the `tools` Permissions Policy, default `self` | `[ ]` verify Netlify does not override |
| Function and page share one origin — no CORS, no cross-origin fetch from a tool | `[ ]` verify `/api/analyze` resolves same-origin on the deploy |
| No secret reachable from the client bundle | `[ ]` `GEMINI_API_KEY` set in Netlify env only; grep the built bundle for it in Phase 6 |
| Chrome needs 149+ and the testing flag | `[x]` `UnsupportedBrowserNotice` explains both paths |
| `getTools()` returns `inputSchema` as a JSON string | `[x]` `parseSchema()` |
| No `unregisterTool` — abort the signal | `[x]` `useTool` uses `AbortController` |

## Hosting

Approved platforms include Netlify. `netlify.toml` is committed. Netlify also
carries a $500 cash sponsor prize, which is not a reason to choose it, but it
is not a reason against.

## Text Description — Draft

To be pasted into the Devpost form. Refine in Phase 7; having a draft now means
the deadline never arrives with a blank field.

> **What it is.** TrendDashboard is a content-marketing workspace where the
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
