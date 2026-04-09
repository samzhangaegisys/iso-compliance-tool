"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileCheck2, CheckCircle2, Clock, AlertTriangle,
  Activity, Filter, X, ExternalLink,
  MessageSquare, Paperclip, User, Calendar, Tag,
  BookOpen, ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityType = "evidence" | "task" | "comment" | "alert";

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  who: string;
  when: string;       // ISO date string
  standard: string;
  control: string;
  projectName: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  body: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ActivityType, string> = {
  evidence: "Evidence",
  task:     "Task",
  comment:  "Comment",
  alert:    "Alert",
};

const TYPE_ICON: Record<ActivityType, React.ElementType> = {
  evidence: FileCheck2,
  task:     Clock,
  comment:  MessageSquare,
  alert:    AlertTriangle,
};

const TYPE_ICON_CLASS: Record<ActivityType, string> = {
  evidence: "text-blue-600 bg-blue-50",
  task:     "text-amber-600 bg-amber-50",
  comment:  "text-purple-600 bg-purple-50",
  alert:    "text-red-600 bg-red-50",
};

const TYPE_BADGE_CLASS: Record<ActivityType, string> = {
  evidence: "bg-blue-100 text-blue-700 border-blue-200",
  task:     "bg-amber-100 text-amber-700 border-amber-200",
  comment:  "bg-purple-100 text-purple-700 border-purple-200",
  alert:    "bg-red-100 text-red-700 border-red-200",
};

const FILTERS = ["All", "Evidence", "Task", "Comment", "Alert"] as const;

// ── Detail Panel ───────────────────────────────────────────────────────────────

function DetailPanel({ item, onClose }: { item: ActivityItem; onClose: () => void }) {
  const Icon = TYPE_ICON[item.type] ?? FileCheck2;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-start gap-3">
          <span className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_ICON_CLASS[item.type]}`}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE_CLASS[item.type]}`}>
                {TYPE_LABELS[item.type]}
              </span>
              <span className="text-xs text-muted-foreground">{formatTimestamp(item.when)}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Metadata */}
        <div className="px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-3 border-b border-border">
          {[
            { icon: User,     label: "Performed by", value: item.who },
            { icon: Calendar, label: "Date & time",  value: formatTimestamp(item.when) },
            { icon: BookOpen, label: "Standard",     value: item.standard },
            { icon: Tag,      label: "Control ref",  value: item.control },
          ].map(({ icon: Meta, label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Meta className="size-3" />{label}
              </p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}

          <div className="col-span-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Project</p>
            <p className="text-sm font-medium text-foreground">{item.projectName}</p>
          </div>

          {/* Attached file */}
          {item.fileName && (
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Paperclip className="size-3" />Attached file
              </p>
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer">
                <div className="size-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                  <FileCheck2 className="size-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.fileName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.fileType ?? "File"}{item.fileSize ? ` · ${formatFileSize(item.fileSize)}` : ""}
                  </p>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Description / body */}
        {item.body && (
          <div className="px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {item.type === "comment" ? "Comment" : "Description"}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{item.body}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Timeline</p>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="size-2 rounded-full mt-1 bg-blue-500" />
              </div>
              <div className="pb-1 min-w-0">
                <p className="text-xs text-foreground font-medium leading-snug">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.who} · {formatTimestamp(item.when)}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground py-16">
      <Activity className="size-12 text-muted-foreground/20" />
      <div>
        <p className="text-sm font-medium">No activity yet</p>
        <p className="text-xs mt-1 text-muted-foreground/70">
          Activity is recorded when evidence is uploaded, tasks are created, or comments are added.
        </p>
      </div>
      <Link href="/projects">
        <Button size="sm" variant="outline" className="mt-2">Go to Projects</Button>
      </Link>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function ActivityPageInner() {
  const searchParams = useSearchParams();
  const highlightId  = searchParams.get("id");

  const [activity,     setActivity]     = useState<ActivityItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedId,   setSelectedId]   = useState<string | null>(highlightId);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => {
        setActivity(data.activity ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (highlightId) setSelectedId(highlightId);
  }, [highlightId]);

  const filtered = activeFilter === "All"
    ? activity
    : activity.filter((a) => TYPE_LABELS[a.type] === activeFilter);

  const selectedItem = activity.find((a) => a.id === selectedId) ?? null;

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
          {!loading && <Badge variant="secondary" className="text-xs">{activity.length} events</Badge>}
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

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="size-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading activity…</p>
          </div>
        </div>
      ) : activity.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Activity list */}
          <div className={`flex flex-col overflow-y-auto border-r border-border transition-all duration-200 ${selectedItem ? "w-[420px] shrink-0" : "flex-1"}`}>
            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-2 border-b border-border bg-muted/30 shrink-0">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Activity</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Control</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">When</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-16">
                No activity matches this filter.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => {
                  const Icon = TYPE_ICON[item.type] ?? FileCheck2;
                  const isSelected = item.id === selectedId;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setSelectedId(isSelected ? null : item.id)}
                        className={`w-full text-left grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 transition-colors ${
                          isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-muted/40"
                        }`}
                      >
                        {/* Activity col */}
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_ICON_CLASS[item.type]}`}>
                            <Icon className="size-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium leading-snug line-clamp-2 ${isSelected ? "text-blue-700" : "text-foreground"}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="size-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-[7px] font-bold text-white">{initials(item.who)}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{item.who}</span>
                            </div>
                          </div>
                        </div>

                        {/* Control col */}
                        <div className="flex items-start pt-0.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TYPE_BADGE_CLASS[item.type]}`}>
                            {item.control}
                          </span>
                        </div>

                        {/* When col */}
                        <div className="flex items-start pt-1">
                          <span className="text-[10px] text-muted-foreground">{timeAgo(item.when)}</span>
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

          {/* Empty detail placeholder */}
          {!selectedItem && (
            <div className="hidden lg:flex flex-col items-center justify-center gap-3 flex-1 text-center text-muted-foreground border-l border-border">
              <Activity className="size-10 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium">Select an activity</p>
                <p className="text-xs mt-0.5">Click any row to view details</p>
              </div>
            </div>
          )}
        </div>
      )}
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
