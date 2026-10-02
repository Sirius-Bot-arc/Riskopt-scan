"use client"

import { ArrowUpRight, ChevronRight, IndianRupee, Sparkles, ShieldAlert, Wallet, Zap } from "lucide-react"
import { BarList } from "@/components/charts/bar-list"
import { TrendChart } from "@/components/charts/trend-chart"
import { useNav } from "@/components/nav-context"
import { RiskGauge } from "@/components/risk-gauge"
import { SeverityBadge } from "@/components/severity-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatINR, formatINRShort, getOverview, severityDistribution, SEVERITY_ORDER } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { severityStyle } from "@/lib/severity"
import { RiskOptIntelligence } from "@/components/riskopt-intelligence"

export function Overview() {
  const { openRisk, setView, openOnboarding } = useNav()
  const { org } = useAppState()
  const overview = getOverview(org)
  const dist = severityDistribution(org)
  const topRisks = [...org.risks].sort((a, b) => b.score - a.score).slice(0, 5)
  const trendStart = org.riskTrend[0]?.score ?? overview.overallRisk
  const trendDelta = overview.overallRisk - trendStart
  const strongest = [...org.controls].sort((a, b) => b.riskReduction - a.riskReduction)[0]

  return (
    <div key={org.id} className="page-enter flex flex-col gap-5">
      <section className="hero-shell relative overflow-hidden">
        <div className="hero-grid" />
        <div className="orb orb-a" /><div className="orb orb-b" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="eyebrow"><span className="eyebrow-dot" /> LIVE SECURITY POSTURE</div>
            <h2 className="hero-title">See the risk.<br /><span>Shape the outcome.</span></h2>
            <p className="hero-copy">RiskOpt turns {org.name}&rsquo;s cyber exposure into a clear investment decision — so every rupee has a job.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => setView("optimizer")} className="rounded-full px-5 shadow-lg shadow-violet-200/60">
                Optimize budget <Sparkles className="size-4" />
              </Button>
              <Button onClick={openOnboarding} variant="ghost" className="rounded-full bg-white/65 px-5 hover:bg-white">
                + Add organization
              </Button>
            </div>
          </div>

          <div className="risk-orbit-card">
            <div className="orbit-glow" />
            <div className="relative flex items-center justify-between gap-5">
              <div>
                <p className="micro-label">OVERALL RISK</p>
                <p className="mt-1 text-4xl font-bold tracking-[-0.04em] text-slate-950">{overview.overallRisk}<span className="text-base font-medium text-slate-400">/100</span></p>
                <div className="mt-3 flex items-center gap-2"><SeverityBadge severity={overview.overallSeverity} /><span className="text-xs text-slate-500">{org.industry}</span></div>
              </div>
              <RiskGauge score={overview.overallRisk} size={148} strokeWidth={11} label="posture" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/70 pt-4">
              <div><p className="micro-label">EXPOSURE</p><p className="mt-1 text-lg font-semibold">{formatINRShort(overview.exposure)}</p></div>
              <div><p className="micro-label">BUDGET</p><p className="mt-1 text-lg font-semibold">{formatINRShort(overview.budget)}</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Annual loss exposure", formatINRShort(overview.exposure), formatINR(overview.exposure), IndianRupee, "stat-peach"],
          ["Available to invest", formatINRShort(overview.budget), "Current optimization budget", Wallet, "stat-lilac"],
          ["Critical risks", String(overview.criticalRisks), "Need immediate attention", ShieldAlert, "stat-rose"],
          ["Risk momentum", `${Math.abs(trendDelta)} pts`, `${trendDelta <= 0 ? "down" : "up"} from ${trendStart}`, Zap, "stat-mint"],
        ].map(([label, value, sub, Icon, cls]) => (
          <div key={String(label)} className={`stat-tile ${cls}`}>
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">{label}</p><span className="stat-icon"><Icon className="size-4" /></span></div>
            <p className="mt-5 text-2xl font-bold tracking-[-.035em] text-slate-950">{String(value)}</p>
            <p className="mt-1 text-xs text-slate-500">{String(sub)}</p>
          </div>
        ))}
      </div>

      <RiskOptIntelligence />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <Card className="premium-card overflow-hidden">
          <CardHeader className="pb-2"><div className="flex items-start justify-between"><div><p className="section-kicker">RISK LANDSCAPE</p><CardTitle className="mt-1 text-xl">Where attention goes next</CardTitle></div><button onClick={() => setView("risk-explorer")} className="icon-link">Explore <ArrowUpRight className="size-4" /></button></div></CardHeader>
          <CardContent>
            <div className="risk-list">
              {topRisks.map((risk, i) => {
                const s = severityStyle(risk.severity)
                return <button key={risk.id} onClick={() => openRisk(risk.id)} className="risk-row group">
                  <span className="risk-rank">0{i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{risk.name}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{risk.category} · {formatINRShort(risk.exposure)} exposure</span></span>
                  <span className={`risk-score ${s.text}`}>{risk.score}</span><SeverityBadge severity={risk.severity} /><ChevronRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                </button>
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader><p className="section-kicker">CONTROL SIGNAL</p><CardTitle className="mt-1 text-xl">Your strongest lever</CardTitle></CardHeader>
          <CardContent>
            <div className="control-feature">
              <div className="control-badge"><Sparkles className="size-5" /></div>
              <div className="min-w-0"><p className="text-lg font-bold text-slate-950">{strongest?.name ?? "Security controls"}</p><p className="mt-1 text-sm leading-6 text-slate-600">{strongest?.description ?? "Run the optimizer to find your best mix."}</p></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="mini-metric"><span>Risk reduction</span><strong>-{strongest?.riskReduction ?? 0}%</strong></div><div className="mini-metric"><span>Investment</span><strong>{strongest ? formatINRShort(strongest.cost) : "—"}</strong></div></div>
            <Button onClick={() => setView("controls")} variant="outline" className="mt-4 w-full rounded-xl">View all controls <ArrowUpRight className="size-4" /></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <Card className="premium-card"><CardHeader><p className="section-kicker">SEVERITY MIX</p><CardTitle className="mt-1 text-xl">Risk distribution</CardTitle></CardHeader><CardContent><BarList items={SEVERITY_ORDER.map((sev) => ({ label: sev, value: dist[sev], color: severityStyle(sev).fill }))} /></CardContent></Card>
        <Card className="premium-card"><CardHeader><p className="section-kicker">6-MONTH SIGNAL</p><CardTitle className="mt-1 text-xl">Risk score trajectory</CardTitle></CardHeader><CardContent><TrendChart data={org.riskTrend} /></CardContent></Card>
      </div>
    </div>
  )
}
