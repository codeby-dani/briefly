import { useId, useState } from 'react'
import { safeChartIndex } from './chartMath'

type ChartPoint = { x: number; y: number }

function smoothPath(points: ChartPoint[]) {
  if (points.length < 2) return ''

  let path = `M${points[0]!.x.toFixed(1)},${points[0]!.y.toFixed(1)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)]!
    const current = points[index]!
    const next = points[index + 1]!
    const after = points[Math.min(points.length - 1, index + 2)]!
    const controlOne = { x: current.x + (next.x - previous.x) / 6, y: current.y + (next.y - previous.y) / 6 }
    const controlTwo = { x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 }
    path += ` C${controlOne.x.toFixed(1)},${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)},${controlTwo.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`
  }
  return path
}

function movingAverage(points: number[]) {
  return points.map((_, index) => {
    const window = points.slice(Math.max(0, index - 2), Math.min(points.length, index + 3))
    return window.reduce((sum, value) => sum + value, 0) / window.length
  })
}

/** A dependency-free SVG chart with an accessible demo comparison series. */
export function LineChart({ points, height = 210, label }: { points: number[]; height?: number; label: string }) {
  const [activeIndex, setActiveIndex] = useState(points.length - 1)
  const gradientId = `chart-fill-${useId().replace(/:/g, '')}`
  const width = 720
  const pad = { top: 18, right: 18, bottom: 30, left: 38 }

  if (points.length < 2) return null

  const baseline = movingAverage(points)
  const values = [...points, ...baseline]
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const plotHeight = height - pad.top - pad.bottom
  const x = (index: number) => pad.left + (index / (points.length - 1)) * (width - pad.left - pad.right)
  const y = (value: number) => height - pad.bottom - ((value - min) / span) * plotHeight
  const primary = points.map((value, index) => ({ x: x(index), y: y(value) }))
  const secondary = baseline.map((value, index) => ({ x: x(index), y: y(value) }))
  const primaryPath = smoothPath(primary)
  const baselinePath = smoothPath(secondary)
  const area = `${primaryPath} L${primary.at(-1)!.x.toFixed(1)},${height - pad.bottom} L${primary[0]!.x.toFixed(1)},${height - pad.bottom} Z`
  const selectedIndex = safeChartIndex(activeIndex, points.length)
  const active = primary[selectedIndex]!
  const tooltipX = Math.min(width - 142, Math.max(pad.left, active.x > width - 170 ? active.x - 142 : active.x + 14))
  const tooltipY = Math.max(pad.top, active.y - 58)
  const tickIndexes = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(ratio * (points.length - 1)))

  return (
    <div className="chart-visual">
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`${label} — ${points.length} demo points, from ${min} to ${max}`} data-testid="line-chart">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.015" />
          </linearGradient>
        </defs>

        <g className="line-chart-grid" data-testid="chart-grid" aria-hidden="true">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const gridY = pad.top + ratio * plotHeight
            const gridLabel = index === 0 ? 'High' : index === 2 ? 'Mid' : index === 4 ? 'Low' : ''
            return <g key={ratio}><line x1={pad.left} x2={width - pad.right} y1={gridY} y2={gridY} />{gridLabel && <text x={pad.left - 9} y={gridY + 3} textAnchor="end">{gridLabel}</text>}</g>
          })}
          {tickIndexes.map((index) => <text key={index} x={x(index)} y={height - 8} textAnchor="middle">Day {index + 1}</text>)}
        </g>

        <path className="line-chart-area" d={area} fill={`url(#${gradientId})`} />
        <path className="line-chart-baseline" d={baselinePath} data-testid="chart-series-baseline" />
        <path className="line-chart-line" d={primaryPath} data-testid="chart-series-primary" />
        <line className="line-chart-crosshair" x1={active.x} x2={active.x} y1={pad.top} y2={height - pad.bottom} />

        {primary.map((point, index) => (
          <circle key={index} className="line-chart-hit" cx={point.x} cy={point.y} r="11" tabIndex={0} aria-label={`Day ${index + 1}: ${points[index]} demo growth; baseline ${Math.round(baseline[index]!)}`} onFocus={() => setActiveIndex(index)} onPointerEnter={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} />
        ))}

        <circle className="line-chart-active-dot" cx={active.x} cy={active.y} r="4.8" />
        <g className="line-chart-tooltip" transform={`translate(${tooltipX} ${tooltipY})`} data-testid="chart-tooltip">
          <rect width="128" height="46" rx="8" />
          <text x="10" y="16" className="line-chart-tooltip-title">Day {selectedIndex + 1}</text>
          <text x="10" y="32">{points[selectedIndex]} growth · {Math.round(baseline[selectedIndex]!)} baseline</text>
        </g>
      </svg>

      <div className="chart-legend" aria-label="Chart legend">
        <span><i className="chart-key chart-key-primary" aria-hidden />Follower growth</span>
        <span><i className="chart-key chart-key-baseline" aria-hidden />Trend baseline</span>
        <small>Demo series</small>
      </div>
    </div>
  )
}
