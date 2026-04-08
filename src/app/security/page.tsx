import PageLayout from "@/components/landing/page-layout";
import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  Users,
  AlertTriangle,
  CheckCircle2,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "SOC 2 Type II",
    content:
      "ISOComply has achieved SOC 2 Type II certification, verified annually by an independent third-party auditor. Our controls cover security, availability, and confidentiality trust service criteria. A copy of our SOC 2 report is available to enterprise customers under NDA.",
    badges: ["Security", "Availability", "Confidentiality"],
    color: "text-blue-400",
    bg: "bg-blue-600/10",
    border: "border-blue-500/20",
  },
  {
    icon: Lock,
    title: "Data Encryption",
    content:
      "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Database backups are encrypted using separate encryption keys. Encryption keys are managed using a hardware security module (HSM) and rotated annually.",
    bullets: [
      "AES-256 encryption at rest",
      "TLS 1.3 in transit",
      "HSM-managed key rotation",
      "Encrypted backups",
    ],
    color: "text-emerald-400",
    bg: "bg-emerald-600/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Server,
    title: "Infrastructure",
    content:
      "ISOComply is hosted on enterprise-grade, ISO 27001-aligned cloud infrastructure across multiple availability zones in the EU with automated failover. We use isolated private networking, WAF protection, and strict network segmentation. EU data residency is guaranteed for all customers.",
    bullets: [
      "EU data residency guaranteed",
      "Multi-AZ deployment with auto-failover",
      "Isolated private networking",
      "DDoS and WAF protection",
    ],
    color: "text-violet-400",
    bg: "bg-violet-600/10",
    border: "border-violet-500/20",
  },
  {
    icon: Eye,
    title: "GDPR Compliance",
    content:
      "ISOComply is fully compliant with the UK GDPR and EU GDPR. We act as a data processor for customer data and maintain a full ROPA. We offer Data Processing Agreements (DPAs) for all customers. Data subject rights requests are handled within 72 hours.",
    bullets: [
      "UK & EU GDPR compliant",
      "DPA available for all customers",
      "Data subject rights portal",
      "72-hour DSR response SLA",
    ],
    color: "text-cyan-400",
    bg: "bg-cyan-600/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Users,
    title: "Access Controls",
    content:
      "ISOComply enforces least-privilege access controls internally. All employee access is reviewed quarterly. Production access requires MFA and is logged in our SIEM. Privileged access uses just-in-time provisioning with automatic expiry.",
    bullets: [
      "MFA required for all access",
      "Just-in-time privileged access",
      "Quarterly access reviews",
      "Full SIEM audit logging",
    ],
    color: "text-amber-400",
    bg: "bg-amber-600/10",
    border: "border-amber-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Penetration Testing",
    content:
      "ISOComply undergoes annual penetration testing by a CREST-accredited external firm, as well as continuous automated scanning. Findings are tracked, prioritised, and remediated according to our vulnerability management policy. Critical findings are remediated within 24 hours.",
    bullets: [
      "Annual CREST-accredited pen test",
      "Continuous automated scanning",
      "SLA: critical findings < 24 hours",
      "Vulnerability disclosure program",
    ],
    color: "text-rose-400",
    bg: "bg-rose-600/10",
    border: "border-rose-500/20",
  },
];

export default function SecurityPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: "#0a0f1e" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8">
            <ShieldCheck className="size-4 text-blue-400" />
            SOC 2 Type II Certified
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Security at ISOComply
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We&apos;re a compliance platform — so we hold ourselves to the same standards we help our customers achieve. Security isn&apos;t a feature; it&apos;s foundational.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 bg-slate-950 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "SOC 2 Type II", icon: ShieldCheck, color: "text-blue-400" },
              { label: "ISO 27001 (self-certified)", icon: CheckCircle2, color: "text-emerald-400" },
              { label: "UK GDPR Compliant", icon: Eye, color: "text-cyan-400" },
              { label: "256-bit Encryption", icon: Lock, color: "text-violet-400" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5"
              >
                <badge.icon className={`size-4 ${badge.color}`} />
                <span className="text-sm text-slate-300 font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((sec) => (
              <div key={sec.title} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`size-10 rounded-xl ${sec.bg} border ${sec.border} flex items-center justify-center`}>
                    <sec.icon className={`size-5 ${sec.color}`} />
                  </div>
                  <h2
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                  >
                    {sec.title}
                  </h2>
                </div>
                <p className="text-slate-400 leading-relaxed mb-5">{sec.content}</p>
                {"bullets" in sec && sec.bullets && (
                  <div className="grid grid-cols-2 gap-2">
                    {sec.bullets.map((b) => (
                      <div key={b} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className={`size-4 shrink-0 ${sec.color}`} />
                        {b}
                      </div>
                    ))}
                  </div>
                )}
                {"badges" in sec && sec.badges && (
                  <div className="flex gap-2 flex-wrap">
                    {sec.badges.map((b) => (
                      <span
                        key={b}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sec.bg} ${sec.color} ${sec.border}`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vulnerability disclosure */}
          <div className="mt-10 bg-slate-900 border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="size-5 text-slate-400" />
              <h2
                className="text-xl font-semibold text-white"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Vulnerability Disclosure
              </h2>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              We operate a responsible disclosure program. If you discover a security vulnerability in ISOComply, please report it to us immediately. We commit to acknowledging your report within 24 hours and providing a fix timeline within 48 hours for critical issues.
            </p>
            <a
              href="mailto:security@isocomply.io"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              security@isocomply.io
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
