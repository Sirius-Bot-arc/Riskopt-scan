"use client"

import { createContext, useContext } from "react"

export type ViewId = "overview" | "risk-explorer" | "controls" | "optimizer" | "reports"

interface NavContextValue {
  view: ViewId
  setView: (view: ViewId) => void
  riskId: string | null
  openRisk: (id: string) => void
  clearRisk: () => void
  controlId: string | null
  openControl: (id: string) => void
  clearControl: () => void
  openSearch: () => void
  notificationId: string | null
  openNotification: (id: string) => void
  clearNotification: () => void
  openOnboarding: () => void
  openWebsiteScan: () => void
}

export const NavContext = createContext<NavContextValue | null>(null)

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useNav must be used within NavContext provider")
  return ctx
}
