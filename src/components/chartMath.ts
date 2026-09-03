export function safeChartIndex(index: number, pointCount: number) {
  return Math.max(0, Math.min(index, pointCount - 1))
}
