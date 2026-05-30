"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  Upload,
  Search,
  Grid3x3,
  List,
  ChevronDown,
  ChevronRight,
  X,
  FolderOpen,
  Folder,
  Check,
  Cloud,
  HardDrive,
  Plus,
  Tag,
  Calendar,
  User,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Filter,
  AlertTriangle,
  Link2,
  Loader2,
  BookOpen,
  Shield,
  Wand2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ISO_STANDARDS } from "@/lib/iso-data";
import { useOrg } from "@/lib/org-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  size: string;
  standard: string;
  standardCode: string;
  clause: string;
  control: string;
  controlTitle: string;
  taskId?: string;
  taskTitle?: string;
  uploadedBy: string;
  uploadedDate: string;
  classification: DataClassification;
  fileUrl?: string | null;
  description: string;
  tags: string[];
  source: "computer" | "onedrive" | "googledrive";
  expiresAt: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STD_CODE_MAP: Record<string, string> = {
  "ISO 27001": "ISO27001",
  "ISO 9001": "ISO9001",
  "ISO 14001": "ISO14001",
  "ISO 45001": "ISO45001",
  "ISO 42001": "ISO42001",
};

const SIDEBAR_TREE: Record<string, string[]> = {
  "ISO 27001": ["A.5", "A.6", "A.7", "A.8"],
  "ISO 9001": ["4", "5", "6", "8", "9", "10"],
  "ISO 14001": ["4", "6", "8"],
  "ISO 45001": ["5", "6", "8", "9"],
  "ISO 42001": ["4", "6", "8"],
};



// ── Helper functions ──────────────────────────────────────────────────────────

function getFileTypeColor(type: string): string {
  switch (type) {
    case "PDF": return "bg-red-100 text-red-700";
    case "XLSX": return "bg-green-100 text-green-700";
    case "DOCX": return "bg-blue-100 text-blue-700";
    case "PNG":
    case "JPG": return "bg-purple-100 text-purple-700";
    case "ZIP": return "bg-amber-100 text-amber-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

function getFileTypeIconColor(type: string): string {
  switch (type) {
    case "PDF": return "text-red-500";
    case "XLSX": return "text-green-500";
    case "DOCX": return "text-blue-500";
    case "PNG":
    case "JPG": return "text-purple-500";
    case "ZIP": return "text-amber-500";
    default: return "text-slate-400";
  }
}

const CLASSIFICATION_CFG: Record<DataClassification, { label: string; className: string }> = {
  PUBLIC:       { label: "Public",       className: "bg-green-100 text-green-700 border-green-200" },
  INTERNAL:     { label: "Internal",     className: "bg-blue-100 text-blue-700 border-blue-200" },
  CONFIDENTIAL: { label: "Confidential", className: "bg-amber-100 text-amber-700 border-amber-200" },
  RESTRICTED:   { label: "Restricted",   className: "bg-red-100 text-red-700 border-red-200" },
};

function SourceIcon({ source }: { source: EvidenceItem["source"] }) {
  if (source === "computer") return <HardDrive className="size-3 text-slate-400" />;
  if (source === "onedrive") return <Cloud className="size-3 text-blue-400" />;
  return <Cloud className="size-3 text-red-400" />;
}

// ── Classification badge ──────────────────────────────────────────────────────

function ClassificationBadge({ classification }: { classification: DataClassification }) {
  const cfg = CLASSIFICATION_CFG[classification];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Expiry chip ───────────────────────────────────────────────────────────────

function ExpiryChip({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return null;
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
  let cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let label: string;
  if (days < 0) {
    cls = "bg-red-50 text-red-700 border-red-200";
    label = `Expired ${-days}d ago`;
  } else if (days === 0) {
    cls = "bg-red-50 text-red-700 border-red-200";
    label = "Expires today";
  } else if (days <= 7) {
    cls = "bg-red-50 text-red-700 border-red-200";
    label = `Expires in ${days}d`;
  } else if (days <= 30) {
    cls = "bg-amber-50 text-amber-700 border-amber-200";
    label = `Expires in ${days}d`;
  } else {
    label = `Expires in ${days}d`;
  }
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

// ── Left Sidebar ──────────────────────────────────────────────────────────────

type QuickFilter = "all" | "recent" | "my_uploads" | "confidential";

interface SidebarNavProps {
  quickFilter: QuickFilter;
  setQuickFilter: (f: QuickFilter) => void;
  selectedStandard: string | null;
  selectedClause: string | null;
  onSelectStandard: (std: string | null, clause: string | null) => void;
  evidence: EvidenceItem[];
}

function SidebarNav({
  quickFilter,
  setQuickFilter,
  selectedStandard,
  selectedClause,
  onSelectStandard,
  evidence,
}: SidebarNavProps) {
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(
    new Set(["ISO 27001"])
  );

  function toggleStandard(std: string) {
    setExpandedStandards((prev) => {
      const next = new Set(prev);
      if (next.has(std)) next.delete(std);
      else next.add(std);
      return next;
    });
  }

  function clauseCount(std: string, clause: string) {
    return evidence.filter((e) => e.standard === std && e.clause === clause).length;
  }

  function standardCount(std: string) {
    return evidence.filter((e) => e.standard === std).length;
  }

  const quickLinks: { id: QuickFilter; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All Evidence", icon: BookOpen },
    { id: "recent", label: "Recent", icon: Calendar },
    { id: "my_uploads", label: "My Uploads", icon: User },
    { id: "confidential", label: "Confidential", icon: Shield },
  ];

  return (
    <div className="w-60 shrink-0 border-r border-border bg-muted/20 flex flex-col overflow-y-auto">
      {/* Quick links */}
      <div className="p-3 border-b border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
          Quick Filters
        </p>
        <nav className="space-y-0.5">
          {quickLinks.map(({ id, label, icon: Icon }) => {
            const isActive = quickFilter === id && !selectedStandard;
            return (
              <button
                key={id}
                onClick={() => {
                  setQuickFilter(id);
                  onSelectStandard(null, null);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate">{label}</span>
                {id === "confidential" && (
                  <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-1 rounded">
                    {evidence.filter((e) => e.classification === "CONFIDENTIAL" || e.classification === "RESTRICTED").length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Standards tree */}
      <div className="p-3 flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
          Standards
        </p>
        <nav className="space-y-0.5">
          {Object.entries(SIDEBAR_TREE).map(([std, clauses]) => {
            const isExpanded = expandedStandards.has(std);
            const isStdSelected = selectedStandard === std && !selectedClause;
            const count = standardCount(std);

            return (
              <div key={std}>
                {/* Standard row */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStandard(std)}
                    className="flex items-center justify-center size-4 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSelectStandard(std, null);
                      setQuickFilter("all");
                    }}
                    className={`flex-1 flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-sm transition-colors text-left ${
                      isStdSelected
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Shield className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-[13px]">{std}</span>
                    {count > 0 && (
                      <span className="ml-auto text-[10px] text-muted-foreground">{count}</span>
                    )}
                  </button>
                </div>

                {/* Clause rows */}
                {isExpanded && (
                  <div className="ml-5 mt-0.5 space-y-0.5">
                    {clauses.map((clause) => {
                      const isClauseSelected =
                        selectedStandard === std && selectedClause === clause;
                      const cCount = clauseCount(std, clause);
                      return (
                        <button
                          key={clause}
                          onClick={() => {
                            onSelectStandard(std, clause);
                            setQuickFilter("all");
                          }}
                          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] transition-colors text-left ${
                            isClauseSelected
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {cCount > 0 ? (
                            <FolderOpen className="size-3 shrink-0" />
                          ) : (
                            <Folder className="size-3 shrink-0" />
                          )}
                          <span>{clause}</span>
                          {cCount > 0 && (
                            <span className="ml-auto text-[10px]">{cCount}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ── Evidence card (grid view) ─────────────────────────────────────────────────

function EvidenceCard({
  item,
  onClick,
  selected,
}: {
  item: EvidenceItem;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:ring-2 hover:ring-blue-300 ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      size="sm"
    >
      <CardContent className="pt-3">
        <div className="flex items-start gap-2">
          <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 bg-muted`}>
            <FileText className={`size-4 ${getFileTypeIconColor(item.type)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
              {item.name}
            </p>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getFileTypeColor(item.type)}`}
              >
                {item.type}
              </span>
              <span className="text-[10px] text-muted-foreground">{item.size}</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {item.control}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">{item.controlTitle}</span>
          </div>

          {item.taskTitle && (
            <div className="flex items-center gap-1">
              <Link2 className="size-2.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">{item.taskTitle}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex items-center gap-1 flex-wrap">
              <ClassificationBadge classification={item.classification} />
              <ExpiryChip expiresAt={item.expiresAt} />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <SourceIcon source={item.source} />
              <span>{item.uploadedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="size-2.5 shrink-0" />
            <span>{item.uploadedBy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Evidence list row ─────────────────────────────────────────────────────────

function EvidenceRow({
  item,
  onClick,
  selected,
}: {
  item: EvidenceItem;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        selected ? "bg-blue-50 ring-1 ring-blue-300" : ""
      }`}
    >
      <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <FileText className={`size-3.5 ${getFileTypeIconColor(item.type)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1 rounded">
            {item.control}
          </span>
          {item.taskTitle && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
              ↗ {item.taskTitle}
            </span>
          )}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground">{item.uploadedBy}</span>
        <span className="text-[10px] text-muted-foreground">{item.uploadedDate}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getFileTypeColor(item.type)}`}>
          {item.type}
        </span>
        <ClassificationBadge classification={item.classification} />
        <ExpiryChip expiresAt={item.expiresAt} />
        <SourceIcon source={item.source} />
      </div>
    </div>
  );
}

// ── Right preview panel ───────────────────────────────────────────────────────


interface RevisionEntry {
  version: string;
  date: string;
  by: string;
  note: string;
}

function PreviewPanel({
  item,
  onClose,
  canEdit,
  panelWidth,
  onResizeStart,
}: {
  item: EvidenceItem;
  onClose: () => void;
  canEdit: boolean;
  panelWidth: number;
  onResizeStart: (e: React.MouseEvent) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDescription, setEditDescription] = useState(item.description);
  const [editClassification, setEditClassification] = useState<DataClassification>(item.classification);
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);

  useEffect(() => {
    fetch(`/api/evidence/${item.id}`)
      .then((r) => r.json())
      .then(({ history }) => { if (Array.isArray(history)) setRevisions(history); })
      .catch(() => {});
  }, [item.id]);

  return (
    <div className="shrink-0 border-l border-border bg-background flex flex-col overflow-hidden relative" style={{ width: panelWidth }}>
      {/* Resize handle — drag left edge */}
      <div
        onMouseDown={onResizeStart}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors"
      />

      {/* Header */}
      <div className="flex items-start gap-2 px-4 py-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <FileText className={`size-4 shrink-0 ${getFileTypeIconColor(item.type)}`} />
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {item.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && !editMode && (
            <button
              onClick={() => {
                setEditName(item.name);
                setEditDescription(item.description);
                setEditClassification(item.classification);
                setEditMode(true);
              }}
              className="size-6 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Eye className="size-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="size-6 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {editMode ? (
          <div className="px-4 py-3 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Edit Evidence
            </p>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Classification</label>
              <select
                value={editClassification}
                onChange={(e) => setEditClassification(e.target.value as DataClassification)}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" onClick={() => setEditMode(false)}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
        {/* File details */}
        <section className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            File Details
          </p>
          <dl className="space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getFileTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-muted-foreground">Size</dt>
              <dd className="text-xs text-foreground">{item.size}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-muted-foreground">Source</dt>
              <dd className="flex items-center gap-1 text-xs text-foreground">
                <SourceIcon source={item.source} />
                <span className="capitalize">{item.source === "googledrive" ? "Google Drive" : item.source === "onedrive" ? "OneDrive" : "Computer"}</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-muted-foreground">Uploaded by</dt>
              <dd className="text-xs text-foreground">{item.uploadedBy}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-muted-foreground">Uploaded</dt>
              <dd className="text-xs text-foreground">{item.uploadedDate}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-xs text-muted-foreground">Classification</dt>
              <dd><ClassificationBadge classification={item.classification} /></dd>
            </div>
          </dl>
          {item.fileUrl ? (
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm transition-colors mt-2">
              <Download className="size-4 text-blue-600 shrink-0" />
              <span>Open / Download file</span>
            </a>
          ) : (
            <p className="text-xs text-muted-foreground italic mt-2">No file attached — upload a file to enable download</p>
          )}
        </section>

        {/* Linked standard & control */}
        <section className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Linked Standard & Control
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Shield className="size-3.5 text-blue-500 shrink-0" />
              <span className="text-xs font-medium text-foreground">{item.standard}</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">{item.control}</p>
                <p className="text-[11px] text-muted-foreground">{item.controlTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Clause:</span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1 rounded">{item.clause}</span>
            </div>
          </div>
        </section>

        {/* Linked task */}
        {item.taskTitle && (
          <section className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Linked Task
            </p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Link2 className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground">{item.taskTitle}</span>
            </div>
          </section>
        )}

        {/* Description */}
        <section className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Description
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
        </section>

        {/* Tags */}
        {item.tags.length > 0 && (
          <section className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                >
                  <Tag className="size-2" />
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Revision history */}
        <section className="px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Revision History
          </p>
          <div className="space-y-2">
            {revisions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No history yet.</p>
            ) : (
              revisions.map((rev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">
                    {rev.version}
                  </span>
                  <div>
                    <p className="text-[11px] text-foreground">{rev.note}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {rev.by} · {rev.date}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <Button size="sm" className="flex-1 gap-1">
          <Download className="size-3.5" />
          Download
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <RefreshCw className="size-3.5" />
          Replace
        </Button>
        <Button variant="destructive" size="icon-sm">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────

type UploadTab = "computer" | "onedrive" | "googledrive";
type UploadStep = 1 | 2;

interface SelectedFile {
  name: string;
  size: string;
}

type ProjectOption = { id: string; name: string; standardCode: string };

function UploadModal({ onClose, onUploaded, projects }: { onClose: () => void; onUploaded: () => void; projects: ProjectOption[] }) {
  const [step, setStep] = useState<UploadStep>(1);
  const [activeTab, setActiveTab] = useState<UploadTab>("computer");
  const [selectedCloudFiles, setSelectedCloudFiles] = useState<Set<string>>(new Set());
  const [localFiles, setLocalFiles] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 fields
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [selectedControl, setSelectedControl] = useState("");
  const [description, setDescription] = useState("");
  const [classification, setClassification] = useState<"PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED">("INTERNAL");
  const [expiresAt, setExpiresAt] = useState(""); // YYYY-MM-DD
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Cross-framework mapping hint: if the selected control has equivalence
  // mappings to controls in other standards the org has projects for, offer
  // to also upload this evidence against the mapped control.
  interface MappingHint {
    mappingId: string;
    mappingType: "EQUIVALENT" | "SIMILAR" | "RELATED";
    targetControlRef: string;
    targetControlTitle: string;
    targetStandardCode: string;
    targetStandardName: string;
    candidateProjectId: string | null;
    candidateProjectName: string | null;
  }
  const [mappingHints, setMappingHints] = useState<MappingHint[]>([]);
  const [enabledHintIds, setEnabledHintIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMappingHints([]);
    setEnabledHintIds(new Set());
    if (!selectedProjectId || !selectedControl) return;
    const ac = new AbortController();
    fetch(`/api/evidence/mapping-suggestions?projectId=${encodeURIComponent(selectedProjectId)}&controlRef=${encodeURIComponent(selectedControl)}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => setMappingHints(d.suggestions ?? []))
      .catch(() => {});
    return () => ac.abort();
  }, [selectedProjectId, selectedControl]);

  function toggleHint(id: string) {
    setEnabledHintIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const stdData = ISO_STANDARDS.find((s) => s.code === selectedProject?.standardCode);

  function toggleCloudFile(name: string) {
    setSelectedCloudFiles((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setLocalFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: `${Math.round(f.size / 1024)} KB` })),
    ]);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setLocalFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: `${Math.round(f.size / 1024)} KB` })),
    ]);
  }

  function removeLocalFile(name: string) {
    setLocalFiles((prev) => prev.filter((f) => f.name !== name));
  }

  const canProceed =
    (activeTab === "computer" && localFiles.length > 0) ||
    ((activeTab === "onedrive" || activeTab === "googledrive") && selectedCloudFiles.size > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Upload Evidence</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  step === 1 ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                }`}
              >
                1 · Select File
              </span>
              <ChevronRight className="size-3 text-muted-foreground" />
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  step === 2 ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                }`}
              >
                2 · Link & Metadata
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && (
            <div>
              {/* Source tabs */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
                {(["computer", "onedrive", "googledrive"] as UploadTab[]).map((tab) => {
                  const labels: Record<UploadTab, string> = {
                    computer: "From Computer",
                    onedrive: "OneDrive",
                    googledrive: "Google Drive",
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSelectedCloudFiles(new Set());
                      }}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Computer tab */}
              {activeTab === "computer" && (
                <div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      dragging
                        ? "border-blue-400 bg-blue-50"
                        : "border-border hover:border-blue-300 hover:bg-muted/30"
                    }`}
                  >
                    <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Drop files here or Browse</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      PDF, DOCX, XLSX, PNG, JPG, ZIP
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.zip"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>

                  {localFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {localFiles.map((f) => (
                        <div
                          key={f.name}
                          className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg"
                        >
                          <FileText className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-xs text-foreground truncate">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground">{f.size}</span>
                          <button
                            onClick={() => removeLocalFile(f.name)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OneDrive tab */}
              {activeTab === "onedrive" && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Cloud className="size-6 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">OneDrive Integration</p>
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      OneDrive import will be available in an upcoming release.
                      <br />Upload files directly from your computer in the meantime.
                    </p>
                  </div>
                </div>
              )}

              {/* Google Drive tab */}
              {activeTab === "googledrive" && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="size-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <Cloud className="size-6 text-red-400" />
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">Google Drive Integration</p>
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Google Drive import will be available in an upcoming release.
                      <br />Upload files directly from your computer in the meantime.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Project */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                {projects.length === 0 ? (
                  <p className="text-xs text-amber-600">No active projects. Create a project first.</p>
                ) : (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedControl(""); }}
                    className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.standardCode})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Control ref */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Control Reference <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedControl}
                  onChange={(e) => setSelectedControl(e.target.value)}
                  disabled={!selectedProjectId || !stdData}
                  className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select control...</option>
                  {stdData?.clauses.map((clause) => (
                    <optgroup key={clause.number} label={`${clause.number} — ${clause.title}`}>
                      {clause.controls.map((ctrl) => (
                        <option key={ctrl.ref} value={ctrl.ref}>
                          {ctrl.ref} — {ctrl.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Cross-framework mapping hint */}
              {mappingHints.length > 0 && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="size-3.5 text-violet-600" />
                    <p className="text-xs font-semibold text-violet-900">Suggest this mapping?</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    This control has cross-framework mappings. Also upload the same evidence to:
                  </p>
                  <div className="space-y-1.5">
                    {mappingHints.map((h) => {
                      const enabled = enabledHintIds.has(h.mappingId);
                      const disabled = !h.candidateProjectId;
                      return (
                        <label key={h.mappingId} className={`flex items-start gap-2 px-2 py-1.5 rounded-lg border ${enabled ? "border-violet-400 bg-background" : "border-transparent"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-background"}`}>
                          <input type="checkbox"
                            checked={enabled}
                            disabled={disabled}
                            onChange={() => toggleHint(h.mappingId)}
                            className="mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-foreground">
                              <span className="font-mono">{h.targetStandardCode}</span> · <span className="font-medium">{h.targetControlRef}</span> — {h.targetControlTitle}
                              <span className="ml-1 text-[10px] uppercase tracking-wide text-violet-700 font-semibold">({h.mappingType})</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {h.candidateProjectName
                                ? `Will be added to project: ${h.candidateProjectName}`
                                : "No active project for this standard — create one to enable."}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of this evidence..."
                  className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Expiry date (optional) */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Expires on <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Used for renewal alerts — leave blank for evidence that doesn&apos;t expire.
                </p>
              </div>

              {/* Classification */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  Classification
                </label>
                <div className="flex flex-wrap gap-3">
                  {(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"] as const).map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="classification"
                        value={c}
                        checked={classification === c}
                        onChange={() => setClassification(c)}
                      />
                      <span className="text-sm text-foreground capitalize">{c.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="size-3.5 shrink-0" />{uploadError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-border flex items-center gap-2 justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            {step === 1 && (
              <Button
                size="sm"
                disabled={!canProceed}
                onClick={() => setStep(2)}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            )}
            {step === 2 && (
              <Button
                size="sm"
                disabled={!selectedProjectId || !selectedControl || uploading || projects.length === 0}
                onClick={async () => {
                  setUploading(true);
                  setUploadError("");
                  const fileName = localFiles[0]?.name ?? [...selectedCloudFiles][0] ?? "Evidence document";
                  const basePayload = {
                    name: fileName,
                    description: description || undefined,
                    fileType: fileName.split(".").pop()?.toUpperCase(),
                    classification,
                    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
                  };
                  try {
                    const primary = await fetch("/api/evidence", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ...basePayload,
                        projectId: selectedProjectId,
                        controlRef: selectedControl,
                      }),
                    });
                    const primaryData = await primary.json();
                    if (!primary.ok) {
                      setUploadError(primaryData.error ?? "Upload failed");
                      setUploading(false);
                      return;
                    }

                    // Fan out to any selected mapping suggestions. Failures here
                    // don't fail the primary upload — surface them as a warning.
                    const selectedHints = mappingHints.filter((h) =>
                      enabledHintIds.has(h.mappingId) && h.candidateProjectId,
                    );
                    if (selectedHints.length > 0) {
                      const results = await Promise.allSettled(
                        selectedHints.map((h) =>
                          fetch("/api/evidence", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              ...basePayload,
                              projectId: h.candidateProjectId,
                              controlRef: h.targetControlRef,
                            }),
                          }).then(async (r) => {
                            if (!r.ok) throw new Error((await r.json()).error ?? "Mapping upload failed");
                          }),
                        ),
                      );
                      const failed = results.filter((r) => r.status === "rejected").length;
                      if (failed > 0) {
                        setUploadError(`Primary uploaded, but ${failed} mapped upload${failed === 1 ? "" : "s"} failed.`);
                        setUploading(false);
                        return;
                      }
                    }

                    onUploaded();
                    onClose();
                  } catch {
                    setUploadError("Something went wrong. Please try again.");
                    setUploading(false);
                  }
                }}
              >
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EvidencePage() {
  const org = useOrg();
  const canEdit = org?.role === "OWNER" || org?.role === "ADMIN" || org?.role === "MEMBER";

  const [panelWidth, setPanelWidth] = useState(360);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(360);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartW.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return;
      const delta = dragStartX.current - ev.clientX;
      setPanelWidth(Math.min(Math.max(dragStartW.current + delta, 280), 700));
    }
    function onUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [panelWidth]);

  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(true);
  const [uploadProjects, setUploadProjects] = useState<ProjectOption[]>([]);

  function loadEvidence() {
    fetch("/api/evidence")
      .then((r) => r.json())
      .then((data) => {
        const mapped: EvidenceItem[] = (data.evidence ?? []).map((e: {
          id: string; name: string; description: string; fileType: string | null;
          fileSize: number | null; uploadedBy: string; createdAt: string;
          controlRef: string; controlTitle: string; standard: string; projectName: string;
          classification?: string; fileUrl?: string | null; expiresAt?: string | null;
        }) => ({
          id: e.id,
          name: e.name,
          type: e.fileType ?? "document",
          size: e.fileSize ? `${(e.fileSize / 1024).toFixed(0)} KB` : "—",
          uploadedBy: e.uploadedBy,
          uploadedDate: new Date(e.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
          classification: (e.classification as DataClassification) ?? "INTERNAL",
          fileUrl: e.fileUrl ?? null,
          standard: e.standard,
          standardCode: "",
          clause: "",
          control: e.controlRef,
          controlTitle: e.controlTitle,
          tags: [],
          source: "computer" as const,
          description: e.description,
          expiresAt: e.expiresAt ?? null,
        }));
        setEvidence(mapped);
        setLoadingEvidence(false);
      })
      .catch(() => setLoadingEvidence(false));
  }

  useEffect(() => {
    loadEvidence();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.projects ?? [])
          .filter((p: { status: string }) => p.status === "ACTIVE" || p.status === "IN_PROGRESS")
          .map((p: { id: string; name: string; standardCode: string }) => ({
            id: p.id,
            name: p.name,
            standardCode: p.standardCode,
          }));
        setUploadProjects(active);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [selectedClause, setSelectedClause] = useState<string | null>(null);

  const handleSelectNode = useCallback(
    (std: string | null, clause: string | null) => {
      setSelectedStandard(std);
      setSelectedClause(clause);
      setSelectedItem(null);
    },
    []
  );

  // Filtering
  const filtered = evidence.filter((item) => {
    // Search
    const q = search.toLowerCase();
    if (
      q &&
      !item.name.toLowerCase().includes(q) &&
      !item.control.toLowerCase().includes(q) &&
      !item.standard.toLowerCase().includes(q) &&
      !item.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      return false;
    }

    // Tree filter
    if (selectedStandard) {
      if (item.standard !== selectedStandard) return false;
      if (selectedClause && item.clause !== selectedClause) return false;
    }

    // Quick filter
    if (!selectedStandard) {
      if (quickFilter === "recent") {
        // show top 5 by upload order (already sorted by date in seed)
        const idx = evidence.indexOf(item);
        return idx < 5;
      }
      if (quickFilter === "my_uploads") {
        return item.uploadedBy === "Sarah K.";
      }
      if (quickFilter === "confidential") {
        return item.classification === "CONFIDENTIAL" || item.classification === "RESTRICTED";
      }
    }

    return true;
  });

  // Breadcrumb label
  function getBreadcrumb() {
    if (selectedStandard && selectedClause) {
      return `${selectedStandard} / Clause ${selectedClause}`;
    }
    if (selectedStandard) {
      return selectedStandard;
    }
    const labels: Record<QuickFilter, string> = {
      all: "All Evidence",
      recent: "Recent",
      my_uploads: "My Uploads",
      confidential: "Confidential",
    };
    return labels[quickFilter];
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-6">
      {/* Left sidebar */}
      <SidebarNav
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        selectedStandard={selectedStandard}
        selectedClause={selectedClause}
        onSelectStandard={handleSelectNode}
        evidence={evidence}
      />

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div className="border-b border-border bg-background px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {getBreadcrumb()}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              ({filtered.length} item{filtered.length !== 1 ? "s" : ""})
            </span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search evidence..."
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view"
            >
              <Grid3x3 className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List view"
            >
              <List className="size-3.5" />
            </button>
          </div>

          {/* Upload button */}
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Upload className="size-3.5" />
            Upload Evidence
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <Filter className="size-10 text-muted-foreground opacity-30 mb-3" />
              <p className="text-sm font-medium text-foreground">No evidence found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <EvidenceCard
                  key={item.id}
                  item={item}
                  onClick={() =>
                    setSelectedItem((prev) => (prev?.id === item.id ? null : item))
                  }
                  selected={selectedItem?.id === item.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <EvidenceRow
                  key={item.id}
                  item={item}
                  onClick={() =>
                    setSelectedItem((prev) => (prev?.id === item.id ? null : item))
                  }
                  selected={selectedItem?.id === item.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right preview panel */}
      {selectedItem && (
        <PreviewPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          canEdit={canEdit}
          panelWidth={panelWidth}
          onResizeStart={onResizeStart}
        />
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={loadEvidence}
          projects={uploadProjects}
        />
      )}
    </div>
  );
}
