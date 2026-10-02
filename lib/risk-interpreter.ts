import type { Control, Risk, Severity } from "./data"

/**
 * RiskOpt Intelligence Layer
 *
 * Interprets observed website-assessment evidence into business language and
 * maps it to the existing RiskOpt control catalogue. It deliberately does not
 * invent vulnerabilities or claim exploitability.
 */
export interface SecurityFinding {
  id: string
  title: string
  detail: string
  severity: Severity | "Info"
  evidence?: string
  category?: string
  recommendedControlIds?: string[]
}

export interface InterpretedRisk {
  findingId: string
  riskName: string
  category: string
  severity: Severity
  score: number
  businessImpact: string
  whyItMatters: string
  evidence: string
  controlIds: string[]
  controlNames: string[]
}

const SEVERITY_SCORE: Record<Severity, number> = { Critical: 90, High: 75, Medium: 55, Low: 30 }

const FINDING_RULES: Array<{
  match: RegExp
  riskName: string
  category: string
  impact: string
  why: string
  protects: string[]
}> = [
  { match: /content-security-policy|csp/i, riskName: "Web Application Exposure", category: "Application", impact: "Browser-based attacks may have a larger opportunity to affect users of the public application.", why: "The assessment observed that a recommended browser security policy is not present.", protects: ["Web Exploitation", "API Attacks", "Account Takeover"] },
  { match: /strict-transport-security|hsts/i, riskName: "Transport Security Gap", category: "Network", impact: "Users may have less protection against downgrade or insecure-transport scenarios.", why: "The assessment observed that a browser-enforced HTTPS policy is not present.", protects: ["Credential Theft", "Network Intrusion"] },
  { match: /x-frame-options|frame-ancestors|clickjack/i, riskName: "Clickjacking Exposure", category: "Application", impact: "A malicious page could potentially attempt to frame the application and trick users into unintended actions.", why: "The assessment observed missing anti-framing protection.", protects: ["Web Exploitation", "Account Takeover"] },
  { match: /secure cookie|httponly|samesite|cookie/i, riskName: "Session Security Gap", category: "Identity", impact: "Weak cookie protections can increase the impact of browser-side or session-related attacks.", why: "The assessment observed a cookie security indicator that should be reviewed.", protects: ["Credential Theft", "Account Takeover"] },
  { match: /server|technology|version disclosure|powered by/i, riskName: "Technology Exposure", category: "Visibility", impact: "Public technology details can give attackers useful reconnaissance information.", why: "The assessment observed technology information that is publicly disclosed by the service.", protects: ["Web Exploitation", "Vulnerability Management", "Network Intrusion"] },
  { match: /tls|certificate|https/i, riskName: "Transport Configuration Risk", category: "Network", impact: "Transport-layer weaknesses can expose users to interception or reduce trust in the public service.", why: "The assessment observed a transport-security indicator that requires review.", protects: ["Credential Theft", "Network Intrusion", "Data Leakage"] },
]

function findRule(finding: SecurityFinding) {
  const text = `${finding.title} ${finding.detail} ${finding.evidence ?? ""}`
  return FINDING_RULES.find((rule) => rule.match.test(text))
}

function scoreFinding(finding: SecurityFinding) {
  if (finding.severity === "Info") return 20
  const base = SEVERITY_SCORE[finding.severity]
  return Math.max(20, Math.min(95, base))
}

export function interpretFinding(finding: SecurityFinding, controls: Control[]): InterpretedRisk {
  const rule = findRule(finding)
  const controlIds = finding.recommendedControlIds?.filter((id) => controls.some((c) => c.id === id)) ?? []
  const mapped = rule ? controls.filter((control) => rule.protects.some((risk) => control.protects.includes(risk))) : []
  const mergedIds = Array.from(new Set([...controlIds, ...mapped.map((control) => control.id)])).slice(0, 6)
  const mappedControls = controls.filter((control) => mergedIds.includes(control.id))
  const severity: Severity = finding.severity === "Info" ? (scoreFinding(finding) >= 45 ? "Medium" : "Low") : finding.severity
  return {
    findingId: finding.id,
    riskName: rule?.riskName ?? finding.title,
    category: finding.category ?? rule?.category ?? "Security",
    severity,
    score: scoreFinding(finding),
    businessImpact: rule?.impact ?? "This finding may increase the organization's exposure and should be reviewed with the affected asset and business context.",
    whyItMatters: rule?.why ?? finding.detail,
    evidence: finding.evidence ?? finding.detail,
    controlIds: mappedControls.map((control) => control.id),
    controlNames: mappedControls.map((control) => control.name),
  }
}

export function interpretFindings(findings: SecurityFinding[], controls: Control[]): InterpretedRisk[] {
  return findings.map((finding) => interpretFinding(finding, controls))
}

export function findingsToRisks(findings: SecurityFinding[], controls: Control[], exposureBase: number, assetLabel = "Public website"): Risk[] {
  return interpretFindings(findings, controls).map((risk, index) => ({
    id: `assessment-${risk.findingId}`,
    name: risk.riskName,
    score: risk.score,
    severity: risk.severity,
    category: risk.category,
    description: risk.businessImpact,
    affectedAssets: [assetLabel],
    contributingFactors: [risk.whyItMatters],
    recommendedControls: risk.controlIds,
    exposure: Math.round(exposureBase * Math.max(0.08, (risk.score / 100) * (0.22 - index * 0.015))),
    trend: 0,
  }))
}
