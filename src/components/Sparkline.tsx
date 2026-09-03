/** A 14-point trend spike, small enough to sit inside a list row. Same reasoning as LineChart: no library. */

export function Sparkline({ points, label, testId }: { points: number[]; label: string; testId?: string }) {
  if (points.length < 2) return null

  const width = 64
  const height = 20
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1

  const d = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((value - min) / span) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} data-testid={testId}>
      <path d={d} />
    </svg>
  )
}
