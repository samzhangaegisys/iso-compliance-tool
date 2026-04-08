import PageLayout from "@/components/landing/page-layout";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Mail } from "lucide-react";

const mentions = [
  {
    publication: "TechCrunch",
    date: "January 2026",
    headline: "ISOComply raises $12M Series A to bring AI to ISO compliance management",
    excerpt:
      "The London-based startup has quietly become the platform of choice for mid-market compliance teams, with over 500 organisations now certified through its platform.",
    url: "#",
  },
  {
    publication: "Forbes",
    date: "November 2025",
    headline: "The Startups Making Compliance Less Painful",
    excerpt:
      "ISOComply is among a new wave of GRC tools that are using automation and AI to strip the manual labour out of standards compliance.",
    url: "#",
  },
  {
    publication: "The Register",
    date: "September 2025",
    headline: "ISO 27001 certification doesn't have to take 18 months — these tools can help",
    excerpt:
      "\"ISOComply stands out for its depth of ISO-specific content and the quality of its evidence management features,\" writes our reviewer.",
    url: "#",
  },
  {
    publication: "Information Age",
    date: "July 2025",
    headline: "ISOComply launches support for ISO 42001 AI Management Standard",
    excerpt:
      "As AI governance becomes a boardroom priority, ISOComply has moved quickly to add comprehensive support for the new ISO 42001 standard.",
    url: "#",
  },
];

const assets = [
  { label: "Logo Pack (SVG, PNG)", description: "Dark and light variants" },
  { label: "Product Screenshots", description: "High-res dashboard and feature screenshots" },
  { label: "Founder Headshots", description: "Oliver Hartley & Priya Nair" },
  { label: "Brand Guidelines", description: "Colours, typography, and usage rules" },
  { label: "Company Fact Sheet", description: "Key stats and boilerplate text" },
];

export default function PressPage() {
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
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Press & Media
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Resources for journalists and analysts covering ISOComply and the compliance technology space.
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Download className="mr-2 size-4" />
            Download Press Kit
          </Button>
        </div>
      </section>

      {/* Press mentions */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-white mb-8"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            In the press
          </h2>
          <div className="space-y-5">
            {mentions.map((m) => (
              <a
                key={m.headline}
                href={m.url}
                className="block bg-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {m.publication}
                      </span>
                      <span className="text-xs text-slate-500">{m.date}</span>
                    </div>
                    <h3
                      className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {m.headline}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{m.excerpt}</p>
                  </div>
                  <ExternalLink className="size-4 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Press kit assets */}
      <section className="py-20" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-white mb-8"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Press kit assets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {assets.map((asset) => (
              <button
                key={asset.label}
                className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors text-left group"
              >
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {asset.label}
                  </p>
                  <p className="text-xs text-slate-500">{asset.description}</p>
                </div>
                <Download className="size-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0 ml-4" />
              </button>
            ))}
          </div>

          {/* Media contact */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6">
            <h3
              className="font-semibold text-white mb-2"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Media contact
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              For press enquiries, interview requests, or analyst briefings:
            </p>
            <a
              href="mailto:press@isocomply.io"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <Mail className="size-4" />
              press@isocomply.io
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
