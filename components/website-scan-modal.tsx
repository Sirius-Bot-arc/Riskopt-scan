"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, Check, ExternalLink, Globe2, LockKeyhole, Radar, ShieldCheck, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppState } from "@/lib/app-state"
import { interpretFindings } from "@/lib/risk-interpreter"
import { cn } from "@/lib/utils"

type Finding = { id: string; title: string; severity: string; detail: string; recommendedControl: string; points: number }
type Assessment = { url: string; hostname: string; status: number; findings: Finding[]; score: number; counts: { critical:number; high:number; medium:number; total:number }; estimatedExposure:number; note:string }

const steps = ["Validate website", "Inspect public security signals", "Analyze security headers", "Build risk profile", "Prepare recommendations"]

function formatINR(value:number) { return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(value) }

export function WebsiteScanModal({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const { addWebsiteOrganization, org } = useAppState()
  const [url,setUrl]=useState("")
  const [authorized,setAuthorized]=useState(false)
  const [stage,setStage]=useState<"input"|"scanning"|"results"|"budget">("input")
  const [step,setStep]=useState(0)
  const [assessment,setAssessment]=useState<Assessment|null>(null)
  const [budget,setBudget]=useState(1000000)
  const [error,setError]=useState("")

  useEffect(()=>{ if(!open){setStage("input");setStep(0);setError("");setAssessment(null);setAuthorized(false);setUrl("")} },[open])
  useEffect(()=>{ if(stage!=="scanning") return; const id=window.setInterval(()=>setStep(s=>Math.min(steps.length-1,s+1)),650); return ()=>window.clearInterval(id) },[stage])

  if(!open) return null

  async function scan() {
    if(!authorized || !url.trim()) return
    setError(""); setStage("scanning"); setStep(0)
    try {
      const res=await fetch("/api/website-assessment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,authorized})})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error || "Assessment failed")
      setAssessment(data); setStep(steps.length-1); window.setTimeout(()=>setStage("results"),500)
    } catch(e) { setError(e instanceof Error?e.message:"Assessment failed"); setStage("input") }
  }

  function finish() {
    if(!assessment) return
    addWebsiteOrganization({ name: assessment.hostname, budget, score: assessment.score, estimatedExposure: assessment.estimatedExposure, findings: assessment.findings })
    onClose()
  }

  const severityClass=(s:string)=>s==="High"||s==="Critical"?"text-critical bg-critical/10 border-critical/20":"text-medium bg-medium/10 border-medium/20"
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Radar className="size-5"/></span><div><p className="font-semibold">AI-Powered Website Assessment</p><p className="text-xs text-muted-foreground">Passive external assessment of a public website</p></div></div>
        <button type="button" aria-label="Close website assessment" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"><X className="size-5"/></button>
      </div>
      <div className="max-h-[calc(92vh-73px)] overflow-y-auto p-6">
      {stage==="input" && <div className="grid gap-6 md:grid-cols-[1.15fr_.85fr]">
        <div><div className="mb-5"><h2 className="text-2xl font-semibold tracking-tight">See what your public website reveals.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">RiskOpt checks visible security indicators, translates them into business risks, and prepares the assessment for optimization.</p></div>
          <label className="text-sm font-medium">Website URL</label><div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30"><Globe2 className="size-4 text-muted-foreground"/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3"><input type="checkbox" checked={authorized} onChange={e=>setAuthorized(e.target.checked)} className="mt-1 size-4 accent-violet-600"/><span><span className="block text-sm font-medium">I confirm I am authorized to assess this website.</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">RiskOpt uses the supplied URL only for the requested assessment. The prototype does not sell assessment data.</span></span></label>
          {error&&<p className="mt-3 rounded-xl border border-critical/20 bg-critical/10 p-3 text-sm text-critical">{error}</p>}
          <Button disabled={!authorized||!url.trim()} onClick={scan} className="mt-5 w-full"><Radar className="size-4"/>Start Assessment<ArrowRight className="ml-auto size-4"/></Button>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What RiskOpt checks</p><div className="mt-4 space-y-3">{["HTTPS & transport security","Security headers","Cookie protection indicators","Public technology disclosure","HTTP response health"].map(x=><div key={x} className="flex items-center gap-3 text-sm"><span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Check className="size-4"/></span>{x}</div>)}</div><div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mb-1 size-4 text-primary"/> This first version is intentionally passive. It does not exploit vulnerabilities or attempt to break into the site.</div></div>
      </div>}
      {stage==="scanning" && <div className="mx-auto max-w-xl py-10 text-center"><div className="mx-auto flex size-16 animate-pulse items-center justify-center rounded-2xl bg-primary/10 text-primary"><Radar className="size-8"/></div><h2 className="mt-5 text-2xl font-semibold">Assessing {url.replace(/^https?:\/\//,"").split("/")[0]}</h2><p className="mt-2 text-sm text-muted-foreground">RiskOpt is building the external security picture.</p><div className="mt-8 space-y-3 text-left">{steps.map((s,i)=><div key={s} className={cn("flex items-center gap-3 rounded-xl border p-3 transition-all",i<=step?"border-primary/20 bg-primary/5":"border-border opacity-45")}><span className={cn("flex size-7 items-center justify-center rounded-full",i<step?"bg-success text-white":i===step?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground")}>{i<step?<Check className="size-4"/>:<span className="text-xs font-semibold">{i+1}</span>}</span><span className="text-sm font-medium">{s}</span>{i===step&&<span className="ml-auto text-xs text-primary">working…</span>}</div>)}</div></div>}
      {stage==="results" && assessment && <div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Assessment complete</p><h2 className="mt-1 text-2xl font-semibold">{assessment.hostname}</h2><p className="mt-1 text-xs text-muted-foreground">HTTP {assessment.status} · {assessment.findings.length} security indicators</p></div><div className="flex size-24 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5"><span className="text-2xl font-bold">{assessment.score}</span><span className="text-[10px] uppercase text-muted-foreground">risk / 100</span></div></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-critical/20 bg-critical/5 p-4"><p className="text-xs text-muted-foreground">High / critical</p><p className="mt-1 text-2xl font-semibold">{assessment.counts.high+assessment.counts.critical}</p></div><div className="rounded-xl border border-medium/20 bg-medium/5 p-4"><p className="text-xs text-muted-foreground">Medium</p><p className="mt-1 text-2xl font-semibold">{assessment.counts.medium}</p></div><div className="rounded-xl border border-border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Modelled exposure</p><p className="mt-1 text-2xl font-semibold">{formatINR(assessment.estimatedExposure)}</p></div></div>
        <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-4"><div className="flex items-center gap-2"><AlertTriangle className="size-4 text-medium"/><p className="text-sm font-semibold">What this means</p></div><p className="mt-2 text-sm leading-6 text-muted-foreground">The assessment found public security indicators worth addressing. The exposure figure is a RiskOpt modelled estimate, not a prediction or guarantee. The next step is to prioritize controls against your available budget.</p></div>
        <div className="mt-5 space-y-2">{assessment.findings.slice(0,6).map(f=><div key={f.id} className="flex items-start gap-3 rounded-xl border border-border p-3"><span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold uppercase",severityClass(f.severity))}>{f.severity}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{f.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{f.detail}</p></div></div>)}</div>
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary"/><p className="text-sm font-semibold">RiskOpt Intelligence</p></div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">The observed signals are translated into business risk and mapped to controls already understood by the optimizer.</p>
          <div className="mt-4 grid gap-3">{interpretFindings(assessment.findings.map(f=>({id:f.id,title:f.title,detail:f.detail,severity:f.severity,evidence:f.detail,recommendedControlIds:[f.recommendedControl]})), org.controls).slice(0,4).map(r=><div key={r.findingId} className="rounded-xl border border-border bg-background/70 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{r.riskName}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{r.businessImpact}</p></div><span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{r.score}/100</span></div><div className="mt-2 flex flex-wrap gap-1.5">{r.controlNames.slice(0,4).map(c=><span key={c} className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">{c}</span>)}</div></div>)}</div>
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={()=>setStage("budget")}>Continue to Budget<ArrowRight className="size-4"/></Button></div>
      </div>}
      {stage==="budget" && assessment && <div className="mx-auto max-w-xl py-4"><div className="text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-success/10 text-success"><ShieldCheck className="size-6"/></span><h2 className="mt-4 text-2xl font-semibold">Now let's decide what you can fix.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">RiskOpt has identified the exposure. Tell us the budget you can invest, and the optimizer will prioritize the controls that fit it.</p></div><div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5"><label className="text-sm font-medium">Available security budget</label><div className="mt-3 flex items-center rounded-xl border border-input bg-background px-4 py-3"><span className="text-lg text-muted-foreground">₹</span><input type="number" min={100000} step={50000} value={budget} onChange={e=>setBudget(Number(e.target.value)||0)} className="ml-2 w-full bg-transparent text-2xl font-semibold outline-none"/></div><p className="mt-2 text-xs text-muted-foreground">You can change this later in Investment Optimizer.</p></div><Button disabled={budget<100000} onClick={finish} className="mt-5 w-full"><Sparkles className="size-4"/>Build My Risk Profile & Optimize</Button></div>}
      </div>
    </div>
  </div>
}
