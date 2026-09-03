/**
 * The six nav glyphs, plus the two in the top bar, as inline SVG.
 *
 * The Stitch reference draws every icon from the Material Symbols variable
 * font. That is one more third-party request than this page can justify, and
 * its failure mode is the loudest available: a font that does not arrive
 * renders the ligature name, so the sidebar reads "trending_up" instead of
 * showing an arrow. These are 24px stroked paths on the same grid, so the
 * shapes match the reference without the dependency.
 *
 * Every icon is `aria-hidden`: each one sits beside its own text label, and an
 * accessible name here would make screen readers announce the label twice.
 */

import type { Route } from '../types'

export type IconName = Route | 'search' | 'sync' | 'settings' | 'help' | 'bell' | 'chevron' | 'panel-left'

const PATHS: Record<IconName, string> = {
  // home
  dashboard: 'M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z',
  // trending_up
  trends: 'M3 17l6-6 4 4 8-8M21 7v5m0-5h-5',
  // inventory / package
  products: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5 12 12m0 0 9-4.5M12 12v9',
  // auto_awesome
  briefs: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  // calendar_today
  calendar: 'M7 3v3m10-3v3M4 8.5h16M5 6h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  // bar_chart
  performance: 'M4 20V10m5 10V4m5 16v-7m5 7V7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm5.2-1.8L21 21',
  sync: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v3.5h-3.5',
  settings:
    'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.4-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.1a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.6 0z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-2.1-11.4a2.1 2.1 0 1 1 3.1 2.2c-.6.4-1 .9-1 1.7M12 17.2h.01',
  bell: 'M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  chevron: 'm7 10 5 5 5-5',
  // sidebar panel collapse / expand — a square with a left column
  'panel-left': 'M3 5h18M3 19h18M3 5v14M9 5v14',
}

export function NavIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="nav-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
