/**
 * The thumbnail on a trend card.
 *
 * A trend is a thing people watched, so the card leads with the frame they
 * watched rather than with its keyword set in bold. The poster is the real
 * first frame of the clip attached to the trend — the same file the player
 * loads — so nothing here is a stand-in for media that does not exist.
 *
 * `fashion` and `finance` trends ship with no clips on purpose, and this is the
 * second place that branch has to be right. Those cards get a tinted plate
 * carrying the keyword, labelled as having no clip, rather than a broken
 * <img> or a grey box that reads as a failed load.
 */

import { getClip } from '../fixtures/clips'
import { PlatformIcon } from './PlatformIcon'
import type { Category, Platform } from '../types'

/**
 * One gradient per category for the trends that have no clip.
 *
 * These are deep and saturated rather than pastel on purpose: the real posters
 * in this corpus are white display type over a dark gradient, and a pale tile
 * with small grey text beside them reads as a thumbnail that failed to load
 * rather than as a trend with no video. Same treatment, generated here.
 */
const PLATE: Record<Category, string> = {
  beauty: 'linear-gradient(160deg, #8c3b6f 0%, #4a2350 100%)',
  food: 'linear-gradient(160deg, #a8551f 0%, #5c2a17 100%)',
  fashion: 'linear-gradient(160deg, #3f4a7a 0%, #1e2340 100%)',
  tech: 'linear-gradient(160deg, #245c78 0%, #12293b 100%)',
  fitness: 'linear-gradient(160deg, #1f6b52 0%, #10322a 100%)',
  finance: 'linear-gradient(160deg, #6b5a2a 0%, #2e2715 100%)',
}

function clock(seconds: number): string {
  const total = Math.round(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function TrendThumb({
  clipId,
  keyword,
  platform,
  category,
}: {
  clipId: string | undefined
  keyword: string
  platform: Platform
  category: Category
}) {
  const clip = clipId ? getClip(clipId) : undefined

  return (
    <div className="thumb" data-testid={`thumb-${platform}`}>
      {clip ? (
        <img
          className="thumb-img"
          src={clip.poster}
          alt={`First frame of “${clip.title}” by ${clip.creator}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="thumb-plate" style={{ background: PLATE[category] }} aria-hidden>
          <span className="thumb-plate-word">{keyword}</span>
        </div>
      )}

      <span className="thumb-platform" title={platform}>
        <PlatformIcon platform={platform} size={16} />
      </span>

      <span className="thumb-tag">
        {clip ? clock(clip.signals.durationS) : 'no clip'}
      </span>
    </div>
  )
}
