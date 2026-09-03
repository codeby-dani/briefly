/**
 * 24 bars, hand-rolled. No chart library, for the same reason `LineChart` is
 * forty lines of SVG: plan/01-architecture.md cuts the dependency, and this is
 * the entire feature.
 *
 * Unlike the line chart this one *is* labelled, because the x axis is hours and
 * an unlabelled "best posting time" chart tells a reader nothing. The y axis
 * stays unlabelled — the values are a relative score over invented data, and
 * putting ticks on them would imply a precision the badge beside the heading
 * explicitly denies.
 */

export function BarChart({
  values,
  label,
  formatX = (i) => String(i),
  highlight,
}: {
  values: number[]
  label: string
  /** Tick text for bar `i`. Only every third tick is drawn. */
  formatX?: (index: number) => string
  /** Index to mark as the peak. Omit for no highlight. */
  highlight?: number
}) {
  if (values.length === 0) return null

  const max = Math.max(...values) || 1
  const width = 720
  const height = 132
  const axis = 18
  const plot = height - axis
  const slot = width / values.length
  const barWidth = Math.max(2, slot * 0.62)

  return (
    <svg
      className="bar-chart"
      viewBox={`0 0 ${width} ${height}`}
      // Not `preserveAspectRatio="none"`, unlike LineChart: this chart has hour
      // ticks in it, and non-uniform scaling stretches glyphs horizontally until
      // a `0` reads as a smudge. Uniform scaling costs a little height and keeps
      // the only labelled axis in the app legible.
      role="img"
      aria-label={`${label} — ${values.length} buckets, peak at ${formatX(values.indexOf(max))}`}
      data-testid="bar-chart"
    >
      {values.map((value, i) => {
        const barHeight = Math.max(1, (value / max) * (plot - 6))
        return (
          <rect
            key={i}
            className={`bar${i === highlight ? ' is-peak' : ''}`}
            x={i * slot + (slot - barWidth) / 2}
            y={plot - barHeight}
            width={barWidth}
            height={barHeight}
            data-testid={`bar-${i}`}
          />
        )
      })}
      {values.map((_, i) =>
        i % 3 === 0 ? (
          <text key={`t${i}`} className="bar-tick" x={i * slot + slot / 2} y={height - 5} textAnchor="middle">
            {formatX(i)}
          </text>
        ) : null,
      )}
    </svg>
  )
}

export interface StackSegment {
  key: string
  value: number
}

/**
 * A single stacked bar. Used for the platform mix, where the question is "what
 * share" rather than "how much", and four numbers do not deserve a pie.
 */
export function StackedBar({ segments, label }: { segments: StackSegment[]; label: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total <= 0) return null

  return (
    <div className="stack" data-testid="stacked-bar" role="img" aria-label={label}>
      <div className="stack-track">
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={`stack-seg stack-${segment.key}`}
            style={{ width: `${(segment.value / total) * 100}%` }}
            data-testid={`stack-seg-${segment.key}`}
            title={`${segment.key} — ${Math.round((segment.value / total) * 100)}%`}
          />
        ))}
      </div>
      <ul className="stack-legend">
        {segments.map((segment) => (
          <li key={segment.key} data-testid={`stack-legend-${segment.key}`}>
            <span className={`stack-dot stack-${segment.key}`} aria-hidden="true" />
            {segment.key} · {Math.round((segment.value / total) * 100)}%
          </li>
        ))}
      </ul>
    </div>
  )
}
