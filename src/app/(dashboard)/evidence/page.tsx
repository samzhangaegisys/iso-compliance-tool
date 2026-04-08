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

const ONEDRIVE_FILES = [
  { name: "ISO-27001-Policy-Package.pdf", size: "1.2 MB", modified: "Apr 5, 2026" },
  { name: "Access-Control-Review-Q1.xlsx", size: "245 KB", modified: "Apr 3, 2026" },
  { name: "Training-Completion-Records.pdf", size: "980 KB", modified: "Mar 28, 2026" },
  { name: "Risk-Treatment-Plan-2026.docx", size: "340 KB", modified: "Mar 20, 2026" },
  { name: "Supplier-Assessment-Forms.xlsx", size: "180 KB", modified: "Mar 15, 2026" },
  { name: "Incident-Response-Procedure.pdf", size: "560 KB", modified: "Feb 28, 2026" },
];

const GDRIVE_FILES = [
  { name: "Quality-Manual-v6-DRAFT.docx", size: "620 KB", modified: "Apr 6, 2026" },
  { name: "Management-Review-Minutes-Q1.pdf", size: "320 KB", modified: "Apr 2, 2026" },
  { name: "Internal-Audit-Checklist-9001.xlsx", size: "145 KB", modified: "Mar 25, 2026" },
  { name: "CAR-Register-2026.xlsx", size: "210 KB", modified: "Mar 18, 2026" },
  { name: "Environmental-Policy-Signed.pdf", size: "180 KB", modified: "Mar 10, 2026" },
  { name: "OH&S-Hazard-Register-2026.xlsx", size: "290 KB", modified: "Feb 20, 2026" },
];

const seedEvidence: EvidenceItem[] = [
  { id: "e1", name: "Information Security Policy v2.1.pdf", type: "PDF", size: "245 KB", standard: "ISO 27001", standardCode: "ISO27001", clause: "A.5", control: "A.5.1", controlTitle: "Policies for information security", taskId: "1", taskTitle: "Complete risk assessment documentation", uploadedBy: "Sarah K.", uploadedDate: "Apr 3, 2026", classification: "INTERNAL", fileUrl: null, description: "Board-approved ISMS policy including scope, objectives, and management commitment statement.", tags: ["policy", "ISMS", "board-approved"], source: "computer" },
  { id: "e2", name: "Access Control Matrix v3-DRAFT.xlsx", type: "XLSX", size: "310 KB", standard: "ISO 27001", standardCode: "ISO27001", clause: "A.5", control: "A.5.15", controlTitle: "Access control", taskId: "6", taskTitle: "Update access control matrix", uploadedBy: "Sarah K.", uploadedDate: "Apr 2, 2026", classification: "CONFIDENTIAL", fileUrl: null, description: "Updated user access matrix with role definitions and approvals pending.", tags: ["access-control", "draft"], source: "computer" },
  { id: "e3", name: "Security Awareness Training Records Q1 2026.pdf", type: "PDF", size: "1.2 MB", standard: "ISO 27001", standardCode: "ISO27001", clause: "A.6", control: "A.6.3", controlTitle: "Information security awareness, education and training", uploadedBy: "Tom R.", uploadedDate: "Apr 1, 2026", classification: "INTERNAL", fileUrl: null, description: "Completion records for Q1 2026 security awareness training — 47 of 48 staff completed.", tags: ["training", "awareness", "records"], source: "onedrive" },
  { id: "e4", name: "Endpoint MDM Enrollment Report.pdf", type: "PDF", size: "890 KB", standard: "ISO 27001", standardCode: "ISO27001", clause: "A.8", control: "A.8.1", controlTitle: "User endpoint devices", uploadedBy: "James O.", uploadedDate: "Mar 29, 2026", classification: "INTERNAL", fileUrl: null, description: "Microsoft Intune enrollment report showing 98% endpoint compliance.", tags: ["MDM", "endpoints", "Intune"], source: "computer" },
  { id: "e5", name: "Vulnerability Scan Report March 2026.pdf", type: "PDF", size: "2.1 MB", standard: "ISO 27001", standardCode: "ISO27001", clause: "A.8", control: "A.8.8", controlTitle: "Management of technical vulnerabilities", uploadedBy: "James O.", uploadedDate: "Mar 28, 2026", classification: "RESTRICTED", fileUrl: null, description: "Qualys scan report — 2 HIGH findings require patch evidence before approval.", tags: ["vulnerability", "scan", "Qualys"], source: "computer" },
  { id: "e6", name: "Quality Manual v5.0.docx", type: "DOCX", size: "560 KB", standard: "ISO 9001", standardCode: "ISO9001", clause: "5", control: "5.2", controlTitle: "Quality policy", uploadedBy: "Sarah K.", uploadedDate: "Mar 28, 2026", classification: "PUBLIC", fileUrl: null, description: "Current quality manual including quality policy signed by CEO.", tags: ["quality", "manual", "policy"], source: "googledrive" },
  { id: "e7", name: "Risk Register Q1 2026.xlsx", type: "XLSX", size: "198 KB", standard: "ISO 9001", standardCode: "ISO9001", clause: "6", control: "6.1", controlTitle: "Actions to address risks and opportunities", uploadedBy: "Tom R.", uploadedDate: "Mar 22, 2026", classification: "CONFIDENTIAL", fileUrl: null, description: "Q1 2026 risk register with updated likelihood/impact scores and treatment actions.", tags: ["risk", "register", "Q1"], source: "computer" },
  { id: "e8", name: "Supplier Evaluation Forms 2026.xlsx", type: "XLSX", size: "145 KB", standard: "ISO 9001", standardCode: "ISO9001", clause: "8", control: "8.4", controlTitle: "Control of externally provided processes", uploadedBy: "James O.", uploadedDate: "Mar 20, 2026", classification: "INTERNAL", fileUrl: null, description: "Annual supplier evaluation forms for all Tier 1 suppliers.", tags: ["supplier", "evaluation"], source: "onedrive" },
  { id: "e9", name: "Environmental Aspects Register v4.xlsx", type: "XLSX", size: "210 KB", standard: "ISO 14001", standardCode: "ISO14001", clause: "6", control: "6.1.2", controlTitle: "Environmental aspects", taskId: "2", taskTitle: "Update environmental aspects register", uploadedBy: "Tom R.", uploadedDate: "Mar 15, 2026", classification: "INTERNAL", fileUrl: null, description: "Environmental aspects and impacts register — pending Q1 operational updates.", tags: ["environmental", "aspects", "register"], source: "computer" },
  { id: "e10", name: "Emergency Response Plan 2026.pdf", type: "PDF", size: "890 KB", standard: "ISO 14001", standardCode: "ISO14001", clause: "8", control: "8.2", controlTitle: "Emergency preparedness and response", uploadedBy: "Tom R.", uploadedDate: "Feb 28, 2026", classification: "PUBLIC", fileUrl: null, description: "Updated emergency response plan including new warehouse procedures.", tags: ["emergency", "response", "plan"], source: "computer" },
];

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
            <ClassificationBadge classification={item.classification} />
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
        <SourceIcon source={item.source} />
      </div>
    </div>
  );
}

// ── Right preview panel ───────────────────────────────────────────────────────

const MOCK_REVISIONS = [
  { version: "v2.1", date: "Apr 3, 2026", by: "Sarah K.", note: "Updated scope section" },
  { version: "v2.0", date: "Jan 10, 2026", by: "Admin", note: "Annual review — no changes" },
  { version: "v1.0", date: "Mar 15, 2025", by: "Sarah K.", note: "Initial upload" },
];

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
            {MOCK_REVISIONS.map((rev, i) => (
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
            ))}
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
type CloudState = "idle" | "connecting" | "connected";
type UploadStep = 1 | 2;

interface CloudFile {
  name: string;
  size: string;
  modified: string;
}

interface SelectedFile {
  name: string;
  size: string;
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UploadStep>(1);
  const [activeTab, setActiveTab] = useState<UploadTab>("computer");
  const [oneDriveState, setOneDriveState] = useState<CloudState>("idle");
  const [gDriveState, setGDriveState] = useState<CloudState>("idle");
  const [selectedCloudFiles, setSelectedCloudFiles] = useState<Set<string>>(new Set());
  const [localFiles, setLocalFiles] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 fields
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedControl, setSelectedControl] = useState("");
  const [linkedTask, setLinkedTask] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"pending_review" | "approved">("pending_review");

  const standardOptions = Object.keys(STD_CODE_MAP);
  const stdData = ISO_STANDARDS.find((s) => s.code === STD_CODE_MAP[selectedStandard]);

  function handleConnectOneDrive() {
    setOneDriveState("connecting");
    setTimeout(() => setOneDriveState("connected"), 1500);
  }

  function handleConnectGDrive() {
    setGDriveState("connecting");
    setTimeout(() => setGDriveState("connected"), 1500);
  }

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

  function CloudFileBrowser({ files, state }: { files: CloudFile[]; state: CloudState }) {
    if (state === "idle") return null;
    if (state === "connecting") {
      return (
        <div className="mt-4 flex flex-col items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-blue-500" />
          <span>Authenticating with Microsoft...</span>
        </div>
      );
    }
    return (
      <div className="mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <FolderOpen className="size-3" />
          <span>OneDrive / Compliance Documents</span>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
          {files.map((f) => (
            <label
              key={f.name}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCloudFiles.has(f.name)}
                onChange={() => toggleCloudFile(f.name)}
                className="rounded"
              />
              <FileText className="size-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-xs text-foreground truncate">{f.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{f.size}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{f.modified}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function GDriveFileBrowser({ files, state }: { files: CloudFile[]; state: CloudState }) {
    if (state === "idle") return null;
    if (state === "connecting") {
      return (
        <div className="mt-4 flex flex-col items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-red-500" />
          <span>Authenticating with Google...</span>
        </div>
      );
    }
    return (
      <div className="mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <FolderOpen className="size-3" />
          <span>My Drive / Compliance Documents</span>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
          {files.map((f) => (
            <label
              key={f.name}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCloudFiles.has(f.name)}
                onChange={() => toggleCloudFile(f.name)}
                className="rounded"
              />
              <FileText className="size-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-xs text-foreground truncate">{f.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{f.size}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{f.modified}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

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
                <div>
                  {oneDriveState === "idle" && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Cloud className="size-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Connect to OneDrive</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Browse and import files from your Microsoft OneDrive
                        </p>
                      </div>
                      <button
                        onClick={handleConnectOneDrive}
                        className="flex items-center gap-2 bg-[#0078D4] hover:bg-[#106EBE] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        <Cloud className="size-4" />
                        Sign in with Microsoft
                      </button>
                    </div>
                  )}
                  <CloudFileBrowser files={ONEDRIVE_FILES} state={oneDriveState} />
                </div>
              )}

              {/* Google Drive tab */}
              {activeTab === "googledrive" && (
                <div>
                  {gDriveState === "idle" && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="size-12 rounded-xl bg-red-50 flex items-center justify-center">
                        <Cloud className="size-6 text-red-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Connect to Google Drive</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Browse and import files from your Google Drive
                        </p>
                      </div>
                      <button
                        onClick={handleConnectGDrive}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 transition-colors shadow-sm"
                      >
                        {/* Google G icon inline SVG */}
                        <svg viewBox="0 0 24 24" className="size-4">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                      </button>
                    </div>
                  )}
                  <GDriveFileBrowser files={GDRIVE_FILES} state={gDriveState} />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Standard */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Standard <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStandard}
                  onChange={(e) => { setSelectedStandard(e.target.value); setSelectedControl(""); }}
                  className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select standard...</option>
                  {standardOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Control ref */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Control Reference <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedControl}
                  onChange={(e) => setSelectedControl(e.target.value)}
                  disabled={!selectedStandard}
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

              {/* Linked task */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Linked Task <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={linkedTask}
                  onChange={(e) => setLinkedTask(e.target.value)}
                  placeholder="e.g. Complete risk assessment documentation"
                  className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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

              {/* Tags */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Tags <span className="text-muted-foreground font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. policy, ISMS, approved"
                  className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {tagsInput && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        <Tag className="size-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="pending_review"
                      checked={uploadStatus === "pending_review"}
                      onChange={() => setUploadStatus("pending_review")}
                    />
                    <span className="text-sm text-foreground">Pending Review</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={uploadStatus === "approved"}
                      onChange={() => setUploadStatus("approved")}
                    />
                    <span className="text-sm text-foreground">Approved</span>
                  </label>
                </div>
              </div>
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
                disabled={!selectedStandard || !selectedControl}
                onClick={onClose}
              >
                <Upload className="size-3.5" />
                Upload
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

  useEffect(() => {
    fetch("/api/evidence")
      .then((r) => r.json())
      .then((data) => {
        const mapped: EvidenceItem[] = (data.evidence ?? []).map((e: {
          id: string; name: string; description: string; fileType: string | null;
          fileSize: number | null; uploadedBy: string; createdAt: string;
          controlRef: string; controlTitle: string; standard: string; projectName: string;
          classification?: string; fileUrl?: string | null;
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
        }));
        setEvidence(mapped);
        setLoadingEvidence(false);
      })
      .catch(() => setLoadingEvidence(false));
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
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
