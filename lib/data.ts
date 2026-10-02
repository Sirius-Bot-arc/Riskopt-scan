// Central mock data layer for RiskOpt.
// Each organization carries its own fully independent dataset (risks, controls,
// notifications, trend history) so switching organizations changes every part
// of the product. Shapes are intentionally close to what a real backend would
// return, so the UI can later be wired to real endpoints with minimal changes. 

export type Severity = "Critical" | "High" | "Medium" | "Low"
export type Objective = "max-reduction" | "best-value" | "balanced"

export interface Risk {
  id: string
  name: string
  score: number
  severity: Severity
  category: string
  description: string
  affectedAssets: string[]
  contributingFactors: string[]
  recommendedControls: string[] // control ids
  exposure: number // estimated annual loss exposure in INR
  trend: number // change in score vs last assessment
}

export interface Control {
  id: string
  name: string
  cost: number
  riskReduction: number // percentage points of overall risk reduction
  exposureReduction: number // INR reduction to annual loss exposure if implemented
  category: string // primary risk category this control addresses
  protects: string[]
  description: string
}

export interface OrgNotification {
  id: string
  title: string
  message: string
  time: string
  severity: Severity | "Info"
  read: boolean
}

export interface Organization {
  id: string
  name: string
  industry: string
  tagline: string
  budgetDefault: number
  budgetMin: number
  budgetMax: number
  risks: Risk[]
  controls: Control[]
  notifications: OrgNotification[]
  riskTrend: { month: string; score: number }[]
}

export interface OverviewStats {
  overallRisk: number
  overallSeverity: Severity
  exposure: number
  budget: number
  criticalRisks: number
}

export const SEVERITY_ORDER: Severity[] = ["Critical", "High", "Medium", "Low"]

export const OBJECTIVES: { id: Objective; label: string; description: string }[] = [
  {
    id: "max-reduction",
    label: "Maximum Risk Reduction",
    description: "Spend within budget to remove as much absolute risk as possible.",
  },
  {
    id: "best-value",
    label: "Best Value for Money",
    description: "Maximize risk reduced per rupee, prioritizing efficient controls.",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Blend risk reduction, cost efficiency, and category coverage.",
  },
]

// ---------------------------------------------------------------------------
// ABC Bank — Banking & Financial Services
// ---------------------------------------------------------------------------

const ABC_BANK: Organization = {
  id: "abc-bank",
  name: "ABC Bank",
  industry: "Banking & Financial Services",
  tagline: "Retail & commercial banking, 2.4M customers",
  budgetDefault: 1500000,
  budgetMin: 300000,
  budgetMax: 2600000,
  risks: [
    {
      id: "ransomware",
      name: "Ransomware",
      score: 90,
      severity: "Critical",
      category: "Malware",
      description:
        "Ransomware targeting core banking infrastructure can halt transaction processing and branch operations until systems are restored or a ransom is paid.",
      affectedAssets: ["Core banking servers", "Branch endpoints", "Backup systems"],
      contributingFactors: ["Unpatched core banking systems", "Weak endpoint protection", "Limited network segmentation"],
      recommendedControls: ["edr", "backup", "training"],
      exposure: 2200000,
      trend: 5,
    },
    {
      id: "financial-fraud",
      name: "Financial Fraud",
      score: 85,
      severity: "Critical",
      category: "Fraud",
      description:
        "Real-time payment rails and weak transaction monitoring allow synthetic identity and transaction fraud to slip through undetected.",
      affectedAssets: ["Payment gateway", "Core banking system", "Customer accounts"],
      contributingFactors: ["Weak transaction monitoring", "Synthetic identity fraud", "Real-time payment rails"],
      recommendedControls: ["fraud-detection", "mfa"],
      exposure: 2800000,
      trend: 4,
    },
    {
      id: "phishing",
      name: "Phishing",
      score: 78,
      severity: "High",
      category: "Social Engineering",
      description:
        "Spoofed banking domains and deceptive emails trick employees and customers into revealing credentials or authorizing fraudulent transfers.",
      affectedAssets: ["Employee inboxes", "Customer email channel"],
      contributingFactors: ["Low security awareness", "Spoofed banking domains", "No email filtering"],
      recommendedControls: ["training", "mfa"],
      exposure: 1200000,
      trend: 2,
    },
    {
      id: "credential-theft",
      name: "Credential Theft",
      score: 74,
      severity: "High",
      category: "Identity",
      description:
        "Stolen credentials from credential-stuffing attacks let attackers impersonate legitimate users on legacy systems that lack multi-factor authentication.",
      affectedAssets: ["Online banking portal", "Employee VPN", "Admin consoles"],
      contributingFactors: ["No MFA on legacy systems", "Password reuse", "Credential-stuffing attacks"],
      recommendedControls: ["mfa", "edr"],
      exposure: 1000000,
      trend: 1,
    },
    {
      id: "data-leakage",
      name: "Data Leakage",
      score: 66,
      severity: "High",
      category: "Data Loss",
      description:
        "Excessive access rights and unencrypted exports create paths for sensitive customer financial data to leave the organization unmonitored.",
      affectedAssets: ["Customer database", "Core banking exports"],
      contributingFactors: ["Excessive access rights", "Unencrypted data exports", "No data loss prevention"],
      recommendedControls: ["dlp"],
      exposure: 800000,
      trend: -1,
    },
    {
      id: "insider-threat",
      name: "Insider Threat",
      score: 52,
      severity: "Medium",
      category: "Identity",
      description:
        "Employees or contractors with broad privileged access may intentionally or accidentally cause data loss or transaction fraud.",
      affectedAssets: ["Core banking system", "HR systems"],
      contributingFactors: ["Excessive privileged access", "No activity monitoring"],
      recommendedControls: ["dlp", "mfa"],
      exposure: 600000,
      trend: 0,
    },
    {
      id: "ddos",
      name: "DDoS on Online Banking",
      score: 42,
      severity: "Medium",
      category: "Network",
      description:
        "Distributed denial-of-service attacks against the online and mobile banking channels can cause outages during peak transaction periods.",
      affectedAssets: ["Online banking portal", "Mobile banking API"],
      contributingFactors: ["Limited edge capacity", "No traffic scrubbing"],
      recommendedControls: ["firewall"],
      exposure: 400000,
      trend: -3,
    },
  ],
  controls: [
    {
      id: "edr",
      name: "EDR",
      cost: 450000,
      riskReduction: 22,
      exposureReduction: 1400000,
      category: "Malware",
      protects: ["Ransomware", "Credential Theft", "Endpoint Compromise"],
      description:
        "Endpoint Detection & Response continuously monitors branch and core-system endpoints for malicious behavior and enables rapid containment.",
    },
    {
      id: "mfa",
      name: "Multi-Factor Authentication",
      cost: 200000,
      riskReduction: 16,
      exposureReduction: 1200000,
      category: "Identity",
      protects: ["Credential Theft", "Phishing", "Financial Fraud"],
      description:
        "Adds a second verification step across online banking and admin systems, drastically reducing the impact of stolen passwords.",
    },
    {
      id: "backup",
      name: "Immutable Backup Upgrade",
      cost: 350000,
      riskReduction: 14,
      exposureReduction: 900000,
      category: "Malware",
      protects: ["Ransomware", "Data Loss"],
      description:
        "Immutable, frequently tested backups ensure fast recovery from ransomware without paying a ransom or losing transaction data.",
    },
    {
      id: "training",
      name: "Employee Security Training",
      cost: 120000,
      riskReduction: 10,
      exposureReduction: 600000,
      category: "Social Engineering",
      protects: ["Phishing", "Insider Threat"],
      description:
        "Security awareness training helps branch and back-office staff recognize and report phishing and social engineering attempts.",
    },
    {
      id: "fraud-detection",
      name: "Real-Time Fraud Detection",
      cost: 600000,
      riskReduction: 20,
      exposureReduction: 1800000,
      category: "Fraud",
      protects: ["Financial Fraud", "Account Takeover"],
      description:
        "Behavioral analytics flag suspicious transactions in real time, blocking fraudulent transfers before funds move.",
    },
    {
      id: "dlp",
      name: "DLP for Customer Data",
      cost: 380000,
      riskReduction: 12,
      exposureReduction: 700000,
      category: "Data Loss",
      protects: ["Data Leakage", "Insider Threat"],
      description:
        "Data Loss Prevention inspects data in motion and at rest to stop sensitive customer financial data from leaving the bank.",
    },
    {
      id: "firewall",
      name: "Next-Gen Firewall & DDoS Scrubbing",
      cost: 500000,
      riskReduction: 9,
      exposureReduction: 350000,
      category: "Network",
      protects: ["DDoS", "Network Attacks"],
      description:
        "Inspects traffic at the network edge and scrubs volumetric attacks before they reach online banking channels.",
    },
  ],
  notifications: [
    {
      id: "n1",
      title: "Critical ransomware risk detected",
      message: "New ransomware campaign targeting core banking systems observed in the wild.",
      time: "2h ago",
      severity: "Critical",
      read: false,
    },
    {
      id: "n2",
      title: "High-risk credential exposure detected",
      message: "A leaked credential dump matching employee email domains was found on dark web forums.",
      time: "6h ago",
      severity: "High",
      read: false,
    },
    {
      id: "n3",
      title: "Security control effectiveness changed",
      message: "MFA effectiveness upgraded after rollout to all branch staff.",
      time: "1d ago",
      severity: "Info",
      read: true,
    },
    {
      id: "n4",
      title: "New recommended investment available",
      message: "Real-Time Fraud Detection is now recommended based on updated fraud loss data.",
      time: "2d ago",
      severity: "Info",
      read: true,
    },
  ],
  riskTrend: [
    { month: "Mar", score: 84 },
    { month: "Apr", score: 82 },
    { month: "May", score: 85 },
    { month: "Jun", score: 81 },
    { month: "Jul", score: 79 },
    { month: "Aug", score: 78 },
  ],
}

// ---------------------------------------------------------------------------
// NovaTech Solutions — Technology / SaaS
// ---------------------------------------------------------------------------

const NOVATECH: Organization = {
  id: "novatech",
  name: "NovaTech Solutions",
  industry: "Technology & Cloud Services",
  tagline: "B2B SaaS platform, cloud-native infrastructure",
  budgetDefault: 1000000,
  budgetMin: 200000,
  budgetMax: 1800000,
  risks: [
    {
      id: "cloud-misconfig",
      name: "Cloud Misconfiguration",
      score: 88,
      severity: "Critical",
      category: "Cloud",
      description:
        "Overly permissive IAM roles and publicly exposed storage leave production infrastructure open to discovery and exploitation by attackers.",
      affectedAssets: ["Production cloud environment", "Object storage buckets", "Kubernetes clusters"],
      contributingFactors: ["Overly permissive IAM roles", "Publicly exposed storage buckets", "No continuous posture monitoring"],
      recommendedControls: ["cspm", "mfa"],
      exposure: 1600000,
      trend: 6,
    },
    {
      id: "api-attacks",
      name: "API Attacks",
      score: 80,
      severity: "Critical",
      category: "Application",
      description:
        "Weak authentication and missing rate limits on public APIs allow attackers to scrape data, abuse business logic, and pivot into partner systems.",
      affectedAssets: ["Public API gateway", "Partner integrations"],
      contributingFactors: ["No rate limiting", "Weak API authentication", "Unvalidated inputs"],
      recommendedControls: ["api-security", "mfa"],
      exposure: 1400000,
      trend: 4,
    },
    {
      id: "credential-theft",
      name: "Credential Theft",
      score: 72,
      severity: "High",
      category: "Identity",
      description:
        "Stolen developer and admin credentials can grant attackers direct access to source code, infrastructure, and customer data.",
      affectedAssets: ["Developer accounts", "CI/CD pipeline", "Admin consoles"],
      contributingFactors: ["No MFA on developer tools", "Password reuse", "Phishing exposure"],
      recommendedControls: ["mfa", "edr"],
      exposure: 800000,
      trend: 2,
    },
    {
      id: "supply-chain",
      name: "Supply Chain Vulnerability",
      score: 68,
      severity: "High",
      category: "Supply Chain",
      description:
        "Unvetted open-source dependencies and vendor integrations introduce vulnerabilities that bypass the organization's own defenses.",
      affectedAssets: ["Third-party libraries", "Vendor integrations", "CI/CD pipeline"],
      contributingFactors: ["Unvetted open-source dependencies", "No vendor risk reviews", "Outdated packages"],
      recommendedControls: ["vendor-risk", "edr"],
      exposure: 900000,
      trend: 3,
    },
    {
      id: "ransomware",
      name: "Ransomware",
      score: 60,
      severity: "High",
      category: "Malware",
      description:
        "Ransomware on employee endpoints or internal file shares can disrupt engineering productivity and threaten source code integrity.",
      affectedAssets: ["Employee endpoints", "Internal file shares"],
      contributingFactors: ["Unpatched systems", "Weak endpoint protection"],
      recommendedControls: ["edr", "backup"],
      exposure: 700000,
      trend: 1,
    },
    {
      id: "insider-threat",
      name: "Insider Threat",
      score: 48,
      severity: "Medium",
      category: "Identity",
      description:
        "Broad repository and data warehouse access without activity monitoring makes it hard to detect misuse by employees or contractors.",
      affectedAssets: ["Source code repositories", "Customer data warehouse"],
      contributingFactors: ["Excessive repository access", "No activity monitoring"],
      recommendedControls: ["dlp", "mfa"],
      exposure: 400000,
      trend: 0,
    },
    {
      id: "ddos",
      name: "DDoS",
      score: 34,
      severity: "Medium",
      category: "Network",
      description:
        "Volumetric attacks against the API gateway and CDN edge can degrade uptime for customers during peak usage.",
      affectedAssets: ["Public API gateway", "CDN edge"],
      contributingFactors: ["Limited edge capacity", "No traffic scrubbing"],
      recommendedControls: ["firewall"],
      exposure: 300000,
      trend: -3,
    },
  ],
  controls: [
    {
      id: "cspm",
      name: "Cloud Security Posture Management",
      cost: 350000,
      riskReduction: 20,
      exposureReduction: 1100000,
      category: "Cloud",
      protects: ["Cloud Misconfiguration", "Data Exposure"],
      description:
        "Continuously scans cloud accounts for misconfigurations, exposed storage, and excessive permissions, and flags drift automatically.",
    },
    {
      id: "api-security",
      name: "API Security Gateway",
      cost: 300000,
      riskReduction: 17,
      exposureReduction: 900000,
      category: "Application",
      protects: ["API Attacks", "Injection Attacks"],
      description:
        "Adds authentication, rate limiting, and schema validation in front of public APIs to block abuse and scraping.",
    },
    {
      id: "mfa",
      name: "MFA for Engineering Accounts",
      cost: 150000,
      riskReduction: 13,
      exposureReduction: 600000,
      category: "Identity",
      protects: ["Credential Theft", "Account Takeover"],
      description:
        "Requires a second factor for developer, admin, and CI/CD access, neutralizing most stolen-password attacks.",
    },
    {
      id: "edr",
      name: "EDR",
      cost: 280000,
      riskReduction: 12,
      exposureReduction: 500000,
      category: "Malware",
      protects: ["Ransomware", "Malware"],
      description:
        "Monitors employee endpoints for malicious behavior and enables rapid isolation of compromised machines.",
    },
    {
      id: "vendor-risk",
      name: "Vendor & Supply Chain Risk Program",
      cost: 220000,
      riskReduction: 11,
      exposureReduction: 550000,
      category: "Supply Chain",
      protects: ["Supply Chain Vulnerability", "Third-Party Breach"],
      description:
        "Establishes dependency scanning and vendor security reviews to catch risky packages and integrations before deployment.",
    },
    {
      id: "backup",
      name: "Backup & Disaster Recovery",
      cost: 180000,
      riskReduction: 9,
      exposureReduction: 350000,
      category: "Malware",
      protects: ["Ransomware", "Data Loss"],
      description:
        "Automated, tested backups of source code and internal systems ensure fast recovery from destructive incidents.",
    },
    {
      id: "dlp",
      name: "Data Loss Prevention",
      cost: 250000,
      riskReduction: 8,
      exposureReduction: 250000,
      category: "Identity",
      protects: ["Insider Threat", "Data Exposure"],
      description:
        "Monitors and restricts bulk exports from the customer data warehouse and code repositories.",
    },
    {
      id: "firewall",
      name: "Edge Firewall & DDoS Scrubbing",
      cost: 260000,
      riskReduction: 7,
      exposureReduction: 150000,
      category: "Network",
      protects: ["DDoS", "Network Attacks"],
      description:
        "Filters volumetric traffic at the CDN edge before it reaches the API gateway.",
    },
  ],
  notifications: [
    {
      id: "n1",
      title: "Critical cloud misconfiguration detected",
      message: "A publicly exposed storage bucket was found in the production AWS account.",
      time: "1h ago",
      severity: "Critical",
      read: false,
    },
    {
      id: "n2",
      title: "High-risk API abuse detected",
      message: "Unusual spike in requests to the public API suggests credential stuffing.",
      time: "5h ago",
      severity: "High",
      read: false,
    },
    {
      id: "n3",
      title: "Security control effectiveness changed",
      message: "CSPM coverage expanded to all cloud accounts.",
      time: "1d ago",
      severity: "Info",
      read: true,
    },
    {
      id: "n4",
      title: "New recommended investment available",
      message: "API Security Gateway is now recommended following recent traffic anomalies.",
      time: "3d ago",
      severity: "Info",
      read: true,
    },
  ],
  riskTrend: [
    { month: "Mar", score: 68 },
    { month: "Apr", score: 70 },
    { month: "May", score: 74 },
    { month: "Jun", score: 77 },
    { month: "Jul", score: 75 },
    { month: "Aug", score: 73 },
  ],
}

// ---------------------------------------------------------------------------
// MediCore Healthcare — Hospital network
// ---------------------------------------------------------------------------

const MEDICORE: Organization = {
  id: "medicore",
  name: "MediCore Healthcare",
  industry: "Healthcare",
  tagline: "Multi-site hospital network & telehealth platform",
  budgetDefault: 900000,
  budgetMin: 200000,
  budgetMax: 1900000,
  risks: [
    {
      id: "ransomware",
      name: "Ransomware",
      score: 91,
      severity: "Critical",
      category: "Malware",
      description:
        "Ransomware against hospital systems can lock electronic health records and imaging systems, disrupting patient care until systems are restored.",
      affectedAssets: ["Electronic Health Record system", "Hospital file servers", "Imaging systems"],
      contributingFactors: ["Unpatched legacy medical systems", "Weak endpoint protection", "Limited network segmentation"],
      recommendedControls: ["edr", "backup", "training"],
      exposure: 2000000,
      trend: 7,
    },
    {
      id: "patient-data-exposure",
      name: "Patient Data Exposure",
      score: 82,
      severity: "Critical",
      category: "Data Loss",
      description:
        "Excessive access rights and unencrypted exports of protected health information create serious regulatory and patient-trust exposure.",
      affectedAssets: ["Electronic Health Record system", "Patient portal", "Insurance claims database"],
      contributingFactors: ["Excessive access rights", "Unencrypted data exports", "No DLP for PHI"],
      recommendedControls: ["dlp", "mfa"],
      exposure: 1800000,
      trend: 3,
    },
    {
      id: "medical-system-disruption",
      name: "Medical System Disruption",
      score: 75,
      severity: "High",
      category: "Availability",
      description:
        "A flat network shared between IT and connected medical devices lets an incident on one system disrupt life-critical equipment on the other.",
      affectedAssets: ["Connected medical devices", "Hospital network", "Imaging systems"],
      contributingFactors: ["Flat network design", "Unsegmented medical devices", "Outdated device firmware"],
      recommendedControls: ["network-segmentation", "edr"],
      exposure: 1400000,
      trend: 2,
    },
    {
      id: "phishing",
      name: "Phishing",
      score: 70,
      severity: "High",
      category: "Social Engineering",
      description:
        "Clinical staff under time pressure are especially susceptible to deceptive emails impersonating vendors or hospital leadership.",
      affectedAssets: ["Staff email", "Patient portal login"],
      contributingFactors: ["Low security awareness among clinical staff", "No email filtering"],
      recommendedControls: ["training", "mfa"],
      exposure: 700000,
      trend: 1,
    },
    {
      id: "credential-theft",
      name: "Credential Theft",
      score: 64,
      severity: "High",
      category: "Identity",
      description:
        "Clinical accounts without multi-factor authentication are a common target for attackers seeking access to patient records.",
      affectedAssets: ["Electronic Health Record system", "VPN", "Admin consoles"],
      contributingFactors: ["No MFA for clinical staff", "Password reuse"],
      recommendedControls: ["mfa"],
      exposure: 600000,
      trend: 0,
    },
    {
      id: "insider-threat",
      name: "Insider Threat",
      score: 50,
      severity: "Medium",
      category: "Identity",
      description:
        "Broad privileged access to patient records without activity monitoring makes inappropriate record access difficult to detect.",
      affectedAssets: ["Electronic Health Record system", "HR systems"],
      contributingFactors: ["Excessive privileged access", "No activity monitoring"],
      recommendedControls: ["dlp", "mfa"],
      exposure: 500000,
      trend: -1,
    },
    {
      id: "ddos",
      name: "DDoS",
      score: 39,
      severity: "Medium",
      category: "Availability",
      description:
        "Denial-of-service attacks against the patient portal or telehealth platform can prevent patients from booking care or reaching providers.",
      affectedAssets: ["Patient portal", "Telehealth platform"],
      contributingFactors: ["Limited edge capacity", "No incident response plan"],
      recommendedControls: ["network-segmentation", "incident-response"],
      exposure: 200000,
      trend: -4,
    },
  ],
  controls: [
    {
      id: "edr",
      name: "EDR",
      cost: 380000,
      riskReduction: 21,
      exposureReduction: 1300000,
      category: "Malware",
      protects: ["Ransomware", "Medical System Disruption"],
      description:
        "Monitors clinical workstations and servers for malicious behavior and enables rapid containment without disrupting patient care.",
    },
    {
      id: "backup",
      name: "Immutable Backup & Recovery",
      cost: 300000,
      riskReduction: 18,
      exposureReduction: 1000000,
      category: "Malware",
      protects: ["Ransomware", "Data Loss"],
      description:
        "Immutable, tested backups of EHR and imaging data allow rapid restoration without paying a ransom.",
    },
    {
      id: "network-segmentation",
      name: "Medical Device Network Segmentation",
      cost: 450000,
      riskReduction: 17,
      exposureReduction: 800000,
      category: "Availability",
      protects: ["Medical System Disruption", "DDoS"],
      description:
        "Isolates connected medical devices from the general IT network so an incident on one cannot spread to the other.",
    },
    {
      id: "dlp",
      name: "DLP for Patient Data",
      cost: 320000,
      riskReduction: 15,
      exposureReduction: 900000,
      category: "Data Loss",
      protects: ["Patient Data Exposure", "Insider Threat"],
      description:
        "Inspects and restricts exports of protected health information from the EHR and claims systems.",
    },
    {
      id: "mfa",
      name: "MFA for Clinical Staff",
      cost: 160000,
      riskReduction: 13,
      exposureReduction: 650000,
      category: "Identity",
      protects: ["Credential Theft", "Phishing", "Patient Data Exposure"],
      description:
        "Adds a lightweight second factor tuned for clinical workflows, reducing friction while blocking stolen-password attacks.",
    },
    {
      id: "training",
      name: "HIPAA Security Awareness Training",
      cost: 90000,
      riskReduction: 9,
      exposureReduction: 350000,
      category: "Social Engineering",
      protects: ["Phishing"],
      description:
        "Short, role-specific training for clinical and administrative staff on recognizing phishing and handling PHI safely.",
    },
    {
      id: "incident-response",
      name: "Incident Response Retainer",
      cost: 140000,
      riskReduction: 7,
      exposureReduction: 200000,
      category: "Availability",
      protects: ["DDoS", "Medical System Disruption"],
      description:
        "On-call incident response expertise reduces downtime and impact when an availability incident does occur.",
    },
  ],
  notifications: [
    {
      id: "n1",
      title: "Critical ransomware risk detected",
      message: "Threat intelligence indicates active ransomware campaigns targeting hospital EHR systems.",
      time: "3h ago",
      severity: "Critical",
      read: false,
    },
    {
      id: "n2",
      title: "High-risk credential exposure detected",
      message: "Clinical staff credentials were found in a recent healthcare-sector breach dump.",
      time: "8h ago",
      severity: "High",
      read: false,
    },
    {
      id: "n3",
      title: "Security control effectiveness changed",
      message: "DLP coverage extended to the insurance claims database.",
      time: "1d ago",
      severity: "Info",
      read: true,
    },
    {
      id: "n4",
      title: "New recommended investment available",
      message: "Medical Device Network Segmentation is now recommended after the latest device inventory scan.",
      time: "4d ago",
      severity: "Info",
      read: true,
    },
  ],
  riskTrend: [
    { month: "Mar", score: 82 },
    { month: "Apr", score: 80 },
    { month: "May", score: 84 },
    { month: "Jun", score: 81 },
    { month: "Jul", score: 79 },
    { month: "Aug", score: 77 },
  ],
}

// ---------------------------------------------------------------------------
// ShopSphere Retail — E-commerce & retail
// ---------------------------------------------------------------------------

const SHOPSPHERE: Organization = {
  id: "shopsphere",
  name: "ShopSphere Retail",
  industry: "Retail & E-commerce",
  tagline: "Omnichannel retail, online + in-store payments",
  budgetDefault: 1100000,
  budgetMin: 200000,
  budgetMax: 2000000,
  risks: [
    {
      id: "payment-fraud",
      name: "Payment Fraud",
      score: 86,
      severity: "Critical",
      category: "Fraud",
      description:
        "Card-not-present fraud and weak transaction monitoring at checkout expose the business to chargebacks and direct financial loss.",
      affectedAssets: ["Checkout & payment gateway", "Point-of-sale systems", "Customer payment data"],
      contributingFactors: ["Weak transaction monitoring", "Card-not-present fraud", "No payment tokenization"],
      recommendedControls: ["fraud-detection", "mfa"],
      exposure: 1900000,
      trend: 5,
    },
    {
      id: "account-takeover",
      name: "Account Takeover",
      score: 79,
      severity: "Critical",
      category: "Identity",
      description:
        "Credential stuffing against customer accounts lets attackers drain loyalty points, place fraudulent orders, and harvest payment data.",
      affectedAssets: ["Customer accounts", "Loyalty program", "Mobile app login"],
      contributingFactors: ["Credential stuffing", "No MFA for customer accounts", "Weak session controls"],
      recommendedControls: ["mfa", "fraud-detection"],
      exposure: 1300000,
      trend: 4,
    },
    {
      id: "supply-chain-risk",
      name: "Supply Chain Risk",
      score: 71,
      severity: "High",
      category: "Supply Chain",
      description:
        "Shared credentials and unvetted access for logistics and inventory vendors create a path into core retail systems.",
      affectedAssets: ["Vendor integrations", "Inventory management system", "Third-party logistics platform"],
      contributingFactors: ["Unvetted vendor access", "No vendor risk reviews", "Shared credentials with partners"],
      recommendedControls: ["vendor-risk", "mfa"],
      exposure: 1000000,
      trend: 2,
    },
    {
      id: "data-leakage",
      name: "Data Leakage",
      score: 65,
      severity: "High",
      category: "Data Loss",
      description:
        "Excessive access and unencrypted exports of customer purchase history and contact data risk exposure through unmonitored channels.",
      affectedAssets: ["Customer database", "Marketing platform", "Cloud storage"],
      contributingFactors: ["Excessive access rights", "Unencrypted exports", "No data loss prevention"],
      recommendedControls: ["dlp"],
      exposure: 800000,
      trend: -1,
    },
    {
      id: "phishing",
      name: "Phishing",
      score: 62,
      severity: "High",
      category: "Social Engineering",
      description:
        "Store managers and corporate staff are targeted with deceptive emails to gain access to point-of-sale and back-office systems.",
      affectedAssets: ["Employee inboxes", "Store manager accounts"],
      contributingFactors: ["Low security awareness", "No email filtering"],
      recommendedControls: ["training", "mfa"],
      exposure: 600000,
      trend: 1,
    },
    {
      id: "ransomware",
      name: "Ransomware",
      score: 55,
      severity: "Medium",
      category: "Malware",
      description:
        "Unpatched point-of-sale terminals and warehouse systems are vulnerable to ransomware that can halt in-store checkout and fulfillment.",
      affectedAssets: ["Point-of-sale systems", "Warehouse management systems"],
      contributingFactors: ["Unpatched POS terminals", "Weak endpoint protection"],
      recommendedControls: ["edr", "backup"],
      exposure: 500000,
      trend: 0,
    },
    {
      id: "ddos",
      name: "DDoS During Sales Events",
      score: 40,
      severity: "Medium",
      category: "Network",
      description:
        "Traffic surges during major sale events are indistinguishable from denial-of-service attacks without adequate scrubbing, risking checkout outages.",
      affectedAssets: ["E-commerce website", "CDN", "Checkout service"],
      contributingFactors: ["Limited edge capacity", "No traffic scrubbing during peak sales"],
      recommendedControls: ["firewall"],
      exposure: 400000,
      trend: -2,
    },
  ],
  controls: [
    {
      id: "fraud-detection",
      name: "Fraud Detection & Payment Tokenization",
      cost: 500000,
      riskReduction: 22,
      exposureReduction: 1500000,
      category: "Fraud",
      protects: ["Payment Fraud", "Account Takeover"],
      description:
        "Tokenizes payment data and applies behavioral analytics at checkout to catch fraudulent transactions before they settle.",
    },
    {
      id: "mfa",
      name: "MFA for Customer & Staff Accounts",
      cost: 180000,
      riskReduction: 15,
      exposureReduction: 900000,
      category: "Identity",
      protects: ["Account Takeover", "Phishing", "Payment Fraud"],
      description:
        "Adds an optional-but-encouraged second factor for customer logins and a required one for staff and admin accounts.",
    },
    {
      id: "vendor-risk",
      name: "Vendor & Supply Chain Risk Management",
      cost: 260000,
      riskReduction: 13,
      exposureReduction: 650000,
      category: "Supply Chain",
      protects: ["Supply Chain Risk"],
      description:
        "Reviews and monitors third-party logistics and inventory vendors, replacing shared credentials with scoped access.",
    },
    {
      id: "dlp",
      name: "DLP for Customer Data",
      cost: 300000,
      riskReduction: 12,
      exposureReduction: 550000,
      category: "Data Loss",
      protects: ["Data Leakage"],
      description:
        "Monitors and restricts bulk exports of customer purchase and contact data from marketing and analytics platforms.",
    },
    {
      id: "training",
      name: "Employee Security Training",
      cost: 100000,
      riskReduction: 9,
      exposureReduction: 300000,
      category: "Social Engineering",
      protects: ["Phishing"],
      description:
        "Security awareness training for store and corporate staff on recognizing phishing and protecting POS credentials.",
    },
    {
      id: "edr",
      name: "EDR for POS & Warehouse Systems",
      cost: 240000,
      riskReduction: 10,
      exposureReduction: 350000,
      category: "Malware",
      protects: ["Ransomware"],
      description:
        "Monitors point-of-sale terminals and warehouse systems for malicious behavior and enables rapid isolation.",
    },
    {
      id: "firewall",
      name: "WAF & DDoS Scrubbing",
      cost: 320000,
      riskReduction: 8,
      exposureReduction: 250000,
      category: "Network",
      protects: ["DDoS"],
      description:
        "A web application firewall and traffic scrubbing keep checkout available during sale-driven traffic surges.",
    },
  ],
  notifications: [
    {
      id: "n1",
      title: "Critical payment fraud spike detected",
      message: "A sudden rise in card-not-present fraud attempts was observed during the recent sale event.",
      time: "4h ago",
      severity: "Critical",
      read: false,
    },
    {
      id: "n2",
      title: "High-risk account takeover activity",
      message: "Credential-stuffing attacks were detected against the customer login endpoint.",
      time: "9h ago",
      severity: "High",
      read: false,
    },
    {
      id: "n3",
      title: "Security control effectiveness changed",
      message: "MFA adoption for customer accounts increased after the latest sign-in prompt update.",
      time: "1d ago",
      severity: "Info",
      read: true,
    },
    {
      id: "n4",
      title: "New recommended investment available",
      message: "Vendor Risk Management is now recommended after a third-party logistics incident.",
      time: "5d ago",
      severity: "Info",
      read: true,
    },
  ],
  riskTrend: [
    { month: "Mar", score: 78 },
    { month: "Apr", score: 76 },
    { month: "May", score: 79 },
    { month: "Jun", score: 75 },
    { month: "Jul", score: 74 },
    { month: "Aug", score: 72 },
  ],
}


export interface OrganizationAssessment {
  name: string
  industry: string
  size: string
  employees: number
  endpoints: number
  cloud: string
  criticalApps: number
  internetAssets: number
  dataSensitivity: string
  mfa: number
  edr: number
  backup: number
  training: number
  firewall: number
  dlp: number
  vulnerability: number
  iam: number
  incidents: number
  concerns: string
  riskAppetite: string
  compliance: string[]
  budget: number
  objective: Objective
}

export function buildOrganizationFromAssessment(a: OrganizationAssessment): Organization {
  const posture = Math.round(
    92 -
      a.mfa * 0.08 - a.edr * 0.06 - a.backup * 0.06 - a.training * 0.04 -
      a.firewall * 0.04 - a.dlp * 0.03 - a.vulnerability * 0.04 - a.iam * 0.05 -
      Math.min(a.employees / 5000, 1) * 3 + a.incidents * 2 +
      (a.dataSensitivity === "Highly sensitive" ? 4 : a.dataSensitivity === "Sensitive" ? 2 : 0),
  )
  const riskScore = Math.max(28, Math.min(91, posture))
  const scale = Math.max(1, a.employees / 500)
  const baseExposure = Math.round((a.budget * (2.2 + riskScore / 100)) + scale * 450000)
  const id = `custom-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "organization"}`
  const industryRisk: Record<string, {name:string; category:string; factor:number}[]> = {
    "Banking & Finance": [
      {name:"Financial Fraud",category:"Fraud",factor:1.12},{name:"Credential Theft",category:"Identity",factor:1.04},
      {name:"Ransomware",category:"Malware",factor:.96},{name:"Phishing",category:"Social Engineering",factor:.88},
    ],
    Healthcare: [
      {name:"Data Leakage",category:"Data Loss",factor:1.12},{name:"Ransomware",category:"Malware",factor:1.08},
      {name:"Legacy Systems",category:"Infrastructure",factor:1.0},{name:"Credential Theft",category:"Identity",factor:.9},
    ],
    "Retail / E-commerce": [
      {name:"Account Takeover",category:"Identity",factor:1.1},{name:"Payment Fraud",category:"Fraud",factor:1.08},
      {name:"DDoS",category:"Network",factor:.92},{name:"Data Leakage",category:"Data Loss",factor:1.0},
    ],
    Technology: [
      {name:"Cloud Misconfiguration",category:"Cloud",factor:1.14},{name:"API Attacks",category:"Application",factor:1.08},
      {name:"Supply Chain",category:"Third Party",factor:1.0},{name:"Credential Theft",category:"Identity",factor:.92},
    ],
    Manufacturing: [
      {name:"Ransomware",category:"Malware",factor:1.1},{name:"OT Intrusion",category:"Operational",factor:1.12},
      {name:"Supply Chain",category:"Third Party",factor:1.0},{name:"Credential Theft",category:"Identity",factor:.9},
    ],
    Government: [
      {name:"Credential Theft",category:"Identity",factor:1.08},{name:"Data Leakage",category:"Data Loss",factor:1.06},
      {name:"Ransomware",category:"Malware",factor:1.0},{name:"DDoS",category:"Network",factor:.92},
    ],
  }
  const templates = industryRisk[a.industry] ?? industryRisk.Technology
  const gap = Math.max(0, (100-riskScore))
  const risks: Risk[] = templates.map((t,i) => {
    const score = Math.max(25, Math.min(95, Math.round((riskScore + (i-1)*6 + (a.incidents*2)) * t.factor - gap*.12)))
    return {
      id: `${id}-risk-${i}`, name:t.name, score, severity:scoreToSeverityLocal(score), category:t.category,
      description:`${t.name} can materially affect ${a.name}'s critical operations, data and customer trust.`,
      affectedAssets:[`${a.criticalApps} critical applications`, `${a.internetAssets} internet-facing assets`, `${a.endpoints.toLocaleString()} endpoints`],
      contributingFactors:[`${a.cloud} environment`, `${a.dataSensitivity} data`, `${a.incidents} prior incidents reported`],
      recommendedControls:["mfa","edr","backup"].slice(0,2 + (i%2)),
      exposure:Math.round(baseExposure * (0.24 - i*.025)),
      trend:i===0 ? Math.max(-4, Math.min(8, a.incidents+2)) : i%2===0 ? -2 : 1,
    }
  })
  const controls: Control[] = [
    {id:"mfa",name:"Adaptive MFA",cost:Math.round(a.employees*900),riskReduction:13,exposureReduction:Math.round(baseExposure*.14),category:"Identity",protects:["Credential Theft","Account Takeover"],description:"Adaptive multi-factor authentication blocks stolen-credential attacks across workforce and customer identities."},
    {id:"edr",name:"Endpoint Detection & Response",cost:Math.round(a.endpoints*1100),riskReduction:12,exposureReduction:Math.round(baseExposure*.12),category:"Malware",protects:["Ransomware","Malware"],description:"Continuous endpoint telemetry and isolation reduces dwell time and limits malware spread."},
    {id:"backup",name:"Immutable Backup & Recovery",cost:Math.round(Math.max(180000,a.criticalApps*65000)),riskReduction:11,exposureReduction:Math.round(baseExposure*.11),category:"Resilience",protects:["Ransomware","Data Loss"],description:"Immutable recovery points reduce operational impact when systems or data are compromised."},
    {id:"training",name:"Security Awareness Training",cost:Math.round(Math.max(100000,a.employees*450)),riskReduction:8,exposureReduction:Math.round(baseExposure*.07),category:"Human Risk",protects:["Phishing","Social Engineering"],description:"Role-based training reduces successful social engineering and credential compromise."},
    {id:"firewall",name:"WAF & Network Protection",cost:Math.round(Math.max(220000,a.internetAssets*18000)),riskReduction:9,exposureReduction:Math.round(baseExposure*.08),category:"Network",protects:["DDoS","API Attacks"],description:"Web application and network controls reduce internet-facing attack paths."},
    {id:"dlp",name:"Data Loss Prevention",cost:Math.round(Math.max(260000,a.employees*650)),riskReduction:10,exposureReduction:Math.round(baseExposure*.09),category:"Data Loss",protects:["Data Leakage"],description:"DLP monitors sensitive data movement and helps prevent unauthorized exfiltration."},
  ]
  const notifications: OrgNotification[] = [
    {id:"assessment-complete",title:"Risk assessment completed",message:`RiskOpt established a ${riskScore}/100 baseline for ${a.name}.`,time:"Just now",severity:"Info",read:false},
    {id:"top-risk",title:`${risks[0].name} needs attention`,message:`This is currently the highest-impact risk in your ${a.industry.toLowerCase()} profile.`,time:"Today",severity:risks[0].severity,read:false},
    {id:"budget",title:"Investment strategy ready",message:`Your ${formatINRShort(a.budget)} budget is ready for optimization.`,time:"Today",severity:"Info",read:true},
  ]
  const riskTrend = ["Mar","Apr","May","Jun","Jul","Aug"].map((month,i)=>({month,score:Math.max(25,Math.min(95,riskScore + (5-i)*1.4 + (i===5?0:2)))}))
  return expandOrganizationControls({id,name:a.name,industry:a.industry,tagline:`${a.size} organization · ${a.employees.toLocaleString()} employees`,budgetDefault:a.budget,budgetMin:Math.max(100000,Math.round(a.budget*.35)),budgetMax:Math.max(a.budget,Math.round(a.budget*1.8)),risks,controls,notifications,riskTrend})
}


// ---------------------------------------------------------------------------
// Expanded security-control catalogue
// ---------------------------------------------------------------------------
// These controls are intentionally shared across organizations. The risk-to-
// control mapping is driven by each control's `protects` field, so future
// AI/security findings can be mapped into the same catalogue instead of
// inventing a new recommendation every time.

const EXPANDED_CONTROL_CATALOG: Control[] = [
  {
    id: "iam",
    name: "Identity & Access Management",
    cost: 280000,
    riskReduction: 11,
    exposureReduction: 650000,
    category: "Identity",
    protects: ["Credential Theft", "Insider Threat", "Account Takeover", "Data Leakage"],
    description: "Centralizes identity, role-based access and joiner-mover-leaver controls so users only receive the access they need.",
  },
  {
    id: "pam",
    name: "Privileged Access Management",
    cost: 420000,
    riskReduction: 12,
    exposureReduction: 800000,
    category: "Identity",
    protects: ["Credential Theft", "Insider Threat", "Ransomware"],
    description: "Protects administrator accounts with just-in-time access, privileged-session controls and stronger authentication.",
  },
  {
    id: "vulnerability-management",
    name: "Vulnerability Management",
    cost: 300000,
    riskReduction: 13,
    exposureReduction: 850000,
    category: "Vulnerability",
    protects: ["Ransomware", "Credential Theft", "Cloud Misconfiguration", "API Attacks", "Data Leakage"],
    description: "Continuously identifies, prioritizes and tracks exploitable weaknesses across systems and internet-facing assets.",
  },
  {
    id: "patch-management",
    name: "Automated Patch Management",
    cost: 220000,
    riskReduction: 10,
    exposureReduction: 600000,
    category: "Vulnerability",
    protects: ["Ransomware", "Malware", "Credential Theft", "Legacy Systems"],
    description: "Automates security patch deployment and reporting to reduce exposure to known vulnerabilities.",
  },
  {
    id: "siem",
    name: "SIEM & Security Monitoring",
    cost: 550000,
    riskReduction: 14,
    exposureReduction: 950000,
    category: "Monitoring",
    protects: ["Ransomware", "Credential Theft", "Insider Threat", "Data Leakage", "Fraud"],
    description: "Aggregates security events and highlights suspicious activity so analysts can investigate and respond faster.",
  },
  {
    id: "email-security",
    name: "Email Security Gateway",
    cost: 240000,
    riskReduction: 11,
    exposureReduction: 650000,
    category: "Social Engineering",
    protects: ["Phishing", "Malware", "Credential Theft"],
    description: "Filters malicious links, attachments and impersonation attempts before they reach employee inboxes.",
  },
  {
    id: "network-segmentation",
    name: "Network Segmentation",
    cost: 380000,
    riskReduction: 12,
    exposureReduction: 750000,
    category: "Network",
    protects: ["Ransomware", "DDoS", "Network Intrusion", "Medical System Disruption", "OT Intrusion"],
    description: "Separates critical systems and limits lateral movement when an attacker gains a foothold.",
  },
  {
    id: "waf",
    name: "Web Application Firewall",
    cost: 300000,
    riskReduction: 9,
    exposureReduction: 500000,
    category: "Application",
    protects: ["API Attacks", "DDoS", "Web Exploitation", "Account Takeover"],
    description: "Inspects web traffic and blocks common application-layer attacks against public applications and APIs.",
  },
  {
    id: "encryption",
    name: "Data Encryption",
    cost: 260000,
    riskReduction: 8,
    exposureReduction: 700000,
    category: "Data Loss",
    protects: ["Data Leakage", "Patient Data Exposure", "Credential Theft"],
    description: "Encrypts sensitive information at rest and in transit to reduce the impact of unauthorized access or loss.",
  },
  {
    id: "penetration-testing",
    name: "Penetration Testing",
    cost: 180000,
    riskReduction: 7,
    exposureReduction: 350000,
    category: "Assurance",
    protects: ["Web Exploitation", "API Attacks", "Cloud Misconfiguration", "Network Intrusion"],
    description: "Authorized security testing finds exploitable weaknesses before attackers do and validates existing controls.",
  },
  {
    id: "incident-response",
    name: "Incident Response & Playbooks",
    cost: 160000,
    riskReduction: 8,
    exposureReduction: 400000,
    category: "Resilience",
    protects: ["Ransomware", "DDoS", "Data Leakage", "Fraud"],
    description: "Predefined response playbooks and escalation procedures reduce containment and recovery time during incidents.",
  },
  {
    id: "cloud-security",
    name: "Cloud Security Posture Management",
    cost: 360000,
    riskReduction: 10,
    exposureReduction: 650000,
    category: "Cloud",
    protects: ["Cloud Misconfiguration", "Data Leakage", "Credential Theft", "Supply Chain"],
    description: "Continuously checks cloud configurations, permissions and exposed resources for security gaps.",
  },
  {
    id: "api-security",
    name: "API Security Monitoring",
    cost: 280000,
    riskReduction: 9,
    exposureReduction: 520000,
    category: "Application",
    protects: ["API Attacks", "Account Takeover", "Data Leakage"],
    description: "Monitors API behavior, authentication and unusual access patterns across internet-facing services.",
  },
  {
    id: "asset-inventory",
    name: "Continuous Asset Inventory",
    cost: 140000,
    riskReduction: 6,
    exposureReduction: 300000,
    category: "Visibility",
    protects: ["Cloud Misconfiguration", "Ransomware", "Network Intrusion", "Supply Chain"],
    description: "Maintains an up-to-date inventory of systems, applications and internet-facing assets so unknown exposure is reduced.",
  },
  {
    id: "vendor-risk",
    name: "Third-Party Risk Management",
    cost: 210000,
    riskReduction: 7,
    exposureReduction: 400000,
    category: "Third Party",
    protects: ["Supply Chain", "Data Leakage", "Credential Theft"],
    description: "Assesses important vendors and limits third-party access paths that could introduce security risk.",
  },
]

function expandOrganizationControls(org: Organization): Organization {
  const existingIds = new Set(org.controls.map((control) => control.id))
  const additional = EXPANDED_CONTROL_CATALOG.filter((control) => !existingIds.has(control.id))
  const controls = [...org.controls, ...additional]

  // Add risk-aware recommendations without removing the original curated mappings.
  const risks = org.risks.map((risk) => {
    const recommended = new Set(risk.recommendedControls)
    for (const control of controls) {
      if (control.protects.includes(risk.name) || control.category === risk.category) {
        recommended.add(control.id)
      }
    }
    return {
      ...risk,
      recommendedControls: Array.from(recommended).slice(0, 6),
    }
  })

  return { ...org, controls, risks }
}

export const ORGANIZATIONS: Organization[] = [ABC_BANK, NOVATECH, MEDICORE, SHOPSPHERE].map(expandOrganizationControls)

export interface WebsiteAssessmentFinding {
  id: string
  title: string
  severity: Severity | "Info"
  detail: string
  recommendedControl: string
  points: number
}

export function buildOrganizationFromWebsiteAssessment(args: {
  name: string
  budget: number
  score: number
  estimatedExposure: number
  findings: WebsiteAssessmentFinding[]
}): Organization {
  const id = `website-${args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "assessment"}`
  const severityFor = (severity: WebsiteAssessmentFinding["severity"], score: number): Severity => {
    if (severity === "Critical") return "Critical"
    if (severity === "High") return "High"
    if (severity === "Medium") return "Medium"
    if (score >= 70) return "High"
    if (score >= 45) return "Medium"
    return "Low"
  }
  const controls = EXPANDED_CONTROL_CATALOG.map((c) => ({ ...c }))
  const risks: Risk[] = args.findings.length
    ? args.findings.map((f, index) => {
        const score = Math.max(20, Math.min(95, args.score + (f.points - 8) * 1.8 - index * 2))
        const exposure = Math.max(80000, Math.round(args.estimatedExposure * (0.18 - Math.min(index, 5) * 0.02)))
        const mapped = controls.filter((c) => c.id === f.recommendedControl || c.protects.includes(f.title) || c.category === (f.recommendedControl === "waf" ? "Application" : "Identity"))
        return {
          id: `${id}-risk-${f.id}`, name: f.title, score: Math.round(score), severity: severityFor(f.severity, score), category: f.recommendedControl === "waf" ? "Application" : f.recommendedControl === "iam" ? "Identity" : "Configuration",
          description: f.detail, affectedAssets: ["Public website"], contributingFactors: ["Observed during passive external assessment"], recommendedControls: mapped.length ? mapped.slice(0, 6).map((c) => c.id) : [f.recommendedControl], exposure, trend: 0,
        }
      })
    : [{ id: `${id}-risk-baseline`, name: "External Security Posture", score: args.score, severity: severityFor("Info", args.score), category: "Application", description: "No material indicators were observed by the passive assessment, but the public attack surface should still be reviewed continuously.", affectedAssets: ["Public website"], contributingFactors: ["Passive external assessment"], recommendedControls: ["vulnerability-management", "waf"], exposure: args.estimatedExposure, trend: 0 }]

  const notifications: OrgNotification[] = [
    { id: "assessment-complete", title: "Website assessment completed", message: `RiskOpt established a ${args.score}/100 external risk baseline for ${args.name}.`, time: "Just now", severity: args.score >= 70 ? "High" : "Info", read: false },
    { id: "findings", title: `${args.findings.length} security indicators identified`, message: "Review the findings and use Investment Optimizer to prioritize controls within your budget.", time: "Just now", severity: args.findings.some((f) => f.severity === "High" || f.severity === "Critical") ? "High" : "Info", read: false },
  ]
  const riskTrend = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((month, i) => ({ month, score: Math.max(20, Math.min(95, args.score + (5 - i) * 1.5)) }))
  return { id, name: args.name, industry: "Technology", tagline: "External website assessment", budgetDefault: args.budget, budgetMin: Math.max(100000, Math.round(args.budget * 0.35)), budgetMax: Math.max(args.budget, Math.round(args.budget * 2)), risks, controls, notifications, riskTrend }
}


// Helpers ------------------------------------------------------------------

export function getOrganization(id: string): Organization {
  return ORGANIZATIONS.find((o) => o.id === id) ?? ORGANIZATIONS[0]
}

export function getControl(org: Organization, id: string): Control | undefined {
  return org.controls.find((c) => c.id === id)
}

export function getRisk(org: Organization, id: string): Risk | undefined {
  return org.risks.find((r) => r.id === id)
}

export function severityDistribution(org: Organization) {
  const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  for (const r of org.risks) counts[r.severity]++
  return counts
}

export function getOverview(org: Organization): OverviewStats {
  const exposure = org.risks.reduce((sum, r) => sum + r.exposure, 0)
  const weighted = org.risks.reduce((sum, r) => sum + r.score * r.exposure, 0)
  const overallRisk = exposure > 0 ? Math.round(weighted / exposure) : 0
  const criticalRisks = org.risks.filter((r) => r.severity === "Critical").length
  return {
    overallRisk,
    overallSeverity: scoreToSeverityLocal(overallRisk),
    exposure,
    budget: org.budgetDefault,
    criticalRisks,
  }
}

// Local copy to avoid a circular import with lib/severity.ts
function scoreToSeverityLocal(score: number): Severity {
  if (score >= 80) return "Critical"
  if (score >= 60) return "High"
  if (score >= 40) return "Medium"
  return "Low"
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

// Compact Indian format e.g. ₹40L, ₹1.6Cr
export function formatINRShort(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(abs % 10000000 === 0 ? 0 : 1)}Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 1)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`
  return `${sign}₹${abs}`
}
