"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X, Link2, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MappingType = "EQUIVALENT" | "SIMILAR" | "RELATED";

interface ControlOption { id: string; controlRef: string; title: string; }
interface ClauseGroup    { clauseNumber: string; title: string; controls: ControlOption[]; }
interface StandardGroup  { id: string; code: string; name: string; clauses: ClauseGroup[]; }

interface MappingRow {
  id: string;
  mappingType: MappingType;
  notes: string | null;
  createdAt: string;
  createdBy: string;
  source: { id: string; ref: string; title: string; clause: string; standardCode: string; standardName: string };
  target: { id: string; ref: string; title: string; clause: string; standardCode: string; standardName: string };
}

const TYPE_LABELS: Record<MappingType, string> = {
  EQUIVALENT: "Equivalent",
  SIMILAR:    "Similar",
  RELATED:    "Related",
};

const TYPE_COLORS: Record<MappingType, string> = {
  EQUIVALENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SIMILAR:    "bg-blue-50 text-blue-700 border-blue-200",
  RELATED:    "bg-slate-50 text-slate-700 border-slate-200",
};

function ControlPicker({ standards, value, onChange, label }: {
  standards: StandardGroup[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const [standardCode, setStandardCode] = useState(standards[0]?.code ?? "");
  // When picker mounts pre-selected via value, infer the standard code from the selected control
  useEffect(() => {
    if (!value) return;
    for (const s of standards) {
      for (const cl of s.clauses) {
        if (cl.controls.some((c) => c.id === value)) {
          setStandardCode(s.code);
          return;
        }
      }
    }
  }, [value, standards]);

  const std = standards.find((s) => s.code === standardCode);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <select value={standardCode}
          onChange={(e) => { setStandardCode(e.target.value); onChange(""); }}
          className="text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background">
          <option value="">Choose standard…</option>
          {standards.map((s) => (
            <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
          ))}
        </select>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          disabled={!std}
          className="text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background disabled:opacity-50">
          <option value="">Choose control…</option>
          {std?.clauses.map((cl) => (
            <optgroup key={cl.clauseNumber} label={`${cl.clauseNumber} — ${cl.title}`}>
              {cl.controls.map((ctrl) => (
                <option key={ctrl.id} value={ctrl.id}>{ctrl.controlRef} — {ctrl.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}

function CreateModal({ standards, onClose, onSaved }: {
  standards: StandardGroup[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [sourceId, setSourceId]   = useState("");
  const [targetId, setTargetId]   = useState("");
  const [type, setType]           = useState<MappingType>("EQUIVALENT");
  const [notes, setNotes]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sourceId || !targetId) { setError("Pick both controls."); return; }
    if (sourceId === targetId)  { setError("Source and target must be different."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/control-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceControlId: sourceId,
          targetControlId: targetId,
          mappingType: type,
          notes: notes.trim() || undefined,
        }),
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
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">New cross-framework mapping</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <ControlPicker standards={standards} value={sourceId} onChange={setSourceId} label="Source control" />
          <ControlPicker standards={standards} value={targetId} onChange={setTargetId} label="Maps to" />
          <div className="space-y-1.5">
            <Label>Relationship</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["EQUIVALENT", "SIMILAR", "RELATED"] as MappingType[]).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`text-sm py-2 rounded-lg border ${
                    type === t
                      ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Equivalent = evidence is freely shareable. Similar = overlap but check carefully. Related = adjacent reference.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Why these controls map (optional)"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
              {saving ? "Saving…" : "Create mapping"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CrossMappingsPage() {
  const [mappings, setMappings]     = useState<MappingRow[]>([]);
  const [standards, setStandards]   = useState<StandardGroup[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");

  function loadAll() {
    setLoading(true);
    Promise.all([
      fetch("/api/control-mappings").then((r) => r.json()),
      fetch("/api/controls/catalog").then((r) => r.json()),
    ])
      .then(([m, c]) => {
        setMappings(m.mappings ?? []);
        setStandards(c.standards ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return mappings;
    const s = search.trim().toLowerCase();
    return mappings.filter((m) =>
      m.source.title.toLowerCase().includes(s) ||
      m.target.title.toLowerCase().includes(s) ||
      m.source.ref.toLowerCase().includes(s) ||
      m.target.ref.toLowerCase().includes(s) ||
      m.source.standardCode.toLowerCase().includes(s) ||
      m.target.standardCode.toLowerCase().includes(s),
    );
  }, [mappings, search]);

  async function deleteMapping(id: string) {
    if (!confirm("Remove this mapping?")) return;
    const res = await fetch(`/api/control-mappings?id=${id}`, { method: "DELETE" });
    if (res.ok) loadAll();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cross-framework mappings</h1>
          <p className="text-sm text-muted-foreground">Declare equivalences between controls across standards so evidence and effort can be re-used.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowModal(true)}
          disabled={standards.length < 2}>
          <Plus className="size-4 mr-1.5" /> New mapping
        </Button>
      </div>

      {standards.length < 2 && (
        <Card>
          <CardContent className="py-6 flex items-start gap-3">
            <Sparkles className="size-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Create projects for at least 2 standards to start mapping</p>
              <p className="text-xs text-muted-foreground">
                Cross-mapping shines when you run multiple ISO standards in parallel — a single piece of evidence
                often satisfies a control in 27001 AND a control in 9001. Spin up a project for a second standard
                from the Projects page, then come back here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">{filtered.length} mapping{filtered.length === 1 ? "" : "s"}</CardTitle>
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8 h-8 w-56 text-xs" placeholder="Search controls or standards…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {mappings.length === 0 ? "No mappings yet." : "No mappings match your search."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => (
                <div key={m.id} className="border border-border rounded-xl p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                  <Link2 className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{m.source.standardCode}</p>
                      <p className="text-sm font-medium text-foreground truncate">{m.source.ref} — {m.source.title}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{m.target.standardCode}</p>
                      <p className="text-sm font-medium text-foreground truncate">{m.target.ref} — {m.target.title}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_COLORS[m.mappingType]}`}>
                    {TYPE_LABELS[m.mappingType]}
                  </span>
                  <button onClick={() => deleteMapping(m.id)} className="text-muted-foreground hover:text-red-600 p-1">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <CreateModal standards={standards} onClose={() => setShowModal(false)} onSaved={loadAll} />
      )}
    </div>
  );
}
