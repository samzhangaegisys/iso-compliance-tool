import PageLayout from "@/components/landing/page-layout";
import {
  BookOpen,
  ShieldCheck,
  FileCheck2,
  BarChart3,
  Code2,
  CreditCard,
  Zap,
  ArrowRight,
  Search,
  CheckCircle2,
} from "lucide-react";

const categories = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Install ISOComply, connect your organisation, and run your first gap analysis.",
    articles: ["Quick start guide", "Inviting your team", "Choosing your standards", "First gap analysis"],
    color: "text-blue-400",
    bg: "bg-blue-600/10",
    border: "border-blue-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Standards",
    description: "Deep-dive guides for ISO 27001, ISO 9001, ISO 14001, ISO 45001, and ISO 42001.",
    articles: ["ISO 27001 overview", "Annex A controls reference", "ISO 9001 clause guide", "Multi-standard management"],
    color: "text-violet-400",
    bg: "bg-violet-600/10",
    border: "border-violet-500/20",
  },
  {
    icon: FileCheck2,
    title: "Evidence",
    description: "How to upload, organise, link, and share compliance evidence effectively.",
    articles: ["Uploading evidence", "Linking to controls", "Evidence expiry", "Sharing with auditors"],
    color: "text-emerald-400",
    bg: "bg-emerald-600/10",
    border: "border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Generate, customise, and export audit-ready compliance reports.",
    articles: ["Generating reports", "Custom templates", "PDF export", "Sharing with auditors"],
    color: "text-amber-400",
    bg: "bg-amber-600/10",
    border: "border-amber-500/20",
  },
  {
    icon: Code2,
    title: "API",
    description: "Integrate ISOComply data into your existing workflows with our REST API.",
    articles: ["Authentication", "API overview", "Endpoints reference", "Webhooks"],
    color: "text-cyan-400",
    bg: "bg-cyan-600/10",
    border: "border-cyan-500/20",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Plans, pricing, invoices, and account management.",
    articles: ["Plans overview", "Upgrading your plan", "Invoices", "Cancellation policy"],
    color: "text-rose-400",
    bg: "bg-rose-600/10",
    border: "border-rose-500/20",
  },
];

const quickStart = [
  {
    step: "01",
    title: "Create your organisation",
    description: "Sign up, create your first organisation, and select which ISO standards you're targeting.",
  },
  {
    step: "02",
    title: "Run your gap analysis",
    description: "Upload any existing documentation, answer the gap analysis questionnaire, and see your compliance score.",
  },
  {
    step: "03",
    title: "Start closing gaps",
    description: "Work through your prioritised control list, upload evidence, and assign tasks to team members.",
  },
];

export default function DocsPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#0a0f1e" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Documentation
          </h1>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
            <input
              type="search"
              placeholder="Search documentation..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-white mb-8"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Quick start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {quickStart.map((s) => (
              <div key={s.step} className="bg-slate-900 border border-slate-700/50 rounded-xl p-6">
                <div className="size-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-blue-400">{s.step}</span>
                </div>
                <h3
                  className="font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>

          {/* Categories */}
          <h2
            className="text-2xl font-bold text-white mb-8"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Browse by topic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <div className={`inline-flex items-center justify-center size-10 rounded-xl ${cat.bg} border ${cat.border} mb-4`}>
                  <cat.icon className={`size-5 ${cat.color}`} />
                </div>
                <h3
                  className="font-semibold text-white mb-1.5"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">{cat.description}</p>
                <ul className="space-y-1.5">
                  {cat.articles.map((a) => (
                    <li key={a}>
                      <a
                        href="#"
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className="size-3 shrink-0" />
                        {a}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
