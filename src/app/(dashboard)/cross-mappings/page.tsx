"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X, Link2, ArrowRight, Sparkles, Wand2, Check } from "lucide-react";
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

interface Suggestion {
  score: number;
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed]   = useState<Set<string>>(new Set());
  const [acceptingKey, setAcceptingKey] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");

  function suggestionKey(s: Suggestion) {
    return s.source.id < s.target.id
      ? `${s.source.id}|${s.target.id}`
      : `${s.target.id}|${s.source.id}`;
  }

  function loadAll() {
    setLoading(true);
    // Safety net: if any of the three fetches hang (cold start, transient
    // network), force the loading state to resolve after 10s so the page
    // doesn't sit on "Loading…" indefinitely. Whatever data arrived by then
    // wins; the rest stays empty and the user sees the empty state.
    const safetyTimer = setTimeout(() => setLoading(false), 10_000);

    Promise.all([
      fetch("/api/control-mappings").then((r) => r.ok ? r.json() : { mappings: [] }),
      fetch("/api/controls/catalog").then((r) => r.ok ? r.json() : { standards: [] }),
      fetch("/api/control-mappings/suggestions").then((r) => r.ok ? r.json() : { suggestions: [] }),
    ])
      .then(([m, c, s]) => {
        setMappings(m.mappings ?? []);
        setStandards(c.standards ?? []);
        setSuggestions(s.suggestions ?? []);
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(safetyTimer);
        setLoading(false);
      });
  }

  async function acceptSuggestion(s: Suggestion) {
    const key = suggestionKey(s);
    setAcceptingKey(key);
    try {
      const res = await fetch("/api/control-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceControlId: s.source.id,
          targetControlId: s.target.id,
          mappingType: "SIMILAR",
        }),
      });
      if (res.ok) loadAll();
    } finally {
      setAcceptingKey(null);
    }
  }

  function dismissSuggestion(s: Suggestion) {
    setDismissed((prev) => new Set(prev).add(suggestionKey(s)));
  }

  useEffect(() => { loadAll(); }, []);

  const visibleSuggestions = useMemo(
    () => suggestions.filter((s) => !dismissed.has(suggestionKey(s))),
    [suggestions, dismissed],
  );

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

      {visibleSuggestions.length > 0 && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wand2 className="size-4 text-violet-600" />
                <CardTitle className="text-sm">Suggested mappings ({visibleSuggestions.length})</CardTitle>
              </div>
              <p className="text-[11px] text-muted-foreground">Likely matches based on control titles. Accept to save as <b>SIMILAR</b> (re-classify later if equivalent).</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {visibleSuggestions.map((s) => {
                const key = suggestionKey(s);
                const accepting = acceptingKey === key;
                return (
                  <div key={key} className="border border-violet-200 bg-background rounded-xl p-3 flex items-center gap-3">
                    <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-violet-100 text-violet-700 border-violet-200 shrink-0">
                      {Math.round(s.score * 100)}%
                    </span>
                    <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.source.standardCode}</p>
                        <p className="text-sm font-medium text-foreground truncate">{s.source.ref} — {s.source.title}</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.target.standardCode}</p>
                        <p className="text-sm font-medium text-foreground truncate">{s.target.ref} — {s.target.title}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled={accepting}
                      onClick={() => acceptSuggestion(s)}
                      title="Accept this suggestion">
                      <Check className="size-3.5 mr-1" /> {accepting ? "Saving…" : "Accept"}
                    </Button>
                    <button onClick={() => dismissSuggestion(s)}
                      title="Dismiss"
                      className="text-muted-foreground hover:text-foreground p-1">
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
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
            mappings.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-center gap-3 max-w-md mx-auto">
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Link2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">No cross-framework mappings yet</p>
                  <p className="text-xs text-muted-foreground">
                    Declare equivalences between controls across standards so the same piece of evidence
                    can satisfy ISO 27001 §A.5.1 AND ISO 9001 §7.5.1, for example.
                  </p>
                </div>
                {standards.length >= 2 ? (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowModal(true)}>
                    <Plus className="size-4 mr-1.5" /> Create first mapping
                  </Button>
                ) : (
                  <a href="/projects" className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Create projects for 2+ standards first →
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No mappings match your search.</p>
            )
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
