/**
 * Briefs. Seeded with the six demo briefs the calendar rows point at — a
 * schedule entry with no brief behind it shows a raw id in its chip, so the two
 * seeds live in one fixture. They are marked `brf_seed_*` and authored by a mix
 * of human and agent, so a brief written during a demo is still obvious next to
 * them.
 *
 * The write helpers and the status machine live here rather than in the tool
 * file so the human path (the composer's Save button, the library's status
 * control) and the agent path (`save_brief`, `update_brief_status`) share one
 * implementation. Two code paths that could disagree about what a legal
 * transition is would be exactly the drift plan/02-data-model.md § State
 * Machines exists to prevent.
 */

import type { Brief, BriefStatus, Platform } from '../types'
import { SEED_BRIEFS } from '../fixtures/schedule'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const briefStore = createStore<Brief[]>(KEYS.briefs, () => SEED_BRIEFS)

export function readBriefs(): Brief[] {
  return briefStore.read()
}

export function readBrief(briefId: string): Brief | undefined {
  return briefStore.read().find((brief) => brief.id === briefId)
}

/** Briefs already written for one trend+offering pair. Feeds `get_brief_context`. */
export function readBriefsForPair(trendId: string, offeringId: string): Brief[] {
  return briefStore.read().filter((b) => b.trendId === trendId && b.offeringId === offeringId)
}

/** The fields a composer — human or agent — supplies. Everything else is set here. */
export interface BriefDraftInput {
  title: string
  trendId: string
  offeringId: string
  platform: Platform
  hook: string
  outline: string[]
  tone: string
  cta: string
  hashtags: string[]
  audience: string
}

function newBriefId(): string {
  return `brf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Write a new brief. Always lands as `draft`, whoever authored it — publishing
 * is a human decision made later through the status control, and the constraint
 * is structural here rather than advisory in a schema. Returns the stored brief.
 */
export function saveDraft(input: BriefDraftInput, authoredBy: 'agent' | 'human'): Brief {
  const now = new Date().toISOString()
  const brief: Brief = {
    id: newBriefId(),
    title: input.title,
    trendId: input.trendId,
    offeringId: input.offeringId,
    platform: input.platform,
    status: 'draft',
    hook: input.hook,
    outline: input.outline,
    tone: input.tone,
    cta: input.cta,
    hashtags: input.hashtags,
    audience: input.audience,
    authoredBy,
    createdAt: now,
    updatedAt: now,
  }
  briefStore.set((briefs) => [brief, ...briefs])
  return brief
}

/**
 * The status machine from plan/02-data-model.md § State Machines:
 *
 *   draft ──approve──► approved ──publish──► published
 *     ▲                    │
 *     └────── revise ──────┘
 *
 * Forward only, plus `approved → draft` for a revision. Nothing returns from
 * `published`. A same-status move is a legal no-op so an agent that retries
 * `update_brief_status` is not punished for being idempotent.
 */
export function canTransition(from: BriefStatus, to: BriefStatus): boolean {
  if (from === to) return true
  if (from === 'draft') return to === 'approved'
  if (from === 'approved') return to === 'published' || to === 'draft'
  return false // published is terminal
}

export type StatusResult =
  | { ok: true; from: BriefStatus; to: BriefStatus }
  | { ok: false; reason: string; currentStatus: BriefStatus }
  | { ok: false; reason: string; known: string[] }

/** Apply a status transition, validated against the machine. */
export function setStatus(briefId: string, to: BriefStatus): StatusResult {
  const brief = readBrief(briefId)
  if (!brief) {
    return { ok: false, reason: `no such brief: ${briefId}`, known: readBriefs().map((b) => b.id) }
  }
  const from = brief.status
  if (!canTransition(from, to)) {
    return {
      ok: false,
      reason: `cannot move a ${from} brief to ${to}`,
      currentStatus: from,
    }
  }
  if (from !== to) {
    briefStore.set((briefs) =>
      briefs.map((b) => (b.id === briefId ? { ...b, status: to, updatedAt: new Date().toISOString() } : b)),
    )
  }
  return { ok: true, from, to }
}
