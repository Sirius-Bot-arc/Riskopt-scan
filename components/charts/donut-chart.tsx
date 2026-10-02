import { cn } from "@/lib/utils"

export interface DonutSlice {
  label: string
  value: number
  /** tailwind text-* class used as currentColor for the stroke */
  color: string
}

// Donut chart rendered as stacked SVG arcs. Used for budget allocation.
export function DonutChart({
  slices,
  size = 180,
  strokeWidth = 22,
  centerLabel,
  centerValue,
  className,
}: {
  slices: DonutSlice[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1
  let offset = 0

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {slices.map((slice) => {
          const fraction = slice.value / total
          const dash = fraction * circumference
          const el = (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              className={cn(slice.color, "transition-all duration-700 ease-out")}
            />
          )
          offset += dash
          return el
        })}
      </svg>
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-xl font-semibold tabular-nums">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
