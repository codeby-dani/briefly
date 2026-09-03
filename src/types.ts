/**
 * Shared domain types. Contracts live in plan/02-data-model.md; this file is
 * that document expressed in TypeScript, and the two must not drift.
 *
 * Phase 0 defines only what the shell and the clip corpus need. Trend, Product,
 * Brief and Analytics arrive with the stores in Phase 1.
 */

/**
 * The enums are arrays first and unions second so a tool's `inputSchema` and
 * the type system read from one list. A schema that offers an agent a platform
 * the app does not have is a rejection the agent cannot see coming.
 */
export const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x'] as const

export type Platform = (typeof PLATFORMS)[number]

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value)
}

export const CATEGORIES = [
  'beauty',
  'food',
  'fashion',
  'tech',
  'fitness',
  'finance',
] as const

export type Category = (typeof CATEGORIES)[number]

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

/* ------------------------------------------------------------------------- *
 * Phase 1 — stores. Contracts: plan/02-data-model.md § Types.
 * ------------------------------------------------------------------------- */

/**
 * Where a trend's analysis came from. `null` until something writes one.
 * The UI renders this verbatim next to the summary (`summary-source`), because
 * a cached fixture passed off as a fresh model call is the one dishonesty this
 * project cannot afford.
 */
export type SummarySource = null | 'agent' | 'model' | 'cached' | 'human'

/**
 * The committed fallback `analyze_trend` serves when there is no key and no
 * agent. plan/02-data-model.md § Seed Data asks for one per clip-backed trend.
 *
 * One nested record rather than four loose fields on `Trend`, because the four
 * values have to travel together: a summary without the model id and the date
 * beside it is a summary a judge cannot tell apart from a fresh one, and that
 * is the single dishonesty this project cannot afford.
 */
export interface CachedAnalysis {
  summary: string
  suggestedAngles: string[]
  /** The model that actually wrote it. Rendered verbatim in the drawer. */
  model: string
  /** ISO date. */
  generatedAt: string
}

export interface Sample {
  author: string
  text: string
  /** Invented. Badged `demo data`. */
  engagement: number
  /** Present when this sample is backed by a real playable clip. */
  clipId?: string
}

export interface Trend {
  id: string
  keyword: string
  /** Mentions in the last 24h — invented, badged `demo data`. */
  volume: number
  /** Versus the previous 24h — invented, badged `demo data`. */
  growthPct: number
  platform: Platform
  category: Category
  /** ISO date. */
  firstSeen: string
  /** 14 daily points for the sparkline — invented. */
  spike: number[]
  relatedKeywords: string[]
  samples: Sample[]
  /** Clips in the corpus belonging to this trend; may be empty. */
  clipIds: string[]
  aiSummary: string | null
  aiSummarySource: SummarySource
  suggestedAngles: string[]
  /**
   * The `cached` fallback for `analyze_trend`. `null` on the 12 trends with no
   * clips: nothing grounds an analysis there, so the tool reports the failure
   * rather than serving an invented paragraph.
   */
  cached: CachedAnalysis | null
  /** Literal `true`, not a boolean: the badge cannot be forgotten. */
  demo: true
}

export interface Product {
  id: string
  name: string
  description: string
  usp: string[]
  priceIdr: number
  /** Things the brand will say. */
  dos: string[]
  /** Things the brand will not say. */
  donts: string[]
  updatedAt: string
}

export const BRIEF_STATUSES = ['draft', 'approved', 'published'] as const

export type BriefStatus = (typeof BRIEF_STATUSES)[number]

export function isBriefStatus(value: unknown): value is BriefStatus {
  return typeof value === 'string' && (BRIEF_STATUSES as readonly string[]).includes(value)
}

export interface Brief {
  id: string
  title: string
  trendId: string
  productId: string
  platform: Platform
  status: BriefStatus
  hook: string
  outline: string[]
  tone: string
  cta: string
  hashtags: string[]
  audience: string
  authoredBy: 'agent' | 'human'
  createdAt: string
  updatedAt: string
}

/** Phase 5, cuttable. Declared here so the store keys are complete. */
export interface ScheduleEntry {
  id: string
  briefId: string
  /** ISO date, day precision. */
  date: string
  platform: Platform
  pic: string
  status: 'planned' | 'in_progress' | 'published'
}

export interface AnalyticsContent {
  briefId: string | null
  title: string
  platform: Platform
  postedAt: string
  reach: number
  engagement: number
}

export interface Analytics {
  demo: true
  reach: number
  impressions: number
  engagementRate: number
  /** 30 daily points. */
  followerGrowth: number[]
  perContent: AnalyticsContent[]
  /** 24 buckets, relative score. */
  bestPostingHours: number[]
}
