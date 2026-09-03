#!/usr/bin/env node
/**
 * Generate `src/fixtures/clips.ts` from a ClipBrief checkout.
 *
 * The 12 clips in `public/media/` come from github.com/aliefauzan/ClipBrief —
 * same author, cc0, self-generated. This script is the record of how the
 * fixture was derived, so the transcript text and the `measured` signals can be
 * regenerated instead of hand-maintained.
 *
 * Usage:
 *   node scripts/generate-clips.mjs [path-to-ClipBrief-checkout]
 *
 * It reads `data/corpus.json` and `data/transcripts/*.json` from that checkout
 * and writes `src/fixtures/clips.ts`. It never touches `public/media/` — the
 * media files are committed and are not re-derived.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')
const source = resolve(process.argv[2] ?? '/tmp/ClipBrief')

if (!existsSync(join(source, 'data/corpus.json'))) {
  console.error(`No corpus at ${source}/data/corpus.json`)
  console.error('Clone it first: git clone --depth 1 https://github.com/aliefauzan/ClipBrief /tmp/ClipBrief')
  process.exit(1)
}

/** ClipBrief's four categories map onto TrendDashboard's six. See plan/02-data-model.md. */
const CATEGORY = {
  skincare: 'beauty',
  coffee: 'food',
  fitness: 'fitness',
  gadgets: 'tech',
}

const corpus = JSON.parse(readFileSync(join(source, 'data/corpus.json'), 'utf8'))

const clips = corpus.videos.map((video) => {
  const category = CATEGORY[video.category]
  if (!category) throw new Error(`Unmapped ClipBrief category: ${video.category}`)

  const transcriptPath = join(source, 'data/transcripts', `${video.id}.json`)
  const transcript = JSON.parse(readFileSync(transcriptPath, 'utf8'))

  return {
    id: video.id,
    title: video.title,
    creator: video.creator,
    src: video.src,
    poster: video.poster,
    ...(video.captionTrack ? { captionTrack: video.captionTrack } : {}),
    license: video.license,
    sourceNote: video.sourceNote,
    category,
    hashtags: video.hashtags,
    transcript: transcript.fullText,
    // Signals carry through verbatim. Every field was measured from the encoded
    // file by ClipBrief's scripts/measure-clips.mjs; nothing here is invented.
    signals: video.signals,
  }
})

const banner = `// GENERATED FILE — do not edit by hand.
// Regenerate: node scripts/generate-clips.mjs <path-to-ClipBrief-checkout>
//
// Source: https://github.com/aliefauzan/ClipBrief (same author, cc0).
// Media lives in public/media/ and is committed alongside this file.
//
// Every value under \`signals\` is measured from the encoded file by that repo's
// scripts/measure-clips.mjs — hence \`measured: true\` and the \`measured\` badge.
// No clip has a view or like count: these videos were never published, so there
// is nothing to count. Invented engagement numbers live on Sample instead, where
// they are badged \`demo data\`.
`

const body = `${banner}
import type { Clip } from '../types'

export const CLIPS: Clip[] = ${JSON.stringify(clips, null, 2)}

export const CLIPS_BY_ID: Record<string, Clip> = Object.fromEntries(
  CLIPS.map((clip) => [clip.id, clip]),
)

export function getClip(id: string): Clip | undefined {
  return CLIPS_BY_ID[id]
}

export function clipsForIds(ids: readonly string[]): Clip[] {
  return ids.map((id) => CLIPS_BY_ID[id]).filter((clip): clip is Clip => Boolean(clip))
}
`

writeFileSync(join(repoRoot, 'src/fixtures/clips.ts'), body)

const byCategory = clips.reduce((acc, c) => ({ ...acc, [c.category]: (acc[c.category] ?? 0) + 1 }), {})
console.log(`wrote src/fixtures/clips.ts — ${clips.length} clips`, byCategory)
console.log(`captions: ${clips.filter((c) => c.captionTrack).length}/${clips.length}`)
