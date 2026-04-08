import Link from "next/link";
import PageLayout from "@/components/landing/page-layout";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  BarChart3,
  FileCheck2,
  Users,
  Bell,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lock,
  RefreshCw,
  BookOpen,
  Download,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Gap Analysis Engine",
    description:
      "Our intelligent gap analysis engine maps your current state against ISO requirements in minutes, not weeks. Upload existing documentation and policies — the system automatically identifies which controls you already satisfy and which need attention.",
    bullets: [
      "Visual compliance heatmap with colour-coded risk levels",
      "Priority-ranked gaps based on audit likelihood",
      "Cross-standard overlap detection to eliminate duplication",
      "Automated control mapping from uploaded documents",
      "Real-time progress tracking as you implement changes",
    ],
    badge: "Core Feature",
    color: "blue",
  },
  {
    icon: FileCheck2,
    title: "Evidence Vault",
    description:
      "A secure, centralised repository for all your compliance evidence. Every document, screenshot, and policy is directly linked to the specific controls it satisfies, giving auditors instant, traceable access to everything they need.",
    bullets: [
      "Drag-and-drop file uploads with automatic categorisation",
      "Full version history with timestamped audit trail",
      "Automatic expiry reminders for time-sensitive evidence",
      "Secure auditor sharing links with granular access control",
      "Bulk upload and evidence tagging",
    ],
    badge: "Core Feature",
    color: "violet",
  },
  {
    icon: Award,
    title: "Audit Report Generator",
    description:
      "Generate professional, auditor-ready compliance reports in one click. Our templates are designed by ex-ISO auditors to include exactly what certification bodies look for — structured, clear, and comprehensive.",
    bullets: [
      "One-click PDF and Word export",
      "Customisable templates by standard",
      "Automatic evidence package compilation",
      "Shareable auditor portals with view-only access",
      "Executive summary and detailed technical views",
    ],
    badge: "Popular",
    color: "emerald",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Compliance is a team sport. Assign controls to specific team members, set deadlines, track progress, and keep communication centralised — all within the context of the compliance programme.",
    bullets: [
      "Control assignment and ownership tracking",
      "Built-in commenting and discussion threads",
      "Progress dashboards for managers",
      "Email and in-app notifications for deadlines",
      "Role-based permissions (Admin, Editor, Viewer)",
    ],
    badge: null,
    color: "amber",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Never miss a deadline or let evidence expire. ISOComply proactively monitors your compliance programme and alerts the right people at the right time — so nothing falls through the cracks.",
    bullets: [
      "Evidence expiry warnings (30, 14, 7 days)",
      "Task deadline reminders",
      "Upcoming audit alerts",
      "Policy review reminders",
      "Digest emails and Slack integration",
    ],
    badge: null,
    color: "rose",
  },
  {
    icon: TrendingUp,
    title: "Multi-Standard Management",
    description:
      "Managing ISO 27001 alongside ISO 9001 shouldn't mean double the work. ISOComply identifies shared controls across standards and lets you satisfy multiple requirements with a single piece of evidence.",
    bullets: [
      "All 5 major ISO standards in one platform",
      "Cross-standard control mapping",
      "Shared evidence across standards",
      "Consolidated compliance score",
      "Standard-specific dashboards",
    ],
    badge: "Enterprise",
    color: "cyan",
  },
  {
    icon: BookOpen,
    title: "Controls Library",
    description:
      "Access a comprehensive library of pre-built control templates for every ISO standard. Each template includes implementation guidance, example evidence, and common pitfalls — giving your team a head start.",
    bullets: [
      "114+ ISO 27001 Annex A controls",
      "Implementation guidance for each control",
      "Example evidence templates",
      "Common pitfall warnings",
      "Customisable control descriptions",
    ],
    badge: null,
    color: "indigo",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "ISOComply is built to the same standards we help you achieve. SOC 2 Type II certified, GDPR compliant, with enterprise-grade access controls, audit logging, and data residency options.",
    bullets: [
      "SOC 2 Type II certified",
      "GDPR and UK GDPR compliant",
      "256-bit AES encryption at rest and in transit",
      "SSO / SAML support (Enterprise)",
      "Immutable audit log for all actions",
    ],
    badge: "Enterprise",
    color: "slate",
  },
];

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  blue: { bg: "bg-blue-600/10", border: "border-blue-500/20", icon: "text-blue-400", badge: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  violet: { bg: "bg-violet-600/10", border: "border-violet-500/20", icon: "text-violet-400", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
  emerald: { bg: "bg-emerald-600/10", border: "border-emerald-500/20", icon: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  amber: { bg: "bg-amber-600/10", border: "border-amber-500/20", icon: "text-amber-400", badge: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  rose: { bg: "bg-rose-600/10", border: "border-rose-500/20", icon: "text-rose-400", badge: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
  cyan: { bg: "bg-cyan-600/10", border: "border-cyan-500/20", icon: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
  indigo: { bg: "bg-indigo-600/10", border: "border-indigo-500/20", icon: "text-indigo-400", badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
  slate: { bg: "bg-slate-600/10", border: "border-slate-500/20", icon: "text-slate-400", badge: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
};

export default function FeaturesPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: "#0a0f1e" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8">
            <Zap className="size-4 text-blue-400" />
            Full Feature Set
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Everything you need for ISO compliance
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            From day-one gap assessment to audit day, ISOComply covers every stage of your compliance journey with purpose-built tools.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 font-semibold"
              render={<Link href="/register" />}
            >
              Create Account
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-white/5 h-12 px-8"
              render={<Link href="/demo" />}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16">
            {features.map((feature, i) => {
              const colors = colorMap[feature.color];
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col lg:flex-row items-start gap-12 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`inline-flex items-center justify-center size-12 rounded-xl ${colors.bg} border ${colors.border}`}>
                        <feature.icon className={`size-6 ${colors.icon}`} />
                      </div>
                      {feature.badge && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors.badge}`}>
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <h2
                      className="text-2xl font-bold text-white mb-4"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {feature.title}
                    </h2>
                    <p className="text-slate-400 leading-relaxed mb-6">{feature.description}</p>
                    <ul className="space-y-2.5">
                      {feature.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-slate-300 text-sm">
                          <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${colors.icon}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Visual */}
                  <div className="flex-1 w-full">
                    <div className={`rounded-2xl border ${colors.border} bg-slate-900/60 p-8 shadow-xl`}>
                      <div
                        className={`w-full h-52 rounded-xl flex flex-col items-center justify-center gap-4 ${colors.bg}`}
                        style={{ border: `1px solid ${colors.border}` }}
                      >
                        <feature.icon className={`size-20 opacity-20 ${colors.icon}`} />
                        <div className="flex gap-2">
                          {feature.bullets.slice(0, 3).map((b) => (
                            <div key={b} className="h-1.5 rounded-full bg-current opacity-20 w-12" style={{ color: "currentColor" }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-5"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Ready to see these features in action?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Start with our free Starter plan — no credit card required. Get audit-ready faster with ISOComply.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-10 font-semibold"
              render={<Link href="/register" />}
            >
              Create Account
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-white/5 h-12 px-8"
              render={<Link href="/demo" />}
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
