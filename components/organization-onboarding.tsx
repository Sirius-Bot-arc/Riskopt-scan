"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Building2, Check, Cloud, ShieldCheck, Sparkles, X } from "lucide-react"
import { type Objective, type OrganizationAssessment } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

const steps = ["Organization", "Environment", "Security", "Risk & Compliance", "Investment"]

export function OrganizationOnboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addOrganization } = useAppState()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OrganizationAssessment>({
    name:"", industry:"Technology", size:"Mid-Market", employees:500, endpoints:450, cloud:"AWS",
    criticalApps:8, internetAssets:12, dataSensitivity:"Sensitive", mfa:55, edr:55, backup:60,
    training:50, firewall:65, dlp:40, vulnerability:55, iam:55, incidents:1, concerns:"Cloud and identity security",
    riskAppetite:"Moderate", compliance:[], budget:1000000, objective:"max-reduction",
  })
  const update = <K extends keyof OrganizationAssessment>(key:K, value:OrganizationAssessment[K]) =>
    setForm((p)=>({...p,[key]:value}))
  const canNext = step === 0 ? form.name.trim().length >= 2 : true
  const finish = () => { addOrganization(form); setStep(0); onClose() }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="org-onboarding-modal animate-in fade-in-0 zoom-in-95 relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl duration-200">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-violet-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-slate-200/70 px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-200"><Sparkles className="size-5"/></span>
            <div><p className="font-semibold">Set up your organization</p><p className="text-xs text-slate-500">RiskOpt needs a few signals to build your risk profile.</p></div>
          </div>
          <button type="button" aria-label="Close organization setup" title="Close" onClick={onClose} className="org-onboarding-close inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400/50"><X className="size-5"/></button>
        </div>
        <div className="relative border-b border-slate-200/70 px-6 py-4 md:px-8">
          <div className="flex items-center gap-2">
            {steps.map((s,i)=><div key={s} className="flex min-w-0 flex-1 items-center gap-2">
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", i<step ? "bg-emerald-100 text-emerald-700":i===step?"bg-violet-600 text-white":"bg-slate-100 text-slate-500")}>{i<step?<Check className="size-4"/>:i+1}</span>
              <span className={cn("hidden truncate text-xs font-medium sm:block",i===step?"text-slate-900":"text-slate-400")}>{s}</span>
              {i<steps.length-1&&<span className="mx-1 h-px flex-1 bg-slate-200"/>}
            </div>)}
          </div>
        </div>
        <div className="relative flex-1 overflow-y-auto px-6 py-7 md:px-10">
          {step===0&&<Section title="Tell us about the organization" icon={<Building2/>}>
            <Field label="Organization name"><input autoFocus value={form.name} onChange={e=>update("name",e.target.value)} placeholder="e.g. Acme Technologies" className="input-premium"/></Field>
            <div className="grid gap-4 md:grid-cols-2"><Field label="Industry"><select value={form.industry} onChange={e=>update("industry",e.target.value)} className="input-premium">{["Banking & Finance","Healthcare","Retail / E-commerce","Technology","Manufacturing","Government","Other"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Organization size"><select value={form.size} onChange={e=>update("size",e.target.value)} className="input-premium">{["Small","Mid-Market","Enterprise"].map(x=><option key={x}>{x}</option>)}</select></Field></div>
          </Section>}
          {step===1&&<Section title="Map your technology environment" icon={<Cloud/>}>
            <div className="grid gap-4 sm:grid-cols-2"><NumberField label="Employees" value={form.employees} min={10} max={100000} step={10} onChange={v=>update("employees",v)}/><NumberField label="Endpoints" value={form.endpoints} min={1} max={100000} step={10} onChange={v=>update("endpoints",v)}/><NumberField label="Critical applications" value={form.criticalApps} min={1} max={1000} onChange={v=>update("criticalApps",v)}/><NumberField label="Internet-facing assets" value={form.internetAssets} min={1} max={10000} onChange={v=>update("internetAssets",v)}/></div>
            <Field label="Primary cloud environment"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{["AWS","Microsoft Azure","Google Cloud","Multi-cloud","On-premises"].map(x=><Choice key={x} selected={form.cloud===x} onClick={()=>update("cloud",x)}>{x}</Choice>)}</div></Field>
            <Field label="Data sensitivity"><div className="grid gap-2 sm:grid-cols-3">{["Public","Sensitive","Highly sensitive"].map(x=><Choice key={x} selected={form.dataSensitivity===x} onClick={()=>update("dataSensitivity",x)}>{x}</Choice>)}</div></Field>
          </Section>}
          {step===2&&<Section title="How mature is your security posture?" icon={<ShieldCheck/>}>
            <p className="mb-5 text-sm text-slate-500">Move each control from low maturity to strong coverage. These signals directly influence the baseline risk.</p>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{([["mfa","MFA coverage"],["edr","Endpoint protection"],["backup","Backup maturity"],["training","Security training"],["firewall","Firewall / WAF"],["dlp","Data Loss Prevention"],["vulnerability","Vulnerability management"],["iam","Identity & Access"] ] as const).map(([key,label])=><div key={key}><div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="font-semibold text-violet-700">{form[key]}%</span></div><input type="range" min={0} max={100} value={form[key]} onChange={e=>update(key,Number(e.target.value))} className="w-full accent-violet-600"/></div>)}</div>
          </Section>}
          {step===3&&<Section title="Risk context & compliance" icon={<ShieldCheck/>}>
            <div className="grid gap-4 sm:grid-cols-2"><NumberField label="Security incidents in last 24 months" value={form.incidents} min={0} max={20} onChange={v=>update("incidents",v)}/><Field label="Risk appetite"><select value={form.riskAppetite} onChange={e=>update("riskAppetite",e.target.value)} className="input-premium">{["Conservative","Moderate","Aggressive"].map(x=><option key={x}>{x}</option>)}</select></Field></div>
            <Field label="Current biggest concern"><input value={form.concerns} onChange={e=>update("concerns",e.target.value)} className="input-premium" placeholder="e.g. ransomware, cloud exposure, fraud"/></Field>
            <Field label="Compliance requirements"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{["ISO 27001","SOC 2","PCI DSS","HIPAA","GDPR","None"].map(x=><Choice key={x} selected={form.compliance.includes(x)} onClick={()=>update("compliance",form.compliance.includes(x)?form.compliance.filter(c=>c!==x):[...form.compliance,x])}>{x}</Choice>)}</div></Field>
          </Section>}
          {step===4&&<Section title="Set your investment strategy" icon={<Sparkles/>}>
            <Field label="Annual cybersecurity budget"><div className="flex items-center gap-3"><span className="text-2xl font-bold text-slate-900">₹</span><input type="number" min={100000} step={50000} value={form.budget} onChange={e=>update("budget",Math.max(100000,Number(e.target.value)||0))} className="input-premium text-lg font-semibold"/></div></Field>
            <Field label="Optimization priority"><div className="grid gap-3 md:grid-cols-3">{([["max-reduction","Maximum Risk Reduction","Cut the most absolute risk"],["best-value","Best Value for Money","Get more risk reduction per rupee"],["balanced","Balanced","Blend impact, efficiency & coverage"]] as [Objective,string,string][]).map(([id,label,desc])=><button key={id} onClick={()=>update("objective",id)} className={cn("rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",form.objective===id?"border-violet-400 bg-violet-50 shadow-md":"border-slate-200 bg-white hover:bg-slate-50")}><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">{desc}</p></button>)}</div></Field>
            <div className="rounded-2xl bg-gradient-to-r from-violet-50 via-sky-50 to-emerald-50 p-5"><p className="text-sm font-semibold">Ready to build your baseline?</p><p className="mt-1 text-xs text-slate-600">RiskOpt will turn these signals into a deterministic risk profile and investment plan.</p></div>
          </Section>}
        </div>
        <div className="relative flex items-center justify-between border-t border-slate-200/70 bg-white/80 px-6 py-4 md:px-8">
          <button disabled={step===0} onClick={()=>setStep(s=>s-1)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:invisible"><ArrowLeft className="size-4"/>Back</button>
          {step<steps.length-1?<button disabled={!canNext} onClick={()=>setStep(s=>s+1)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-40">Continue<ArrowRight className="size-4"/></button>:<button onClick={finish} disabled={!canNext} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:opacity-40"><Sparkles className="size-4"/>Analyze my organization</button>}
        </div>
      </div>
    </div>
  )
}
function Section({title,icon,children}:{title:string;icon:React.ReactNode;children:React.ReactNode}){return <div className="space-y-6"><div><div className="mb-2 flex items-center gap-2 text-violet-600"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-100">{icon}</span><h2 className="text-xl font-semibold text-slate-900">{title}</h2></div></div>{children}</div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block space-y-2 text-sm font-medium text-slate-700">{label}{children}</label>}
function NumberField({label,value,min,max,step=1,onChange}:{label:string;value:number;min:number;max?:number;step?:number;onChange:(v:number)=>void}){return <Field label={label}><input type="number" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} className="input-premium"/></Field>}
function Choice({selected,onClick,children}:{selected:boolean;onClick:()=>void;children:React.ReactNode}){return <button type="button" onClick={onClick} className={cn("rounded-xl border px-3 py-2.5 text-left text-sm transition-all hover:-translate-y-0.5",selected?"border-violet-400 bg-violet-50 text-violet-800 shadow-sm":"border-slate-200 bg-white hover:bg-slate-50")}>{children}</button>}
