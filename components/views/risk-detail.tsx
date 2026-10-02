"use client"

import { ArrowLeft, ChevronRight, Server, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { RiskGauge } from "@/components/risk-gauge"
import { SeverityBadge } from "@/components/severity-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getControl, formatINR, formatINRShort, type Risk } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

export function RiskDetail({ risk }: { risk: Risk }) {
  const { clearRisk, openControl } = useNav()
  const { org } = useAppState()

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-6 duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={clearRisk}>
          <ArrowLeft className="size-4" />
          All risks
        </Button>
        <span className="text-sm text-muted-foreground">/ {risk.category}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">{risk.name}</CardTitle>
              <SeverityBadge severity={risk.severity} />
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                  risk.trend > 0 ? "bg-critical/15 text-critical" : "bg-success/15 text-success",
                )}
              >
                {risk.trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {risk.trend > 0 ? "+" : ""}
                {risk.trend} vs last assessment
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-muted-foreground">{risk.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Annual Loss Exposure
                </p>
                <p className="mt-1 text-xl font-semibold text-critical">{formatINRShort(risk.exposure)}</p>
                <p className="text-xs text-muted-foreground">{formatINR(risk.exposure)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
                <p className="mt-1 text-xl font-semibold">{risk.category}</p>
                <p className="text-xs text-muted-foreground">{risk.affectedAssets.length} assets affected</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Contributing Factors</h4>
              <ul className="flex flex-wrap gap-2">
                {risk.contributingFactors.map((f) => (
                  <li
                    key={f}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Server className="size-4 text-muted-foreground" />
                Affected Assets
              </h4>
              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
                {risk.affectedAssets.map((a) => (
                  <div key={a} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score + recommended controls */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-4">
              <RiskGauge score={risk.score} size={140} label="Risk Score" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {risk.recommendedControls.map((cid) => {
                const control = getControl(org, cid)
                if (!control) return null
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => openControl(cid)}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{control.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatINRShort(control.cost)} · -{control.riskReduction}% risk
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
