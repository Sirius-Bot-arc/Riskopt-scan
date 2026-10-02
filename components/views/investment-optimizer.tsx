"use client"

import { ArrowRight, Check, Info, Loader2, Sparkles, TrendingDown, Wallet, WandSparkles } from "lucide-react"
import { DonutChart } from "@/components/charts/donut-chart"
import { RiskGauge } from "@/components/risk-gauge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OBJECTIVES, formatINR, formatINRShort, getControl } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"
import { RiskOptIntelligence } from "@/components/riskopt-intelligence"

const DONUT_COLORS = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5", "text-chart-1"]

export function InvestmentOptimizer() {
  const { org, budget, setBudget, objective, setObjective, running, result, runOptimizer } = useAppState()
  const selectedControls = result ? result.controlIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c) : []
  const excludedControls = result ? result.excludedIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c) : []
  const step = Math.max(50000, Math.round((org.budgetMax - org.budgetMin) / 24 / 50000) * 50000)

  return (
    <div key={org.id} className="page-enter flex flex-col gap-5">
      <section className="optimizer-hero">
        <div className="optimizer-stars" />
        <div className="relative max-w-4xl"><div className="eyebrow"><span className="eyebrow-dot" /> DECISION LAB · {org.name.toUpperCase()}</div><h2 className="optimizer-title">If you had <span>{formatINRShort(budget)}</span> to spend today,<br />where would you put it?</h2><p className="hero-copy max-w-2xl">RiskOpt tests the control mix against your budget and turns a pile of cyber risks into one defensible investment plan.</p></div>
        <div className="optimizer-hero-bottom"><div><span className="micro-label">CURRENT POSTURE</span><strong>{result ? result.riskBefore : "—"}<small>/100</small></strong></div><div className="hero-arrow">→</div><div><span className="micro-label">PROJECTED</span><strong className="projected">{result ? result.riskAfter : "?"}<small>/100</small></strong></div><div className="hero-separator" /><div><span className="micro-label">BUDGET</span><strong>{formatINRShort(budget)}</strong></div></div>
      </section>

      <RiskOptIntelligence compact />

      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <aside className="flex flex-col gap-4">
          <Card className="premium-card"><CardHeader><p className="section-kicker">01 · STRATEGY</p><CardTitle className="mt-1 text-lg">What should win?</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{OBJECTIVES.map((o) => <button key={o.id} type="button" onClick={() => setObjective(o.id)} className={cn("objective-card", objective === o.id && "objective-active")}><span className="flex items-center justify-between text-sm font-bold">{o.label}{objective === o.id && <Check className="size-4" />}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{o.description}</span></button>)}</CardContent></Card>
          <Card className="premium-card"><CardHeader><p className="section-kicker">02 · CAPITAL</p><CardTitle className="mt-1 text-lg">Investment ceiling</CardTitle></CardHeader><CardContent><div className="budget-readout"><span>{formatINRShort(budget)}</span><small>{formatINR(budget)}</small></div><input type="range" min={org.budgetMin} max={org.budgetMax} step={step} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="budget-range" aria-label="Budget" /><div className="flex justify-between text-[11px] font-medium text-slate-400"><span>{formatINRShort(org.budgetMin)}</span><span>{formatINRShort(org.budgetMax)}</span></div><Button onClick={runOptimizer} disabled={running} className="mt-5 h-12 w-full rounded-2xl shadow-lg shadow-violet-200/60">{running ? <><Loader2 className="size-4 animate-spin" /> Thinking...</> : <><WandSparkles className="size-4" /> Run optimization</>}</Button></CardContent></Card>
        </aside>

        <div className="min-w-0">
          {!result && !running && <div className="optimizer-empty"><div className="empty-orbit"><Sparkles className="size-6" /></div><p className="section-kicker">READY WHEN YOU ARE</p><h3>Let the math pick the mix.</h3><p>Choose an objective, set your ceiling, and let RiskOpt evaluate the combinations.</p><div className="empty-line"><span /> <span /> <span /> <span /></div></div>}
          {running && <div className="optimizer-empty"><div className="empty-orbit spin"><Loader2 className="size-6 animate-spin" /></div><p className="section-kicker">OPTIMIZATION IN PROGRESS</p><h3>Testing the trade-offs…</h3><p>Evaluating control combinations against {org.name}&rsquo;s budget.</p></div>}
          {result && !running && <div className="flex flex-col gap-5">
            <Card className="impact-card overflow-hidden"><div className="impact-wash" /><CardHeader className="relative"><p className="section-kicker">03 · OUTCOME</p><CardTitle className="mt-1 text-2xl">The plan changes the picture.</CardTitle></CardHeader><CardContent className="relative"><div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]"><div className="impact-side"><RiskGauge score={result.riskBefore} size={142} strokeWidth={10} label="before" /><span className="impact-caption">Current posture</span></div><ArrowRight className="mx-auto hidden size-8 text-violet-300 md:block" /><div className="impact-side"><RiskGauge score={result.riskAfter} size={142} strokeWidth={10} label="after" /><span className="impact-caption success">Projected posture</span></div></div><div className="impact-metrics"><div><span>Risk reduction</span><strong>-{result.percentReduction}%</strong></div><div><span>Exposure avoided</span><strong>{formatINRShort(result.exposureReduced)}</strong></div><div><span>Capital deployed</span><strong>{formatINRShort(result.totalInvestment)}</strong></div></div></CardContent></Card>

              <div className="grid gap-5 lg:grid-cols-[1fr_18rem]"><Card className="premium-card"><CardHeader><p className="section-kicker">04 · RECOMMENDATION</p><CardTitle className="mt-1 text-xl">Recommended investment plan</CardTitle><p className="text-sm text-slate-500">{selectedControls.length} controls selected within {formatINRShort(budget)}.</p></CardHeader><CardContent className="flex flex-col gap-2">{selectedControls.map((c, i) => <div key={c.id} className="plan-row" style={{ animationDelay: `${i * 70}ms` }}><span className="plan-number">0{i + 1}</span><span className="plan-check"><Check className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{c.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">Protects {c.protects.join(" · ")}</p>{result.explanations[c.id] && <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500"><Info className="mt-0.5 size-3 shrink-0" />{result.explanations[c.id]}</p>}</div><div className="text-right"><p className="text-sm font-bold">{formatINRShort(c.cost)}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingDown className="size-3" />-{c.riskReduction}%</p></div></div>)}{excludedControls.length > 0 && <p className="mt-2 px-1 text-xs text-slate-400">Not selected this round: {excludedControls.map((c) => c.name).join(", ")}</p>}</CardContent></Card>
                <Card className="premium-card"><CardHeader><p className="section-kicker">CAPITAL MIX</p><CardTitle className="mt-1 text-lg">Where the money goes</CardTitle></CardHeader><CardContent className="flex flex-col items-center gap-4"><DonutChart slices={[...selectedControls.map((c, i) => ({ label: c.name, value: c.cost, color: DONUT_COLORS[i % DONUT_COLORS.length] })), ...(result.remainingBudget > 0 ? [{ label: "Unspent", value: result.remainingBudget, color: "text-slate-300" }] : [])]} centerValue={formatINRShort(result.totalInvestment)} centerLabel="allocated" /><div className="w-full space-y-2">{selectedControls.map((c, i) => <div key={c.id} className="flex items-center gap-2 text-xs"><span className={cn("size-2.5 rounded-full bg-current", DONUT_COLORS[i % DONUT_COLORS.length])} /><span className="flex-1 truncate text-slate-500">{c.name}</span><span className="font-semibold tabular-nums">{formatINRShort(c.cost)}</span></div>)}<div className="flex items-center gap-2 border-t border-slate-100 pt-2 text-xs"><Wallet className="size-3 text-slate-400" /><span className="flex-1 text-slate-500">Unspent</span><span className="font-semibold">{formatINRShort(Math.max(0, result.remainingBudget))}</span></div></div></CardContent></Card></div>
            </div>}
        </div>
      </div>
    </div>
  )
}
