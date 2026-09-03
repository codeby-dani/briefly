/**
 * Fetches a cover image for every trend that ships without a clip.
 *
 * Source is Openverse (api.openverse.org), filtered to `license_type=commercial`
 * — CC0, CC-BY and CC-BY-SA only. That filter is the point: the rest of this
 * app asserts a licence on every piece of media it shows, and a cover scraped
 * off a platform's CDN would make that assertion false. Each image lands with
 * its title, creator, licence and landing page, and the app renders that
 * attribution rather than quietly hotlinking someone's photo.
 *
 * Files are downloaded once and committed, like public/media/*.jpg — the page
 * never calls Openverse at runtime.
 *
 * Run: node scripts/fetch-trend-thumbs.mjs [--force]
 */

import { mkdir, writeFile, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public/media/thumbs')
const FIXTURE = join(ROOT, 'src/fixtures/trendThumbs.ts')
const FORCE = process.argv.includes('--force')

/**
 * Search terms per clipless trend, written by hand, shortest first.
 *
 * The trend keyword alone is a bad query — "thrift flip" returns memes, "no
 * spend january" returns nothing photographic. And Openverse ANDs every term,
 * so a five-word description of the shot returns zero rows where two words
 * return hundreds. Hence short phrases, with a second one to fall back to.
 */
const QUERIES = {
  tr_005: ['facial serum', 'skincare bottle'],
  tr_009: ['matcha latte', 'green tea'],
  tr_013: ['trail running', 'jogging'],
  tr_016: ['ebook reader', 'tablet desk'],
  tr_017: ['usb cable', 'charger'],
  tr_018: ['minimalist fashion', 'beige coat'],
  tr_019: ['thrift store', 'clothing rack'],
  tr_020: ['folded clothes', 'wardrobe'],
  tr_021: ['cargo pants', 'street style'],
  tr_022: ['coin jar', 'saving money'],
  tr_023: ['budget planner', 'empty wallet'],
  tr_024: ['stock chart', 'investing'],
}

const ENDPOINT = 'https://api.openverse.org/v1/images/'
const UA = 'TrendDashboard/1.0 (github.com/aliefauzan/ClipBrief; demo thumbnails)'

async function search(query) {
  const url = new URL(ENDPOINT)
  url.searchParams.set('q', query)
  // cc0/by/by-sa only. `license_type=commercial` would also let ND through,
  // and a cover we crop to 4:5 is a derivative.
  url.searchParams.set('license', 'cc0,pdm,by,by-sa')
  url.searchParams.set('mature', 'false')
  url.searchParams.set('page_size', '20')

  // Anonymous Openverse is rate limited and answers 403 when it has had
  // enough. Back off rather than dropping the trend on the first refusal.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
    if (res.ok) return (await res.json()).results ?? []
    if (res.status !== 403 && res.status !== 429) throw new Error(`openverse ${res.status} for "${query}"`)
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
  }
  throw new Error(`openverse rate limited on "${query}"`)
}

/** Prefer something tall, big and actually a photograph. */
function pick(results) {
  // Not every Openverse URL carries a file extension, so the extension is a
  // bonus rather than a gate — the download checks the content type instead.
  const usable = results.filter((r) => typeof r.url === 'string' && r.url.startsWith('http'))
  const scored = usable.map((r) => {
    const w = r.width ?? 0
    const h = r.height ?? 0
    let score = 0
    if (h >= 800) score += 3
    else if (h >= 500) score += 1
    if (h > w) score += 3 // portrait, like the clip posters
    else if (Math.abs(h - w) < w * 0.2) score += 1
    if (r.license === 'cc0' || r.license === 'pdm') score += 2
    if (/\.(jpe?g|png)(\?|$)/i.test(r.url)) score += 1
    return { r, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.r ?? null
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`download ${res.status} ${url}`)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'no content-type'})`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.byteLength < 4096) throw new Error(`suspiciously small file: ${buf.byteLength}B`)
  await writeFile(dest, buf)
  return buf.byteLength
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const rows = []
await mkdir(OUT_DIR, { recursive: true })

for (const [trendId, queries] of Object.entries(QUERIES)) {
  const file = join(OUT_DIR, `${trendId}.jpg`)
  if (!FORCE && (await exists(file))) {
    console.log(`· ${trendId} already downloaded, skipping (--force to refetch)`)
    continue
  }
  try {
    let hit = null
    for (const query of queries) {
      hit = pick(await search(query))
      if (hit) break
      console.warn(`  ${trendId} — nothing for "${query}", trying the next term`)
      await new Promise((r) => setTimeout(r, 1500))
    }
    if (!hit) {
      console.warn(`! ${trendId} — no usable result`)
      continue
    }
    const bytes = await download(hit.url, file)
    rows.push({
      trendId,
      src: `/media/thumbs/${trendId}.jpg`,
      title: hit.title ?? 'untitled',
      creator: hit.creator ?? 'unknown',
      license: `${hit.license}${hit.license_version ? ` ${hit.license_version}` : ''}`.toUpperCase(),
      sourceUrl: hit.foreign_landing_url ?? hit.url,
      provider: hit.provider ?? 'openverse',
    })
    console.log(`✓ ${trendId} ${(bytes / 1024).toFixed(0)}KB — ${hit.creator} (${hit.license})`)
  } catch (error) {
    console.warn(`! ${trendId} — ${error.message}`)
  }
  await new Promise((r) => setTimeout(r, 1800)) // be a polite client
}

if (rows.length === 0) {
  console.log('Nothing new fetched; leaving the fixture alone.')
  process.exit(0)
}

const body = `// GENERATED FILE — do not edit by hand.
// Regenerate: node scripts/fetch-trend-thumbs.mjs --force
//
// Cover images for the trends that ship without a clip, fetched once from
// Openverse and committed under public/media/thumbs/. Every entry is
// CC0/CC-BY/CC-BY-SA — the search is filtered to \`license_type=commercial\` —
// and the attribution below is rendered in the trend drawer. Nothing here is
// hotlinked and nothing was taken off a platform's CDN.

export interface TrendThumb {
  trendId: string
  src: string
  title: string
  creator: string
  license: string
  sourceUrl: string
  provider: string
}

export const TREND_THUMBS: Record<string, TrendThumb> = {
${rows.map((r) => `  ${r.trendId}: ${JSON.stringify(r, null, 2).split('\n').join('\n  ')},`).join('\n')}
}

export function getTrendThumb(trendId: string): TrendThumb | undefined {
  return TREND_THUMBS[trendId]
}
`

await writeFile(FIXTURE, body)
console.log(`\nWrote ${rows.length} entries to src/fixtures/trendThumbs.ts`)
