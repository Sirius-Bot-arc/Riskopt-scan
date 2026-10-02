import { cn } from "@/lib/utils"

interface Point {
  month: string
  score: number
}

// Lightweight area/line trend chart drawn as SVG paths.
export function TrendChart({
  data,
  className,
  height = 160,
}: {
  data: Point[]
  className?: string
  height?: number
}) {
  const width = 520
  const pad = 8
  const min = Math.min(...data.map((d) => d.score)) - 6
  const max = Math.max(...data.map((d) => d.score)) + 6
  const range = max - min || 1
  const stepX = (width - pad * 2) / (data.length - 1)

  const points = data.map((d, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (d.score - min) / range) * (height - pad * 2)
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Overall risk score trend over time"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} className="text-primary" fill="url(#trendFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {points.map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r={3} className="fill-primary" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between px-1 text-xs text-muted-foreground">
        {data.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </div>
  )
}
