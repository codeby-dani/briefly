# TrendDashboard — Pre-Coding Decision Checklist

**Answer in place. Do not create a separate answers file.**

Checkbox states:

| State | Meaning |
|-------|---------|
| `[ ]` | Unanswered / not done |
| `[x]` | Answered and settled, or done **and deployed** |
| `[~]` | Deliberately skipped — reasoning appended inline |

Inline markers: `TODO` (needs an answer), `BLOCKING` (nothing downstream can
start until this is resolved), `SKIPPED` (cut on purpose, with a reason).

The distinction between "unanswered" and "answered no" is the entire point of
this file. Never leave an item ambiguous.

---

## Status Overview

**Hard deadline: 2026-09-03 13:00 PDT = 2026-09-04 04:00 WITA.**

At the time this file was written there were **10 hours 05 minutes** remaining.
Every scope decision below is downstream of that number. This is not a
13-day plan compressed; it is a 10-hour plan with a roadmap attached.

| Area | State |
|------|-------|
| Eligibility | `[ ]` BLOCKING |
| Devpost registration | `[ ]` BLOCKING |
| Repo + open-source licence | `[x]` MIT `LICENSE` present at repo root |
| WebMCP runtime verified | `[x]` `document.modelContext`, verified 2026-09-02 |
| Hosting target | `[x]` Netlify — `netlify.toml` already committed |
| Product scope frozen | `[x]` See "Scope Freeze" below |
| Demo video | `[ ]` BLOCKING — under 3 min, audio required |

---

## 1. Eligibility and Registration — BLOCKING

- [ ] **Age of majority met.** TODO
- [ ] **Resident of a country with OpenAI API access.** Indonesia is supported.
      Confirm nothing else in the rules excludes you. TODO
- [ ] **Registered on Devpost before the deadline.** Registration and
      submission close together at 13:00 PDT on 2026-09-03. TODO
- [ ] **Not an employee of OpenAI, Devpost, a judge, or immediate family of
      one.** TODO
- [ ] **Team members declared** (if any). Prizes list per-member value, so the
      roster must be right at submission time. TODO

## 2. Submission Artifacts — BLOCKING

Four artifacts are required. Missing any one disqualifies the entry.

- [ ] **Live URL** reachable in the ChatGPT in-app browser *and* in Chrome 149+
      with `chrome://flags/#enable-webmcp-testing` enabled. TODO
- [ ] **Public repository** with an open-source licence visible.
      `LICENSE` is committed; repo must be public before submitting. TODO
- [ ] **Demo video, under 3 minutes, with audio**, public on YouTube.
      TODO — see `plan/99-demo-script.md`.
- [ ] **Text description** covering: why WebMCP suits this use case, what the
      user experience gains, and how human and agent collaborate. TODO

## 3. WebMCP Provenance — BLOCKING

The rules require the project to be new within the submission window, or a
pre-existing project *meaningfully extended* with WebMCP and documented as such.

- [x] **Project is new.** Repo history starts at `ebe1b8a Initial commit:
      TrendDashboard`. No prior work to disambiguate.
- [ ] **README states the provenance explicitly** anyway, so a judge never has
      to infer it from git history. TODO

## 4. Runtime and API Surface

- [x] **Global object is `document.modelContext`.** An older draft used
      `navigator.modelContext` and most blog posts still say so — that path is
      stale and fails silently. Verified against the W3C explainer and Chrome's
      imperative-API docs on 2026-09-02.
- [x] **Unregistration is by `AbortSignal`.** `registerTool(def, { signal })`;
      aborting the controller removes the tool. There is no `unregisterTool`.
- [x] **`getTools()` returns `inputSchema` as a JSON *string*.** Normalise with
      `parseSchema()` before rendering or reasoning over it.
- [x] **`toolchange` fires on the model context** when the surface changes.
      This is what drives the live inspector panel.
- [x] **Origin isolation required.** WebMCP is disabled on any page that sets
      `document.domain`. We never set it.
- [ ] **Permissions-Policy `tools` header checked on the deployed origin.**
      Defaults to `self`, which is what we want, but confirm Netlify does not
      strip or override it. TODO

## 5. Scope Freeze

The feature list on the whiteboard is a product; ten hours is a demo. Split:

### Real (implemented, agent-callable)

- [x] Product Knowledge base — full CRUD, persisted
- [x] Search, filter, sort across trends and briefs
- [x] Brief generation — hook, outline, tone, CTA, hashtags, target audience
- [x] Trend "why is this rising" summary
- [x] Brief library with status transitions

### Mocked (seeded fixtures, labelled `demo data` in the UI)

- [x] Trend scraping — seeded dataset, no live scraper
- [x] Account analytics — seeded metrics, no connected social accounts
- [x] KPI cards and 7/30-day performance charts
- [x] Sample engagement counts on trend samples

### Measured (derived from files in this repo, labelled `measured` in the UI)

- [x] Clip duration, file size, word count, words per minute
- [x] Hook end time and hook word count, segment count and mean length
- [x] All of it re-derivable by anyone who clones the repo and runs the script

The 12 clips themselves are cc0 and self-generated, copied from
github.com/aliefauzan/ClipBrief. They carry **no** view, like or share counts:
a video that was never published cannot have them, and inventing one next to a
measured word rate would make both meaningless.

Every mocked surface carries a visible `demo data` badge; every measured value
carries `measured`. A judge must never have to guess which is which. This is
scored under Execution, and pretending seeded data is live reads as a defect
the moment anyone looks closely.

### Cut for the sprint — SKIPPED

- [~] Real scraping pipeline. SKIPPED — no time, and not what is being judged.
- [~] Team management and roles. SKIPPED — single-user demo.
- [~] PDF export. SKIPPED — CSV only, and only if Phase 5 survives.
- [~] Brief versioning. SKIPPED — duplicate-and-edit covers the demo.
- [~] Reminders and notifications. SKIPPED — nothing to notify in a 3-min demo.
- [~] Connect-social-media OAuth. SKIPPED — cannot be done safely in-window.
- [~] Help and Support pages. SKIPPED — README carries the docs.
- [~] Settings > MCP config panel. SKIPPED — the tool surface panel already
      shows what an agent can see, which is the same information with a better
      story.

## 6. Architecture Decisions

- [x] **Revised 19:50 — the agent is still the model, with one scoped
      exception.** Brief generation has no server path: `save_brief` is
      agent-only. One tool, `analyze_trend`, calls Gemini through a Netlify
      Function so a judge with no agent connected still sees an analysis
      appear. Key lives in Netlify's env UI, never in the repo. Superseded
      wording kept below for the record.
      > ~~No backend, no LLM API key in the page. The agent *is* the model.
      > Removes hosting cost, and is a stronger WebMCP story than calling an
      > LLM from a static site would be.~~
- [x] **Persistence is `localStorage`.** No accounts, no server, no privacy
      surface. Seed fixtures load on first run.
- [x] **Zero new runtime dependencies.** React 19 and React DOM only.
      Routing is a hash-based reducer, charts are hand-rolled SVG. Every
      dependency added between now and the deadline is a build risk with no
      time to absorb it.
- [x] **Tool surface is state-dependent.** Tools register and unregister as the
      human navigates and selects. `ToolSurfacePanel` renders it live, so the
      differentiator is visible on camera rather than asserted in narration.
- [ ] **Fallback path when no agent is connected.** Every agent-writable field
      needs a hand-editable equivalent, or the app looks broken to a judge who
      opens it in plain Chrome. TODO — Phase 1.

## 7. Design and Assets

- [ ] **Design source.** A Stitch key was proposed for this.
      **BLOCKING — that key was pasted into a chat transcript and must be
      treated as compromised. Revoke and reissue it before use.** It has not
      been written to any file in this repo and must not be.
- [ ] **Decide: Stitch-generated screens, or hand-built from the existing CSS?**
      At T-10h, hand-built is the lower-risk answer. TODO
- [x] **Palette and shell** — reuse the dark panel tokens already in
      `src/webmcp/ToolSurfacePanel.tsx` so the inspector does not look bolted on.

## 8. Demo and Recording

- [ ] **Screen recorder ready and tested** before Phase 7 starts. A recorder
      that turns out to be broken at T-1h has ended entries before. TODO
- [ ] **Narration or captions?** Audio is *required* by the rules, so narration
      it is — captions alone do not satisfy it. TODO confirm mic works.
- [ ] **Recording environment**: ChatGPT desktop in-app browser, since it needs
      no flag and shows the agent and the page side by side. TODO
- [ ] **Two takes minimum.** Budget for it in the Phase 7 timebox.

## 9. Outstanding Minimal Tasks

- [ ] Public repo visibility flipped on before submitting
- [ ] README rewritten from the Vite template to the actual project
- [ ] `data-testid` on every element the demo touches
- [ ] Netlify deploy verified from a cold browser, not just localhost
- [ ] Submission entered on Devpost **by T-30m**, not at the deadline
