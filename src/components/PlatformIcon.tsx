/**
 * The four platform glyphs, inline.
 *
 * A trend card claims a source — "this came from TikTok" — and a word set in
 * 11px grey is the weakest possible way to say it. These are the brand marks,
 * drawn as filled paths on a 24px grid so they read at the 18px they are used
 * at, and tinted with each platform's own colour so the row scans by shape and
 * hue before it is read.
 *
 * Same reasoning as NavIcon: no icon font, no third-party request. The paths
 * are simplified silhouettes, not the vendors' exact trademark artwork.
 */

import { PLATFORM_LABEL } from '../types'
import type { Platform } from '../types'

const GLYPH: Record<Platform, { path: string; tint: string }> = {
  tiktok: {
    tint: '#111114',
    path: 'M16.2 3h-2.6v11.6a2.4 2.4 0 1 1-2-2.36V9.5a5.3 5.3 0 1 0 4.6 5.25V8.9a6 6 0 0 0 3.4 1.06V7.3a3.5 3.5 0 0 1-3.4-3.5V3z',
  },
  instagram: {
    tint: '#c9308e',
    path: 'M8.2 3h7.6A5.2 5.2 0 0 1 21 8.2v7.6a5.2 5.2 0 0 1-5.2 5.2H8.2A5.2 5.2 0 0 1 3 15.8V8.2A5.2 5.2 0 0 1 8.2 3zm0 2A3.2 3.2 0 0 0 5 8.2v7.6A3.2 3.2 0 0 0 8.2 19h7.6a3.2 3.2 0 0 0 3.2-3.2V8.2A3.2 3.2 0 0 0 15.8 5zM12 7.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm0 2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2zm4.9-2.75a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z',
  },
  youtube: {
    tint: '#d9232a',
    path: 'M21.2 8.2a2.7 2.7 0 0 0-1.9-1.9C17.6 5.8 12 5.8 12 5.8s-5.6 0-7.3.5A2.7 2.7 0 0 0 2.8 8.2 28 28 0 0 0 2.3 12c0 1.3.1 2.6.5 3.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.3.5 7.3.5s5.6 0 7.3-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.2.5-2.5.5-3.8s-.1-2.6-.5-3.8zM10.2 14.7V9.3L14.9 12z',
  },
  x: {
    tint: '#111114',
    path: 'M17.6 3h3.1l-6.8 7.7L21.9 21h-6.2l-4.9-6.3L5.2 21H2.1l7.2-8.2L2.4 3h6.4l4.4 5.8zm-1.1 16.1h1.7L7.6 4.8H5.8z',
  },
}

export function PlatformIcon({
  platform,
  size = 18,
  tinted = true,
}: {
  platform: Platform
  size?: number
  /** `false` inherits `currentColor`, for placements that carry their own colour. */
  tinted?: boolean
}) {
  const glyph = GLYPH[platform]
  return (
    <svg
      className="platform-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={tinted ? glyph.tint : 'currentColor'}
      role="img"
      aria-label={PLATFORM_LABEL[platform]}
      data-platform={platform}
    >
      <path d={glyph.path} />
    </svg>
  )
}
