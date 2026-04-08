"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileCheck2, CheckCircle2, Clock, AlertTriangle,
  Activity, Filter, ArrowLeft, X, ExternalLink,
  MessageSquare, Paperclip, User, Calendar, Tag,
  BookOpen, ChevronDown, Circle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Rich activity data ─────────────────────────────────────────────────────────

type ActivityItem = {
  id: string;
  type: "evidence" | "status" | "task" | "alert";
  title: string;
  icon: string;
  iconClass: string;
  who: string;
  whoInitials: string;
  whoColor: string;
  when: string;
  timestamp: string;
  standard: string;
  control: string;
  description: string;
  impact: string;
  prevStatus?: string;
  newStatus?: string;
  file?: { name: string; size: string; type: string };
  comments: { author: string; initials: string; color: string; text: string; when: string }[];
  timeline: { event: string; who: string; when: string }[];
};

const allActivity: ActivityItem[] = [
  {
    id: "1", type: "evidence",
    title: 'Evidence uploaded for "A.8.7 — Protection against malware"',
    icon: "FileCheck2", iconClass: "text-blue-600 bg-blue-50",
    who: "Sarah K.", whoInitials: "SK", whoColor: "bg-blue-500",
    when: "2 hours ago", timestamp: "7 Apr 2026, 10:14 AM",
    standard: "ISO 27001:2022", control: "A.8.7",
    description: "Anti-malware policy document (v4.1) uploaded as supporting evidence for control A.8.7. Document covers endpoint protection, email scanning, removable media controls, and incident response procedures for malware events.",
    impact: "Control A.8.7 evidence gap has been closed. Compliance score for this domain increased from 62% to 68%.",
    file: { name: "Anti-Malware-Policy-v4.1.pdf", size: "1.8 MB", type: "PDF" },
    comments: [
      { author: "James O.", initials: "JO", color: "bg-emerald-500", text: "Confirmed this matches the latest vendor specifications. Good to go.", when: "1 hour ago" },
    ],
    timeline: [
      { event: "File uploaded and linked to control A.8.7", who: "Sarah K.", when: "2 hours ago" },
      { event: "Control A.8.7 status changed: In Progress → Implemented", who: "System", when: "2 hours ago" },
      { event: "Evidence review requested", who: "Sarah K.", when: "3 hours ago" },
    ],
  },
  {
    id: "2", type: "status",
    title: '"5.2 Quality Policy" marked as Implemented',
    icon: "CheckCircle2", iconClass: "text-green-600 bg-green-50",
    who: "James O.", whoInitials: "JO", whoColor: "bg-emerald-500",
    when: "4 hours ago", timestamp: "7 Apr 2026, 8:02 AM",
    standard: "ISO 9001:2015", control: "5.2",
    description: "Quality Policy document has been approved by senior management and distributed to all staff. The policy has been posted on the intranet and all team leads have confirmed receipt. Physical copies displayed in all work areas.",
    impact: "Clause 5.2 is now fully Implemented. This contributes to the overall ISO 9001 project reaching 84% completion.",
    prevStatus: "In Progress", newStatus: "Implemented",
    comments: [],
    timeline: [
      { event: "Status changed: In Progress → Implemented", who: "James O.", when: "4 hours ago" },
      { event: "Management approval recorded", who: "James O.", when: "5 hours ago" },
      { event: "Policy distributed to all staff", who: "James O.", when: "Yesterday" },
      { event: "Control assigned to James O.", who: "Admin", when: "2 weeks ago" },
    ],
  },
  {
    id: "3", type: "task",
    title: "New task: Review supplier agreements for ISO 9001 clause 8.4",
    icon: "Clock", iconClass: "text-amber-600 bg-amber-50",
    who: "Admin", whoInitials: "AD", whoColor: "bg-slate-500",
    when: "Yesterday", timestamp: "6 Apr 2026, 3:45 PM",
    standard: "ISO 9001:2015", control: "8.4",
    description: "Task created to review all supplier and subcontractor agreements for compliance with ISO 9001 clause 8.4 (Control of externally provided processes, products and services). Scope includes all Tier 1 and Tier 2 suppliers.",
    impact: "Completion of this task is required before the ISO 9001 certification audit scheduled for June 2026.",
    comments: [
      { author: "Tom R.", initials: "TR", color: "bg-purple-500", text: "I have the supplier list ready. Will start contacting procurement tomorrow.", when: "Yesterday" },
    ],
    timeline: [
      { event: "Task assigned to Tom R.", who: "Admin", when: "Yesterday" },
      { event: "Task created", who: "Admin", when: "Yesterday" },
    ],
  },
  {
    id: "4", type: "alert",
    title: '"4.1 Understanding context" is overdue — 3 days past target',
    icon: "AlertTriangle", iconClass: "text-red-600 bg-red-50",
    who: "System", whoInitials: "SY", whoColor: "bg-red-500",
    when: "Yesterday", timestamp: "6 Apr 2026, 9:00 AM",
    standard: "ISO 27001:2022", control: "4.1",
    description: "Control 4.1 (Understanding the organisation and its context) was due for review on 3 April 2026. The assigned owner has not marked it complete or submitted an extension request. An automated reminder was sent on the due date.",
    impact: "Overdue controls affect the overall compliance score. If not addressed within 7 days, this will be escalated to the CISO and flagged in the next management review.",
    comments: [],
    timeline: [
      { event: "Overdue alert triggered (3 days past target)", who: "System", when: "Yesterday" },
      { event: "Second reminder email sent", who: "System", when: "4 Apr 2026" },
      { event: "First reminder email sent", who: "System", when: "3 Apr 2026" },
      { event: "Control target date set: 3 Apr 2026", who: "Admin", when: "1 month ago" },
    ],
  },
  {
    id: "5", type: "evidence",
    title: 'Evidence uploaded for "8.2 Emergency preparedness"',
    icon: "FileCheck2", iconClass: "text-blue-600 bg-blue-50",
    who: "Tom R.", whoInitials: "TR", whoColor: "bg-purple-500",
    when: "2 days ago", timestamp: "5 Apr 2026, 11:30 AM",
    standard: "ISO 45001:2018", control: "8.2",
    description: "Emergency response procedure document and last drill report uploaded as evidence for clause 8.2. Includes evacuation procedures, emergency contacts, drill records from March 2026, and sign-off from the HSE Manager.",
    impact: "Clause 8.2 now has sufficient evidence. Control status updated to Implemented.",
    file: { name: "Emergency-Response-Procedure-2026.pdf", size: "3.1 MB", type: "PDF" },
    comments: [],
    timeline: [
      { event: "File uploaded and linked to clause 8.2", who: "Tom R.", when: "2 days ago" },
      { event: "Control status auto-updated: In Progress → Implemented", who: "System", when: "2 days ago" },
    ],
  },
  {
    id: "6", type: "status",
    title: '"A.5.1 Policies for information security" marked as Implemented',
    icon: "CheckCircle2", iconClass: "text-green-600 bg-green-50",
    who: "Sarah K.", whoInitials: "SK", whoColor: "bg-blue-500",
    when: "3 days ago", timestamp: "4 Apr 2026, 2:15 PM",
    standard: "ISO 27001:2022", control: "A.5.1",
    description: "Information security policy suite approved and published. Covers acceptable use, data classification, access control, incident response, and supplier security. All employees have acknowledged receipt via the HR portal.",
    impact: "A.5.1 implementation closes a previously high-risk gap. Risk score for the Governance domain reduced from High to Medium.",
    prevStatus: "In Progress", newStatus: "Implemented",
    comments: [
      { author: "Admin", initials: "AD", color: "bg-slate-500", text: "Excellent work — this was the last blocker for the internal audit checklist.", when: "3 days ago" },
    ],
    timeline: [
      { event: "Status changed: In Progress → Implemented", who: "Sarah K.", when: "3 days ago" },
      { event: "All staff acknowledgements received", who: "Sarah K.", when: "3 days ago" },
      { event: "Policy published on intranet", who: "Sarah K.", when: "4 days ago" },
    ],
  },
  {
    id: "7", type: "evidence",
    title: "Business continuity plan uploaded for ISO 22301 alignment",
    icon: "FileCheck2", iconClass: "text-blue-600 bg-blue-50",
    who: "James O.", whoInitials: "JO", whoColor: "bg-emerald-500",
    when: "3 days ago", timestamp: "4 Apr 2026, 10:05 AM",
    standard: "ISO 27001:2022", control: "A.17.1",
    description: "Full BCP document (v3.2) uploaded, covering RTO/RPO targets, crisis communication plan, IT disaster recovery procedures, and test results from the February 2026 tabletop exercise.",
    impact: "BCP evidence satisfies requirements for A.17.1. Auditor-ready documentation package now complete for this control domain.",
    file: { name: "BCP-v3.2-2026.pdf", size: "5.4 MB", type: "PDF" },
    comments: [],
    timeline: [
      { event: "BCP v3.2 uploaded", who: "James O.", when: "3 days ago" },
      { event: "Previous version BCP-v3.1 archived", who: "System", when: "3 days ago" },
    ],
  },
  {
    id: "8", type: "alert",
    title: '"6.2 Information security objectives" review overdue by 1 day',
    icon: "AlertTriangle", iconClass: "text-red-600 bg-red-50",
    who: "System", whoInitials: "SY", whoColor: "bg-red-500",
    when: "4 days ago", timestamp: "3 Apr 2026, 9:00 AM",
    standard: "ISO 27001:2022", control: "6.2",
    description: "Annual review of information security objectives (clause 6.2) was due on 2 April 2026. Control owner has not submitted the updated objectives document or requested an extension.",
    impact: "This control is in the critical path for the upcoming Stage 2 certification audit. Escalation will be triggered if not resolved within 5 business days.",
    comments: [],
    timeline: [
      { event: "Overdue alert triggered", who: "System", when: "4 days ago" },
      { event: "Reminder sent to control owner", who: "System", when: "3 Apr 2026" },
    ],
  },
  {
    id: "9", type: "task",
    title: "Task assigned: Supplier security questionnaire (ISO 27001 A.15)",
    icon: "Clock", iconClass: "text-amber-600 bg-amber-50",
    who: "Admin", whoInitials: "AD", whoColor: "bg-slate-500",
    when: "4 days ago", timestamp: "3 Apr 2026, 11:00 AM",
    standard: "ISO 27001:2022", control: "A.15.1",
    description: "Supplier security questionnaire task created and assigned to James O. Must be completed for all Tier 1 suppliers before the end of Q2 2026. Template questionnaire linked in task resources.",
    impact: "Required for A.15.1 compliance. Affects 12 active supplier relationships.",
    comments: [],
    timeline: [
      { event: "Task assigned to James O.", who: "Admin", when: "4 days ago" },
      { event: "Task created", who: "Admin", when: "4 days ago" },
    ],
  },
  {
    id: "10", type: "evidence",
    title: "Penetration test report uploaded as evidence for A.12.6",
    icon: "FileCheck2", iconClass: "text-blue-600 bg-blue-50",
    who: "Tom R.", whoInitials: "TR", whoColor: "bg-purple-500",
    when: "5 days ago", timestamp: "2 Apr 2026, 4:20 PM",
    standard: "ISO 27001:2022", control: "A.12.6",
    description: "Annual penetration test report from CyberSec Partners uploaded. Scope covered external perimeter, web applications, and internal network segments. Three medium-severity findings identified — all remediated before report upload.",
    impact: "Satisfies A.12.6 (Management of technical vulnerabilities). All findings remediated. Evidence package is auditor-ready.",
    file: { name: "PenTest-Report-Q1-2026.pdf", size: "8.2 MB", type: "PDF" },
    comments: [
      { author: "Sarah K.", initials: "SK", color: "bg-blue-500", text: "All three findings confirmed remediated by the IT team. Retest evidence also attached.", when: "5 days ago" },
    ],
    timeline: [
      { event: "Pen test report uploaded", who: "Tom R.", when: "5 days ago" },
      { event: "Remediation evidence attached", who: "Sarah K.", when: "5 days ago" },
      { event: "Control status updated: Not Started → Implemented", who: "System", when: "5 days ago" },
    ],
  },
];

// ── Config ─────────────────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = { evidence: "Evidence", status: "Status Change", task: "Task", alert: "Alert" };
const typeBadgeColors: Record<string, string> = {
  evidence: "bg-blue-100 text-blue-700 border-blue-200",
  status:   "bg-green-100 text-green-700 border-green-200",
  task:     "bg-amber-100 text-amber-700 border-amber-200",
  alert:    "bg-red-100 text-red-700 border-red-200",
};
const typeIconColors: Record<string, string> = {
  evidence: "text-blue-600 bg-blue-50",
  status:   "text-green-600 bg-green-50",
  task:     "text-amber-600 bg-amber-50",
  alert:    "text-red-600 bg-red-50",
};
const iconMap: Record<string, React.ElementType> = { FileCheck2, CheckCircle2, Clock, AlertTriangle };
const FILTERS = ["All", "Evidence", "Status Change", "Task", "Alert"] as const;

// ── Detail Panel ───────────────────────────────────────────────────────────────

function DetailPanel({ item, onClose }: { item: ActivityItem; onClose: () => void }) {
  const Icon = iconMap[item.icon] ?? FileCheck2;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-start gap-3">
          <span className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${typeIconColors[item.type]}`}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeBadgeColors[item.type]}`}>
                {typeLabels[item.type]}
              </span>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Metadata grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-3 border-b border-border">
          {[
            { icon: User,      label: "Performed by",  value: item.who },
            { icon: Calendar,  label: "Date & time",   value: item.timestamp },
            { icon: BookOpen,  label: "Standard",      value: item.standard },
            { icon: Tag,       label: "Control ref.",  value: item.control },
          ].map(({ icon: Meta, label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Meta className="size-3" />{label}
              </p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}

          {/* Status change */}
          {item.prevStatus && item.newStatus && (
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Status change</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">{item.prevStatus}</span>
                <span className="text-muted-foreground text-xs">→</span>
                <span className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-medium">{item.newStatus}</span>
              </div>
            </div>
          )}

          {/* Attached file */}
          {item.file && (
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Paperclip className="size-3" />Attached file
              </p>
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="size-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                  <FileCheck2 className="size-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.file.type} · {item.file.size}</p>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
          <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
        </div>

        {/* Impact */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Compliance impact</p>
          <div className="flex items-start gap-2">
            <div className="size-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">{item.impact}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Timeline</p>
          <ol className="space-y-3">
            {item.timeline.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`size-2 rounded-full mt-1 ${i === 0 ? "bg-blue-500" : "bg-border"}`} />
                  {i < item.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1 min-h-[16px]" />}
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-xs text-foreground font-medium leading-snug">{t.event}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.who} · {t.when}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Comments */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
            <MessageSquare className="size-3" />Comments {item.comments.length > 0 && `(${item.comments.length})`}
          </p>
          {item.comments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {item.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`size-7 rounded-full ${c.color} flex items-center justify-center shrink-0`}>
                    <span className="text-[9px] font-bold text-white">{c.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-foreground">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.when}</span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment input */}
          <div className="mt-4 flex items-center gap-2">
            <div className="size-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">ME</span>
            </div>
            <input
              type="text"
              placeholder="Add a comment…"
              className="flex-1 text-xs bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function ActivityPageInner() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(highlightId);

  // Auto-open the highlighted item
  useEffect(() => {
    if (highlightId) setSelectedId(highlightId);
  }, [highlightId]);

  const filtered = activeFilter === "All"
    ? allActivity
    : allActivity.filter((a) => typeLabels[a.type] === activeFilter);

  const selectedItem = allActivity.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-1px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ArrowLeft className="size-4" /> Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-blue-500" />
            Activity Log
          </h1>
          <Badge variant="secondary" className="text-xs">{allActivity.length} events</Badge>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="size-3.5 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                activeFilter === f ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Body: list + detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity list */}
        <div className={`flex flex-col overflow-y-auto border-r border-border transition-all duration-200 ${selectedItem ? "w-[420px] shrink-0" : "flex-1"}`}>
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-2 border-b border-border bg-muted/30 shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Activity</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Standard</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">When</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-16">No activity matches this filter.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((activity) => {
                const Icon = iconMap[activity.icon] ?? FileCheck2;
                const isSelected = activity.id === selectedId;
                return (
                  <li key={activity.id}>
                    <button
                      onClick={() => setSelectedId(isSelected ? null : activity.id)}
                      className={`w-full text-left grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 transition-colors ${
                        isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Activity col */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${activity.iconClass}`}>
                          <Icon className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium leading-snug line-clamp-2 ${isSelected ? "text-blue-700" : "text-foreground"}`}>
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className={`size-4 rounded-full ${activity.whoColor} flex items-center justify-center`}>
                              <span className="text-[7px] font-bold text-white">{activity.whoInitials}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{activity.who}</span>
                          </div>
                        </div>
                      </div>

                      {/* Standard col */}
                      <div className="flex items-start pt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeBadgeColors[activity.type]}`}>
                          {activity.control}
                        </span>
                      </div>

                      {/* When col */}
                      <div className="flex items-start pt-1">
                        <span className="text-[10px] text-muted-foreground">{activity.when}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="flex-1 overflow-hidden bg-background animate-in slide-in-from-right-4 duration-200">
            <DetailPanel item={selectedItem} onClose={() => setSelectedId(null)} />
          </div>
        )}

        {/* Empty state when nothing selected */}
        {!selectedItem && (
          <div className="hidden lg:flex flex-col items-center justify-center gap-3 flex-1 text-center text-muted-foreground border-l border-border">
            <Activity className="size-10 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">Select an activity</p>
              <p className="text-xs mt-0.5">Click any row to view full details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityPageInner />
    </Suspense>
  );
}
