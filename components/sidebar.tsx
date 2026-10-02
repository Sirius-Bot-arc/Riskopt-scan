"use client"

import { FileText, LayoutDashboard, Radar, ShieldCheck, ShieldHalf, Target, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useNav, type ViewId } from "@/components/nav-context"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

const NAV: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "risk-explorer", label: "Risk Explorer", icon: Radar }, { id: "controls", label: "Security Controls", icon: ShieldCheck }, { id: "optimizer", label: "Investment Optimizer", icon: Target }, { id: "reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
  const { view, setView } = useNav(); const { org } = useAppState()
  return <aside className="hidden w-[17rem] shrink-0 flex-col border-r border-border/70 bg-background/65 backdrop-blur-xl lg:flex">
    <div className="px-6 pb-5 pt-6"><div className="brand-mark"><ShieldHalf className="size-5" /></div><div className="mt-4"><span className="text-lg font-black tracking-[-.04em] text-foreground">RiskOpt<span className="text-violet-500">.</span></span><p className="text-[11px] font-medium text-muted-foreground">Cyber Risk Intelligence</p></div></div>
    <nav className="flex flex-1 flex-col gap-1 px-3 py-3"><p className="nav-kicker">Workspace</p>{NAV.map((item) => { const active = view === item.id; return <button key={item.id} onClick={() => setView(item.id)} className={cn("nav-item", active && "nav-active")}><item.icon className="size-[18px]" /><span>{item.label}</span>{item.id === "optimizer" && <Sparkles className="ml-auto size-3.5 text-violet-400" />}</button> })}</nav>
    <div className="p-4"><div className="org-mini"><div className="org-mini-avatar">{org.name.slice(0, 1)}</div><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-900">{org.name}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{org.tagline}</p></div></div></div>
  </aside>
}
