"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2, Clock, XCircle, MinusCircle,
  ChevronLeft, ChevronRight, BarChart3, AlertTriangle,
  FileText, ListTodo, Download, Search, Filter,
  Lightbulb, Check, Info, Loader2, RotateCcw,
  Bot, Send, Sparkles, X as XClose, FolderOpen, Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────

type Rating = "NOT_STARTED" | "PARTIAL" | "IMPLEMENTED" | "NOT_APPLICABLE";
type Risk   = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Mode   = "assess" | "report";

interface Control {
  ref: string;
  title: string;
  description: string;    // plain-English explanation of what the control requires
  guidance: string;       // what "fully implemented" looks like
  risk: Risk;
}

interface Clause {
  id: string;
  number: string;
  title: string;
  controls: Control[];
}

interface Standard {
  code: string;
  name: string;
  short: string;
  clauses: Clause[];
  color: string;
  ring: string;
}

type Assessment = Record<string, { rating: Rating; notes: string }>;

// ── Controls data ─────────────────────────────────────────────────────────────

const STANDARDS: Standard[] = [
  {
    code: "ISO27001", name: "ISO/IEC 27001:2022", short: "ISO 27001",
    color: "text-blue-700 bg-blue-50 border-blue-200", ring: "#3b82f6",
    clauses: [
      {
        id: "A5", number: "A.5", title: "Organisational Controls",
        controls: [
          { ref: "A.5.1",  title: "Policies for information security",         description: "Management-approved information security policies must exist, be communicated, and reviewed regularly.",                            guidance: "A current, board-approved ISMS policy exists, is published to all staff, and was reviewed in the last 12 months.",           risk: "HIGH"     },
          { ref: "A.5.2",  title: "Information security roles & responsibilities", description: "Responsibilities for protecting information assets must be clearly defined and assigned.",                                       guidance: "All IS roles are documented in job descriptions or a RACI; a named CISO or equivalent is accountable.",                    risk: "HIGH"     },
          { ref: "A.5.3",  title: "Segregation of duties",                      description: "Conflicting duties must be separated to prevent fraud, error, or unauthorised modification.",                                       guidance: "No single person can both initiate and approve sensitive transactions; controls are documented and tested.",               risk: "MEDIUM"   },
          { ref: "A.5.7",  title: "Threat intelligence",                         description: "Your organisation must collect and analyse information about relevant threats to information security.",                            guidance: "A threat feed or process is in place; threat intel is reviewed quarterly and informs risk treatment decisions.",            risk: "HIGH"     },
          { ref: "A.5.8",  title: "Information security in project management",  description: "IS requirements must be integrated into all projects regardless of type.",                                                          guidance: "A project security checklist or gate review is mandatory; evidence exists for recent projects.",                        risk: "MEDIUM"   },
          { ref: "A.5.12", title: "Classification of information",               description: "Information must be classified according to its confidentiality, integrity, and availability requirements.",                         guidance: "A classification scheme (e.g. Public / Internal / Confidential / Restricted) exists and is applied to key assets.",       risk: "HIGH"     },
          { ref: "A.5.15", title: "Access control",                              description: "Rules for access to information and systems must be defined and enforced based on need-to-know.",                                   guidance: "An access control policy exists; user access is reviewed at least annually; privileged access is strictly controlled.",    risk: "CRITICAL" },
          { ref: "A.5.23", title: "Information security for cloud services",     description: "Controls for acquiring, using, managing, and exiting cloud services must be defined.",                                              guidance: "A cloud security policy exists; all cloud vendors are assessed against IS requirements before use.",                    risk: "CRITICAL" },
        ],
      },
      {
        id: "A6", number: "A.6", title: "People Controls",
        controls: [
          { ref: "A.6.1", title: "Screening",                                    description: "Background checks on all candidates must be performed before employment, proportionate to the role.",                              guidance: "Pre-employment screening policy exists; checks (ID, references, criminal record where legal) are documented for all hires.", risk: "HIGH"   },
          { ref: "A.6.2", title: "Terms and conditions of employment",            description: "Contractual obligations regarding IS must be stated in employment agreements.",                                                   guidance: "All employment contracts include IS obligations; all staff have signed.",                                               risk: "MEDIUM" },
          { ref: "A.6.3", title: "Information security awareness & training",    description: "All staff must receive IS awareness training appropriate to their role.",                                                            guidance: "Annual security awareness training is completed by ≥95% of staff; completion records are kept.",                        risk: "HIGH"   },
          { ref: "A.6.4", title: "Disciplinary process",                         description: "A formal disciplinary process for IS policy violations must exist.",                                                               guidance: "HR disciplinary policy explicitly covers IS breaches; at least one case has been processed through the procedure.",      risk: "LOW"    },
          { ref: "A.6.5", title: "Responsibilities after termination",           description: "IS responsibilities must remain enforced after employment ends.",                                                                   guidance: "Offboarding checklist ensures accounts are disabled, devices returned, and NDAs are in force.",                         risk: "HIGH"   },
        ],
      },
      {
        id: "A7", number: "A.7", title: "Physical Controls",
        controls: [
          { ref: "A.7.1", title: "Physical security perimeters",                 description: "Physical boundaries must be defined and secured to protect information processing areas.",                                         guidance: "Server rooms, data centres, and secure areas have controlled access (key card, biometric, or lock).",                  risk: "HIGH"   },
          { ref: "A.7.2", title: "Physical entry",                               description: "Access to secure areas must be controlled and recorded.",                                                                           guidance: "Visitor logs and access badge records exist; unauthorised access attempts are monitored.",                            risk: "HIGH"   },
          { ref: "A.7.4", title: "Physical security monitoring",                 description: "Secure areas must be monitored continuously against unauthorised physical access.",                                                 guidance: "CCTV or equivalent covers all secure areas; footage is retained for at least 30 days.",                               risk: "MEDIUM" },
          { ref: "A.7.6", title: "Working in secure areas",                      description: "Work in secure areas must be subject to defined controls.",                                                                         guidance: "A clean desk policy exists and is enforced; secure area procedures are documented and staff are briefed.",             risk: "MEDIUM" },
          { ref: "A.7.8", title: "Equipment siting and protection",              description: "Equipment must be sited and protected to reduce risks from environmental threats and unauthorised access.",                          guidance: "Server equipment is in locked racks; UPS and fire suppression are in place for critical systems.",                    risk: "MEDIUM" },
        ],
      },
      {
        id: "A8", number: "A.8", title: "Technological Controls",
        controls: [
          { ref: "A.8.1",  title: "User endpoint devices",                       description: "Policies and controls must protect information on user endpoint devices.",                                                          guidance: "MDM or equivalent enforces disk encryption, screen lock, and remote wipe on all endpoints.",                          risk: "HIGH"     },
          { ref: "A.8.2",  title: "Privileged access rights",                    description: "Privileged access must be allocated, managed, and reviewed more strictly than standard user access.",                              guidance: "Privileged accounts are listed, unique to individuals, reviewed quarterly, and use MFA.",                             risk: "CRITICAL" },
          { ref: "A.8.5",  title: "Secure authentication",                       description: "Authentication methods must be strong and proportionate to the sensitivity of the system.",                                         guidance: "MFA is enforced on all remote access and critical internal systems; password policies meet NIST SP 800-63B.",          risk: "CRITICAL" },
          { ref: "A.8.7",  title: "Protection against malware",                  description: "Controls against malware must be implemented and kept up to date.",                                                                 guidance: "EDR/AV is deployed on all endpoints and servers; signatures auto-update; alerts are monitored.",                     risk: "HIGH"     },
          { ref: "A.8.8",  title: "Management of technical vulnerabilities",     description: "Technical vulnerabilities must be identified and remediated in a timely manner.",                                                   guidance: "A vulnerability scanning programme runs at least quarterly; critical CVEs are patched within 72 hours.",              risk: "CRITICAL" },
          { ref: "A.8.13", title: "Information backup",                          description: "Backup copies of information must be taken and regularly tested.",                                                                  guidance: "Backups run daily; restoration is tested at least annually; offsite or cloud copy is maintained.",                   risk: "HIGH"     },
          { ref: "A.8.16", title: "Monitoring activities",                       description: "Networks, systems, and applications must be monitored for anomalous behaviour.",                                                    guidance: "SIEM or log management collects events from all critical systems; alerts are reviewed daily.",                       risk: "CRITICAL" },
          { ref: "A.8.24", title: "Use of cryptography",                         description: "Cryptographic controls must be used appropriately and their keys managed securely.",                                               guidance: "An encryption policy exists; TLS 1.2+ is enforced for data in transit; encryption at rest covers sensitive stores.",  risk: "HIGH"     },
          { ref: "A.8.28", title: "Secure coding",                               description: "Secure coding principles must be applied in software development.",                                                                guidance: "A secure SDLC policy exists; SAST/DAST tooling is used in CI/CD; developers receive secure coding training.",        risk: "HIGH"     },
        ],
      },
    ],
  },
  {
    code: "ISO9001", name: "ISO 9001:2015", short: "ISO 9001",
    color: "text-green-700 bg-green-50 border-green-200", ring: "#22c55e",
    clauses: [
      {
        id: "Q4", number: "4", title: "Context of the Organisation",
        controls: [
          { ref: "4.1", title: "Understanding the organisation and its context",    description: "Identify internal and external issues that are relevant to your quality objectives.",                     guidance: "A documented SWOT or PESTLE analysis is reviewed annually.",                                        risk: "MEDIUM" },
          { ref: "4.2", title: "Understanding needs of interested parties",         description: "Identify stakeholders and understand their requirements.",                                                   guidance: "Stakeholder register exists and is kept current; requirements are reviewed in management meetings.",   risk: "MEDIUM" },
          { ref: "4.4", title: "Quality management system and its processes",       description: "The QMS and its processes must be defined, implemented, maintained, and improved.",                         guidance: "A documented process map or turtle diagram covers all key processes.",                              risk: "HIGH"   },
        ],
      },
      {
        id: "Q5", number: "5", title: "Leadership",
        controls: [
          { ref: "5.1", title: "Leadership and commitment",                         description: "Top management must demonstrate leadership and commitment to the QMS.",                                     guidance: "CEO or equivalent chairs management reviews; quality policy is signed by leadership.",               risk: "HIGH"   },
          { ref: "5.2", title: "Quality policy",                                    description: "A quality policy must be established, communicated, and maintained.",                                       guidance: "Policy is current, published, and understood by staff (evidence via training records or survey).",   risk: "HIGH"   },
          { ref: "5.3", title: "Organisational roles and responsibilities",         description: "Responsibilities for quality must be assigned and communicated.",                                            guidance: "Quality responsibilities are in job descriptions; a quality lead is named.",                        risk: "MEDIUM" },
        ],
      },
      {
        id: "Q6", number: "6", title: "Planning",
        controls: [
          { ref: "6.1", title: "Actions to address risks and opportunities",        description: "Risks and opportunities related to quality must be identified and addressed.",                              guidance: "Risk register exists; actions are tracked and reviewed.",                                           risk: "HIGH"   },
          { ref: "6.2", title: "Quality objectives and planning",                   description: "Measurable quality objectives must be set and plans made to achieve them.",                                 guidance: "SMART objectives with owners, targets, and review dates are documented.",                           risk: "HIGH"   },
        ],
      },
      {
        id: "Q8", number: "8", title: "Operation",
        controls: [
          { ref: "8.1", title: "Operational planning and control",                 description: "Processes needed to deliver products/services must be planned and controlled.",                              guidance: "Work instructions or SOPs exist for all key delivery processes.",                                   risk: "HIGH"   },
          { ref: "8.3", title: "Design and development",                           description: "A process for designing and developing products/services must be defined and controlled.",                   guidance: "Design review gates, verification, and validation steps are documented.",                           risk: "MEDIUM" },
          { ref: "8.4", title: "Control of externally provided processes",         description: "Supplier quality must be controlled.",                                                                        guidance: "An approved supplier list exists; suppliers are evaluated and monitored.",                          risk: "HIGH"   },
          { ref: "8.7", title: "Control of nonconforming outputs",                 description: "Nonconforming products or services must be identified and controlled.",                                       guidance: "NCR process exists; all NCRs are logged, investigated, and closed.",                               risk: "HIGH"   },
        ],
      },
      {
        id: "Q9", number: "9", title: "Performance Evaluation",
        controls: [
          { ref: "9.1", title: "Monitoring, measurement, analysis and evaluation", description: "Performance against quality objectives must be monitored and measured.",                                     guidance: "KPIs are tracked monthly; data is analysed for trends.",                                            risk: "MEDIUM" },
          { ref: "9.2", title: "Internal audit",                                   description: "Internal audits must be conducted at planned intervals.",                                                     guidance: "Annual audit programme is documented; all processes are audited at least once per cycle.",           risk: "HIGH"   },
          { ref: "9.3", title: "Management review",                                description: "Top management must review the QMS at planned intervals.",                                                   guidance: "Management review minutes exist; all required inputs are addressed.",                               risk: "HIGH"   },
        ],
      },
      {
        id: "Q10", number: "10", title: "Improvement",
        controls: [
          { ref: "10.2", title: "Nonconformity and corrective action",             description: "Nonconformities must be investigated and corrected; root causes must be eliminated.",                        guidance: "CAR process exists; root cause analysis is documented; effectiveness is verified.",                 risk: "HIGH"   },
          { ref: "10.3", title: "Continual improvement",                           description: "The organisation must continually improve the suitability and effectiveness of the QMS.",                   guidance: "Improvement opportunities are identified, tracked, and reviewed at management reviews.",             risk: "MEDIUM" },
        ],
      },
    ],
  },
  {
    code: "ISO14001", name: "ISO 14001:2015", short: "ISO 14001",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200", ring: "#10b981",
    clauses: [
      {
        id: "E4", number: "4", title: "Context",
        controls: [
          { ref: "4.1", title: "Understanding the organisation and its context",    description: "Identify environmental conditions and issues that affect the organisation.",                                guidance: "Environmental context is documented and reviewed annually.",                                        risk: "MEDIUM" },
          { ref: "4.2", title: "Needs and expectations of interested parties",      description: "Identify stakeholders with environmental interests and their requirements.",                                 guidance: "Interested parties register includes regulators, community, customers with environmental requirements.", risk: "MEDIUM" },
        ],
      },
      {
        id: "E6", number: "6", title: "Planning",
        controls: [
          { ref: "6.1.1", title: "Risks and opportunities",                         description: "Environmental risks and opportunities must be identified and addressed.",                                   guidance: "Environmental risk register exists; risks are linked to aspects and objectives.",                   risk: "HIGH"   },
          { ref: "6.1.2", title: "Environmental aspects",                           description: "Significant environmental aspects of operations must be identified and managed.",                            guidance: "Aspects and impacts register covers all activities; significance criteria are defined and applied.",  risk: "CRITICAL"},
          { ref: "6.1.3", title: "Compliance obligations",                          description: "Legal and other environmental compliance requirements must be identified.",                                  guidance: "Legal register is current; compliance is evaluated at least annually.",                            risk: "CRITICAL"},
          { ref: "6.2",   title: "Environmental objectives",                        description: "Measurable environmental objectives must be set and achieved.",                                              guidance: "Objectives with targets, owners, and timelines are documented and tracked.",                       risk: "HIGH"   },
        ],
      },
      {
        id: "E8", number: "8", title: "Operation",
        controls: [
          { ref: "8.1", title: "Operational planning and control",                 description: "Processes with significant environmental aspects must be controlled.",                                        guidance: "SOPs exist for all significant aspect activities; emergency response procedures are current.",       risk: "HIGH"   },
          { ref: "8.2", title: "Emergency preparedness and response",              description: "Plans must exist to respond to environmental emergencies.",                                                   guidance: "Emergency response plan is documented, tested, and staff are trained.",                             risk: "CRITICAL"},
        ],
      },
    ],
  },
  {
    code: "ISO45001", name: "ISO 45001:2018", short: "ISO 45001",
    color: "text-amber-700 bg-amber-50 border-amber-200", ring: "#f59e0b",
    clauses: [
      {
        id: "H5", number: "5", title: "Leadership & Worker Participation",
        controls: [
          { ref: "5.1", title: "Leadership and commitment",                        description: "Top management must demonstrate leadership in OH&S.",                                                         guidance: "CEO/MD participates in safety tours; OH&S is on board agenda.",                                    risk: "HIGH"   },
          { ref: "5.4", title: "Consultation and participation of workers",        description: "Workers must be consulted on OH&S matters.",                                                                  guidance: "A HSC or equivalent meets regularly; minutes show worker input on safety issues.",                 risk: "HIGH"   },
        ],
      },
      {
        id: "H6", number: "6", title: "Planning",
        controls: [
          { ref: "6.1.1", title: "Hazard identification",                          description: "Hazards in all work activities must be systematically identified.",                                           guidance: "Hazard register is current and covers all tasks, locations, and non-routine activities.",           risk: "CRITICAL"},
          { ref: "6.1.2", title: "OH&S risks and opportunities",                  description: "Risks arising from identified hazards must be assessed.",                                                     guidance: "Risk assessment uses a recognised methodology; all significant risks have controls.",               risk: "CRITICAL"},
          { ref: "6.1.3", title: "Legal requirements",                             description: "OH&S legal and other requirements must be identified.",                                                       guidance: "Legal register is current; compliance is evaluated at least annually.",                            risk: "HIGH"   },
        ],
      },
      {
        id: "H8", number: "8", title: "Operation",
        controls: [
          { ref: "8.1.1", title: "Operational controls",                           description: "Controls for significant OH&S risks must be implemented and maintained.",                                    guidance: "SOPs for all high-risk activities; hierarchy of controls documented.",                             risk: "CRITICAL"},
          { ref: "8.1.3", title: "Management of change",                           description: "Changes with OH&S implications must be managed.",                                                             guidance: "Formal change management process assesses OH&S impact before changes are implemented.",             risk: "HIGH"   },
          { ref: "8.2",   title: "Emergency preparedness and response",            description: "Emergency procedures must exist and be tested.",                                                              guidance: "Emergency response plan is tested at least annually; staff are trained.",                          risk: "CRITICAL"},
        ],
      },
      {
        id: "H9", number: "9", title: "Performance Evaluation",
        controls: [
          { ref: "9.1.1", title: "Monitoring and measurement",                     description: "OH&S performance must be monitored and measured.",                                                            guidance: "Leading and lagging indicators are tracked monthly; data drives improvement.",                     risk: "MEDIUM" },
          { ref: "9.2",   title: "Internal audit",                                 description: "Internal audits must cover the OH&S management system.",                                                     guidance: "Annual audit programme; all elements audited at least once per cycle.",                            risk: "HIGH"   },
        ],
      },
    ],
  },
  {
    code: "ISO42001", name: "ISO/IEC 42001:2023", short: "ISO 42001",
    color: "text-purple-700 bg-purple-50 border-purple-200", ring: "#a855f7",
    clauses: [
      {
        id: "AI4", number: "4", title: "Context",
        controls: [
          { ref: "4.1", title: "Understanding the organisation and its context",    description: "Issues relevant to AI objectives and the AIMS must be identified.",                                          guidance: "Internal/external AI context is documented including regulatory landscape (EU AI Act, etc.).",      risk: "MEDIUM" },
          { ref: "4.2", title: "AI system inventory",                              description: "All AI systems in scope must be documented.",                                                                 guidance: "AI system register exists with owner, purpose, data inputs, and risk classification for each.",    risk: "HIGH"   },
        ],
      },
      {
        id: "AI6", number: "6", title: "Planning",
        controls: [
          { ref: "6.1.1", title: "AI risk assessment",                             description: "Risks associated with AI systems must be identified and assessed.",                                           guidance: "AI risk methodology covers bias, transparency, explainability, safety, and privacy.",               risk: "CRITICAL"},
          { ref: "6.1.2", title: "AI impact assessment",                           description: "The potential impacts of AI on affected parties must be assessed.",                                           guidance: "Impact assessments are conducted for all AI systems before deployment.",                           risk: "CRITICAL"},
          { ref: "6.2",   title: "AI objectives",                                  description: "Measurable AI management objectives must be defined.",                                                        guidance: "Objectives address responsible AI goals (fairness, transparency, reliability); they are tracked.",  risk: "HIGH"   },
        ],
      },
      {
        id: "AI8", number: "8", title: "Operation",
        controls: [
          { ref: "8.4", title: "AI system impact assessment — operation",          description: "Operational controls for AI impacts must be implemented.",                                                    guidance: "Model monitoring, drift detection, and human oversight controls are in place.",                    risk: "HIGH"   },
          { ref: "8.5", title: "Responsible AI practices",                         description: "Responsible AI principles must be embedded in operations.",                                                  guidance: "AI ethics policy published; bias testing is part of the deployment pipeline.",                    risk: "HIGH"   },
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_CFG: Record<Risk, { cls: string; dot: string; label: string }> = {
  CRITICAL: { cls: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-500",    label: "Critical" },
  HIGH:     { cls: "bg-orange-100 text-orange-700 border-orange-200",dot: "bg-orange-400", label: "High"     },
  MEDIUM:   { cls: "bg-amber-100 text-amber-700 border-amber-100",   dot: "bg-amber-400",  label: "Medium"   },
  LOW:      { cls: "bg-slate-100 text-slate-500 border-slate-200",   dot: "bg-slate-300",  label: "Low"      },
};

const RATING_BTN: Record<Rating, { label: string; short: string; cls: string; activeCls: string; icon: React.ElementType }> = {
  NOT_STARTED:    { label: "Not in place",  short: "None",        cls: "border-border text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-700",         activeCls: "border-red-400 bg-red-50 text-red-700",         icon: XCircle      },
  PARTIAL:        { label: "Partial",       short: "Partial",     cls: "border-border text-muted-foreground hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700",    activeCls: "border-amber-400 bg-amber-50 text-amber-700",   icon: Clock        },
  IMPLEMENTED:    { label: "Implemented",   short: "Done",        cls: "border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700", activeCls: "border-emerald-500 bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  NOT_APPLICABLE: { label: "Not applicable",short: "N/A",         cls: "border-border text-muted-foreground hover:border-slate-300 hover:bg-slate-50",                         activeCls: "border-slate-400 bg-slate-100 text-slate-600",  icon: MinusCircle  },
};


function ratingScore(r: Rating): number {
  if (r === "IMPLEMENTED")    return 1;
  if (r === "PARTIAL")        return 0.5;
  return 0;
}

function computeScore(controls: Control[], assessment: Assessment) {
  const applicable = controls.filter((c) => assessment[c.ref]?.rating !== "NOT_APPLICABLE");
  if (applicable.length === 0) return 0;
  const total = applicable.reduce((s, c) => s + ratingScore(assessment[c.ref]?.rating ?? "NOT_STARTED"), 0);
  return Math.round((total / applicable.length) * 100);
}

function allControls(std: Standard) {
  return std.clauses.flatMap((c) => c.controls);
}

// ── SVG ring ──────────────────────────────────────────────────────────────────

function Ring({ score, size = 80, stroke = 8, color }: { score: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const clr = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color || clr} strokeWidth={stroke}
        strokeDasharray={`${(score / 100) * c} ${(1 - score / 100) * c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

// ── AI Advisor logic ──────────────────────────────────────────────────────────

const AI_EVIDENCE_HINTS: Record<string, string[]> = {
  "A.5": ["Information security policy document (board-signed)", "Policy review minutes or sign-off log", "Staff acknowledgement records or intranet publication screenshot"],
  "A.6": ["Pre-employment screening records / DBS check logs", "Signed employment contracts with IS clauses", "Training completion reports (LMS export or sign-in sheets)"],
  "A.7": ["Physical access control logs (door badge reports)", "CCTV footage retention policy + test records", "Clean desk audits or site inspection reports"],
  "A.8": ["MDM enrollment reports / endpoint compliance dashboards", "MFA configuration screenshots (Azure AD, Okta, etc.)", "Vulnerability scan reports + patch management logs", "SIEM alert dashboards / log retention policy"],
  "4.":  ["Context analysis document (SWOT/PESTLE)", "Stakeholder register with requirements", "Management review minutes"],
  "5.":  ["Signed quality/EMS/OH&S policy", "Leadership participation records (board minutes)", "Role definitions in job descriptions"],
  "6.":  ["Risk register or risk assessment document", "Objectives register with targets and owners", "Aspects & impacts register (14001/45001)"],
  "8.":  ["SOPs for key operational processes", "Emergency response plan + drill records", "Change management forms or records"],
  "9.":  ["KPI / performance dashboard reports", "Internal audit programme + completed audit reports", "Management review minutes with all required inputs"],
  "10.": ["Corrective action register (CAR log)", "Root cause analysis records", "Improvement initiative tracking log"],
  "AI":  ["AI system inventory / register", "AI risk assessment records", "Bias testing and model monitoring reports"],
};

const TIMELINE_BY_RISK: Record<Risk, string> = {
  CRITICAL: "4–8 weeks from scratch. If partially in place: 1–3 weeks to close the remaining gaps.",
  HIGH:     "2–4 weeks from scratch. Partial implementation typically needs 1–2 weeks of effort.",
  MEDIUM:   "1–2 weeks from scratch — often just documentation and a review cycle.",
  LOW:      "A few days to a week — mainly documentation or a simple process change.",
};

const TOOLS_BY_PREFIX: Record<string, string[]> = {
  "A.5": ["Confluence or Notion for policy documentation", "DocuSign / Adobe Sign for policy sign-offs", "Microsoft Purview for information classification"],
  "A.6": ["BambooHR / Workday for HR records + onboarding workflows", "KnowBe4 or Proofpoint for security awareness training", "LinkedIn Learning or internal LMS for role-specific training"],
  "A.7": ["Verkada / Genetec for physical access control + CCTV", "ServiceNow for visitor management", "Any badge/keycard system (HID, Lenel)"],
  "A.8": ["Microsoft Intune or Jamf for endpoint MDM", "CrowdStrike / SentinelOne for EDR", "Qualys / Tenable for vulnerability scanning", "Splunk / Microsoft Sentinel for SIEM"],
  "default": ["Your existing document management system", "Jira or this platform's Tasks board for tracking", "Google Workspace or Microsoft 365 for collaboration"],
};

function getEvidenceHints(ctrl: Control): string[] {
  const key = Object.keys(AI_EVIDENCE_HINTS).find((k) => ctrl.ref.startsWith(k)) ?? "A.5";
  return AI_EVIDENCE_HINTS[key] ?? AI_EVIDENCE_HINTS["A.5"];
}
function getTools(ctrl: Control): string[] {
  const key = Object.keys(TOOLS_BY_PREFIX).find((k) => ctrl.ref.startsWith(k)) ?? "default";
  return TOOLS_BY_PREFIX[key] ?? TOOLS_BY_PREFIX["default"];
}

type AIMsg = { role: "user" | "ai"; text: string };

function buildAIAnswer(question: string, ctrl: Control | null, std: Standard): string {
  if (!ctrl) {
    const total = std.clauses.flatMap((c) => c.controls).length;
    if (question.includes("start")) {
      return `**Where to start with ${std.short}?**\n\nI recommend this order:\n\n1. **Complete this gap analysis** — rate all ${total} controls so you know your baseline score.\n2. **Fix CRITICAL gaps first** — these are what auditors check first and carry the most risk.\n3. **Create tasks** — use the "Create tasks from gaps" button to turn every gap into an assigned task.\n4. **Gather evidence** — as you implement controls, upload proof to the Evidence Vault.\n5. **Book your audit** — once you're above 80%, you're typically ready for a Stage 1 audit.`;
    }
    if (question.includes("long") || question.includes("certif")) {
      return `**Time to ${std.short} certification:**\n\nFor a typical SME starting from scratch:\n\n• **Gap analysis**: 2–4 hours\n• **Remediation**: 3–9 months (depends heavily on current maturity)\n• **Internal audit**: 1–2 weeks\n• **Stage 1 audit**: 1 day\n• **Stage 2 audit**: 2–5 days\n\nOrganisations using a structured tool like this typically reduce preparation time by 40–60% vs. spreadsheets.`;
    }
    if (question.includes("risk") || question.includes("biggest")) {
      return `**Biggest risks for ${std.short}:**\n\nBased on common audit findings:\n\n🔴 **Most often failed:** Access control, incident management, and supplier security (${std.code === "ISO27001" ? "A.5.15, A.8.2, A.8.5" : "risk register and objectives"})\n\n⚠️ **Common weaknesses:** Outdated policies, missing management review records, incomplete training logs\n\n✅ **Quick wins:** Document what you already do — many controls are partially in place but undocumented.`;
    }
    return `**Getting certified with ${std.short}:**\n\n${std.name} certification demonstrates that your organisation has a systematic approach to managing compliance risks. Start by completing this gap analysis, then work through gaps starting with the highest-risk items. I'm here to guide you through every control — click "Ask AI" on any control card for specific advice.`;
  }

  if (question.includes("implement") || question.includes("how")) {
    return `**Implementing ${ctrl.ref} — ${ctrl.title}**\n\n**What's required:**\n${ctrl.description}\n\n**Step-by-step:**\n1. **Assign an owner** — ${ctrl.risk === "CRITICAL" || ctrl.risk === "HIGH" ? "CISO, IT Manager, or equivalent for this " + ctrl.risk + "-risk control" : "a named team lead is sufficient"}\n2. **Draft/update documentation** — create a policy, procedure, or record as appropriate\n3. **Implement the control** — ${ctrl.guidance.split(";")[0]}\n4. **Collect evidence** — ${getEvidenceHints(ctrl)[0]}\n5. **Review cycle** — schedule an annual review at minimum\n\n💡 *Auditors expect:* ${ctrl.guidance}`;
  }
  if (question.includes("evidence") || question.includes("auditor")) {
    const hints = getEvidenceHints(ctrl);
    return `**Evidence auditors expect for ${ctrl.ref}:**\n\n${hints.map((h) => `• ${h}`).join("\n")}\n\n**Pro tip:** Even informal evidence counts — a screenshot of a setting, an email thread showing a decision, or a meeting agenda. Auditors want to see that the control *actually operates*, not just that a policy exists.\n\n**What "fully implemented" looks like:**\n${ctrl.guidance}`;
  }
  if (question.includes("long") || question.includes("time")) {
    return `**Timeline for ${ctrl.ref} (${ctrl.risk} risk):**\n\n${TIMELINE_BY_RISK[ctrl.risk]}\n\n**What typically takes longest:**\n• Getting stakeholder buy-in and sign-off\n• Collecting retrospective evidence if controls weren't previously documented\n• Waiting for a cycle to complete (e.g. first annual training run, first backup test)\n\n**Acceleration tip:** If you already have *some* controls in place, document what exists immediately — even an imperfect process counts as "Partial" and raises your score.`;
  }
  if (question.includes("tool") || question.includes("software")) {
    const tools = getTools(ctrl);
    return `**Tools that help with ${ctrl.ref}:**\n\n${tools.map((t) => `• ${t}`).join("\n")}\n\n**Budget-conscious options:**\n• Microsoft 365 / Google Workspace cover many controls out of the box\n• Open-source alternatives exist for most categories\n• Document what manual processes you already have — not everything needs a dedicated tool\n\n**Remember:** Auditors care about the *outcome*, not the tool. A spreadsheet with a documented process is better than an expensive tool with no evidence of use.`;
  }
  return `**AI insight for ${ctrl.ref} — ${ctrl.title}**\n\nThis is a **${ctrl.risk.toLowerCase()} risk** control. ${ctrl.description}\n\n**Key requirement:** ${ctrl.guidance}\n\nAsk me a specific question — "How do I implement this?", "What evidence do I need?", or "How long will this take?" — and I'll give you a tailored answer.`;
}

// ── AI Advisor panel ──────────────────────────────────────────────────────────

function AIAdvisor({ std, ctrl, onClose }: {
  std: Standard;
  ctrl: Control | null;
  onClose: () => void;
}) {
  const initMsg: AIMsg = {
    role: "ai",
    text: ctrl
      ? `Hi! I'm your AI compliance advisor. I see you're looking at **${ctrl.ref} — ${ctrl.title}** (${ctrl.risk} risk).\n\nSelect a question below or ask me anything about this control.`
      : `Hi! I'm your AI compliance advisor for **${std.short}**.\n\nI can help you understand requirements, plan implementation, and know what evidence auditors expect. What would you like to know?`,
  };
  const [messages, setMessages] = useState<AIMsg[]>([initMsg]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([initMsg]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctrl?.ref, std.code]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickQs = ctrl
    ? ["How do I implement this?", "What evidence do auditors need?", "How long does this take?", "What tools can help?"]
    : ["Where should I start?", "How long to certification?", "What are my biggest risks?", "Which gaps should I fix first?"];

  function ask(question: string) {
    if (thinking) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const answer = buildAIAnswer(question, ctrl, std);
      setMessages((m) => [...m, { role: "ai", text: answer }]);
      setThinking(false);
    }, 900 + Math.random() * 600);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) ask(input.trim());
  }

  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex flex-col w-full max-w-sm border-l border-border bg-background shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-violet-50 to-blue-50 shrink-0">
        <div className="size-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0">
          <Bot className="size-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            AI Compliance Advisor
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
              <Sparkles className="size-2.5" /> AI
            </span>
          </p>
          {ctrl && (
            <p className="text-[10px] text-muted-foreground truncate">Context: {ctrl.ref} · {ctrl.risk} risk</p>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <XClose className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="size-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="size-3 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === "ai" ? "bg-muted text-foreground" : "bg-blue-600 text-white"
            }`}>
              {renderText(msg.text)}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex gap-2">
            <div className="size-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
              <Bot className="size-3 text-white" />
            </div>
            <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
        {quickQs.map((q) => (
          <button key={q} onClick={() => ask(q)} disabled={thinking}
            className="text-[10px] px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 flex items-center gap-2 shrink-0">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about ISO compliance…"
          className="flex-1 text-xs bg-muted border border-border rounded-xl px-3 py-2.5 outline-none focus:border-violet-400 placeholder:text-muted-foreground" />
        <button type="submit" disabled={!input.trim() || thinking}
          className="size-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0">
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}

// ── Assessment view ───────────────────────────────────────────────────────────

function CompletionModal({ std, assessment, onViewReport, onCreateTasks, onClose }: {
  std: Standard;
  assessment: Assessment;
  onViewReport: () => void;
  onCreateTasks: () => Promise<void>;
  onClose: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const controls  = allControls(std);
  const score     = computeScore(controls, assessment);
  const critical  = controls.filter((c) => c.risk === "CRITICAL" && (assessment[c.ref]?.rating ?? "NOT_STARTED") !== "IMPLEMENTED" && assessment[c.ref]?.rating !== "NOT_APPLICABLE").length;
  const totalGaps = controls.filter((c) => { const r = assessment[c.ref]?.rating ?? "NOT_STARTED"; return r !== "IMPLEMENTED" && r !== "NOT_APPLICABLE"; }).length;

  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  const scoreText  = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-blue-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  const scoreLabel = score >= 80 ? "Certification ready" : score >= 60 ? "Good progress" : score >= 40 ? "Remediation needed" : "Significant gaps";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <XClose className="size-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-border">
          <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="size-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Assessment complete</h2>
          <p className="text-xs text-muted-foreground mt-1">You've reviewed all {std.short} sections</p>
        </div>

        {/* Score + stats */}
        <div className="px-6 py-5 flex items-center gap-6">
          <div className="relative shrink-0">
            <Ring score={score} size={88} stroke={9} color={scoreColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={`text-lg font-bold ${scoreText}`}>{score}%</p>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            <p className={`text-sm font-semibold ${scoreText}`}>{scoreLabel}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total gaps</span>
                <span className="font-semibold text-foreground">{totalGaps}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Critical gaps</span>
                <span className={`font-bold ${critical > 0 ? "text-red-600" : "text-emerald-600"}`}>{critical}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Controls assessed</span>
                <span className="font-semibold text-foreground">{controls.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip */}
        {critical > 0 && (
          <div className="mx-6 mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex gap-2">
            <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              You have <strong>{critical} critical gap{critical > 1 ? "s" : ""}</strong> — address these first as certifiers will check them immediately.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="px-6 pb-6 flex flex-col gap-2.5">
          <button
            disabled={creating}
            onClick={async () => { setCreating(true); await onCreateTasks(); setCreating(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm">
            {creating ? <Loader2 className="size-4 animate-spin" /> : <ListTodo className="size-4" />}
            {creating ? "Creating tasks…" : `Create tasks from ${totalGaps} gaps`}
          </button>
          <button onClick={onViewReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-colors">
            <BarChart3 className="size-4 text-blue-600" /> View full report
          </button>
        </div>
      </div>
    </div>
  );
}

function AssessmentView({ std, assessment, onChange, onAskAI, onComplete }: {
  std: Standard;
  assessment: Assessment;
  onChange: (ref: string, rating: Rating, notes: string) => void;
  onAskAI: (ctrl: Control) => void;
  onComplete: () => void;
}) {
  const [clauseIdx, setClauseIdx] = useState(0);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [expandedGuidance, setExpandedGuidance] = useState<string | null>(null);

  const clause = std.clauses[clauseIdx];
  const allCtrls = allControls(std);
  const assessed = allCtrls.filter((c) => assessment[c.ref]?.rating && assessment[c.ref].rating !== "NOT_STARTED").length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card px-5 py-3.5 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-foreground">Assessment progress</p>
            <p className="text-xs text-muted-foreground">{assessed}/{allCtrls.length} controls rated</p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(assessed / allCtrls.length) * 100}%` }} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Current score</p>
          <p className="text-lg font-bold text-blue-600">{computeScore(allCtrls, assessment)}%</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {std.clauses.map((cl, i) => {
          const clDone  = cl.controls.filter((c) => (assessment[c.ref]?.rating ?? "NOT_STARTED") !== "NOT_STARTED").length;
          const clTotal = cl.controls.length;
          return (
            <button key={cl.id} onClick={() => setClauseIdx(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                i === clauseIdx ? "border-blue-400 bg-blue-50 text-blue-700" : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              }`}>
              <span>{cl.number} {cl.title}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${clDone === clTotal ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {clDone}/{clTotal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {clause.controls.map((ctrl) => {
          const current  = assessment[ctrl.ref]?.rating ?? "NOT_STARTED";
          const notes    = assessment[ctrl.ref]?.notes ?? "";
          const showNotes = expandedNotes === ctrl.ref;
          const showGuide = expandedGuidance === ctrl.ref;

          return (
            <div key={ctrl.ref}
              className={`rounded-xl border-2 bg-card p-4 transition-all ${current !== "NOT_STARTED" ? "border-border" : "border-border"}`}>
              {/* Control header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{ctrl.ref}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${RISK_CFG[ctrl.risk].cls}`}>{RISK_CFG[ctrl.risk].label}</span>
                </div>
                {current !== "NOT_STARTED" && (
                  <div className="ml-auto shrink-0">
                    {(() => { const RIcon = RATING_BTN[current].icon; return <RIcon className={`size-4 ${current === "IMPLEMENTED" ? "text-emerald-500" : current === "PARTIAL" ? "text-amber-500" : current === "NOT_APPLICABLE" ? "text-slate-400" : "text-red-400"}`} />; })()}
                  </div>
                )}
              </div>

              <p className="text-sm font-semibold text-foreground mb-1">{ctrl.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ctrl.description}</p>

              {/* Rating buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {(["NOT_STARTED","PARTIAL","IMPLEMENTED","NOT_APPLICABLE"] as Rating[]).map((r) => {
                  const cfg    = RATING_BTN[r];
                  const active = current === r;
                  const Ic     = cfg.icon;
                  return (
                    <button key={r} onClick={() => onChange(ctrl.ref, r, notes)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all ${active ? cfg.activeCls : cfg.cls}`}>
                      <Ic className="size-3.5 shrink-0" />
                      <span className="hidden sm:inline">{cfg.short}</span>
                      <span className="sm:hidden">{cfg.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Guidance + Notes + Ask AI toggles */}
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => setExpandedGuidance(showGuide ? null : ctrl.ref)}
                  className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                  <Info className="size-3" /> {showGuide ? "Hide guidance" : "What does 'implemented' look like?"}
                </button>
                <button onClick={() => setExpandedNotes(showNotes ? null : ctrl.ref)}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                  <FileText className="size-3" /> {notes ? "Edit notes" : "Add notes"}
                </button>
                <button onClick={() => onAskAI(ctrl)}
                  className="flex items-center gap-1 text-[10px] font-medium text-violet-600 hover:text-violet-700 ml-auto border border-violet-200 bg-violet-50 px-2 py-0.5 rounded-full hover:bg-violet-100 transition-colors">
                  <Sparkles className="size-3" /> Ask AI
                </button>
              </div>

              {showGuide && (
                <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 flex gap-2">
                  <Lightbulb className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-relaxed">{ctrl.guidance}</p>
                </div>
              )}

              {showNotes && (
                <textarea value={notes} rows={2}
                  onChange={(e) => onChange(ctrl.ref, current, e.target.value)}
                  placeholder="Add context, evidence references, or action notes…"
                  className="mt-2 w-full text-xs bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none placeholder:text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      {/* Section navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setClauseIdx((i) => Math.max(0, i - 1))} disabled={clauseIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
          <ChevronLeft className="size-4" /> Previous section
        </button>
        <span className="text-xs text-muted-foreground">{clauseIdx + 1} / {std.clauses.length}</span>
        {clauseIdx < std.clauses.length - 1 ? (
          <button onClick={() => setClauseIdx((i) => i + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
            Next section <ChevronRight className="size-4" />
          </button>
        ) : (
          <button onClick={onComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Check className="size-4" /> See my results
          </button>
        )}
      </div>
    </div>
  );
}

// ── Report view ───────────────────────────────────────────────────────────────

function ReportView({ std, assessment, onCreateTasks }: {
  std: Standard;
  assessment: Assessment;
  onCreateTasks: (gaps: Control[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | Risk>("all");
  const controls = allControls(std);
  const score    = computeScore(controls, assessment);

  const implemented = controls.filter((c) => assessment[c.ref]?.rating === "IMPLEMENTED").length;
  const partial     = controls.filter((c) => assessment[c.ref]?.rating === "PARTIAL").length;
  const notStarted  = controls.filter((c) => (assessment[c.ref]?.rating ?? "NOT_STARTED") === "NOT_STARTED").length;
  const na          = controls.filter((c) => assessment[c.ref]?.rating === "NOT_APPLICABLE").length;
  const critical    = controls.filter((c) => c.risk === "CRITICAL" && (assessment[c.ref]?.rating ?? "NOT_STARTED") !== "IMPLEMENTED" && assessment[c.ref]?.rating !== "NOT_APPLICABLE").length;

  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  const scoreText  = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-blue-600" : score >= 40 ? "text-amber-600" : "text-red-600";

  // Prioritised gaps: sort by risk then implementation
  const riskOrder: Record<Risk, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const gaps = controls
    .filter((c) => {
      const r = assessment[c.ref]?.rating ?? "NOT_STARTED";
      return r !== "IMPLEMENTED" && r !== "NOT_APPLICABLE";
    })
    .filter((c) => filter === "all" || c.risk === filter)
    .sort((a, b) => {
      const rDiff = riskOrder[a.risk] - riskOrder[b.risk];
      if (rDiff !== 0) return rDiff;
      const aR = assessment[a.ref]?.rating ?? "NOT_STARTED";
      const bR = assessment[b.ref]?.rating ?? "NOT_STARTED";
      return (aR === "NOT_STARTED" ? 0 : 1) - (bR === "NOT_STARTED" ? 0 : 1);
    });

  // By-clause breakdown
  const clauseBreakdown = std.clauses.map((cl) => {
    const s = computeScore(cl.controls, assessment);
    return { ...cl, score: s };
  });

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center py-5 sm:col-span-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Compliance Score</p>
          <div className="relative">
            <Ring score={score} size={96} stroke={10} color={scoreColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={`text-xl font-bold ${scoreText}`}>{score}%</p>
            </div>
          </div>
          <p className={`text-xs font-semibold mt-3 ${scoreText}`}>
            {score >= 80 ? "Certification ready" : score >= 60 ? "Good progress" : score >= 40 ? "Remediation needed" : "Significant gaps"}
          </p>
        </Card>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: "Implemented",  value: implemented, cls: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Partial",      value: partial,     cls: "text-amber-600",   bg: "bg-amber-50"   },
            { label: "Not in place", value: notStarted,  cls: "text-red-600",     bg: "bg-red-50"     },
            { label: "Critical gaps",value: critical,    cls: "text-red-700",     bg: "bg-red-100"    },
          ].map((s) => (
            <Card key={s.label} className={`${s.bg} border-0`}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Clause heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Progress by Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {clauseBreakdown.map((cl) => {
            const c = cl.score >= 80 ? "#10b981" : cl.score >= 60 ? "#3b82f6" : cl.score >= 40 ? "#f59e0b" : "#ef4444";
            return (
              <div key={cl.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{cl.number} {cl.title}</span>
                  <span className="font-bold" style={{ color: c }}>{cl.score}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cl.score}%`, backgroundColor: c }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Prioritised gap list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-500" /> Prioritised Gap List
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Sorted by risk level — address top items first</CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground" />
              {(["all","CRITICAL","HIGH","MEDIUM","LOW"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {gaps.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <CheckCircle2 className="size-10 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm font-medium">No gaps in this filter</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {gaps.map((ctrl) => {
                const rating  = assessment[ctrl.ref]?.rating ?? "NOT_STARTED";
                const notes   = assessment[ctrl.ref]?.notes ?? "";
                const RIcon   = RATING_BTN[rating].icon;
                return (
                  <div key={ctrl.ref} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 pt-0.5 shrink-0">
                      <span className={`size-2.5 rounded-full ${RISK_CFG[ctrl.risk].dot}`} />
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{ctrl.ref}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{ctrl.title}</p>
                      {notes && <p className="text-[10px] text-muted-foreground mt-0.5 italic">Note: {notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${RISK_CFG[ctrl.risk].cls}`}>{ctrl.risk}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${
                        rating === "PARTIAL" ? "text-amber-600" : "text-red-600"
                      }`}>
                        <RIcon className="size-3" />
                        {rating === "PARTIAL" ? "Partial" : "Not in place"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => onCreateTasks(gaps)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm">
          <ListTodo className="size-4" /> Create tasks from {gaps.length} gaps
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-colors">
          <Download className="size-4" /> Export PDF report
        </button>
      </div>

      {gaps.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3">
          <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-0.5">How to read this report</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Fix <strong>CRITICAL</strong> gaps first — these represent controls that certifiers will look at first and that carry the most risk.
              Controls rated <strong>Partial</strong> are typically faster to close (you already have something in place).
              Once you create tasks, assign owners and track progress in the Tasks board.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ProjectOption = {
  id: string;
  name: string;
  standardCode: string;
  standardName: string;
  status: string;
};

export default function GapAnalysisPage() {
  const [projects,          setProjects]          = useState<ProjectOption[]>([]);
  const [projectsLoading,   setProjectsLoading]   = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [mode,              setMode]              = useState<Mode>("assess");
  const [assessment,        setAssessmentState]   = useState<Assessment>({});
  const [savedAt,           setSavedAt]           = useState<string | null>(null);
  const [taskBanner,        setTaskBanner]        = useState<string | null>(null);
  const [taskError,         setTaskError]         = useState<string | null>(null);
  const [completionOpen,    setCompletionOpen]    = useState(false);
  const [aiOpen,            setAiOpen]            = useState(false);
  const [aiCtrl,            setAiCtrl]            = useState<Control | null>(null);

  // Fetch active projects on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.projects ?? []).filter(
          (p: ProjectOption) => p.status === "ACTIVE" || p.status === "PAUSED"
        );
        setProjects(active);
        if (active.length > 0) setSelectedProjectId(active[0].id);
        setProjectsLoading(false);
      })
      .catch(() => setProjectsLoading(false));
  }, []);

  // Load saved assessment from localStorage when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    try {
      const raw = localStorage.getItem(`gap_assessment_${selectedProjectId}`);
      if (!raw) { setAssessmentState({}); setSavedAt(null); setMode("assess"); return; }
      const parsed = JSON.parse(raw) as { data: Assessment; savedAt: string };
      setAssessmentState(parsed.data ?? {});
      setSavedAt(parsed.savedAt ?? null);
      setMode(Object.keys(parsed.data ?? {}).length > 0 ? "report" : "assess");
    } catch {
      setAssessmentState({}); setSavedAt(null);
    }
  }, [selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const stdCode         = selectedProject?.standardCode ?? "ISO27001";
  const std             = STANDARDS.find((s) => s.code === stdCode) ?? STANDARDS[0];

  function handleAskAI(ctrl: Control) { setAiCtrl(ctrl); setAiOpen(true); }

  function setRating(ref: string, rating: Rating, notes: string) {
    if (!selectedProjectId) return;
    setAssessmentState((prev) => {
      const updated = { ...prev, [ref]: { rating, notes } };
      try {
        const ts = new Date().toISOString();
        localStorage.setItem(`gap_assessment_${selectedProjectId}`, JSON.stringify({ data: updated, savedAt: ts }));
        setSavedAt(ts);
      } catch { /* ignore */ }
      return updated;
    });
  }

  function clearAssessment() {
    if (!selectedProjectId) return;
    setAssessmentState({});
    setSavedAt(null);
    setMode("assess");
    try { localStorage.removeItem(`gap_assessment_${selectedProjectId}`); } catch { /* ignore */ }
  }

  async function handleCreateTasks(gaps: Control[]) {
    if (!selectedProjectId) return;
    setTaskError(null);
    try {
      const res  = await fetch("/api/gap-analysis/create-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          gaps: gaps.map((g) => ({ ref: g.ref, title: g.title, risk: g.risk, guidance: g.guidance })),
        }),
      });
      const data = await res.json();
      const msg = data.created > 0
        ? `${data.created} task${data.created !== 1 ? "s" : ""} created in "${data.projectName}"${data.skipped > 0 ? ` · ${data.skipped} already existed` : ""}`
        : `All gaps already have tasks in "${data.projectName}" — nothing duplicated`;
      setTaskBanner(msg);
      setTimeout(() => setTaskBanner(null), 8000);
    } catch {
      setTaskError("Failed to create tasks. Please try again.");
    }
  }

  const controls = allControls(std);
  const rated    = controls.filter((c) => (assessment[c.ref]?.rating ?? "NOT_STARTED") !== "NOT_STARTED").length;
  const score    = computeScore(controls, assessment);
  const lastRun  = savedAt ? new Date(savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div className="space-y-6 pb-10">
      {/* Success banner */}
      {taskBanner && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl animate-in slide-in-from-top-2 duration-300">
          <Check className="size-4 shrink-0" />
          <span className="text-sm font-medium">{taskBanner}</span>
          <Link href="/tasks" className="text-xs underline underline-offset-2">View tasks →</Link>
          <button onClick={() => setTaskBanner(null)} className="ml-1 opacity-70 hover:opacity-100"><XCircle className="size-4" /></button>
        </div>
      )}
      {/* Error banner */}
      {taskError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 text-white shadow-xl animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="text-sm font-medium">{taskError}</span>
          <button onClick={() => setTaskError(null)} className="ml-1 opacity-70 hover:opacity-100"><XCircle className="size-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            Gap Analysis
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 text-violet-700 border border-violet-200">
              <Sparkles className="size-3" /> AI-Guided
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">Rate each control against your project to identify gaps</p>
        </div>
        {selectedProjectId && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {lastRun && <span className="text-xs text-muted-foreground">Last run: {lastRun}</span>}
            {rated > 0 && !lastRun && (
              <span className="text-xs text-muted-foreground">{rated}/{controls.length} rated · <span className="font-semibold text-blue-600">{score}%</span></span>
            )}
            {lastRun && (
              <button onClick={clearAssessment}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground transition-colors">
                <RotateCcw className="size-3.5" /> Start fresh
              </button>
            )}
            <button onClick={() => { setAiCtrl(null); setAiOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium transition-colors">
              <Bot className="size-4" /> Ask AI
            </button>
            <button onClick={() => setMode(mode === "assess" ? "report" : "assess")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors">
              {mode === "assess"
                ? <><BarChart3 className="size-4 text-blue-600" /> View Report</>
                : <><Search className="size-4 text-blue-600" /> Re-run analysis</>}
            </button>
          </div>
        )}
      </div>

      {/* Project selector */}
      {projectsLoading ? (
        <div className="flex gap-2">
          {[1,2].map((i) => <div key={i} className="h-10 w-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-14 text-center">
          <FolderOpen className="size-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm font-semibold text-foreground mb-1">No active projects</p>
          <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
            Gap analysis is tied to a compliance project. Create a project first, then return here to run your analysis.
          </p>
          <Link href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Plus className="size-4" /> Create a project
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                p.id === selectedProjectId
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              }`}>
              <FolderOpen className="size-3.5 shrink-0" />
              <span>{p.name}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                p.id === selectedProjectId ? "bg-blue-200 text-blue-700" : "bg-muted text-muted-foreground"
              }`}>{p.standardCode.replace("ISO", "ISO ")}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content — only render when a project is selected */}
      {selectedProjectId && (
        <>
          {/* How it works (first-time users) */}
          {rated === 0 && mode === "assess" && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Lightbulb className="size-4 text-blue-500" /> How the gap analysis works
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Rate each control", body: "For each control, select whether it's Not in place, Partial, or Fully implemented. Each control includes guidance on what 'implemented' means." },
                  { step: "2", title: "Review your score", body: "Your compliance score updates in real time. Once you've rated all controls, click 'View Report' to see your prioritised gap list." },
                  { step: "3", title: "Build your plan", body: "Create tasks from your gaps with one click. Each task includes step-by-step guidance on how to close the gap." },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="size-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                    <div>
                      <p className="text-xs font-semibold text-blue-800">{s.title}</p>
                      <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment / Report */}
          <div className={aiOpen ? "pr-0 sm:pr-96" : ""}>
            {mode === "assess" ? (
              <AssessmentView std={std} assessment={assessment} onChange={setRating} onAskAI={handleAskAI} onComplete={() => setCompletionOpen(true)} />
            ) : (
              <ReportView std={std} assessment={assessment} onCreateTasks={handleCreateTasks} />
            )}
          </div>

          {/* Completion modal */}
          {completionOpen && (
            <CompletionModal
              std={std}
              assessment={assessment}
              onViewReport={() => { setCompletionOpen(false); setMode("report"); }}
              onCreateTasks={async () => {
                const gaps = allControls(std).filter((c) => { const r = assessment[c.ref]?.rating ?? "NOT_STARTED"; return r !== "IMPLEMENTED" && r !== "NOT_APPLICABLE"; });
                await handleCreateTasks(gaps);
                setCompletionOpen(false);
                setMode("report");
              }}
              onClose={() => setCompletionOpen(false)}
            />
          )}

          {/* AI Advisor panel */}
          {aiOpen && (
            <>
              <div className="fixed inset-0 bg-black/20 z-30 sm:hidden" onClick={() => setAiOpen(false)} />
              <AIAdvisor std={std} ctrl={aiCtrl} onClose={() => setAiOpen(false)} />
            </>
          )}

          {/* Floating AI button */}
          {!aiOpen && (
            <button onClick={() => { setAiCtrl(null); setAiOpen(true); }}
              className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:shadow-2xl hover:scale-105 transition-all">
              <Bot className="size-4" />
              <span>AI Advisor</span>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
