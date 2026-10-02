import { NextResponse } from "next/server"
import dns from "node:dns/promises"
import net from "node:net"

export const runtime = "nodejs"

function isPrivateIpv4(ip: string) {
  const p = ip.split(".").map(Number)
  if (p.length !== 4 || p.some(Number.isNaN)) return true
  const [a, b] = p
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    a >= 224
}

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) return isPrivateIpv4(ip)
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase()
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb")
  }
  return true
}

async function assertPublicHost(hostname: string) {
  const lower = hostname.toLowerCase()
  if (lower === "localhost" || lower.endsWith(".localhost") || lower.endsWith(".local") || lower === "metadata.google.internal") {
    throw new Error("Local and metadata hosts are not allowed")
  }
  const records = await dns.lookup(hostname, { all: true })
  if (!records.length || records.some((r) => isPrivateIp(r.address))) throw new Error("The website resolves to a private or local network address")
}

function finding(id: string, title: string, severity: "Critical" | "High" | "Medium" | "Low" | "Info", detail: string, control: string, points: number) {
  return { id, title, severity, detail, recommendedControl: control, points }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const raw = String(body?.url ?? "").trim()
    const authorized = body?.authorized === true
    if (!authorized) return NextResponse.json({ error: "Authorization is required before an assessment can start." }, { status: 400 })
    if (!raw) return NextResponse.json({ error: "Enter a website URL." }, { status: 400 })

    let url: URL
    try {
      url = new URL(raw.includes("://") ? raw : `https://${raw}`)
    } catch {
      return NextResponse.json({ error: "That does not look like a valid website URL." }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(url.protocol)) return NextResponse.json({ error: "Only HTTP and HTTPS websites can be assessed." }, { status: 400 })
    await assertPublicHost(url.hostname)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let response: Response
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "RiskOpt-External-Assessment/1.0" },
      })
    } finally {
      clearTimeout(timeout)
    }

    const headers = response.headers
    const findings = []
    if (url.protocol !== "https:") findings.push(finding("https", "Website does not use HTTPS", "High", "The assessed URL is reachable over unencrypted HTTP.", "waf", 16))
    if (!headers.get("strict-transport-security")) findings.push(finding("hsts", "HSTS header is not visible", "Medium", "The response does not advertise HTTP Strict Transport Security.", "waf", 7))
    if (!headers.get("content-security-policy")) findings.push(finding("csp", "Content-Security-Policy is not visible", "Medium", "No CSP header was observed in the response.", "waf", 8))
    if (!headers.get("x-content-type-options")) findings.push(finding("xcto", "Content-Type protection is not visible", "Low", "The response does not advertise X-Content-Type-Options.", "waf", 4))
    if (!headers.get("x-frame-options") && !headers.get("content-security-policy")?.toLowerCase().includes("frame-ancestors")) findings.push(finding("clickjacking", "Clickjacking protection is not visible", "Medium", "Neither X-Frame-Options nor a CSP frame-ancestors directive was observed.", "waf", 6))
    const setCookie = headers.get("set-cookie") || ""
    if (setCookie && (!/secure/i.test(setCookie) || !/httponly/i.test(setCookie))) findings.push(finding("cookies", "Session cookie flags need review", "Medium", "A Set-Cookie response was observed without all expected Secure/HttpOnly protections.", "iam", 8))
    const server = headers.get("server")
    const powered = headers.get("x-powered-by")
    if (server || powered) findings.push(finding("fingerprint", "Server technology is publicly disclosed", "Low", `The response exposes ${[server && `Server: ${server}`, powered && `X-Powered-By: ${powered}`].filter(Boolean).join("; ")}.`, "vulnerability-management", 3))
    if (response.status >= 500) findings.push(finding("server-error", "Server returned an error status", "Medium", `The public page returned HTTP ${response.status} during the assessment.`, "siem", 6))

    const score = Math.max(12, Math.min(92, 34 + findings.reduce((sum, f) => sum + f.points, 0)))
    const critical = findings.filter((f) => f.severity === "Critical").length
    const high = findings.filter((f) => f.severity === "High").length
    const medium = findings.filter((f) => f.severity === "Medium").length
    const exposure = Math.round(700000 + score * 42000 + findings.length * 90000)

    return NextResponse.json({
      url: url.toString(),
      hostname: url.hostname,
      status: response.status,
      contentType: headers.get("content-type") || "unknown",
      findings,
      score,
      counts: { critical, high, medium, total: findings.length },
      estimatedExposure: exposure,
      note: "This is a passive external assessment of the supplied public URL. Findings are indicators for review, not proof of exploitability or a guarantee of business loss.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "The assessment could not be completed."
    return NextResponse.json({ error: message.includes("private") || message.includes("Local") ? message : "RiskOpt could not safely reach that website. Check the URL and try again." }, { status: 400 })
  }
}
