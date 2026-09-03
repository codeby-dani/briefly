# Phase 0 — Foundation

**Window:** T+0:00 → T+1:15 · **Cuttable:** no

Widened by 15 minutes to absorb the corpus copy and the function smoke test.
Taken out of Phase 6's polish budget, not out of Phases 2–4.

## Status

- [x] Vite starter content removed from `App.tsx` — present in the deployed Phase 1 bundle
- [x] App shell renders with `ToolSurfacePanel` and `UnsupportedBrowserNotice` — deployed
- [ ] Global tools register and are visible in the panel — two tools are present in the deployed bundle; required browser runtime check pending
- [x] Deployed to Vercel, live URL recorded in `PROGRESS.md` — `https://trend-lake.vercel.app`
- [ ] Tool surface confirmed on the **deployed origin** in both environments — ChatGPT and flagged Chrome checks pending
- [x] 12 clips copied into `public/media/`, `src/fixtures/clips.ts` generated — poster and MP4 return their real media content types from the deployed origin
- [ ] `/api/analyze` returns structured JSON — deployed POST timed out on 2026-09-03; ten-second upstream timeout is ready on `feat/hackathon-compliance`
- [ ] `GEMINI_API_KEY` set in Vercel project env; `/api/analyze` returns 200 — inspect the environment and retest after deploying the timeout fix

The static application and corpus are deployed. The phase remains open because
the required browser checks have not been performed and the live function does
not yet return a response.

**Added beyond the original scope, at your request:** every tool is also served
at `window.__td` so Claude — and any other agent that can run JavaScript on the
page but has no WebMCP browser — can reach the same tools through the same
executors. See `src/webmcp/bridge.ts` and the new section in `01-architecture.md`.

## Why This Is First

Nothing downstream matters if the deploy path is broken, and the deploy path
has two failure modes that are invisible on localhost: the `tools`
Permissions-Policy being stripped by the host, and the ChatGPT in-app browser
behaving differently from flagged Chrome. Both must be ruled out before an hour
of feature work is committed to an origin that cannot carry it.

The existing `src/webmcp/` layer is complete and correct. This phase does not
touch it.

## Tasks

1. Strip `App.tsx` down to a shell: header, nav placeholder, main slot.
   Keep `App.css`; the palette is reusable.
2. Mount `<UnsupportedBrowserNotice />` at the top of the document and
   `<ToolSurfacePanel />` at the root.
3. Register one throwaway tool — `get_app_state` returning a stub is the right
   choice, since Phase 1 keeps it.
4. `npm run build` locally. Fix any type errors now; TypeScript 6 with a fresh
   config will surface things.
5. Deploy: push `main` to GitHub and let Vercel's GitHub integration build it.
   Record the URL in `PROGRESS.md` and clear blocker B2.
6. Open the deployed URL in the **ChatGPT desktop in-app browser**. Ask the
   agent to list its tools. Confirm the throwaway tool appears.
7. Open the same URL in **Chrome 149+** with
   `chrome://flags/#enable-webmcp-testing` set to Enabled and restarted.
   Confirm the panel shows the tool.
7b. Open the same URL with **Claude** (or any agent driving an ordinary browser)
   and have it run `window.__td.listTools()`, then
   `await window.__td.callTool('get_app_state', {})`. Confirm the same tool and
   the same payload as the WebMCP path, plus a `_trace` id. No flag required.
8. Open it in a **private window** to confirm nothing depends on warm
   `localStorage`.
9. **Copy the corpus.** From `github.com/aliefauzan/ClipBrief`, copy
   `public/media/*` (12 mp4, 12 jpg, 6 vtt — 8.8MB) into `public/media/`. Then
   generate `src/fixtures/clips.ts` from that repo's `data/corpus.json`:
   remap `category` per the table in `02-data-model.md`, carry `signals`
   through verbatim, and inline each transcript's `fullText` from
   `data/transcripts/`. Commit the media. Confirm one poster and one mp4 load
   from the deployed origin.
10. **Stand up the function.** `api/analyze.ts`, returning
    `{ ok: false, error: 'llm_unavailable', message, hint }` with status 503
    when `GEMINI_API_KEY` is absent. Deploy. `curl` the deployed
    `/api/analyze` and confirm the 503 JSON, not a 404 — a 404 means the
    SPA rewrite is swallowing `/api`, and finding that out in Phase 2 costs
    more than finding it out now.
11. Set `GEMINI_API_KEY` in Vercel's project environment variables — **never in
    a committed file**.
    Confirm `.env.local` is gitignored *before* writing any key anywhere.
    `curl` again and confirm a 200.

## Exit Criteria

Observable, not felt:

1. A public Vercel URL exists and is written into `PROGRESS.md`.
2. In the ChatGPT in-app browser, the agent lists at least one tool from this
   origin without any setup by the visitor.
3. In flagged Chrome, `ToolSurfacePanel` shows a green dot and a count of 1.
3b. In an ordinary browser with no flag, `window.__td.listTools()` returns the
   same tool and `callTool` executes it — the Claude path.
4. In a private window, the page renders without errors.
5. `npm run build` exits 0.
6. A clip poster and its mp4 both load from the deployed origin.
7. `curl -X POST <url>/api/analyze -d '{}'` returns JSON with an `ok` field —
   503 before the key is set, 200 after. Not a 404, not HTML.
8. `git grep -i AIza` and `git grep GEMINI_API_KEY -- ':!*.md'` return nothing
   outside `.env.example`.

## If This Runs Long

It must not. If the deploy is still not working at T+1:15, stop feature work
and fix it — a perfect app on localhost scores zero. If the *ChatGPT browser*
specifically is the problem and flagged Chrome works, continue building and
carry it as blocker; the rules accept either environment, though the demo is
better in the ChatGPT one. If neither WebMCP environment is available at all, the
bridge still gives Claude a working agent path — but it does not satisfy
requirements 1 and 2 in `03-hackathon-compliance.md`, and must never be reported
as if it did.

If the **function** is what runs long, cut it here and move on. `analyze_trend`
is the floor, not the feature — Phases 1–4 do not depend on it, and shipping
tiers 1 and 3 is the original architecture working as designed. Do not spend
Phase 2's budget debugging a serverless deploy.
