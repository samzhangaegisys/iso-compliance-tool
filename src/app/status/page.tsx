import PageLayout from "@/components/landing/page-layout";
import { CheckCircle2, Clock } from "lucide-react";

const services = [
  { name: "API", description: "REST API endpoints", status: "Operational", uptime: "99.98%" },
  { name: "Dashboard", description: "Web application", status: "Operational", uptime: "99.99%" },
  { name: "Evidence Storage", description: "File upload and retrieval", status: "Operational", uptime: "99.97%" },
  { name: "Email Notifications", description: "Transactional email delivery", status: "Operational", uptime: "99.95%" },
  { name: "Webhooks", description: "Real-time event delivery", status: "Operational", uptime: "99.93%" },
  { name: "Database", description: "Primary data store", status: "Operational", uptime: "100.00%" },
];

// Generate 30 days of green blocks
const uptimeBlocks = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  status: "green",
}));

export default function StatusPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#0a0f1e" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-base font-medium mb-8">
            <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            System Status
          </h1>
          <p className="text-slate-400">Last updated: {dateStr}</p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-slate-900 border border-slate-700/50 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-medium text-white text-sm">{service.name}</p>
                    <p className="text-xs text-slate-500">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-slate-500 hidden sm:block">{service.uptime} uptime</span>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Uptime history */}
          <div className="mt-12 bg-slate-900 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-semibold text-white"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                30-Day Uptime History
              </h2>
              <span className="text-xs text-emerald-400 font-medium">99.97% overall</span>
            </div>
            <div className="flex gap-1 mb-2">
              {uptimeBlocks.map((block) => (
                <div
                  key={block.day}
                  title={`Day ${block.day}`}
                  className="flex-1 h-8 rounded-sm bg-emerald-500/60 hover:bg-emerald-400/80 transition-colors cursor-default"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Incident history */}
          <div className="mt-8 bg-slate-900 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-4 text-slate-400" />
              <h2
                className="font-semibold text-white"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Incident History
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              No incidents in the past 90 days.
            </p>
          </div>

          {/* Subscribe */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400 mb-4">
              Subscribe to status updates for real-time notifications:
            </p>
            <div className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
