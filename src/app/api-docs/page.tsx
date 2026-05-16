import PageLayout from "@/components/landing/page-layout";
import { Key, Code2, ArrowRight, Copy } from "lucide-react";

const endpoints = [
  {
    method: "GET",
    path: "/v1/organisations",
    description: "List all organisations the authenticated user has access to.",
    response: `{
  "data": [
    {
      "id": "org_01HXYZ123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "created_at": "2025-01-15T10:30:00Z",
      "standards": ["iso_27001", "iso_9001"]
    }
  ],
  "meta": { "total": 1, "page": 1, "per_page": 25 }
}`,
  },
  {
    method: "GET",
    path: "/v1/organisations/:id/projects",
    description: "List all compliance projects for an organisation.",
    response: `{
  "data": [
    {
      "id": "proj_02AXYZ456",
      "name": "ISO 27001 Certification 2026",
      "standard": "iso_27001",
      "status": "in_progress",
      "score": 68,
      "target_date": "2026-06-30"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/projects/:id/controls",
    description: "List all controls for a compliance project, with their current status and evidence.",
    response: `{
  "data": [
    {
      "id": "ctrl_A51",
      "reference": "A.5.1",
      "name": "Information security policies",
      "status": "implemented",
      "evidence_count": 3,
      "assignee_id": "usr_01BXYZ"
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/v1/projects/:id/controls/:control_id/evidence",
    description: "Upload a new evidence item and link it to a control.",
    response: `{
  "data": {
    "id": "ev_03CXYZ789",
    "filename": "access-control-policy.pdf",
    "size_bytes": 245678,
    "control_id": "ctrl_A51",
    "uploaded_by": "usr_01BXYZ",
    "expires_at": "2027-01-01T00:00:00Z",
    "created_at": "2026-04-07T09:15:00Z"
  }
}`,
  },
  {
    method: "POST",
    path: "/v1/projects/:id/reports",
    description: "Trigger generation of a compliance report. Returns a job ID to poll for the result.",
    response: `{
  "data": {
    "job_id": "job_04DXYZ012",
    "status": "queued",
    "type": "gap_analysis_report",
    "format": "pdf",
    "created_at": "2026-04-07T09:20:00Z"
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  POST: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  PUT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DELETE: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function ApiDocsPage() {
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
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="size-8 text-blue-400" />
            <h1
              className="text-4xl md:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              API Reference
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl">
            The ISOComply REST API lets you integrate compliance data into your own workflows, dashboards, and applications. All endpoints return JSON.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Base URL */}
                <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Base URL</p>
                  <code className="text-sm text-blue-300 font-mono">https://api.isocomply.io</code>
                </div>

                {/* Authentication */}
                <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="size-4 text-amber-400" />
                    <p className="text-sm font-semibold text-white">Authentication</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    All requests must include your API key in the Authorization header:
                  </p>
                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300">
                    <span className="text-slate-500">Authorization: </span>
                    <span className="text-amber-300">Bearer sk_live_...</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Find your API key in Settings → API Keys.
                  </p>
                </div>

                {/* Rate limits */}
                <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rate Limits</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Starter</span>
                      <span className="text-slate-300">100 req/hour</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Professional</span>
                      <span className="text-slate-300">1,000 req/hour</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Enterprise</span>
                      <span className="text-slate-300">Unlimited</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="lg:col-span-2 space-y-6">
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Endpoints
              </h2>

              {endpoints.map((ep) => (
                <div
                  key={ep.path}
                  className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden"
                >
                  {/* Method + path */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${methodColors[ep.method]}`}>
                      {ep.method}
                    </span>
                    <code className="text-sm text-slate-200 font-mono">{ep.path}</code>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-400 mb-4">{ep.description}</p>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Example Response
                      </p>
                      <div className="bg-slate-950 rounded-lg p-4 relative">
                        <pre className="text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
                          {ep.response}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Webhooks note */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-5">
                <h3
                  className="font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  Webhooks
                </h3>
                <p className="text-sm text-slate-400">
                  ISOComply can send real-time event notifications to your endpoint for events like evidence uploads, control status changes, and report generation. Configure webhooks in Settings → Webhooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
