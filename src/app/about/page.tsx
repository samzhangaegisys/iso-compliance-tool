import Link from "next/link";
import PageLayout from "@/components/landing/page-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

const team = [
  {
    name: "Oliver Hartley",
    role: "CEO & Co-founder",
    initials: "OH",
    bio: "Former Lead Auditor at BSI Group with 12 years of ISO certification experience. Saw first-hand how compliance tools were failing teams and decided to build something better.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Priya Nair",
    role: "CTO & Co-founder",
    initials: "PN",
    bio: "Previously Staff Engineer at Palantir. Built data infrastructure at scale. Now obsessed with making compliance data beautiful and actionable.",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Marcus Webb",
    role: "Head of Compliance",
    initials: "MW",
    bio: "CISSP, ISO 27001 Lead Implementer, ISO 9001 Lead Auditor. Leads our standards team, ensuring every control mapping and template is audit-ready.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Sophie Brennan",
    role: "VP of Customer Success",
    initials: "SB",
    bio: "Previously at Drata and OneTrust. Helped over 300 organisations achieve ISO certification. Leads our customer success and implementation teams.",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Liam Chen",
    role: "Head of Product",
    initials: "LC",
    bio: "Former PM at Notion and Linear. Believes compliance software should be a joy to use, not a burden. Obsessed with simplicity and speed.",
    color: "from-cyan-500 to-blue-600",
  },
];

const values = [
  {
    title: "Compliance should be accessible",
    description:
      "ISO certification shouldn't be the preserve of enterprises with large compliance teams. We're democratising access to world-class compliance tooling for organisations of every size.",
  },
  {
    title: "Accuracy above all",
    description:
      "Our control mappings, gap analyses, and audit templates are maintained by certified ISO professionals. We never ship guesswork.",
  },
  {
    title: "Build with customers, not for them",
    description:
      "Our roadmap is shaped by conversations with real compliance managers, CISOs, and quality managers. Every feature ships because a customer needed it.",
  },
  {
    title: "Security is non-negotiable",
    description:
      "We're a compliance platform — we'd better be compliant ourselves. SOC 2 Type II, GDPR, and ISO 27001 are requirements, not aspirations.",
  },
];

const investors = [
  "Sequoia Capital",
  "Index Ventures",
  "Balderton Capital",
  "Y Combinator",
];

export default function AboutPage() {
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
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            We&apos;re on a mission to make ISO certification achievable for every organisation
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            ISOComply was founded in 2022 by a team of ex-auditors and engineers who believed compliance software could be dramatically better.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-3xl font-bold text-white mb-5"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                The problem we&apos;re solving
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                ISO certification is widely recognised as a mark of trust and operational excellence — but for most organisations, the journey to certification is needlessly painful. Teams spend months navigating spreadsheets, chasing documents, and trying to decode dense standards documentation.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                The existing tools were either too complex, too expensive, or built for consultants rather than the in-house teams who actually do the work.
              </p>
              <p className="text-slate-400 leading-relaxed">
                ISOComply changes that. We&apos;ve combined deep ISO expertise with modern software design to create a platform that genuinely reduces the time and effort required to achieve and maintain certification.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "2022", label: "Founded" },
                  { value: "500+", label: "Certified organisations" },
                  { value: "28", label: "Team members" },
                  { value: "London", label: "Headquarters" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p
                      className="text-3xl font-bold text-white mb-1"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-sm text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Meet the team
            </h2>
            <p className="text-slate-400">The people building the future of compliance software.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <div
                  className={`size-14 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-4`}
                >
                  <span className="text-white font-bold text-lg">{member.initials}</span>
                </div>
                <h3
                  className="font-semibold text-white mb-0.5"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  {member.name}
                </h3>
                <p className="text-sm text-blue-400 mb-3">{member.role}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Our values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="bg-slate-900 border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">{i + 1}</span>
                  </div>
                  <h3
                    className="font-semibold text-white"
                    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                  >
                    {v.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors */}
      <section className="py-16" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Backed by world-class investors
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {investors.map((inv) => (
              <div
                key={inv}
                className="px-5 py-2.5 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-500 font-semibold text-sm"
              >
                {inv}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold text-white mb-5"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Join 500+ organisations on the path to certification
          </h2>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-10 font-semibold"
            render={<Link href="/register" />}
          >
            Create Account
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
