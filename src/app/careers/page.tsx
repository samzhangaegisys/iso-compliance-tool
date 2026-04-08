import Link from "next/link";
import PageLayout from "@/components/landing/page-layout";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";

const jobs = [
  {
    title: "Compliance Content Writer",
    department: "Content & Standards",
    location: "London (Hybrid)",
    type: "Full-time",
    description:
      "Write clear, accurate implementation guidance, control descriptions, and help content for our ISO standards library. You'll work closely with our Head of Compliance to ensure every word is audit-ready.",
    requirements: [
      "Strong technical writing skills",
      "ISO 27001 or ISO 9001 knowledge",
      "Ability to simplify complex standards",
    ],
  },
  {
    title: "Full-Stack Engineer",
    department: "Engineering",
    location: "London (Hybrid) or Remote (UK/EU)",
    type: "Full-time",
    description:
      "Build and improve the core ISOComply platform. You'll work across the full stack — Next.js frontend, Node.js API, PostgreSQL — shipping features that directly impact hundreds of compliance teams.",
    requirements: [
      "3+ years full-stack experience",
      "TypeScript, React, Node.js",
      "Experience with complex data models",
    ],
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "London (Hybrid)",
    type: "Full-time",
    description:
      "Own the post-sales experience for a portfolio of mid-market and enterprise accounts. Guide customers from onboarding to certification, and act as their advocate internally.",
    requirements: [
      "2+ years in B2B SaaS CSM role",
      "Compliance or security background preferred",
      "Excellent communication skills",
    ],
  },
  {
    title: "Sales Development Representative",
    department: "Sales",
    location: "London (Office)",
    type: "Full-time",
    description:
      "Generate qualified pipeline for our Account Executive team through outbound prospecting and inbound lead qualification. You'll be targeting CISOs, Quality Managers, and Compliance Officers.",
    requirements: [
      "1+ year in SDR or sales role",
      "High energy and resilience",
      "Interest in security or compliance",
    ],
  },
  {
    title: "Product Designer",
    department: "Product",
    location: "Remote (UK/EU)",
    type: "Full-time",
    description:
      "Design intuitive experiences for complex compliance workflows. You'll own end-to-end design from research and wireframes to polished prototypes, working closely with our Head of Product.",
    requirements: [
      "3+ years product design experience",
      "Strong Figma skills",
      "Experience with data-heavy applications",
    ],
  },
];

const perks = [
  "Competitive salary + meaningful equity",
  "25 days holiday + bank holidays",
  "Private health insurance (Vitality)",
  "£1,000 annual learning budget",
  "Latest MacBook Pro",
  "Regular team retreats",
  "Flexible hours and remote options",
  "ISO 27001 certification training",
];

export default function CareersPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium mb-8">
            <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            We&apos;re hiring — 5 open roles
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Build the future of compliance with us
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We&apos;re a small, ambitious team building software that helps hundreds of organisations achieve ISO certification. Come solve interesting problems with us.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-white mb-8 text-center"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            What we offer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {perks.map((perk) => (
              <div
                key={perk}
                className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex items-start gap-2.5"
              >
                <CheckCircle2 className="size-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-16" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-white mb-8"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Open positions
          </h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <h3
                      className="text-lg font-semibold text-white mb-1"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="size-3.5" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white shrink-0"
                    render={<Link href="/contact" />}
                  >
                    Apply
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((r) => (
                    <span
                      key={r}
                      className="text-xs text-slate-400 bg-slate-800 border border-slate-700/50 rounded-lg px-2.5 py-1"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">
              Don&apos;t see a role that fits? We&apos;re always interested in hearing from exceptional people.
            </p>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-white/5"
              render={<Link href="mailto:careers@isocomply.io" />}
            >
              Send a speculative application
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
