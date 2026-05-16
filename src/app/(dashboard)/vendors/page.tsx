"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building, Plus, Search, Sparkles, AlertTriangle,
  X, Edit3, Trash2, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrg } from "@/lib/org-context";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status    = "ACTIVE" | "PENDING_REVIEW" | "ARCHIVED";

interface Vendor {
  id: string;
  name: string;
  service: string | null;
  dataCategories: string[];
  inherentRisk: RiskLevel;
  certifications: string[];
  certExpiry: string | null;
  lastReviewDate: string | null;
  dpaSignedOn: string | null;
  ownerId: string | null;
  ownerName: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  notes: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM:   "bg-amber-50 text-amber-700 border-amber-200",
  HIGH:     "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_COLORS: Record<Status, string> = {
  ACTIVE:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  ARCHIVED:       "bg-slate-50 text-slate-700 border-slate-200",
};

const DATA_CATEGORY_OPTIONS = ["PII", "Payment", "Health", "IP", "Credentials", "Logs", "Financial"];
const CERT_OPTIONS          = ["SOC 2 Type II", "ISO 27001", "ISO 27017", "HIPAA", "PCI DSS", "GDPR"];

function StarterUpsell() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
        <p className="text-sm text-muted-foreground">Track third-party suppliers and their security posture.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-blue-500" /> Available on Professional and Enterprise
          </CardTitle>
          <CardDescription>
            Vendor / Third-Party Risk Management is required by ISO 27001 §A.5.19. Track every vendor with
            access to your data, their certifications, expiry dates, and review history. Professional: up to
            25 vendors. Enterprise: unlimited with risk scoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings?tab=billing"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-9 px-4">
            View upgrade options
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function MultiTag({ label, values, options, onChange }: {
  label: string;
  values: string[];
  options: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button key={o} type="button"
              onClick={() => onChange(on ? values.filter((v) => v !== o) : [...values, o])}
              className={`text-xs px-2 py-1 rounded-full border ${
                on
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}>
              {o}
            </button>
          );
        })}
      </div>
      {values.filter((v) => !options.includes(v)).map((v) => (
        <span key={v} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 rounded-full px-2 py-1 mr-1">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-red-600">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <div className="flex gap-1.5">
        <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add custom…" className="h-7 text-xs" />
        <Button type="button" variant="outline" size="sm"
          onClick={() => { if (custom.trim()) { onChange([...values, custom.trim()]); setCustom(""); } }}>
          Add
        </Button>
      </div>
    </div>
  );
}

function VendorModal({ existing, onClose, onSaved }: {
  existing: Vendor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName]                       = useState(existing?.name ?? "");
  const [service, setService]                 = useState(existing?.service ?? "");
  const [dataCategories, setDataCategories]   = useState<string[]>(existing?.dataCategories ?? []);
  const [inherentRisk, setInherentRisk]       = useState<RiskLevel>(existing?.inherentRisk ?? "MEDIUM");
  const [certifications, setCertifications]   = useState<string[]>(existing?.certifications ?? []);
  const [certExpiry, setCertExpiry]           = useState(existing?.certExpiry ? existing.certExpiry.slice(0, 10) : "");
  const [lastReviewDate, setLastReviewDate]   = useState(existing?.lastReviewDate ? existing.lastReviewDate.slice(0, 10) : "");
  const [dpaSignedOn, setDpaSignedOn]         = useState(existing?.dpaSignedOn ? existing.dpaSignedOn.slice(0, 10) : "");
  const [contactEmail, setContactEmail]       = useState(existing?.contactEmail ?? "");
  const [websiteUrl, setWebsiteUrl]           = useState(existing?.websiteUrl ?? "");
  const [notes, setNotes]                     = useState(existing?.notes ?? "");
  const [status, setStatus]                   = useState<Status>(existing?.status ?? "ACTIVE");
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Vendor name is required."); return; }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        service: service.trim() || undefined,
        dataCategories,
        inherentRisk,
        certifications,
        certExpiry: certExpiry ? new Date(certExpiry).toISOString() : undefined,
        lastReviewDate: lastReviewDate ? new Date(lastReviewDate).toISOString() : undefined,
        dpaSignedOn: dpaSignedOn ? new Date(dpaSignedOn).toISOString() : undefined,
        contactEmail: contactEmail.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      };
      const res = await fetch(existing ? `/api/vendors/${existing.id}` : "/api/vendors", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      onSaved();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{existing ? "Edit vendor" : "New vendor"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AWS, Stripe, HubSpot" />
            </div>
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="What they provide" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Inherent risk</Label>
              <select value={inherentRisk} onChange={(e) => setInherentRisk(e.target.value as RiskLevel)}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background">
                <option value="ACTIVE">Active</option>
                <option value="PENDING_REVIEW">Pending review</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <MultiTag label="Data categories handled"
            values={dataCategories} options={DATA_CATEGORY_OPTIONS} onChange={setDataCategories} />
          <MultiTag label="Certifications"
            values={certifications} options={CERT_OPTIONS} onChange={setCertifications} />
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Cert expiry</Label>
              <Input type="date" value={certExpiry} onChange={(e) => setCertExpiry(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Last review</Label>
              <Input type="date" value={lastReviewDate} onChange={(e) => setLastReviewDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>DPA signed</Label>
              <Input type="date" value={dpaSignedOn} onChange={(e) => setDpaSignedOn(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contact email</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="security@vendor.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://vendor.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
          )}
        </form>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save changes" : "Add vendor"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const org = useOrg();
  const isPro = org?.plan === "professional" || org?.plan === "enterprise";

  const [vendors, setVendors]       = useState<Vendor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Vendor | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<"all" | Status>("all");

  function load() {
    setLoading(true);
    fetch("/api/vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors ?? []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (org && isPro) load();
    else if (org) setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.plan]);

  const filtered = useMemo(() => {
    let out = vendors;
    if (statusFilter !== "all") out = out.filter((v) => v.status === statusFilter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      out = out.filter((v) =>
        v.name.toLowerCase().includes(s) ||
        (v.service ?? "").toLowerCase().includes(s) ||
        v.certifications.some((c) => c.toLowerCase().includes(s)),
      );
    }
    return out;
  }, [vendors, search, statusFilter]);

  if (!org) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!isPro) return <StarterUpsell />;

  async function deleteVendor(id: string) {
    if (!confirm("Delete this vendor? This action cannot be undone.")) return;
    const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <p className="text-sm text-muted-foreground">Track third-party suppliers and their security posture (ISO 27001 §A.5.19).</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus className="size-4 mr-1.5" /> New vendor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">{filtered.length} vendor{filtered.length === 1 ? "" : "s"}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8 h-8 w-56 text-xs" placeholder="Search vendors…"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatus(e.target.value as "all" | Status)}
                className="h-8 text-xs border border-border rounded-lg px-2 bg-background">
                <option value="all">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_REVIEW">Pending review</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {vendors.length === 0
                ? "No vendors yet. Click \"New vendor\" to add your first."
                : "No vendors match your filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">Vendor</th>
                    <th className="py-2 font-medium">Service</th>
                    <th className="py-2 font-medium">Risk</th>
                    <th className="py-2 font-medium">Certs</th>
                    <th className="py-2 font-medium">Cert expiry</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const expiringSoon = v.certExpiry
                      ? new Date(v.certExpiry).getTime() - Date.now() < 60 * 86_400_000
                      : false;
                    return (
                      <tr key={v.id} className="border-b border-border hover:bg-muted/40">
                        <td className="py-3 pr-3">
                          <p className="font-medium text-foreground">{v.name}</p>
                          {v.websiteUrl && (
                            <a href={v.websiteUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5">
                              {v.websiteUrl.replace(/^https?:\/\//, "")}
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted-foreground">{v.service ?? "—"}</td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${RISK_COLORS[v.inherentRisk]}`}>
                            {v.inherentRisk}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex flex-wrap gap-1">
                            {v.certifications.slice(0, 2).map((c) => (
                              <span key={c} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                {c}
                              </span>
                            ))}
                            {v.certifications.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{v.certifications.length - 2}</span>
                            )}
                            {v.certifications.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-xs">
                          {v.certExpiry ? (
                            <span className={expiringSoon ? "text-amber-700 font-semibold inline-flex items-center gap-1" : "text-muted-foreground"}>
                              {expiringSoon && <AlertTriangle className="size-3" />}
                              {new Date(v.certExpiry).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATUS_COLORS[v.status]}`}>
                            {v.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => { setEditing(v); setShowModal(true); }}
                              className="text-muted-foreground hover:text-foreground p-1">
                              <Edit3 className="size-3.5" />
                            </button>
                            <button onClick={() => deleteVendor(v.id)}
                              className="text-muted-foreground hover:text-red-600 p-1">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <VendorModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}
