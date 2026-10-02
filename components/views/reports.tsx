"use client"

import { useState } from "react"
import { Check, Download, FileText, Mail, Printer, Sparkles } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/severity-badge"
import { formatINR, formatINRShort, getControl, getOverview, OBJECTIVES, type Organization, type Control, type Risk } from "@/lib/data"
import { useAppState } from "@/lib/app-state"

const SECTIONS = [
  { id: "summary", label: "Executive Summary", desc: "High-level posture for leadership" },
  { id: "risks", label: "Detailed Risk Register", desc: "All risks with scores and exposure" },
  { id: "controls", label: "Recommended Controls", desc: "Optimizer plan and rationale" },
  { id: "trend", label: "Trend Analysis", desc: "Risk movement over time" },
]

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: unknown) {
  const text = String(value ?? "")
  return `"${text.replaceAll('"', '""')}"`
}

function safeFileName(value: string) {
  return value.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "riskopt"
}


function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[₹€£]/g, "INR ")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, "")
}

function pdfEscape(value: string) {
  return pdfSafe(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function wrapPdf(text: string, maxChars = 92) {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function buildRiskReportPdf({
  org,
  budget,
  objectiveLabel,
  overview,
  topRisks,
  planControls,
  result,
  selected,
}: {
  org: Organization
  budget: number
  objectiveLabel: string
  overview: ReturnType<typeof getOverview>
  topRisks: Risk[]
  planControls: Control[]
  result: { percentReduction?: number } | null
  selected: string[]
}) {
  const pages: string[][] = [[]]
  let page = pages[0]
  let y = 800
  const add = (text: string, size = 10, bold = false) => {
    if (y < 55) {
      page = []
      pages.push(page)
      y = 800
    }
    page.push(`${size}|${bold ? 1 : 0}|${y}|${pdfSafe(text)}`)
    y -= size >= 15 ? 24 : 16
  }
  const heading = (text: string) => {
    if (y < 90) { page = []; pages.push(page); y = 800 }
    add(text, 12, true)
    y -= 2
  }
  const paragraph = (text: string) => {
    for (const line of wrapPdf(text)) add(line, 9)
    y -= 3
  }

  add("RiskOpt", 22, true)
  add("Cyber Risk Assessment Report", 10)
  add(new Date().toLocaleDateString(), 8)
  y -= 8
  add(String(org.name), 16, true)
  add(`${org.industry} - ${org.tagline}`, 9)
  y -= 8
  add(`Overall Risk: ${overview.overallRisk}/100    Severity: ${overview.overallSeverity}`, 10, true)
  add(`Annual Exposure: ${formatINRShort(overview.exposure)}    Budget: ${formatINRShort(budget)}`, 9)
  y -= 8

  if (selected.includes("summary")) {
    heading("1. EXECUTIVE SUMMARY")
    paragraph(`${org.name} currently carries a ${overview.overallSeverity.toLowerCase()} overall cyber risk posture. Estimated annual loss exposure is ${formatINR(overview.exposure)}. The current investment budget is ${formatINR(budget)}.`)
  }

  if (selected.includes("risks")) {
    heading("2. DETAILED RISK REGISTER")
    for (const risk of topRisks) {
      if (y < 80) { page = []; pages.push(page); y = 800 }
      add(`${risk.score}/100  ${risk.name}`, 9.5, true)
      add(`${risk.severity} - ${risk.category} - Exposure ${formatINRShort(risk.exposure)}`, 8)
    }
  }

  if (selected.includes("controls")) {
    heading("3. RECOMMENDED CONTROLS")
    add(result ? `Latest optimizer run - ${objectiveLabel} - ${formatINRShort(budget)} budget` : "No optimization run has been completed yet.", 8)
    if (planControls.length) {
      for (const control of planControls) {
        if (y < 80) { page = []; pages.push(page); y = 800 }
        add(control.name, 9.5, true)
        add(`${formatINRShort(control.cost)} - ${control.category} - ${control.riskReduction}% risk reduction`, 8)
      }
    } else {
      add("Run the Investment Optimizer to populate the recommended plan.", 8)
    }
  }

  if (selected.includes("trend")) {
    heading("4. TREND ANALYSIS")
    add("Month                         Risk Score", 8, true)
    for (const point of org.riskTrend) add(`${point.month.padEnd(28, " ")} ${point.score}/100`, 8)
  }

  add("Generated by RiskOpt - Cyber Risk Intelligence", 7)

  const objects: string[] = []
  const addObj = (body: string) => { objects.push(body); return objects.length }
  const fontId = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  const pageIds: number[] = []
  const contentIds: number[] = []
  const pageEntries: string[] = []

  const contentForPage = (items: string[]) => {
    const commands: string[] = ["0.12 0.12 0.2 rg"]
    for (const item of items) {
      const [size, bold, yPos, ...rest] = item.split("|")
      const text = pdfEscape(rest.join("|"))
      commands.push(`BT /F1 ${size} Tf ${bold === "1" ? "0.12 0.08 0.35 rg" : "0.25 0.27 0.35 rg"} 50 ${yPos} Td (${text}) Tj ET`)
    }
    return commands.join("\n")
  }

  const pageObjectNumbers: number[] = []
  pages.forEach((items) => {
    const content = contentForPage(items)
    const contentId = addObj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    const pageId = objects.length + 1
    objects.push("")
    pageObjectNumbers.push(pageId)
    contentIds.push(contentId)
  })
  const pagesId = objects.length + 1
  objects.push("")
  pages.forEach((_, i) => {
    const pageId = pageObjectNumbers[i]
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`
  })
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`
  const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"
  const offsets: number[] = [0]
  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: "application/pdf" })
}

export function Reports() {
  const { setView } = useNav()
  const { org, budget, objective, result } = useAppState()
  const overview = getOverview(org)
  const [selected, setSelected] = useState<string[]>(SECTIONS.map((s) => s.id))
  const [format, setFormat] = useState<"pdf" | "csv">("pdf")
  const [exporting, setExporting] = useState(false)

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const topRisks = [...org.risks].sort((a, b) => b.score - a.score).slice(0, 5)
  const objectiveLabel = OBJECTIVES.find((o) => o.id === objective)?.label ?? objective
  const planControls = result
    ? result.controlIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c)
    : []

  async function handleDownload() {
    if (selected.length === 0 || exporting) return
    setExporting(true)
    try {
      if (format === "csv") {
        const rows: string[][] = [
          ["RiskOpt Cyber Risk Assessment Report"],
          ["Organization", org.name],
          ["Industry", org.industry],
          ["Overall Risk", `${overview.overallRisk}/100`],
          ["Severity", overview.overallSeverity],
          ["Annual Exposure (INR)", String(overview.exposure)],
          ["Budget (INR)", String(budget)],
          [],
        ]
        if (selected.includes("summary")) {
          rows.push(["EXECUTIVE SUMMARY"], ["Metric", "Value"], ["Overall Risk", String(overview.overallRisk)], ["Severity", overview.overallSeverity], ["Annual Exposure (INR)", String(overview.exposure)], ["Critical Risks", String(overview.criticalRisks)], [])
        }
        if (selected.includes("risks")) {
          rows.push(["DETAILED RISK REGISTER"], ["Risk", "Score", "Severity", "Category", "Exposure (INR)"])
          for (const risk of org.risks) rows.push([risk.name, String(risk.score), risk.severity, risk.category, String(risk.exposure)])
          rows.push([])
        }
        if (selected.includes("controls")) {
          rows.push(["RECOMMENDED CONTROLS"], ["Control", "Cost (INR)", "Risk Reduction %", "Category"])
          for (const control of planControls) rows.push([control.name, String(control.cost), String(control.riskReduction), control.category])
          if (!result) rows.push(["No optimization run", "", "", ""])
          rows.push([])
        }
        if (selected.includes("trend")) {
          rows.push(["TREND ANALYSIS"], ["Month", "Risk Score"])
          for (const point of org.riskTrend) rows.push([point.month, String(point.score)])
        }
        const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n")
        downloadBlob("\ufeff" + csv, `${safeFileName(org.name)}-risk-report.csv`, "text/csv;charset=utf-8")
        return
      }

      const pdf = buildRiskReportPdf({
        org,
        budget,
        objectiveLabel,
        overview,
        topRisks,
        planControls,
        result,
        selected,
      })
      downloadBlob(pdf, `${safeFileName(org.name)}-risk-report.pdf`, "application/pdf")
    } finally {
      setExporting(false)
    }
  }

  function handlePrint() { window.print() }
  function handleEmail() {
    const subject = encodeURIComponent(`RiskOpt report — ${org.name}`)
    const body = encodeURIComponent(`RiskOpt cyber risk report for ${org.name}. Overall risk: ${overview.overallRisk}/100. Annual exposure: ${formatINR(overview.exposure)}. Budget: ${formatINR(budget)}.`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div key={org.id} className="animate-in fade-in-0 slide-in-from-bottom-1 grid gap-6 duration-300 lg:grid-cols-[1fr_20rem] print:block">
      <Card className="overflow-hidden p-0 print:border-0 print:shadow-none">
        <div className="border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><FileText className="size-5" /></span><div><h2 className="text-lg font-semibold">Cyber Risk Assessment Report</h2><p className="text-xs text-muted-foreground">{org.name} · {org.industry} · Generated today</p></div></div>
        </div>
        <div className="flex flex-col gap-6 px-6 py-6">
          {selected.includes("summary") && <section><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><SummaryStat label="Overall Risk" value={`${overview.overallRisk}/100`} /><SummaryStat label="Severity" value={overview.overallSeverity} /><SummaryStat label="Exposure" value={formatINRShort(overview.exposure)} /><SummaryStat label="Critical Risks" value={String(overview.criticalRisks)} /></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{org.name} currently carries a <strong className="text-foreground">{overview.overallSeverity}</strong> overall cyber risk posture driven primarily by {topRisks[0]?.name.toLowerCase()} and {topRisks[1]?.name.toLowerCase()} exposure. An estimated {formatINR(overview.exposure)} in annual loss exposure can be materially reduced by allocating the {formatINRShort(overview.budget)} security budget toward the highest-impact controls.</p></section>}
          {selected.includes("risks") && <section><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Risks</h3><div className="overflow-hidden rounded-xl border border-border">{topRisks.map((r) => <div key={r.id} className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0"><span className="w-8 text-sm font-semibold tabular-nums">{r.score}</span><span className="flex-1 text-sm font-medium">{r.name}</span><span className="text-xs tabular-nums text-muted-foreground">{formatINRShort(r.exposure)}</span><SeverityBadge severity={r.severity} /></div>)}</div></section>}
          {selected.includes("controls") && <section><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recommended Controls</h3>{result ? <><p className="mb-3 text-sm text-muted-foreground">Latest optimizer run · {objectiveLabel} · {formatINRShort(budget)} budget · <span className="font-medium text-success">-{result.percentReduction}% risk</span></p><div className="overflow-hidden rounded-xl border border-border">{planControls.map((c) => <div key={c.id} className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0"><span className="flex-1 text-sm font-medium">{c.name}</span><span className="text-xs tabular-nums text-muted-foreground">{formatINRShort(c.cost)}</span><span className="text-xs font-medium text-success">-{c.riskReduction}%</span></div>)}</div></> : <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3"><p className="text-sm text-muted-foreground">No optimization has been run yet for {org.name}.</p><Button size="sm" variant="outline" onClick={() => setView("optimizer")}><Sparkles className="size-4" />Run Optimizer</Button></div>}</section>}
          {selected.includes("trend") && <section><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trend Analysis</h3><div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-border px-4 py-3">{org.riskTrend.map((t) => <div key={t.month} className="flex flex-1 flex-col items-center gap-1"><span className="text-sm font-semibold tabular-nums">{t.score}</span><span className="text-[11px] text-muted-foreground">{t.month}</span></div>)}</div></section>}
        </div>
      </Card>

      <div className="flex flex-col gap-4 print:hidden">
        <Card><CardHeader><CardTitle>Include Sections</CardTitle><CardDescription>Choose what to include in the export</CardDescription></CardHeader><CardContent className="flex flex-col gap-2">{SECTIONS.map((s) => { const on = selected.includes(s.id); return <button key={s.id} type="button" onClick={() => toggle(s.id)} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"><span className={`flex size-5 items-center justify-center rounded-md border transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{on && <Check className="size-3.5" />}</span><div className="min-w-0"><p className="text-sm font-medium">{s.label}</p><p className="truncate text-xs text-muted-foreground">{s.desc}</p></div></button> })}</CardContent></Card>
        <Card><CardHeader><CardTitle>Export Format</CardTitle></CardHeader><CardContent className="flex flex-col gap-3"><div className="grid grid-cols-2 gap-2">{(["pdf", "csv"] as const).map((f) => <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-xl border px-3 py-2 text-sm font-medium uppercase transition-colors ${format === f ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent"}`}>{f}</button>)}</div><Button className="w-full" disabled={selected.length === 0 || exporting} onClick={handleDownload}><Download className="size-4" />{exporting ? "Preparing Report..." : `Download ${format.toUpperCase()} Report`}</Button><div className="grid grid-cols-2 gap-2"><Button variant="outline" size="sm" onClick={handlePrint}><Printer className="size-4" />Print</Button><Button variant="outline" size="sm" onClick={handleEmail}><Mail className="size-4" />Email</Button></div></CardContent></Card>
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-0.5 text-base font-semibold">{value}</p></div> }
