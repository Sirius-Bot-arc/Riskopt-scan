import type { Severity } from "@/lib/data"
import { severityStyle } from "@/lib/severity"
import { cn } from "@/lib/utils"

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  const s = severityStyle(severity)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        s.soft,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.fill)} aria-hidden="true" />
      {severity}
    </span>
  )
}
