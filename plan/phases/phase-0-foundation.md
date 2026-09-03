# Phase 0 — Foundation

**Window:** T+0:00 → T+1:00 · **Cuttable:** no

## Status

- [ ] Vite starter content removed from `App.tsx`
- [ ] App shell renders with `ToolSurfacePanel` and `UnsupportedBrowserNotice`
- [ ] One throwaway tool registers and is visible in the panel
- [ ] Deployed to Netlify, live URL recorded in `PROGRESS.md`
- [ ] Tool surface confirmed on the **deployed origin** in both environments

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
5. Deploy to Netlify. Record the URL in `PROGRESS.md` and clear blocker B2.
6. Open the deployed URL in the **ChatGPT desktop in-app browser**. Ask the
   agent to list its tools. Confirm the throwaway tool appears.
7. Open the same URL in **Chrome 149+** with
   `chrome://flags/#enable-webmcp-testing` set to Enabled and restarted.
   Confirm the panel shows the tool.
8. Open it in a **private window** to confirm nothing depends on warm
   `localStorage`.

## Exit Criteria

Observable, not felt:

1. A public Netlify URL exists and is written into `PROGRESS.md`.
2. In the ChatGPT in-app browser, the agent lists at least one tool from this
   origin without any setup by the visitor.
3. In flagged Chrome, `ToolSurfacePanel` shows a green dot and a count of 1.
4. In a private window, the page renders without errors.
5. `npm run build` exits 0.

## If This Runs Long

It must not. If the deploy is still not working at T+1:00, stop feature work
and fix it — a perfect app on localhost scores zero. If the *ChatGPT browser*
specifically is the problem and flagged Chrome works, continue building and
carry it as blocker; the rules accept either environment, though the demo is
better in the ChatGPT one.
