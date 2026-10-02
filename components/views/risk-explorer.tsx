"use client"

import { useMemo, useState } from "react"
import { ChevronRight, Search } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { RiskDetail } from "@/components/views/risk-detail"
import { SeverityBadge } from "@/components/severity-badge"
import { Card } from "@/components/ui/card"
import { formatINRShort, getRisk, SEVERITY_ORDER, type Severity } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { severityStyle } from "@/lib/severity"
import { cn } from "@/lib/utils"

type Filter = "All" | Severity

const FILTERS: Filter[] = ["All", ...SEVERITY_ORDER]

export function RiskExplorer() {
  const { riskId, openRisk } = useNav()
  const { org } = useAppState()
  const [filter, setFilter] = useState<Filter>("All")
  const [query, setQuery] = useState("")

  const selected = riskId ? getRisk(org, riskId) : undefined

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...org.risks]
      .filter((r) => (filter === "All" ? true : r.severity === filter))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .sort((a, b) => b.score - a.score)
  }, [filter, query, org])

  if (selected) return <RiskDetail risk={selected} />

  return (
    <div key={org.id} className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-5 duration-300">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:-translate-y-px hover:bg-accent",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${org.name}'s risks...`}
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="p-0">
        <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid-cols-[4rem_1fr_10rem_9rem_2rem]">
          <span>Score</span>
          <span>Risk</span>
          <span className="hidden md:block">Exposure</span>
          <span className="hidden md:block">Severity</span>
          <span className="hidden md:block" />
        </div>
        <div className="flex flex-col">
          {rows.map((risk) => {
            const s = severityStyle(risk.severity)
            return (
              <button
                key={risk.id}
                type="button"
                onClick={() => openRisk(risk.id)}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-accent md:grid-cols-[4rem_1fr_10rem_9rem_2rem]"
              >
                <div className="flex flex-col gap-1">
                  <span className={cn("text-base font-semibold tabular-nums", s.text)}>{risk.score}</span>
                  <span className="h-1 w-10 overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn("block h-full rounded-full transition-[width] duration-700 ease-out", s.fill)}
                      style={{ width: `${risk.score}%` }}
                    />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{risk.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{risk.category}</p>
                </div>
                <span className="hidden text-sm tabular-nums text-muted-foreground md:block">
                  {formatINRShort(risk.exposure)}
                </span>
                <div className="hidden md:block">
                  <SeverityBadge severity={risk.severity} />
                </div>
                <ChevronRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 md:block" />
              </button>
            )
          })}
          {rows.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No risks match the current filters.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
