import type { Severity } from "@/lib/data"

interface SeverityStyle {
  /** solid text color token */
  text: string
  /** soft translucent background + text for badges/pills */
  soft: string
  /** solid background fill for bars/dots */
  fill: string
  /** ring/border color */
  ring: string
}

const STYLES: Record<Severity, SeverityStyle> = {
  Critical: {
    text: "text-critical",
    soft: "bg-critical/15 text-critical",
    fill: "bg-critical",
    ring: "ring-critical/40",
  },
  High: {
    text: "text-high",
    soft: "bg-high/15 text-high",
    fill: "bg-high",
    ring: "ring-high/40",
  },
  Medium: {
    text: "text-medium",
    soft: "bg-medium/15 text-medium",
    fill: "bg-medium",
    ring: "ring-medium/40",
  },
  Low: {
    text: "text-low",
    soft: "bg-low/15 text-low",
    fill: "bg-low",
    ring: "ring-low/40",
  },
}

export function severityStyle(severity: Severity): SeverityStyle {
  return STYLES[severity]
}

export function scoreToSeverity(score: number): Severity {
  if (score >= 80) return "Critical"
  if (score >= 60) return "High"
  if (score >= 40) return "Medium"
  return "Low"
}
