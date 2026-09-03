/**
 * A hand-rolled SVG line. No chart library, per the scope reductions in
 * plan/01-architecture.md — a chart lib is ~100KB and an hour of API learning,
 * and this is forty lines.
 *
 * Deliberately unlabelled on the axes: the numbers it plots are invented, and a
 * chart with precise axis ticks over invented data implies a precision that
 * does not exist. The badge beside the heading carries that claim instead.
 */

export function LineChart({
  points,
  height = 120,
  label,
}: {
  points: number[]
  height?: number
  label: string
}) {
  if (points.length < 2) return null

  const width = 720
  const pad = 6
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1

  const x = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2)
  const y = (value: number) => height - pad - ((value - min) / span) * (height - pad * 2)

  const line = points.map((value, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1).toFixed(1)},${height - pad} L${x(0).toFixed(1)},${height - pad} Z`

  return (
    <svg
      className="line-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label} — ${points.length} points, from ${min} to ${max}`}
      data-testid="line-chart"
    >
      <path className="line-chart-area" d={area} />
      <path className="line-chart-line" d={line} />
      <circle
        className="line-chart-dot"
        cx={x(points.length - 1)}
        cy={y(points[points.length - 1]!)}
        r="3.5"
      />
    </svg>
  )
}
