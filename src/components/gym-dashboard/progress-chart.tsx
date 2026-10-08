import { useState } from 'react'

export type ChartPoint = { label: string; value: number; caption: string }

// A fixed viewBox scaled uniformly by CSS: the chart has few enough elements
// that measuring the container would be more machinery than it is worth, and
// uniform scaling keeps the text proportional instead of stretched.
const width = 320
const height = 170
const padding = { top: 14, right: 10, bottom: 24, left: 34 }

const plotWidth = width - padding.left - padding.right
const plotHeight = height - padding.top - padding.bottom

export default function ProgressChart({
  points,
  formatValue,
}: {
  points: ChartPoint[]
  formatValue: (value: number) => string
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  const values = points.map((point) => point.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  // A flat series would divide by zero; give it a band so the line sits
  // mid-chart rather than collapsing onto an edge.
  const span = max - min || Math.max(max, 1)
  const top = max + span * 0.15
  const bottom = Math.max(0, min - span * 0.15)

  const x = (index: number) =>
    padding.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth)
  const y = (value: number) =>
    padding.top + plotHeight - ((value - bottom) / (top - bottom || 1)) * plotHeight

  const line = points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ')
  const active = hovered === null ? null : points[hovered]

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - box.left) / box.width
    const position = ((ratio * width - padding.left) / plotWidth) * (points.length - 1)
    setHovered(Math.min(points.length - 1, Math.max(0, Math.round(position))))
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label={`${points.length} sessions, latest ${formatValue(values[values.length - 1])}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHovered(null)}
      >
        {[top, (top + bottom) / 2, bottom].map((value) => (
          <g key={value}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(value)}
              y2={y(value)}
              className="stroke-border"
              strokeWidth="1"
            />
            <text
              x={padding.left - 5}
              y={y(value) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono"
              fontSize="8"
            >
              {Math.round(value)}
            </text>
          </g>
        ))}

        {active && (
          <line
            x1={x(hovered!)}
            x2={x(hovered!)}
            y1={padding.top}
            y2={padding.top + plotHeight}
            className="stroke-muted-foreground"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {points.length > 1 && (
          <polyline
            points={line}
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((point, index) => (
          <circle
            key={point.label}
            cx={x(index)}
            cy={y(point.value)}
            r={hovered === index ? 5 : 4}
            className="fill-primary stroke-card"
            strokeWidth="2"
          />
        ))}

        <text
          x={padding.left}
          y={height - 8}
          className="fill-muted-foreground font-mono"
          fontSize="8"
        >
          {points[0].caption}
        </text>
        {points.length > 1 && (
          <text
            x={width - padding.right}
            y={height - 8}
            textAnchor="end"
            className="fill-muted-foreground font-mono"
            fontSize="8"
          >
            {points[points.length - 1].caption}
          </text>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-border bg-card px-2 py-1 text-center shadow-sm"
          style={{ left: `${(x(hovered!) / width) * 100}%` }}
        >
          <p className="font-mono text-xs font-medium">{formatValue(active.value)}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{active.caption}</p>
        </div>
      )}
    </div>
  )
}
