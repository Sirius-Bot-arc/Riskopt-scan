"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import {
  ORGANIZATIONS,
  getOverview,
  type Objective,
  type OrgNotification,
  type Organization,
  type OrganizationAssessment,
  buildOrganizationFromAssessment,
  buildOrganizationFromWebsiteAssessment,
  type WebsiteAssessmentFinding,
} from "@/lib/data"

import { runOptimization, type OptimizationResult } from "@/lib/optimizer"
import { findingsToRisks } from "@/lib/risk-interpreter"

interface AppStateValue {
  org: Organization
  orgId: string
  organizations: Organization[]
  setOrgId: (id: string) => void
  addOrganization: (assessment: OrganizationAssessment) => void
  addWebsiteOrganization: (args: { name: string; budget: number; score: number; estimatedExposure: number; findings: WebsiteAssessmentFinding[] }) => void

  budget: number
  setBudget: (value: number) => void

  objective: Objective
  setObjective: (value: Objective) => void

  running: boolean
  hasRun: boolean
  result: OptimizationResult | null
  runOptimizer: () => void

  notifications: OrgNotification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const AppStateContext =
  createContext<AppStateValue | null>(null)

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)

  if (!ctx) {
    throw new Error(
      "useAppState must be used within AppStateProvider",
    )
  }

  return ctx
}

export function AppStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [customOrgs, setCustomOrgs] =
    useState<Organization[]>([])

  const organizations = useMemo(
    () => [...ORGANIZATIONS, ...customOrgs],
    [customOrgs],
  )

  const [orgId, setOrgIdState] =
    useState<string>(ORGANIZATIONS[0].id)

  const org = useMemo(
    () =>
      organizations.find(
        (o) => o.id === orgId,
      ) ?? ORGANIZATIONS[0],
    [organizations, orgId],
  )

  const [budget, setBudgetState] =
    useState<number>(
      ORGANIZATIONS[0].budgetDefault,
    )

  const [objective, setObjectiveState] =
    useState<Objective>("max-reduction")

  const [running, setRunning] =
    useState(false)

  const [hasRun, setHasRun] =
    useState(false)

  const [backendResult, setBackendResult] =
    useState<OptimizationResult | null>(null)

  const [notifState, setNotifState] =
    useState<Record<string, OrgNotification[]>>(
      () => {
        const initial: Record<
          string,
          OrgNotification[]
        > = {}

        for (const o of ORGANIZATIONS) {
          initial[o.id] =
            o.notifications.map((n) => ({
              ...n,
            }))
        }

        return initial
      },
    )

  const setOrgId = useCallback(
    (id: string) => {
      setOrgIdState(id)

      const next =
        organizations.find(
          (o) => o.id === id,
        ) ?? ORGANIZATIONS[0]

      setBudgetState(next.budgetDefault)
      setHasRun(false)
      setBackendResult(null)
    },
    [organizations],
  )

  const addOrganization =
    useCallback(
      (
        assessment: OrganizationAssessment,
      ) => {
        const next =
          buildOrganizationFromAssessment(
            assessment,
          )

        setCustomOrgs((prev) => [
          ...prev.filter(
            (o) => o.id !== next.id,
          ),
          next,
        ])

        setNotifState((prev) => ({
          ...prev,
          [next.id]:
            next.notifications.map(
              (n) => ({ ...n }),
            ),
        }))

        setOrgIdState(next.id)
        setBudgetState(next.budgetDefault)
        setObjectiveState(
          assessment.objective,
        )
        setHasRun(false)
        setBackendResult(null)
      },
      [],
    )

  const addWebsiteOrganization = useCallback((args: { name: string; budget: number; score: number; estimatedExposure: number; findings: WebsiteAssessmentFinding[] }) => {
    const next = buildOrganizationFromWebsiteAssessment(args)
    const interpretedRisks = findingsToRisks(
      args.findings.map((f) => ({
        id: f.id,
        title: f.title,
        detail: f.detail,
        severity: f.severity,
        evidence: f.detail,
        recommendedControlIds: [f.recommendedControl],
      })),
      next.controls,
      args.estimatedExposure,
      `Public website · ${args.name}`,
    )
    const nextWithIntelligence = { ...next, risks: interpretedRisks.length ? interpretedRisks : next.risks }
    setCustomOrgs((prev) => [...prev.filter((o) => o.id !== nextWithIntelligence.id), nextWithIntelligence])
    setNotifState((prev) => ({ ...prev, [nextWithIntelligence.id]: nextWithIntelligence.notifications.map((n) => ({ ...n })) }))
    setOrgIdState(nextWithIntelligence.id)
    setBudgetState(nextWithIntelligence.budgetDefault)
    setObjectiveState("max-reduction")
    setHasRun(false)
    setBackendResult(null)
  }, [])

  const setBudget = useCallback(
    (value: number) => {
      setBudgetState(value)
      setHasRun(false)
      setBackendResult(null)
    },
    [],
  )

  const setObjective = useCallback(
    (value: Objective) => {
      setObjectiveState(value)
      setHasRun(false)
      setBackendResult(null)
    },
    [],
  )

  const runOptimizer = useCallback(() => {
    setRunning(true)
    setHasRun(false)

    try {
      // Phase 1 local product build: run the same deterministic optimizer
      // against the expanded local control catalogue. This keeps control
      // testing independent from the deployed Render service.
      const result = runOptimization(org, budget, objective)

      setBackendResult(result)
      setHasRun(true)

      setNotifState((prev) => {
        const current = prev[org.id] ?? []
        const entry: OrgNotification = {
          id: "optimization-run",
          title: "Budget optimization completed",
          message: `Investment Optimizer generated a new plan for ${org.name} within a ${Math.round(
            budget / 100000,
          )}L budget.`,
          time: "Just now",
          severity: "Info",
          read: false,
        }

        const withoutOld = current.filter(
          (n) => n.id !== "optimization-run",
        )

        return {
          ...prev,
          [org.id]: [entry, ...withoutOld],
        }
      })
    } catch (error) {
      console.error("RiskOpt optimization error:", error)
      alert("RiskOpt couldn't run the local optimization engine. Please try again.")
    } finally {
      setRunning(false)
    }
  }, [org, budget, objective])

  const notifications =
    notifState[org.id] ?? []

  const unreadCount =
    notifications.filter(
      (n) => !n.read,
    ).length

  const markNotificationRead =
    useCallback(
      (id: string) => {
        setNotifState((prev) => ({
          ...prev,
          [org.id]: (
            prev[org.id] ?? []
          ).map((n) =>
            n.id === id
              ? {
                  ...n,
                  read: true,
                }
              : n,
          ),
        }))
      },
      [org.id],
    )

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifState((prev) => ({
        ...prev,
        [org.id]: (
          prev[org.id] ?? []
        ).map((n) => ({
          ...n,
          read: true,
        })),
      }))
    }, [org.id])

  const value: AppStateValue = {
    org,
    orgId,
    organizations,

    setOrgId,
    addOrganization,
    addWebsiteOrganization,

    budget,
    setBudget,

    objective,
    setObjective,

    running,
    hasRun,

    result:
      hasRun
        ? backendResult
        : null,

    runOptimizer,

    notifications,
    unreadCount,

    markNotificationRead,
    markAllNotificationsRead,
  }

  return (
    <AppStateContext.Provider
      value={value}
    >
      {children}
    </AppStateContext.Provider>
  )
}
