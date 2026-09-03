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

/** One hue per category, so a wall of cards still sorts by eye. */
const PLATE: Record<Category, string> = {
  beauty: 'linear-gradient(145deg, #f4d9ec, #d9c4ef)',
  food: 'linear-gradient(145deg, #f7e2c8, #efd0c0)',
  fashion: 'linear-gradient(145deg, #dde0f3, #cfd8ee)',
  tech: 'linear-gradient(145deg, #d4e6f6, #c8dcef)',
  fitness: 'linear-gradient(145deg, #d5eede, #c6e6d8)',
  finance: 'linear-gradient(145deg, #e6e6df, #d8ddd2)',
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
