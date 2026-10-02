"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, FileText, Radar, Search, ShieldCheck, Sparkles } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { SeverityBadge } from "@/components/severity-badge"
import { formatINRShort } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openRisk, openControl, openNotification, setView } = useNav()
  const { org, notifications, markNotificationRead } = useAppState()
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const q = query.trim().toLowerCase()

  const risks = useMemo(
    () => org.risks.filter((r) => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)),
    [q, org],
  )
  const controls = useMemo(
    () =>
      org.controls.filter(
        (c) => !q || c.name.toLowerCase().includes(q) || c.protects.join(" ").toLowerCase().includes(q),
      ),
    [q, org],
  )
  const matchedNotifications = useMemo(
    () =>
      notifications.filter(
        (n) => !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
      ),
    [q, notifications],
  )
  const pages = useMemo(
    () =>
      [
        { id: "optimizer" as const, label: "Investment Optimizer", hint: "Run a new budget optimization" },
        { id: "reports" as const, label: "Reports", hint: "View and export the risk assessment report" },
      ].filter((p) => !q || p.label.toLowerCase().includes(q) || p.hint.toLowerCase().includes(q)),
    [q],
  )

  const nothingFound =
    risks.length === 0 && controls.length === 0 && matchedNotifications.length === 0 && pages.length === 0

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl ring-1 ring-foreground/10 duration-150">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${org.name}'s risks, controls, notifications...`}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {nothingFound && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for &ldquo;{query}&rdquo;
            </p>
          )}

          {risks.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Risks
              </p>
              {risks.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    openRisk(r.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <Radar className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">{r.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{r.score}</span>
                  <SeverityBadge severity={r.severity} />
                </button>
              ))}
            </div>
          )}

          {controls.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Controls
              </p>
              {controls.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    openControl(c.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  <span className={cn("text-xs tabular-nums text-muted-foreground")}>
                    {formatINRShort(c.cost)} · -{c.riskReduction}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedNotifications.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Notifications
              </p>
              {matchedNotifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id)
                    openNotification(n.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <Bell className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </button>
              ))}
            </div>
          )}

          {pages.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Go to
              </p>
              {pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setView(p.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  {p.id === "optimizer" ? (
                    <Sparkles className="size-4 shrink-0 text-primary" />
                  ) : (
                    <FileText className="size-4 shrink-0 text-primary" />
                  )}
                  <span className="flex-1 text-sm font-medium">{p.label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{p.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
