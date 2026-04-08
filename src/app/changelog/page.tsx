import PageLayout from "@/components/landing/page-layout";
import { CheckCircle2, ArrowUp, Bug, Zap } from "lucide-react";

const releases = [
  {
    version: "v2.4.0",
    date: "March 2026",
    tag: "Latest",
    tagColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    newFeatures: [
      "ISO 42001 AI Management System — full control library with 9 clauses",
      "Evidence expiry dashboard — see all expiring evidence in one view",
      "Auditor portal improvements — custom branding and password protection",
      "Bulk control assignment — assign multiple controls to team members at once",
    ],
    improvements: [
      "Faster gap analysis recalculation (60% speed improvement)",
      "Redesigned compliance score widget with trend indicators",
      "Improved PDF export rendering for complex tables",
    ],
    bugFixes: [
      "Fixed an issue where evidence files over 50MB failed to upload silently",
      "Corrected ISO 9001 clause 8.5 control mapping",
      "Fixed date picker timezone handling for non-UTC users",
    ],
  },
  {
    version: "v2.3.1",
    date: "January 2026",
    tag: "Patch",
    tagColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    newFeatures: [],
    improvements: [
      "Performance improvements for organisations with 500+ controls",
      "Improved Slack notification formatting",
    ],
    bugFixes: [
      "Fixed SSO login loop for Okta-configured accounts",
      "Resolved PDF export crash when evidence filenames contained special characters",
      "Fixed task assignment emails not sending to users with non-Latin names",
    ],
  },
  {
    version: "v2.3.0",
    date: "December 2025",
    tag: null,
    tagColor: "",
    newFeatures: [
      "Multi-standard overlap detection — see shared controls across ISO standards",
      "Custom control templates — create organisation-specific control descriptions",
      "Evidence search — full-text search across all uploaded documents",
      "Scheduled compliance reports — weekly or monthly PDF to your inbox",
    ],
    improvements: [
      "Completely redesigned sidebar navigation",
      "New onboarding flow for new organisations (50% faster to first gap analysis)",
      "Improved mobile responsiveness across all views",
      "Dark mode improvements for the evidence vault",
    ],
    bugFixes: [
      "Fixed duplicate notifications when multiple users were assigned to the same task",
      "Corrected ISO 45001 clause ordering in reports",
    ],
  },
  {
    version: "v2.2.0",
    date: "October 2025",
    tag: null,
    tagColor: "",
    newFeatures: [
      "ISO 45001:2018 Occupational Health &amp; Safety — full standard support",
      "Team roles — granular RBAC with Admin, Editor, Reviewer, and Viewer roles",
      "Comment threads on controls — keep discussions in context",
      "Control history log — see every change to a control with timestamps",
    ],
    improvements: [
      "Gap analysis now supports partial control satisfaction scoring",
      "Improved audit report templates with new executive summary section",
    ],
    bugFixes: [
      "Fixed occasional data load failure on the dashboard for large accounts",
    ],
  },
  {
    version: "v2.1.0",
    date: "August 2025",
    tag: null,
    tagColor: "",
    newFeatures: [
      "ISO 14001:2015 Environmental Management — full standard support",
      "Integrations marketplace — Slack, Jira, and Microsoft Teams connectors",
      "Evidence bulk import — upload up to 100 files at once",
    ],
    improvements: [
      "Faster page load times (core web vitals improvement)",
      "New chart types in compliance dashboard",
      "Improved CSV export format",
    ],
    bugFixes: [
      "Fixed evidence linking for controls in sub-clauses",
      "Resolved occasional timeout on large PDF exports",
    ],
  },
];

export default function ChangelogPage() {
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
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Changelog
          </h1>
          <p className="text-lg text-slate-400">
            New features, improvements, and bug fixes for ISOComply.
          </p>
        </div>
      </section>

      {/* Releases */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800" />

            <div className="space-y-16">
              {releases.map((release) => (
                <div key={release.version} className="relative pl-16">
                  {/* Dot */}
                  <div className="absolute left-4 top-1.5 size-4 rounded-full bg-slate-800 border-2 border-blue-500/60" />

                  {/* Version header */}
                  <div className="flex items-center gap-3 mb-1">
                    <h2
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {release.version}
                    </h2>
                    {release.tag && (
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${release.tagColor}`}>
                        {release.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-6">{release.date}</p>

                  <div className="space-y-6">
                    {release.newFeatures.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="size-4 text-blue-400" />
                          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                            New Features
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {release.newFeatures.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                              <CheckCircle2 className="size-4 text-blue-400 shrink-0 mt-0.5" />
                              <span dangerouslySetInnerHTML={{ __html: f }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {release.improvements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowUp className="size-4 text-emerald-400" />
                          <p className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">
                            Improvements
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {release.improvements.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                              <div className="size-1.5 rounded-full bg-emerald-500/60 shrink-0 mt-1.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {release.bugFixes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Bug className="size-4 text-amber-400" />
                          <p className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
                            Bug Fixes
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {release.bugFixes.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                              <div className="size-1.5 rounded-full bg-amber-500/60 shrink-0 mt-1.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
