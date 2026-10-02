"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Building2, Check, ChevronDown, Menu, Moon, Search, Sun, Radar } from "lucide-react"
import { useNav, type ViewId } from "@/components/nav-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

const TITLES: Record<ViewId, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Organization-wide cyber risk posture" },
  "risk-explorer": { title: "Risk Explorer", subtitle: "Inspect and rank individual risks" },
  controls: { title: "Security Controls", subtitle: "Available controls and their impact" },
  optimizer: { title: "Investment Optimizer", subtitle: "Allocate budget for maximum risk reduction" },
  reports: { title: "Reports", subtitle: "Export and share your risk assessment" },
}

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [onClose])
  return ref
}

function severityDotClass(severity: string) {
  if (severity === "Critical") return "bg-critical/15 text-critical"
  if (severity === "High") return "bg-high/15 text-high"
  if (severity === "Medium") return "bg-medium/15 text-medium"
  return "bg-primary/15 text-primary"
}

export function Topbar({ theme, onToggleTheme, onScanWebsite }: { theme: "light" | "dark"; onToggleTheme: () => void; onScanWebsite: () => void }) {
  const { view, openSearch, notificationId, openNotification, clearNotification, openOnboarding } = useNav()
  const { org, orgId, organizations, setOrgId, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useAppState()
  const [orgOpen, setOrgOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const orgRef = useClickOutside(() => setOrgOpen(false))
  const notifRef = useClickOutside(() => setNotifOpen(false))
  const meta = TITLES[view]
  const activeNotification = notifications.find((n) => n.id === notificationId)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md transition-colors md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
          <Menu className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight">{meta.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={openSearch}
        className="hidden items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:-translate-y-px hover:bg-accent hover:shadow-md md:flex"
      >
        <Search className="size-4" />
        <span>Search risks &amp; controls</span>
        <kbd className="ml-6 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="flex size-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground transition-colors hover:bg-accent md:hidden"
      >
        <Search className="size-4" />
      </button>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        title={theme === "light" ? "Dark mode" : "Light mode"}
        className="theme-toggle group flex size-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground shadow-sm transition-all hover:-translate-y-px hover:border-primary/40 hover:bg-accent hover:text-foreground hover:shadow-lg"
      >
        {theme === "light" ? <Moon className="size-4 transition-transform group-hover:rotate-12" /> : <Sun className="size-4 transition-transform group-hover:rotate-45" />}
      </button>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setNotifOpen((v) => !v)}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground transition-all hover:-translate-y-px hover:bg-accent hover:shadow-md",
            notifOpen && "border-ring bg-accent text-foreground",
          )}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 z-10 flex min-w-5 h-5 items-center justify-center rounded-full border-2 border-background bg-critical px-1 text-[9px] font-bold leading-none text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 absolute right-0 top-11 z-40 w-80 origin-top-right rounded-2xl border border-border bg-popover p-2 shadow-xl ring-1 ring-foreground/10 duration-150">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {org.name} · Notifications
              </p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id)
                    openNotification(n.id)
                    setNotifOpen(false)
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-2 shrink-0 translate-y-1 rounded-full",
                      n.read ? "bg-transparent" : "bg-primary",
                    )}
                    aria-hidden="true"
                  />
                  <span className={cn("mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase", severityDotClass(n.severity))}>
                    {n.severity}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm", n.read ? "font-normal text-muted-foreground" : "font-medium text-foreground")}>
                      {n.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{n.time}</span>
                  </span>
                </button>
              ))}
              {notifications.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Organization selector */}
      <div ref={orgRef} className="relative">
        <button
          type="button"
          onClick={() => setOrgOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 text-sm font-medium shadow-sm transition-all hover:-translate-y-px hover:bg-accent hover:shadow-md",
            orgOpen && "border-ring",
          )}
        >
          <Building2 className="size-4 text-primary" />
          <span className="hidden max-w-36 truncate sm:inline">{org.name}</span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", orgOpen && "rotate-180")} />
        </button>
        {orgOpen && (
          <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 absolute right-0 top-11 z-[60] w-72 origin-top-right rounded-2xl border border-border bg-popover p-1.5 shadow-xl ring-1 ring-foreground/10 duration-150">
            {organizations.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setOrgId(o.id)
                  setOrgOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                  o.id === orgId && "bg-primary/10",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    o.id === orgId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Building2 className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate font-medium", o.id === orgId && "text-primary")}>
                    {o.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{o.industry}</span>
                </span>
                {o.id === orgId && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            ))}
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              onClick={() => { setOrgOpen(false); onScanWebsite() }}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Radar className="size-4" /></span>
              Scan a website
            </button>
            <button
              type="button"
              onClick={() => { setOrgOpen(false); openOnboarding() }}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg">+</span>
              Add organization
            </button>
          </div>
        )}
      </div>

      <Dialog open={!!activeNotification} onOpenChange={(o) => !o && clearNotification()}>
        <DialogContent className="sm:max-w-sm">
          {activeNotification && (
            <>
              <DialogHeader>
                <span
                  className={cn(
                    "mb-1 inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
                    severityDotClass(activeNotification.severity),
                  )}
                >
                  {activeNotification.severity}
                </span>
                <DialogTitle>{activeNotification.title}</DialogTitle>
                <DialogDescription>{activeNotification.message}</DialogDescription>
              </DialogHeader>
              <p className="text-xs text-muted-foreground">{activeNotification.time} · {org.name}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}
