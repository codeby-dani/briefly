# Phase 6 — Polish and Manual E2E

**Window:** T+7:30 → T+8:30 · **Cuttable:** partly

## Status

- [ ] Full manual E2E pass, agent-driven, in the ChatGPT in-app browser
- [ ] Full manual E2E pass, by hand, in a browser with no WebMCP
- [ ] Tool descriptions rewritten for an agent audience
- [ ] Annotations audited against `01-architecture.md`
- [ ] Keyboard and contrast pass on the demo path
- [ ] Event log tab shipped in `ToolSurfacePanel`

## Tasks

1. **Agent E2E.** Run the core loop from `00-prd.md` end to end, in the
   environment you will record in. Every failure found here is a failure that
   would otherwise be found on camera.
2. **No-agent E2E.** Same loop, by hand, in a browser with WebMCP off. Confirm
   `UnsupportedBrowserNotice` is visible and every AI field is editable.
3. **Description pass.** Rewrite every tool description to say *when to use it*.
   This is the cheapest available gain under WebMCP Leverage: descriptions are
   what the agent actually reads, and default ones read as unfinished.
4. **Annotation audit.** Every user-authored return has
   `untrustedContentHint`. `update_product` and `delete_product` have
   `destructiveHint`. Idempotent tools are marked. Read-only tools do not mutate
   stored data.
5. **Surface-count check.** Walk every route and compare against the state
   machine in `02-data-model.md`. Any mismatch is a guard bug.
6. **A11y on the demo path only.** Focus visible, tab order sane, contrast on
   the status chips and the growth colours. Not a full audit — the demo path.
7. **Event log tab** in the panel, per `04-observability.md`.

## Exit Criteria

1. The core loop completes agent-driven, in the recording environment, twice in
   a row without a reload.
2. The same loop completes by hand with no agent.
3. Surface counts match the state machine on all routes.
4. No console errors during either pass.
5. Every tool description says when to use the tool.
6. `npm run build` exits 0 and the deployed URL serves the current build.

## Cut Order Within The Phase

If time is short: keep 1, 2, 4 and 6. The event log tab and the a11y pass are
the cuts. Never cut the two E2E passes — they are the only thing standing
between you and discovering a break while recording.
