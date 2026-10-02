"use client"

import { Check, ShieldCheck, TrendingDown, Sparkles } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { BarList } from "@/components/charts/bar-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getControl, formatINR, formatINRShort } from "@/lib/data"
import { useAppState } from "@/lib/app-state"

export function SecurityControls() {
  const { controlId, openControl, clearControl, setView } = useNav()
  const { org } = useAppState()
  const active = controlId ? getControl(org, controlId) : undefined

  const topRisks = [...org.risks].sort((a, b) => b.score - a.score).slice(0, 3)
  const recommended = org.controls
    .map((control) => {
      const matchedRisk = topRisks
        .filter((risk) => risk.recommendedControls.includes(control.id))
        .sort((a, b) => b.score - a.score)[0]
      return matchedRisk ? { control, risk: matchedRisk } : null
    })
    .filter((item): item is NonNullable<typeof item> => !!item)
    .sort((a, b) => {
      if (b.risk.score !== a.risk.score) return b.risk.score - a.risk.score
      return b.control.riskReduction - a.control.riskReduction
    })
    .slice(0, 6)

  return (
    <div key={org.id} className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-6 duration-300">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">Risk-aligned recommendations</CardTitle>
              <CardDescription>Controls are matched to the organization&apos;s highest-scoring risks before the optimizer considers the budget.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map(({ control, risk }) => (
              <button
                key={`${risk.id}-${control.id}`}
                type="button"
                onClick={() => openControl(control.id)}
                className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{control.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">For {risk.name} · {risk.score}/100 risk</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-success">-{control.riskReduction}%</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="lg:w-2/3">
          <CardHeader>
            <CardTitle>Security Control Catalogue</CardTitle>
            <CardDescription>
              {org.controls.length} available controls with estimated cost, risk impact and the risks they protect.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={[...org.controls]
                .sort((a, b) => b.riskReduction - a.riskReduction)
                .map((c) => ({
                  label: c.name,
                  value: c.riskReduction,
                  display: `-${c.riskReduction}%`,
                  color: "bg-primary",
                }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle>Ready to allocate?</CardTitle>
            <CardDescription>Compare these controls against your budget.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              The optimizer selects the best mix of controls to maximize risk reduction within your
              available budget.
            </p>
            <Button onClick={() => setView("optimizer")} variant="secondary">
              Go to Optimizer
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {org.controls.map((control, i) => (
          <Card
            key={control.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-in fade-in-0 slide-in-from-bottom-1 group fill-mode-backwards transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
                  <TrendingDown className="size-3" />-{control.riskReduction}%
                </span>
              </div>
              <CardTitle className="mt-2 text-base">{control.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">{control.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold tabular-nums">{formatINRShort(control.cost)}</p>
                  <p className="text-xs text-muted-foreground">one-time investment</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openControl(control.id)}>
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && clearControl()}>
        <DialogContent className="sm:max-w-md">
          {active && (
            <>
              <DialogHeader>
                <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <DialogTitle>{active.name}</DialogTitle>
                <DialogDescription>{active.description}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Investment</p>
                  <p className="mt-1 text-lg font-semibold">{formatINR(active.cost)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Reduction</p>
                  <p className="mt-1 text-lg font-semibold text-success">-{active.riskReduction}%</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Protects against</p>
                <ul className="flex flex-col gap-2">
                  {active.protects.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
