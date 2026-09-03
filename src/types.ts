/**
 * Shared domain types. Contracts live in plan/02-data-model.md; this file is
 * that document expressed in TypeScript, and the two must not drift.
 *
 * Phase 0 defines only what the shell and the clip corpus need. Trend, Product,
 * Brief and Analytics arrive with the stores in Phase 1.
 */

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'x'

export type Category = 'beauty' | 'food' | 'fashion' | 'tech' | 'fitness' | 'finance'

export const ROUTES = [
  'dashboard',
  'trends',
  'products',
  'briefs',
  'calendar',
  'performance',
] as const

export type Route = (typeof ROUTES)[number]

export function isRoute(value: unknown): value is Route {
  return typeof value === 'string' && (ROUTES as readonly string[]).includes(value)
}

/**
 * Measured from the encoded file and its transcript by ClipBrief's
 * scripts/measure-clips.mjs. Nothing in here is invented — that is what
 * `measured: true` asserts, and why these values carry the `measured` badge
 * rather than `demo data`.
 */
export interface ClipSignals {
  durationS: number
  fileBytes: number
  words: number
  wordsPerMinute: number
  segments: number
  hookEndS: number
  hookWords: number
  avgSegmentS: number
  transcriptSource: 'caption' | 'stt'
  measured: true
}

export interface Clip {
  id: string
  title: string
  creator: string
  src: string
  poster: string
  captionTrack?: string
  license: 'cc0'
  sourceNote: string
  category: Category
  hashtags: string[]
  transcript: string
  signals: ClipSignals
}
