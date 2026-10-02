import { scoreToSeverity, severityStyle } from "@/lib/severity"
import { cn } from "@/lib/utils"

// Circular risk gauge rendered with SVG. Color reflects the derived severity.
export function RiskGauge({
  score,
  size = 160,
  strokeWidth = 12,
  label = "Risk Score",
  className,
}: {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const dash = (clamped / 100) * circumference
  const severity = scoreToSeverity(score)
  const s = severityStyle(severity)

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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn(s.text, "transition-[stroke-dasharray] duration-700 ease-out")}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-semibold tabular-nums", s.text)}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  )
}
