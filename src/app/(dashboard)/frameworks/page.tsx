"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, X, BookOpen, Sparkles, FileCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrg } from "@/lib/org-context";

interface Framework {
  id: string;
  code: string;
  name: string;
  description: string | null;
  version: string;
  isCustom: boolean;
  clauseCount: number;
  createdAt: string;
}

interface ControlDraft { controlRef: string; title: string; description?: string; guidance?: string; }
interface ClauseDraft  { clauseNumber: string; title: string; controls: ControlDraft[]; }

function emptyControl(): ControlDraft { return { controlRef: "", title: "", description: "", guidance: "" }; }
function emptyClause(): ClauseDraft   { return { clauseNumber: "", title: "", controls: [emptyControl()] }; }

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion]         = useState("1.0");
  const [clauses, setClauses]         = useState<ClauseDraft[]>([emptyClause()]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  function updateClause(idx: number, patch: Partial<ClauseDraft>) {
    setClauses((prev) => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  }
  function updateControl(cIdx: number, ctrlIdx: number, patch: Partial<ControlDraft>) {
    setClauses((prev) => prev.map((c, i) => i === cIdx
      ? { ...c, controls: c.controls.map((ctrl, j) => j === ctrlIdx ? { ...ctrl, ...patch } : ctrl) }
      : c));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Framework name is required."); return; }
    const cleanClauses = clauses
      .filter((c) => c.clauseNumber.trim() && c.title.trim())
      .map((c) => ({
        clauseNumber: c.clauseNumber.trim(),
        title: c.title.trim(),
        controls: c.controls
          .filter((ctrl) => ctrl.controlRef.trim() && ctrl.title.trim())
          .map((ctrl) => ({
            controlRef: ctrl.controlRef.trim(),
            title: ctrl.title.trim(),
            description: ctrl.description?.trim() || undefined,
            guidance: ctrl.guidance?.trim() || undefined,
          })),
      }))
      .filter((c) => c.controls.length > 0);
    if (cleanClauses.length === 0) {
      setError("Add at least one clause with at least one control.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/frameworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          version: version.trim() || "1.0",
          clauses: cleanClauses,
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
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">New custom framework</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={submit} className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Internal Security Baseline" />
            </div>
            <div className="space-y-1.5">
              <Label>Version</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What this framework covers and who it applies to" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Clauses & Controls</Label>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setClauses((prev) => [...prev, emptyClause()])}>
                <Plus className="size-3.5 mr-1" /> Add clause
              </Button>
            </div>

            {clauses.map((cl, cIdx) => (
              <div key={cIdx} className="border border-border rounded-xl p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <Input value={cl.clauseNumber}
                    onChange={(e) => updateClause(cIdx, { clauseNumber: e.target.value })}
                    placeholder="Clause # (e.g. 5.1)"
                    className="w-32 text-xs" />
                  <Input value={cl.title}
                    onChange={(e) => updateClause(cIdx, { title: e.target.value })}
                    placeholder="Clause title"
                    className="flex-1 text-xs" />
                  <button type="button"
                    onClick={() => setClauses((prev) => prev.filter((_, i) => i !== cIdx))}
                    disabled={clauses.length === 1}
                    className="text-muted-foreground hover:text-red-600 p-1 disabled:opacity-30">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="space-y-2 pl-4 border-l border-border ml-2">
                  {cl.controls.map((ctrl, ctrlIdx) => (
                    <div key={ctrlIdx} className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Input value={ctrl.controlRef}
                          onChange={(e) => updateControl(cIdx, ctrlIdx, { controlRef: e.target.value })}
                          placeholder="Ref (e.g. 5.1.1)"
                          className="w-32 text-xs" />
                        <Input value={ctrl.title}
                          onChange={(e) => updateControl(cIdx, ctrlIdx, { title: e.target.value })}
                          placeholder="Control title"
                          className="flex-1 text-xs" />
                        <button type="button"
                          onClick={() => updateClause(cIdx, { controls: cl.controls.filter((_, j) => j !== ctrlIdx) })}
                          disabled={cl.controls.length === 1}
                          className="text-muted-foreground hover:text-red-600 p-1 disabled:opacity-30">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <textarea value={ctrl.description ?? ""}
                        onChange={(e) => updateControl(cIdx, ctrlIdx, { description: e.target.value })}
                        rows={2} placeholder="Control description (optional)"
                        className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => updateClause(cIdx, { controls: [...cl.controls, emptyControl()] })}>
                    <Plus className="size-3 mr-1" /> Add control
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
          )}
        </form>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Create framework"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FrameworksPage() {
  const org = useOrg();
  const isEnterprise = org?.plan === "enterprise";

  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/frameworks")
      .then((r) => r.json())
      .then((d) => setFrameworks(d.frameworks ?? []))
      .catch(() => setFrameworks([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (org) load(); }, [org?.plan]); // eslint-disable-line react-hooks/exhaustive-deps

  async function deleteFramework(id: string) {
    if (!confirm("Delete this custom framework? All projects against it will be affected.")) return;
    const res = await fetch(`/api/frameworks?id=${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (!org) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  const builtIn = frameworks.filter((f) => !f.isCustom);
  const custom  = frameworks.filter((f) =>  f.isCustom);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Frameworks</h1>
          <p className="text-sm text-muted-foreground">Built-in ISO standards and your custom frameworks (Enterprise only).</p>
        </div>
        {isEnterprise && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowModal(true)}>
            <Plus className="size-4 mr-1.5" /> New custom framework
          </Button>
        )}
      </div>

      {!isEnterprise && custom.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" /> Custom frameworks — Enterprise only
            </CardTitle>
            <CardDescription>
              Author your own compliance frameworks (internal baselines, regional standards, client-specific
              requirements) alongside the built-in ISO standards. Available on Enterprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings?tab=billing"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-9 px-4">
              View upgrade options
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="size-4" /> Built-in ISO catalogue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          ) : builtIn.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No built-in standards loaded yet. Create your first compliance project to seed the catalogue.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {builtIn.map((f) => (
                <div key={f.id} className="border border-border rounded-xl p-3 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">{f.code} · v{f.version} · {f.clauseCount} clauses</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCog className="size-4" /> Your custom frameworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {custom.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {isEnterprise
                ? "No custom frameworks yet. Click \"New custom framework\" to author your first."
                : "Available on Enterprise."}
            </p>
          ) : (
            <div className="space-y-2">
              {custom.map((f) => (
                <div key={f.id} className="border border-border rounded-xl p-3 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                    <FileCog className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    {f.description && <p className="text-xs text-muted-foreground line-clamp-1">{f.description}</p>}
                    <p className="text-[11px] text-muted-foreground">v{f.version} · {f.clauseCount} clauses · created {new Date(f.createdAt).toLocaleDateString("en-AU")}</p>
                  </div>
                  <button onClick={() => deleteFramework(f.id)} className="text-muted-foreground hover:text-red-600 p-1">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && <CreateModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}
