/**
 * CSV serialisation for the Performance export.
 *
 * Its own module rather than a second export from `Performance.tsx`: a route
 * file that exports anything but components breaks React Fast Refresh, and
 * oxlint says so. It also has to be importable from `scripts/verify-phase5.mjs`
 * without rendering anything, which is what makes Phase 5 exit criterion 4
 * checkable outside a browser.
 */

import type { AnalyticsContent } from './types'

/**
 * One CSV field, quoted the way a spreadsheet expects.
 *
 * Doubling the inner quote is the whole rule, and forgetting it is how a title
 * containing a comma turns one row into two on open — which is exactly the
 * "without mangling" in Phase 5 exit criterion 4.
 */
export function csvField(value: string | number): string {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: AnalyticsContent[]): string {
  const header = ['title', 'platform', 'postedAt', 'reach', 'engagement', 'briefId']
  const lines = rows.map((row) =>
    [row.title, row.platform, row.postedAt, row.reach, row.engagement, row.briefId ?? ''].map(csvField).join(','),
  )
  // CRLF, because that is what the CSV RFC says and what Excel is least
  // surprised by. The BOM is what stops Excel reading UTF-8 as Latin-1 and
  // rendering every non-ASCII character as mojibake.
  return `﻿${[header.join(','), ...lines].join('\r\n')}\r\n`
}
