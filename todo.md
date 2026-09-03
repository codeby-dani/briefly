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

Last swept **2026-09-03 23:05 WITA**, after the cross-branch reconciliation
audit — **4h 55m left**. This file holds *decisions*; `plan/PROGRESS.md` holds
*state* and is the authority on where the build actually is. Where the two could
disagree, believe PROGRESS.

**Nothing in the decisions below changed in that audit.** What changed is which
of them are true on a public origin: Phases 1–4 are code-complete on one tree
for the first time, but the deployed bundle predates Phase 2, so Trends and
Products are placeholders for anyone who opens the live URL right now. The
parallel merges had also left `main` unable to compile; that is repaired in the
working tree and not yet committed.

| Area | State |
|------|-------|
| Eligibility | `[ ]` BLOCKING |
| Devpost registration | `[ ]` BLOCKING |
| Repo + open-source licence | `[x]` MIT `LICENSE` present at repo root |
| WebMCP runtime verified | `[x]` `document.modelContext`, verified 2026-09-02 |
| Hosting target | `[x]` **Vercel** — explicitly allowed by the official rules, verified 2026-09-03; `vercel.json` committed and deployed from GitHub |
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
- [x] **Public repository** with an open-source licence visible.
      GitHub API reports the repo public and detects its MIT licence.
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
      to infer it from git history. Written on `feat/hackathon-compliance`;
      check after merge and deploy.

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
- [x] **Permissions-Policy checked on the deployed origin.** The response has
      no overriding header, so WebMCP keeps its default `self` allowlist.
      `vercel.json` now also emits `Permissions-Policy: tools=(self)` explicitly;
      verify that header after the branch deploys.

## 5. Scope Freeze

The feature list on the whiteboard is a product; ten hours is a demo. Split:

### Real (implemented, agent-callable)

These are `[x]` as *scope decisions* — the question this file asks is "is this in
or out", and all five are in. Build state is `plan/PROGRESS.md`'s job, and the
note beside each is a convenience, not a second source of truth.

- [x] Product Knowledge base — full CRUD, persisted · *Phase 3 built; create →
      update → delete driven locally, 4 → 5 → 4. Not on the deployed bundle*
- [x] Search, filter, sort across trends and briefs · *both built. Trends not on
      the deployed bundle; briefs are*
- [x] Brief generation — hook, outline, tone, CTA, hashtags, target audience ·
      *Phase 4 built and deployed; `save_brief` forces `draft`*
- [x] Trend "why is this rising" summary · *built in Phase 2 — four sources,
      `agent` / `model` / `cached` / `human`, each labelled on screen. The
      `model` source has still never been observed; see B6*
- [x] Brief library with status transitions · *Phase 4 built and deployed;
      forward-only machine, refusals carry `currentStatus`*

### Mocked (seeded fixtures, labelled `demo data` in the UI)

- [x] Trend scraping — seeded dataset, no live scraper
- [x] Account analytics — seeded metrics, no connected social accounts
- [x] KPI cards and 7/30-day performance charts
- [x] Sample engagement counts on trend samples

### Measured (derived from files in this repo, labelled `measured` in the UI)

- [x] Clip duration, file size, word count, words per minute
- [x] Hook end time and hook word count, segment count and mean length
- [x] All of it re-derivable by anyone who clones the repo and runs the script

Rendered as of Phase 2 in the trend drawer under the player
(`clip-signals-{clipId}`), with the `measured` badge on that section head and
`demo data` on the spike chart and the samples beside it — two claims, two
colours, never both on one value.

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
- [~] PDF export. SKIPPED — CSV only. Phase 5 survived and the CSV shipped.
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
      agent-only. One tool, `analyze_trend`, calls Gemini through a Vercel
      Function so a judge with no agent connected still sees an analysis
      appear. Key lives in Vercel's project env, never in the repo. Superseded
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
      opens it in plain Chrome. Built for everything that exists: the trend
      summary has a *Write it yourself* textarea that saves as `human`, a *Run
      analysis* button that takes the same `runAnalysis()` path `analyze_trend`
      takes, and a *Clear*. The action is hand-driveable, not only the text.
      Phases 3 and 4 have since landed and both hold the line: the product
      editor is a full hand-editable form with human Save and a guarded delete,
      and the brief composer's every field can be filled and saved with no agent
      connected. Still `[ ]` only because the Trends and Products halves of that
      claim are not on the deployed origin yet.

## 7. Design and Assets

- [~] **Design source.** Resolved without the key: Stitch was driven through its
      MCP connector, so no API key was needed, none was requested, and none is in
      this repo. **The previously pasted key is still exposed and still needs
      revoking (B3)** — that is a security item, not a design one, and using
      Stitch a different way does not close it.
- [x] **Decide: Stitch-generated screens, or hand-built from the existing CSS?**
      Both, in that order. A Stitch project and design system were created
      (`TrendDashboard Dark`, dark, Inter, 8px radii, seeded from `#aa3bff`).
      What landed in the repo is the resolved *token set* — the exact hex values
      the Stitch API returned — transcribed into `src/index.css`, with the layout
      hand-built against it. No generated markup was pasted: Stitch emits
      Tailwind, and `plan/README.md` forbids new runtime dependencies.

      **Re-verified against Stitch over MCP on 2026-09-03 23:05**, after three
      more routes had been hand-built in parallel by different sessions. The
      design system `assets/8039779349710605252` still resolves, and every token
      in `src/index.css` still matches it exactly — background `#0d0e14`,
      surfaces `#181921` / `#1d1f29` / `#232530`, text `#a9aab8` over `#e4e4f4`,
      accent `#c890ff`, `demo data` amber `#f0a227`, `measured` teal `#4fe0cf`.
      `App.css` holds exactly one raw hex in the file (`#000`, the video
      letterbox); every other colour reads a custom property, which is why three
      independently built routes look like one product.

      **One correction:** an earlier sweep recorded a generated Dashboard screen.
      `list_screens` on that project returns nothing — the project holds the
      design system and no screens at all. Generating screens for the Trends and
      Products routes was attempted twice over MCP at 23:05 and both calls timed
      out with nothing created. This changes no decision and blocks nothing: the
      decision recorded here is *token set from Stitch, layout hand-built*, and
      the token set is verified above. Reference screens would have been a
      convenience, not an input.
- [x] **Palette and shell** — reuse the dark panel tokens already in
      `src/webmcp/ToolSurfacePanel.tsx` so the inspector does not look bolted on.
- [x] **Standing rule for whoever runs the next phase: new UI starts from the
      Stitch design system, over MCP.** Project `15263749367928268748`, design
      system `assets/8039779349710605252`. Written into `plan/README.md`
      § Execution Constraints and into the phase-runner template so it is read
      at the top of every run rather than remembered. The rule binds the tokens,
      not the layout — restyling or restructuring a screen afterwards is fine,
      and only a deliberate departure from the design system needs a line in the
      session log.

## 8. Demo and Recording

- [ ] **Screen recorder ready and tested** before Phase 7 starts. A recorder
      that turns out to be broken at T-1h has ended entries before. TODO
- [ ] **Narration or captions?** Audio is *required* by the rules, so narration
      it is — captions alone do not satisfy it. TODO confirm mic works.
- [ ] **Recording environment**: ChatGPT desktop in-app browser, since it needs
      no flag and shows the agent and the page side by side. TODO
- [ ] **Two takes minimum.** Budget for it in the Phase 7 timebox.

## 9. Outstanding Minimal Tasks

- [x] Public repo visibility is public; verified through the GitHub API on
      2026-09-03
- [x] README rewritten from the Vite template to the actual project — Phase 0.
      Phase 7 still adds the creation-window provenance paragraph
- [ ] `data-testid` on every element the demo touches — on for everything built
      so far. Shell, panel rows and badges from Phases 0–1; the Trends surface
      from Phase 2 (`trend-row-{id}`, `trend-detail`, `trend-summary`,
      `summary-source`, `clip-player`, `clip-signals-{clipId}`, plus the search,
      filter, sort and watchlist controls); the Products surface from Phase 3
      (`product-list`, `product-card-{id}`, `product-editor`, `close-product`,
      `product-form-edit`, `product-usp-{n}`, `product-dos-{n}`,
      `create-product`); the Briefs surface from Phase 4 (`composer-trend`,
      `composer-product`); and the Phase 5 routes (`calendar-grid`,
      `calendar-day-{iso}`, `schedule-chip-{id}`, `schedule-entry-{id}`,
      `schedule-form`, `per-content-table`, `sort-{field}`, `export-csv`,
      `bar-chart`, `stacked-bar`, `tvr-row-{trendId}`). Every route is now
      covered; the box stays `[ ]` only because nothing is deployed
- [x] The merged tree builds and every route is reachable — `npm run build`
      exits 0 and all six routes render with the surface counts 2 / 8 / 5 / 4 /
      2 / 2. Added 2026-09-03 23:05: the parallel merges had silently dropped
      the `trends` and `briefs` route branches and one type guard, and `main`
      did not compile at all. Re-run both checks after every future merge.
      Re-run 2026-09-03 23:40 on `phase5` after fast-forwarding to `1b81994`:
      build exits 0, counts are 2 / 8 / 5 / 4 / **4** / 2 and 12 with a trend
      open — the calendar moved because Phase 5 registers two tools there
- [ ] Vercel deploy verified from a cold browser, not just localhost —
      **BLOCKING four phases now, and the live URL is actively misleading.** The
      deployed bundle predates Phase 2: a judge opening it today finds Trends and
      Products as placeholders. Phases 0–4 are code-complete and verified on
      `localhost:4173`; none can close until this happens
- [ ] Submission entered on Devpost **by T-30m**, not at the deadline
