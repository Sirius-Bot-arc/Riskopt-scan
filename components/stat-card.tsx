import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
  trend,
}: {
  label: string
  value: string
  sublabel?: string
  icon: LucideIcon
  accent?: string
  trend?: { value: number; goodDirection: "up" | "down" }
}) {
  const isUp = trend ? trend.value > 0 : false
  const isGood = trend ? (isUp ? trend.goodDirection === "up" : trend.goodDirection === "down") : false

  return (
    <Card className="gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg bg-muted", accent)}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
        <div className="flex items-center gap-2">
          {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isGood ? "text-success" : "text-critical",
              )}
            >
              {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(trend.value)}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
