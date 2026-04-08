"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ListTodo, Clock, User, X, CheckCircle2, Circle, Plus, Calendar,
  Tag, BookOpen, MessageSquare, Filter, Paperclip, ArrowLeft, Send,
  AtSign, Share2, Copy, Check, Pencil, ChevronDown, Link2,
  AlertCircle, AlertTriangle, Minus, MoreHorizontal, Eye, Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ISO_STANDARDS } from "@/lib/iso-data";

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status   = "Todo" | "In Progress" | "In Review" | "Done";

type Attachment = { id: string; name: string; size: string; mime: string };
type Subtask    = { id: string; title: string; done: boolean; assignee: string };
type Comment    = { id: string; author: string; initials: string; color: string; text: string; when: string; attachments: Attachment[] };

type CustomField = {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  value: string;
  options?: string[];
};

type TaskItem = {
  id: string;
  title: string;
  standard: string;
  control: string;
  dueDate: string;
  priority: Priority;
  assignee: string;
  assigneeInitials: string;
  assigneeColor: string;
  status: Status;
  description: string;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  createdBy: string;
  createdDate: string;
  watchers: string[];
  approvedBy?: string;
  approvalNote?: string;
  customFields?: CustomField[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: "Sarah K.",   initials: "SK", color: "bg-blue-500"    },
  { name: "James O.",   initials: "JO", color: "bg-emerald-500" },
  { name: "Tom R.",     initials: "TR", color: "bg-purple-500"  },
  { name: "Admin",      initials: "AD", color: "bg-slate-500"   },
  { name: "Unassigned", initials: "?",  color: "bg-slate-400"   },
];

const STANDARDS = ["ISO 27001", "ISO 9001", "ISO 14001", "ISO 45001", "ISO 42001"];

const COLUMNS: { id: Status; label: string; headerCls: string; dot: string }[] = [
  { id: "Todo",        label: "To Do",       headerCls: "bg-slate-100 text-slate-700",   dot: "bg-slate-400"    },
  { id: "In Progress", label: "In Progress", headerCls: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"     },
  { id: "In Review",   label: "In Review",   headerCls: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"    },
  { id: "Done",        label: "Done",        headerCls: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"  },
];

const PRIORITY_CFG: Record<Priority, { cls: string; icon: React.ElementType; dot: string }> = {
  CRITICAL: { cls: "bg-red-100 text-red-700 border-red-200",        icon: AlertCircle,   dot: "bg-red-600"     },
  HIGH:     { cls: "bg-orange-100 text-orange-700 border-orange-200",icon: AlertTriangle, dot: "bg-orange-400"  },
  MEDIUM:   { cls: "bg-amber-100 text-amber-700 border-amber-100",   icon: Minus,         dot: "bg-amber-400"   },
  LOW:      { cls: "bg-slate-100 text-slate-500 border-slate-200",   icon: Circle,        dot: "bg-slate-300"   },
};

const STATUS_CFG: Record<Status, { pill: string }> = {
  "Todo":        { pill: "bg-slate-100 text-slate-600 border-slate-200"      },
  "In Progress": { pill: "bg-blue-100 text-blue-700 border-blue-200"         },
  "In Review":   { pill: "bg-amber-100 text-amber-700 border-amber-200"      },
  "Done":        { pill: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const STD_CODE_MAP: Record<string, string> = {
  "ISO 27001": "ISO27001",
  "ISO 9001":  "ISO9001",
  "ISO 14001": "ISO14001",
  "ISO 45001": "ISO45001",
  "ISO 42001": "ISO42001",
};

const TODAY_TASKS = new Date("2026-04-07");

function isTaskOverdue(t: TaskItem) {
  if (!t.dueDate || t.status === "Done") return false;
  try { return new Date(t.dueDate) < TODAY_TASKS; } catch { return false; }
}

function fakeMime(name: string) {
  if (name.endsWith(".pdf"))  return "pdf";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "xlsx";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "docx";
  if (name.match(/\.(png|jpg|jpeg|gif)$/)) return "image";
  return "file";
}

// ── Seed data ─────────────────────────────────────────────────────────────────

// Status map from DB enum to local UI status
const DB_STATUS_MAP: Record<string, Status> = {
  TODO:        "Todo",
  IN_PROGRESS: "In Progress",
  DONE:        "Done",
};

const seedTasks: TaskItem[] = [
  {
    id: "1", title: "Complete risk assessment documentation", standard: "ISO 27001", control: "6.1.2",
    dueDate: "2026-04-12", priority: "HIGH", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500",
    status: "In Progress", createdBy: "Admin", createdDate: "Mar 15, 2026", watchers: ["James O.", "Admin"],
    description: "Review and finalise all risk assessment documentation including threat landscape, likelihood and impact ratings for all identified information assets. The risk register must be signed off by the CISO before submission.",
    subtasks: [
      { id: "s1", title: "Complete asset inventory spreadsheet", done: true,  assignee: "James O." },
      { id: "s2", title: "Score likelihood & impact for each asset", done: true,  assignee: "Sarah K." },
      { id: "s3", title: "Update risk treatment plan", done: false, assignee: "Sarah K." },
      { id: "s4", title: "Get CISO sign-off", done: false, assignee: "Admin" },
    ],
    attachments: [{ id: "a1", name: "Risk-Register-Draft-v1.xlsx", size: "420 KB", mime: "xlsx" }],
    comments: [
      { id: "c1", author: "James O.", initials: "JO", color: "bg-emerald-500", text: "I've started on the asset inventory. Should have a draft to you by EOD Thursday.", when: "2 days ago", attachments: [] },
      { id: "c2", author: "Sarah K.", initials: "SK", color: "bg-blue-500", text: "Thanks @James O. Reminder that we need CISO sign-off before uploading.", when: "1 day ago", attachments: [] },
    ],
  },
  {
    id: "2", title: "Update environmental aspects register", standard: "ISO 14001", control: "6.1.2",
    dueDate: "2026-04-15", priority: "MEDIUM", assignee: "Tom R.", assigneeInitials: "TR", assigneeColor: "bg-purple-500",
    status: "Todo", createdBy: "Admin", createdDate: "Mar 20, 2026", watchers: [],
    description: "Update the environmental aspects and impacts register to reflect operational changes in the warehouse and packaging line introduced in Q1 2026. Re-score significance ratings using the updated criteria in Procedure ENV-03.",
    subtasks: [
      { id: "s5", title: "Identify all new processes from Q1 changes", done: false, assignee: "Tom R." },
      { id: "s6", title: "Re-score significance ratings per ENV-03", done: false, assignee: "Tom R." },
    ],
    attachments: [],
    comments: [],
  },
  {
    id: "3", title: "Conduct internal audit for clause 9.2", standard: "ISO 9001", control: "9.2",
    dueDate: "2026-04-18", priority: "HIGH", assignee: "James O.", assigneeInitials: "JO", assigneeColor: "bg-emerald-500",
    status: "Todo", createdBy: "Admin", createdDate: "Mar 10, 2026", watchers: ["Admin"],
    description: "Plan and execute internal audit for clause 9.2 (Internal Audit). Prepare audit plan, checklists, and schedule interviews with process owners. Audit report must be completed within 5 business days of fieldwork completion.",
    subtasks: [
      { id: "s7", title: "Prepare audit plan and checklists", done: false, assignee: "James O." },
      { id: "s8", title: "Schedule process owner interviews", done: false, assignee: "James O." },
      { id: "s9", title: "Complete fieldwork", done: false, assignee: "James O." },
      { id: "s10", title: "Write and distribute audit report", done: false, assignee: "James O." },
    ],
    attachments: [{ id: "a2", name: "Internal-Audit-Plan-Template.docx", size: "85 KB", mime: "docx" }],
    comments: [
      { id: "c3", author: "Admin", initials: "AD", color: "bg-slate-500", text: "Auditor must be independent from the areas being audited per 9.2.2(b).", when: "1 week ago", attachments: [] },
    ],
  },
  {
    id: "4", title: "Review AI system impact assessment", standard: "ISO 42001", control: "6.1",
    dueDate: "2026-04-25", priority: "MEDIUM", assignee: "Unassigned", assigneeInitials: "?", assigneeColor: "bg-slate-400",
    status: "Todo", createdBy: "Admin", createdDate: "Apr 1, 2026", watchers: [],
    description: "Conduct impact assessment of AI systems in scope including the customer support chatbot and document classification model. Identify risks related to bias, transparency, explainability, and data governance per ISO 42001 Annex B.",
    subtasks: [
      { id: "s11", title: "Document all in-scope AI systems", done: false, assignee: "Unassigned" },
      { id: "s12", title: "Run bias risk assessment per Annex B", done: false, assignee: "Unassigned" },
    ],
    attachments: [],
    comments: [],
  },
  {
    id: "5", title: "Document corrective actions for non-conformances", standard: "ISO 9001", control: "10.2",
    dueDate: "2026-04-28", priority: "HIGH", assignee: "James O.", assigneeInitials: "JO", assigneeColor: "bg-emerald-500",
    status: "In Progress", createdBy: "Admin", createdDate: "Mar 25, 2026", watchers: ["Sarah K."],
    description: "Document and close out all open corrective actions from the last management review. Update the CAR register, attach root cause analysis for each NC, and upload evidence of completion. 7 open CARs remain.",
    subtasks: [
      { id: "s13", title: "Assign root cause analysis to all 7 CARs", done: true,  assignee: "James O." },
      { id: "s14", title: "Close CAR-2026-001 through 005", done: true,  assignee: "James O." },
      { id: "s15", title: "Close CAR-2026-003 and CAR-2026-007", done: false, assignee: "James O." },
    ],
    attachments: [{ id: "a3", name: "CAR-Register-Apr-2026.xlsx", size: "210 KB", mime: "xlsx" }],
    comments: [
      { id: "c4", author: "James O.", initials: "JO", color: "bg-emerald-500", text: "5 of 7 CARs are now closed. Working on CAR-2026-003 and CAR-2026-007.", when: "3 days ago", attachments: [] },
    ],
  },
  {
    id: "6", title: "Update access control matrix", standard: "ISO 27001", control: "A.9.1",
    dueDate: "2026-05-02", priority: "HIGH", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500",
    status: "In Review", createdBy: "Admin", createdDate: "Apr 2, 2026", watchers: ["Admin"],
    description: "Review and update the user access control matrix. Ensure principle of least privilege is applied across all systems. All role assignments must be justified, approved by system owners, and documented in the ACM.",
    subtasks: [
      { id: "s16", title: "Review all user roles for least privilege", done: true,  assignee: "Sarah K." },
      { id: "s17", title: "Identify and remove orphaned accounts", done: true,  assignee: "Sarah K." },
      { id: "s18", title: "Obtain system owner approvals", done: false, assignee: "Admin" },
    ],
    attachments: [{ id: "a4", name: "Access-Control-Matrix-v3-DRAFT.xlsx", size: "310 KB", mime: "xlsx" }],
    comments: [
      { id: "c5", author: "Sarah K.", initials: "SK", color: "bg-blue-500", text: "Draft ACM submitted for review. Waiting on IT manager approval for the DevOps role definitions.", when: "Yesterday", attachments: [] },
      { id: "c6", author: "Admin", initials: "AD", color: "bg-slate-500", text: "Chasing IT manager — expect approval by COB today.", when: "5 hours ago", attachments: [] },
    ],
  },
  {
    id: "7", title: "Review and update ISMS Statement of Applicability", standard: "ISO 27001", control: "6.1.3",
    dueDate: "2026-05-12", priority: "CRITICAL", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500",
    status: "Todo", createdBy: "Admin", createdDate: "Apr 5, 2026", watchers: [],
    description: "Annual review of Statement of Applicability (SoA). Cross-check all Annex A controls against current risk treatment plan. Document justifications for all exclusions. SoA must be approved by the CISO and board.",
    subtasks: [
      { id: "s19", title: "Review all 93 Annex A controls", done: false, assignee: "Sarah K." },
      { id: "s20", title: "Document exclusion justifications", done: false, assignee: "Sarah K." },
      { id: "s21", title: "Get CISO and board approval", done: false, assignee: "Admin" },
    ],
    attachments: [],
    comments: [],
  },
  {
    id: "8", title: "Conduct H&S inspection of all work areas", standard: "ISO 45001", control: "9.1",
    dueDate: "2026-05-15", priority: "HIGH", assignee: "Tom R.", assigneeInitials: "TR", assigneeColor: "bg-purple-500",
    status: "Done", createdBy: "Admin", createdDate: "Mar 1, 2026", watchers: [],
    description: "Completed scheduled H&S inspection covering all office areas, server room, and warehouse. All findings raised as corrective actions. Inspection report signed off by HSE Manager on 1 Apr 2026.",
    subtasks: [
      { id: "s22", title: "Inspect office areas", done: true, assignee: "Tom R." },
      { id: "s23", title: "Inspect server room", done: true, assignee: "Tom R." },
      { id: "s24", title: "Raise CARs for findings", done: true, assignee: "Tom R." },
      { id: "s25", title: "Get HSE Manager sign-off", done: true, assignee: "Tom R." },
    ],
    attachments: [{ id: "a5", name: "HS-Inspection-Apr-2026.pdf", size: "1.2 MB", mime: "pdf" }],
    comments: [
      { id: "c7", author: "Tom R.", initials: "TR", color: "bg-purple-500", text: "Inspection completed. 2 minor findings — CARs raised and assigned.", when: "1 week ago", attachments: [] },
    ],
  },
  {
    id: "9", title: "Review supplier security assessments", standard: "ISO 27001", control: "A.5.23",
    dueDate: "2026-04-02", priority: "HIGH", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500",
    status: "In Progress", createdBy: "Admin", createdDate: "Mar 25, 2026", watchers: ["Admin"],
    description: "Review all third-party supplier security questionnaires and update the supplier risk register. Ensure all critical suppliers have completed the annual security assessment form.",
    subtasks: [
      { id: "s26", title: "Send questionnaires to all Tier 1 suppliers", done: true,  assignee: "Sarah K." },
      { id: "s27", title: "Chase outstanding responses (3 remaining)",   done: false, assignee: "Sarah K." },
      { id: "s28", title: "Update supplier risk register",               done: false, assignee: "Admin"    },
    ],
    attachments: [],
    comments: [
      { id: "c8", author: "Sarah K.", initials: "SK", color: "bg-blue-500", text: "3 suppliers have not responded yet. Following up today.", when: "1 day ago", attachments: [] },
    ],
  },
  {
    id: "10", title: "Submit Q1 compliance evidence package", standard: "ISO 9001", control: "9.1",
    dueDate: "2026-04-04", priority: "CRITICAL", assignee: "James O.", assigneeInitials: "JO", assigneeColor: "bg-emerald-500",
    status: "In Progress", createdBy: "Admin", createdDate: "Mar 20, 2026", watchers: ["Sarah K.", "Admin"],
    description: "Compile and submit the Q1 compliance evidence package to the external auditor. Package must include KPI reports, management review minutes, internal audit results, and CAR status.",
    subtasks: [
      { id: "s29", title: "Compile KPI reports for Q1",            done: true,  assignee: "James O." },
      { id: "s30", title: "Attach management review minutes",      done: true,  assignee: "Admin"    },
      { id: "s31", title: "Include internal audit results",        done: false, assignee: "James O." },
      { id: "s32", title: "Submit to external auditor portal",     done: false, assignee: "James O." },
    ],
    attachments: [{ id: "a6", name: "Q1-Evidence-Package-DRAFT.pdf", size: "2.4 MB", mime: "pdf" }],
    comments: [
      { id: "c9", author: "Admin", initials: "AD", color: "bg-slate-500", text: "This is now overdue. Escalating to management.", when: "3 days ago", attachments: [] },
    ],
  },
  {
    id: "11", title: "Complete environmental context review", standard: "ISO 14001", control: "4.1",
    dueDate: "2026-03-30", priority: "MEDIUM", assignee: "Tom R.", assigneeInitials: "TR", assigneeColor: "bg-purple-500",
    status: "Todo", createdBy: "Admin", createdDate: "Mar 10, 2026", watchers: [],
    description: "Review and update the environmental context analysis document to reflect changes in operations introduced in Q1. Identify any new environmental aspects arising from the new warehouse process.",
    subtasks: [
      { id: "s33", title: "Review existing context document",          done: false, assignee: "Tom R." },
      { id: "s34", title: "Identify new environmental aspects from Q1", done: false, assignee: "Tom R." },
      { id: "s35", title: "Update and circulate for approval",         done: false, assignee: "Tom R." },
    ],
    attachments: [],
    comments: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

function MimeIcon({ mime, className = "size-3.5" }: { mime: string; className?: string }) {
  const colors: Record<string, string> = { pdf: "text-red-500", xlsx: "text-green-600", docx: "text-blue-600", image: "text-purple-500", file: "text-slate-500" };
  return <Paperclip className={`${className} ${colors[mime] ?? colors.file}`} />;
}

function Avatar({ initials, color, size = "size-6" }: { initials: string; color: string; size?: string }) {
  return (
    <div className={`${size} rounded-full ${color} flex items-center justify-center shrink-0`}>
      <span className="text-[8px] font-bold text-white leading-none">{initials}</span>
    </div>
  );
}

// ── Inline field editor (click to edit) ──────────────────────────────────────

function InlineEdit({ value, onSave, multiline = false, placeholder = "Click to edit…", className = "" }: {
  value: string; onSave: (v: string) => void; multiline?: boolean; placeholder?: string; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  function commit() { setEditing(false); onSave(draft.trim() || value); }

  if (editing) {
    const shared = {
      ref: ref as React.RefObject<HTMLTextAreaElement & HTMLInputElement>,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
      },
      className: `w-full bg-white border border-blue-400 rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${className}`,
      autoComplete: "off",
    };
    return multiline
      ? <textarea {...shared} rows={4} style={{ resize: "vertical" }} />
      : <input {...shared} />;
  }

  return (
    <div onClick={() => setEditing(true)}
      className={`group cursor-pointer rounded-md px-2 py-1 -mx-2 -my-1 hover:bg-muted/60 transition-colors ${className}`}>
      {value
        ? <span className="text-sm text-foreground">{value}</span>
        : <span className="text-sm text-muted-foreground italic">{placeholder}</span>}
      <Pencil className="inline size-3 ml-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// ── Dropdown selector ─────────────────────────────────────────────────────────

function FieldDropdown<T extends string>({ value, options, renderOption, renderValue, onSelect, className = "" }: {
  value: T; options: T[]; renderOption: (v: T) => React.ReactNode; renderValue: (v: T) => React.ReactNode;
  onSelect: (v: T) => void; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer">
        {renderValue(value)}
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 min-w-[140px] bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onSelect(opt); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left text-sm ${opt === value ? "bg-blue-50" : ""}`}>
              {renderOption(opt)}
              {opt === value && <Check className="size-3 text-blue-500 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comment input with @ mention and attachment ───────────────────────────────

function CommentBox({ onSubmit }: { onSubmit: (text: string, attachments: Attachment[]) => void }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [mentionQ, setMentionQ] = useState<string | null>(null);
  const taRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    const m = val.slice(0, e.target.selectionStart).match(/@(\w*)$/);
    setMentionQ(m ? m[1] : null);
  }

  function insertMention(name: string) {
    const ta = taRef.current;
    if (!ta) return;
    const before = text.slice(0, ta.selectionStart).replace(/@\w*$/, `@${name} `);
    setText(before + text.slice(ta.selectionStart));
    setMentionQ(null);
    setTimeout(() => ta.focus(), 0);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((f) => [...f, ...picked.map((p) => ({
      id: String(Date.now() + Math.random()),
      name: p.name,
      size: p.size > 1048576 ? `${(p.size / 1048576).toFixed(1)} MB` : `${Math.round(p.size / 1024)} KB`,
      mime: fakeMime(p.name),
    }))]);
    e.target.value = "";
  }

  function submit() {
    if (!text.trim() && files.length === 0) return;
    onSubmit(text.trim(), files);
    setText(""); setFiles([]);
  }

  const members = mentionQ !== null
    ? TEAM_MEMBERS.filter((m) => m.name.toLowerCase().includes(mentionQ.toLowerCase()))
    : [];

  return (
    <div className="relative">
      {mentionQ !== null && members.length > 0 && (
        <div className="absolute bottom-full mb-1 left-0 z-20 w-44 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          {members.map((m) => (
            <button key={m.name} type="button" onMouseDown={(e) => { e.preventDefault(); insertMention(m.name); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors">
              <Avatar initials={m.initials} color={m.color} />
              <span className="text-xs">{m.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
        <textarea ref={taRef} value={text} onChange={handleChange}
          onKeyDown={(e) => { if (e.key === "Escape") setMentionQ(null); if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(); }}
          placeholder="Add a comment… Use @ to mention someone  ·  Ctrl+Enter to post"
          rows={3}
          className="w-full text-xs px-3 pt-2.5 pb-1 outline-none resize-none placeholder:text-muted-foreground bg-background" />

        {/* File chips */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1">
                <MimeIcon mime={f.mime} className="size-3" />
                <span className="text-[10px] font-medium max-w-[100px] truncate">{f.name}</span>
                <span className="text-[9px] text-muted-foreground">{f.size}</span>
                <button onClick={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))}
                  className="size-3 text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => { setText((t) => t + "@"); setMentionQ(""); setTimeout(() => taRef.current?.focus(), 0); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground hover:bg-muted transition-colors">
              <AtSign className="size-3" /> Mention
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground hover:bg-muted transition-colors">
              <Paperclip className="size-3" /> Attach
            </button>
          </div>
          <button type="button" onClick={submit} disabled={!text.trim() && files.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
            <Send className="size-3" /> Post
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Subtasks panel ────────────────────────────────────────────────────────────

function SubtaskPanel({ subtasks, onUpdate }: {
  subtasks: Subtask[];
  onUpdate: (subtasks: Subtask[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const done = subtasks.filter((s) => s.done).length;

  function toggle(id: string) {
    onUpdate(subtasks.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  }
  function addSubtask() {
    if (!draft.trim()) return;
    onUpdate([...subtasks, { id: String(Date.now()), title: draft.trim(), done: false, assignee: "Unassigned" }]);
    setDraft(""); setAdding(false);
  }
  function remove(id: string) {
    onUpdate(subtasks.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <ListTodo className="size-3" /> Subtasks
          {subtasks.length > 0 && (
            <span className="ml-1 font-normal text-muted-foreground">{done}/{subtasks.length}</span>
          )}
        </p>
        <button onClick={() => setAdding(true)} className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
          <Plus className="size-3" /> Add
        </button>
      </div>

      {subtasks.length > 0 && (
        <div className="mb-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden mb-2.5">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: subtasks.length ? `${(done / subtasks.length) * 100}%` : "0%" }} />
          </div>
          <div className="space-y-1">
            {subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2 group">
                <button onClick={() => toggle(s.id)}
                  className={`size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${s.done ? "bg-blue-600 border-blue-600" : "border-border hover:border-blue-400"}`}>
                  {s.done && <Check className="size-2.5 text-white" />}
                </button>
                <span className={`flex-1 text-xs leading-snug ${s.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {s.title}
                </span>
                {s.assignee !== "Unassigned" && (
                  <span className="text-[9px] text-muted-foreground shrink-0">{s.assignee.split(" ")[0]}</span>
                )}
                <button onClick={() => remove(s.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adding && (
        <div className="flex items-center gap-2 mt-2">
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addSubtask(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
            placeholder="Subtask title…"
            className="flex-1 text-xs bg-muted border border-border rounded-lg px-2 py-1.5 outline-none focus:border-blue-400" />
          <button onClick={addSubtask}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">Add</button>
          <button onClick={() => { setAdding(false); setDraft(""); }}
            className="px-2 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── Attachment manager ────────────────────────────────────────────────────────

function AttachmentManager({ attachments, onUpdate }: {
  attachments: Attachment[];
  onUpdate: (a: Attachment[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    onUpdate([...attachments, ...picked.map((f) => ({
      id: String(Date.now() + Math.random()),
      name: f.name,
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      mime: fakeMime(f.name),
    }))]);
    e.target.value = "";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Paperclip className="size-3" /> Attachments {attachments.length > 0 && `(${attachments.length})`}
        </p>
        <button onClick={() => fileRef.current?.click()}
          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
          <Plus className="size-3" /> Attach file
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((f) => (
            <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors group">
              <div className="size-7 rounded bg-background border border-border flex items-center justify-center shrink-0">
                <MimeIcon mime={f.mime} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{f.name}</p>
                <p className="text-[9px] text-muted-foreground">{f.size}</p>
              </div>
              <button onClick={() => onUpdate(attachments.filter((x) => x.id !== f.id))}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500">
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {attachments.length === 0 && (
        <button onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-lg py-3 text-[10px] text-muted-foreground hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5">
          <Paperclip className="size-3" /> Drop files or click to attach
        </button>
      )}
      <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Full-screen detail panel ──────────────────────────────────────────────────

function TaskDetail({ task, onClose, onUpdate }: {
  task: TaskItem;
  onClose: () => void;
  onUpdate: (updated: TaskItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showAddField, setShowAddField] = useState(false);

  function patch(changes: Partial<TaskItem>) {
    const updated = { ...task, ...changes };
    // Re-sync assignee metadata when assignee name changes
    if (changes.assignee) {
      const m = TEAM_MEMBERS.find((x) => x.name === changes.assignee);
      if (m) { updated.assigneeInitials = m.initials; updated.assigneeColor = m.color; }
    }
    onUpdate(updated);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.origin + `/tasks?id=${task.id}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function addComment(text: string, attachments: Attachment[]) {
    patch({
      comments: [...task.comments, {
        id: String(Date.now()), author: "Me", initials: "ME", color: "bg-blue-600",
        text, when: "Just now", attachments,
      }],
    });
  }

  function toggleWatcher() {
    const me = "Me";
    patch({
      watchers: task.watchers.includes(me)
        ? task.watchers.filter((w) => w !== me)
        : [...task.watchers, me],
    });
  }

  const PriorityIcon = PRIORITY_CFG[task.priority].icon;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
            {task.standard} · {task.control}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Watch */}
          <button onClick={toggleWatcher} title={task.watchers.includes("Me") ? "Stop watching" : "Watch"}
            className={`p-1.5 rounded-lg transition-colors ${task.watchers.includes("Me") ? "text-blue-600 bg-blue-50" : "text-muted-foreground hover:bg-muted"}`}>
            <Eye className="size-3.5" />
          </button>
          {/* Share */}
          <button onClick={copyLink} title="Copy link"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1">
            {copied ? <><Check className="size-3.5 text-emerald-500" /><span className="text-[10px] text-emerald-600">Copied!</span></> : <><Share2 className="size-3.5" /><span className="text-[10px]">Share</span></>}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">

          {/* Title (editable) */}
          <div>
            <InlineEdit value={task.title}
              onSave={(v) => patch({ title: v })}
              className="text-base font-semibold leading-snug" />
          </div>

          {/* Status + Priority inline */}
          <div className="flex flex-wrap items-center gap-2">
            <FieldDropdown<Status>
              value={task.status}
              options={["Todo", "In Progress", "In Review", "Done"]}
              renderValue={(v) => <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_CFG[v].pill}`}>{v}</span>}
              renderOption={(v) => <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_CFG[v].pill}`}>{v}</span>}
              onSelect={(v) => patch({ status: v })}
            />
            <FieldDropdown<Priority>
              value={task.priority}
              options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
              renderValue={(v) => (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${PRIORITY_CFG[v].cls}`}>
                  <PriorityIcon className="size-3" />{v}
                </span>
              )}
              renderOption={(v) => {
                const Ic = PRIORITY_CFG[v].icon;
                return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${PRIORITY_CFG[v].cls}`}><Ic className="size-3" />{v}</span>;
              }}
              onSelect={(v) => patch({ priority: v })}
            />
          </div>

          <Separator />

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            {/* Assignee */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><User className="size-3" />Assignee</p>
              <FieldDropdown<string>
                value={task.assignee}
                options={TEAM_MEMBERS.map((m) => m.name)}
                renderValue={(v) => {
                  const m = TEAM_MEMBERS.find((x) => x.name === v)!;
                  return (
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={m.initials} color={m.color} />
                      <span className="text-xs font-medium text-foreground">{v}</span>
                    </div>
                  );
                }}
                renderOption={(v) => {
                  const m = TEAM_MEMBERS.find((x) => x.name === v)!;
                  return <div className="flex items-center gap-2"><Avatar initials={m.initials} color={m.color} /><span className="text-xs">{v}</span></div>;
                }}
                onSelect={(v) => patch({ assignee: v })}
              />
            </div>

            {/* Due date */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar className="size-3" />Due date</p>
              <input type="date" value={task.dueDate}
                onChange={(e) => patch({ dueDate: e.target.value })}
                className="text-xs font-medium bg-transparent border border-transparent hover:border-border focus:border-blue-400 rounded-md px-1.5 py-0.5 outline-none transition-colors cursor-pointer w-full" />
            </div>

            {/* Standard */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><BookOpen className="size-3" />Standard</p>
              <FieldDropdown<string>
                value={task.standard}
                options={STANDARDS}
                renderValue={(v) => <span className="text-xs font-medium text-foreground">{v}</span>}
                renderOption={(v) => <span className="text-xs">{v}</span>}
                onSelect={(v) => patch({ standard: v })}
              />
            </div>

            {/* Control */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><Tag className="size-3" />Control ref</p>
              <InlineEdit value={task.control} onSave={(v) => patch({ control: v })} placeholder="e.g. 6.1.2" />
            </div>

            {/* Created */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1"><User className="size-3" />Created by</p>
              <span className="text-xs font-medium text-foreground">{task.createdBy}</span>
            </div>

            {/* Watchers */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><Eye className="size-3" />Watchers</p>
              <div className="flex items-center gap-1 flex-wrap">
                {task.watchers.length === 0
                  ? <span className="text-xs text-muted-foreground italic">None</span>
                  : task.watchers.map((w) => {
                      const m = TEAM_MEMBERS.find((x) => x.name === w);
                      return m
                        ? <Avatar key={w} initials={m.initials} color={m.color} size="size-5" />
                        : <span key={w} className="text-xs">{w}</span>;
                    })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Description (editable) */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
            <InlineEdit value={task.description} multiline
              onSave={(v) => patch({ description: v })}
              placeholder="Add a description…" />
          </div>

          {/* Approval banner */}
          {task.approvedBy && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700">Approved by {task.approvedBy}</p>
                {task.approvalNote && <p className="text-[11px] text-emerald-600 truncate">{task.approvalNote}</p>}
              </div>
            </div>
          )}

          <Separator />

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Custom Fields</p>
              <button onClick={() => setShowAddField(true)}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
                <Plus className="size-3" /> Add field
              </button>
            </div>
            {(task.customFields ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground italic">No custom fields yet.</p>
            )}
            {(task.customFields ?? []).map((field) => (
              <div key={field.id} className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium text-foreground w-28 shrink-0">{field.label}</span>
                {field.type === "select" ? (
                  <select
                    value={field.value}
                    onChange={(e) => patch({ customFields: task.customFields?.map((f) => f.id === field.id ? { ...f, value: e.target.value } : f) })}
                    className="flex-1 text-xs bg-muted border border-border rounded-lg px-2 py-1 outline-none focus:border-blue-400 cursor-pointer">
                    <option value="">— Select —</option>
                    {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => patch({ customFields: task.customFields?.map((f) => f.id === field.id ? { ...f, value: e.target.value } : f) })}
                    className="flex-1 text-xs bg-muted border border-border rounded-lg px-2 py-1 outline-none focus:border-blue-400" />
                )}
                <button
                  onClick={() => patch({ customFields: task.customFields?.filter((f) => f.id !== field.id) })}
                  className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {showAddField && (
              <AddCustomFieldModal
                onAdd={(field) => {
                  patch({ customFields: [...(task.customFields ?? []), field] });
                  setShowAddField(false);
                }}
                onClose={() => setShowAddField(false)}
              />
            )}
          </div>

          <Separator />

          {/* Subtasks */}
          <SubtaskPanel subtasks={task.subtasks}
            onUpdate={(s) => patch({ subtasks: s })} />

          <Separator />

          {/* Attachments */}
          <AttachmentManager attachments={task.attachments}
            onUpdate={(a) => patch({ attachments: a })} />

          <Separator />

          {/* Comments */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <MessageSquare className="size-3" /> Activity
              {task.comments.length > 0 && ` · ${task.comments.length} comment${task.comments.length !== 1 ? "s" : ""}`}
            </p>

            {task.comments.length > 0 && (
              <div className="space-y-4 mb-4">
                {task.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <Avatar initials={c.initials} color={c.color} size="size-7" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{c.when}</span>
                      </div>
                      <div className="bg-muted/50 rounded-xl px-3 py-2">
                        <p className="text-xs text-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: c.text.replace(/@([\w .]+)/g, '<span class="text-blue-600 font-medium">@$1</span>') }}
                        />
                        {c.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {c.attachments.map((f) => (
                              <div key={f.id} className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2 py-1">
                                <MimeIcon mime={f.mime} className="size-3" />
                                <span className="text-[10px] font-medium max-w-[90px] truncate">{f.name}</span>
                                <span className="text-[9px] text-muted-foreground">{f.size}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <CommentBox onSubmit={addComment} />
          </div>

          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

// ── Kanban card ───────────────────────────────────────────────────────────────

function KanbanCard({ task, isSelected, onClick, onDragStart, onDragEnd }: {
  task: TaskItem; isSelected: boolean; onClick: () => void;
  onDragStart: () => void; onDragEnd: () => void;
}) {
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const PriorityIcon = PRIORITY_CFG[task.priority].icon;

  return (
    <button onClick={onClick}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all group cursor-grab active:cursor-grabbing ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
          : isTaskOverdue(task)
            ? "border-red-300 bg-red-50/50 hover:border-red-400 hover:shadow-sm"
            : "border-border bg-card hover:border-blue-300 hover:shadow-sm"
      }`}>
      {/* Priority + standard */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isTaskOverdue(task)
            ? <AlertTriangle className="size-3 text-red-500 shrink-0" />
            : <PriorityIcon className={`size-3 shrink-0 ${PRIORITY_CFG[task.priority].dot.replace("bg-", "text-")}`} />
          }
          <span className="text-[10px] font-medium text-muted-foreground">{task.standard}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{task.control}</span>
      </div>

      {/* Title */}
      <p className={`text-xs font-medium leading-snug mb-2.5 ${isSelected ? "text-blue-700" : "text-foreground group-hover:text-blue-600"} transition-colors`}>
        {task.title}
      </p>

      {/* Subtask progress */}
      {task.subtasks.length > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground">{doneSubs}/{task.subtasks.length} subtasks</span>
            <span className="text-[9px] text-muted-foreground">{Math.round((doneSubs / task.subtasks.length) * 100)}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(doneSubs / task.subtasks.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-1">
        <div className={`flex items-center gap-1 ${isTaskOverdue(task) ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
          <Clock className="size-3" />
          <span className="text-[10px]">{isTaskOverdue(task) ? "Overdue · " : ""}{formatDate(task.dueDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Paperclip className="size-3" />
              <span className="text-[10px]">{task.attachments.length}</span>
            </div>
          )}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MessageSquare className="size-3" />
              <span className="text-[10px]">{task.comments.length}</span>
            </div>
          )}
          <Avatar initials={task.assigneeInitials} color={task.assigneeColor} size="size-5" />
        </div>
      </div>
    </button>
  );
}

// ── Approval Modal ─────────────────────────────────────────────────────────────

function ApprovalModal({ task, onApprove, onCancel }: {
  task: TaskItem;
  onApprove: (approver: string, note: string) => void;
  onCancel: () => void;
}) {
  const [approver, setApprover] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="size-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Approval Required</p>
            <p className="text-xs text-muted-foreground">Moving to Done requires sign-off</p>
          </div>
          <button onClick={onCancel} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Task being approved */}
          <div className="rounded-xl bg-muted/50 border border-border px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Task</p>
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{task.standard} · {task.control}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Approver <span className="text-red-500">*</span></label>
            <select value={approver} onChange={(e) => setApprover(e.target.value)}
              className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-emerald-400 cursor-pointer">
              <option value="">— Select approver —</option>
              {TEAM_MEMBERS.filter((m) => m.name !== "Unassigned").map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Approval note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="Confirm all requirements are met, evidence is uploaded, and the task is complete…"
              className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-emerald-400 resize-none placeholder:text-muted-foreground" />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button onClick={() => approver && onApprove(approver, note)} disabled={!approver}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
              <CheckCircle2 className="size-4" /> Approve & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Custom Field Modal ─────────────────────────────────────────────────────

function AddCustomFieldModal({ onAdd, onClose }: {
  onAdd: (field: CustomField) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [type, setType]   = useState<CustomField["type"]>("text");
  const [options, setOptions] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({
      id: String(Date.now()),
      label: label.trim(),
      type,
      value: "",
      options: type === "select" ? options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Plus className="size-4 text-blue-600" /> Add Custom Field
          </p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Field name <span className="text-red-500">*</span></label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus
              placeholder="e.g. Certification body, Risk level, Review cycle…"
              className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 placeholder:text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Field type</label>
            <div className="grid grid-cols-4 gap-2">
              {(["text","number","date","select"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-all capitalize ${type === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {type === "select" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Options <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
              <input value={options} onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 placeholder:text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!label.trim()}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
              Add Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add Task Modal ─────────────────────────────────────────────────────────────

function AddTaskModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (task: TaskItem) => void;
}) {
  const [form, setForm] = useState({
    title: "", standard: "ISO 27001", control: "", assignee: "Unassigned",
    dueDate: "", priority: "MEDIUM" as Priority, description: "", status: "Todo" as Status,
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({
      ...p,
      [k]: v,
      ...(k === "standard" ? { control: "" } : {}),
    }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setAttachments((a) => [...a, ...picked.map((f) => ({
      id: String(Date.now() + Math.random()),
      name: f.name,
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      mime: fakeMime(f.name),
    }))]);
    e.target.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const m = TEAM_MEMBERS.find((x) => x.name === form.assignee) ?? TEAM_MEMBERS[4];
    onAdd({
      id: String(Date.now()),
      title: form.title, standard: form.standard, control: form.control,
      dueDate: form.dueDate, priority: form.priority,
      assignee: m.name, assigneeInitials: m.initials, assigneeColor: m.color,
      status: form.status, description: form.description,
      subtasks: [], comments: [], attachments,
      createdBy: "Me",
      createdDate: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      watchers: [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Plus className="size-4 text-blue-600" />Create Task</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required autoFocus
              placeholder="What needs to be done?"
              className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Standard</label>
              <select value={form.standard} onChange={(e) => set("standard", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer">
                {STANDARDS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Control ref</label>
              <select value={form.control} onChange={(e) => set("control", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer">
                <option value="">— Select control —</option>
                {(ISO_STANDARDS.find((s) => s.code === STD_CODE_MAP[form.standard])?.clauses ?? []).map((clause) => (
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Assignee</label>
              <select value={form.assignee} onChange={(e) => set("assignee", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer">
                {TEAM_MEMBERS.map((m) => <option key={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer">
                {(["LOW","MEDIUM","HIGH","CRITICAL"] as Priority[]).map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as Status)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer">
                {(["Todo","In Progress","In Review","Done"] as Status[]).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Due date</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
              placeholder="Add details, context, or acceptance criteria…"
              className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 placeholder:text-muted-foreground resize-none" />
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Attachments</label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
                <Plus className="size-3" /> Add file
              </button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                    <MimeIcon mime={f.mime} />
                    <span className="text-xs flex-1 truncate">{f.name}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">{f.size}</span>
                    <button type="button" onClick={() => setAttachments((a) => a.filter((x) => x.id !== f.id))}
                      className="text-muted-foreground hover:text-red-500 transition-colors">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {attachments.length === 0 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg py-2.5 text-[10px] text-muted-foreground hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5">
                <Paperclip className="size-3" /> Attach files to this task
              </button>
            )}
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-3.5 mr-1.5" /> Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function TasksPageInner() {
  const searchParams = useSearchParams();
  const highlightId  = searchParams.get("id");
  const filterParam  = searchParams.get("filter");

  const [tasks,         setTasks]         = useState<TaskItem[]>([]);
  const [loadingTasks,  setLoadingTasks]  = useState(true);
  const [selectedId,    setSelectedId]    = useState<string | null>(highlightId);
  const [stdFilter,     setStdFilter]     = useState("All");
  const [overdueOnly,   setOverdueOnly]   = useState(filterParam === "overdue");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [dragOverCol,   setDragOverCol]   = useState<Status | null>(null);
  const [approvalFor,   setApprovalFor]   = useState<{ taskId: string; toStatus: Status } | null>(null);

  // Resizable panel state
  const [panelWidth,    setPanelWidth]    = useState(420);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(420);

  const onPanelResizeStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartW.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return;
      const delta = dragStartX.current - ev.clientX;
      setPanelWidth(Math.min(Math.max(dragStartW.current + delta, 300), 800));
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

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        const mapped: TaskItem[] = (data.tasks ?? []).map((t: {
          id: string; title: string; description: string; status: string;
          priority: string; dueDate: string | null; assigneeName: string;
          controlRef: string; standard: string; projectName: string; createdAt: string;
        }) => ({
          id: t.id,
          title: t.title,
          standard: t.standard,
          control: t.controlRef,
          dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
          priority: (["CRITICAL","HIGH","MEDIUM","LOW"].includes(t.priority) ? t.priority : "MEDIUM") as Priority,
          assignee: t.assigneeName,
          assigneeInitials: t.assigneeName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          assigneeColor: "bg-blue-500",
          status: DB_STATUS_MAP[t.status] ?? "Todo",
          description: t.description,
          subtasks: [],
          comments: [],
          attachments: [],
          createdBy: "",
          createdDate: t.createdAt.slice(0, 10),
          watchers: [],
        }));
        setTasks(mapped);
        setLoadingTasks(false);
      })
      .catch(() => setLoadingTasks(false));
  }, []);

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;
  const overdueCount = tasks.filter(isTaskOverdue).length;

  const filtered = tasks
    .filter((t) => stdFilter === "All" || t.standard === stdFilter)
    .filter((t) => !overdueOnly || isTaskOverdue(t));

  const standards = ["All", ...Array.from(new Set(tasks.map((t) => t.standard)))];

  function updateTask(updated: TaskItem) {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  function addTask(task: TaskItem) {
    setTasks((prev) => [...prev, task]);
    setSelectedId(task.id);
    setShowAddModal(false);
  }

  function handleDrop(toStatus: Status) {
    if (!draggingId) return;
    const task = tasks.find((t) => t.id === draggingId);
    if (!task || task.status === toStatus) { setDraggingId(null); setDragOverCol(null); return; }
    // Moving to Done from In Review requires approval
    if (task.status === "In Review" && toStatus === "Done") {
      setApprovalFor({ taskId: draggingId, toStatus });
    } else {
      setTasks((prev) => prev.map((t) => t.id === draggingId ? { ...t, status: toStatus } : t));
    }
    setDraggingId(null);
    setDragOverCol(null);
  }

  function handleApprove(approver: string, note: string) {
    if (!approvalFor) return;
    setTasks((prev) => prev.map((t) =>
      t.id === approvalFor.taskId
        ? { ...t, status: approvalFor.toStatus, approvedBy: approver, approvalNote: note }
        : t
    ));
    setApprovalFor(null);
  }

  return (
    <>
      {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} onAdd={addTask} />}
      {approvalFor && (
        <ApprovalModal
          task={tasks.find((t) => t.id === approvalFor.taskId)!}
          onApprove={handleApprove}
          onCancel={() => { setApprovalFor(null); setDraggingId(null); }}
        />
      )}

      <div className="flex flex-col h-[calc(100vh-3.5rem-1px)]">
        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-border shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
                <ArrowLeft className="size-4" /> Dashboard
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ListTodo className="size-4 text-amber-500" /> Tasks
            </h1>
            <Badge variant="secondary" className="text-xs">{tasks.length} tasks</Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-3.5 text-muted-foreground" />
            <button onClick={() => setOverdueOnly((o) => !o)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                overdueOnly
                  ? "bg-red-600 text-white"
                  : overdueCount > 0
                    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              <AlertTriangle className="size-3" />
              Overdue ({overdueCount})
            </button>
            {standards.map((s) => (
              <button key={s} onClick={() => setStdFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  stdFilter === s ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                {s === "All" ? "All standards" : s}
              </button>
            ))}
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs ml-1"
              onClick={() => setShowAddModal(true)}>
              <Plus className="size-3.5 mr-1" /> Create
            </Button>
          </div>
        </div>

        {/* ── Board + detail ────────────────────────────────────── */}
        {loadingTasks ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="size-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading tasks…</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center max-w-xs">
              <ListTodo className="size-12 mx-auto mb-3 text-muted-foreground/30" />
              <h3 className="text-base font-semibold text-foreground mb-1">No tasks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Tasks are created from compliance projects. Start a project to generate tasks.</p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowAddModal(true)}>
                <Plus className="size-3.5 mr-1" /> Create task manually
              </Button>
            </div>
          </div>
        ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Kanban board */}
          <div className={`flex gap-4 overflow-x-auto p-5 flex-1 min-w-0 transition-all duration-200`}>
            {COLUMNS.map((col) => {
              const colTasks = filtered.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="flex flex-col shrink-0 w-72"
                  onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={() => handleDrop(col.id)}>
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${col.headerCls}`}>
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${col.dot}`} />
                      <span className="text-xs font-semibold">{col.label}</span>
                      <span className="size-5 rounded-full bg-white/70 flex items-center justify-center text-[10px] font-bold">
                        {colTasks.length}
                      </span>
                    </div>
                    <button onClick={() => setShowAddModal(true)}
                      className="size-5 rounded flex items-center justify-center hover:bg-black/10 transition-colors">
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Cards */}
                  <div className={`flex flex-col gap-2 flex-1 rounded-xl transition-colors ${dragOverCol === col.id ? "bg-blue-50/60 ring-2 ring-blue-200 ring-inset" : ""}`}>
                    {colTasks.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                        <p className="text-[10px] text-muted-foreground">No tasks</p>
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          isSelected={task.id === selectedId}
                          onClick={() => setSelectedId(task.id === selectedId ? null : task.id)}
                          onDragStart={() => setDraggingId(task.id)}
                          onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedTask ? (
            <div
              className="shrink-0 border-l border-border overflow-hidden animate-in slide-in-from-right-4 duration-200 relative"
              style={{ width: panelWidth }}
            >
              {/* Resize handle */}
              <div
                onMouseDown={onPanelResizeStart}
                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors"
                title="Drag to resize"
              />
              <TaskDetail
                key={selectedTask.id}
                task={selectedTask}
                onClose={() => setSelectedId(null)}
                onUpdate={updateTask}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center gap-3 w-64 shrink-0 text-center text-muted-foreground border-l border-border">
              <ListTodo className="size-10 text-muted-foreground/20" />
              <div>
                <p className="text-sm font-medium">Select a task</p>
                <p className="text-xs mt-0.5 text-muted-foreground/70">Click any card to view details</p>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}

export default function TasksPage() {
  return (
    <Suspense>
      <TasksPageInner />
    </Suspense>
  );
}
