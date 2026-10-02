"use client"

import { ArrowUpRight, BrainCircuit, Sparkles } from "lucide-react"
import { useAppState } from "@/lib/app-state"
import { formatINRShort, getOverview } from "@/lib/data"
import { useNav } from "@/components/nav-context"

export function RiskOptIntelligence({ compact = false }: { compact?: boolean }) {
  const { org, budget, result } = useAppState()
  const { setView, openRisk } = useNav()
  const overview = getOverview(org)
  const top = [...org.risks].sort((a, b) => b.score - a.score)[0]
  const topControl = org.controls.find((c) => top?.recommendedControls.includes(c.id))
  const text = result
    ? `Your latest plan cuts estimated exposure by ${formatINRShort(result.exposureReduced)} with ${formatINRShort(result.totalInvestment)} invested.`
    : `${top?.name ?? "Your highest risk"} is the biggest impact opportunity. ${topControl ? `${topControl.name} is a strong lever within your ${formatINRShort(budget)} budget.` : "Run the optimizer to find the strongest mix."}`
  return (
    <div className={`intel-card ${compact ? "intel-compact" : ""}`}>
      <div className="intel-spark" />
      <div className="relative flex items-start gap-4">
        <div className="intel-icon"><BrainCircuit className="size-5" /></div>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold text-slate-950">RiskOpt Intelligence</p><Sparkles className="size-3.5 text-violet-500" /></div><p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>{!compact && <div className="mt-3 flex flex-wrap gap-2"><span className="intel-pill">Risk {overview.overallRisk}/100</span><span className="intel-pill">{formatINRShort(overview.exposure)} exposure</span><span className="intel-pill">{org.controls.length} controls available</span></div>}</div>
        {!compact && top && <button onClick={() => openRisk(top.id)} className="intel-action">Inspect <ArrowUpRight className="size-3.5" /></button>}
        {compact && <button onClick={() => setView("optimizer")} className="hidden rounded-full bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm ring-1 ring-violet-100 sm:flex">Open optimizer</button>}
      </div>
    </div>
  )
}
