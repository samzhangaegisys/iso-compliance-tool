"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ISO_STANDARDS } from "@/lib/iso-data";

const standardMeta: Record<
  string,
  { category: string; color: string; bgColor: string; borderColor: string }
> = {
  ISO27001: { category: "Information Security", color: "text-blue-700",    bgColor: "bg-blue-50",    borderColor: "border-blue-200"    },
  ISO9001:  { category: "Quality Management",   color: "text-green-700",   bgColor: "bg-green-50",   borderColor: "border-green-200"   },
  ISO14001: { category: "Environmental",        color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  ISO45001: { category: "Health & Safety",      color: "text-amber-700",   bgColor: "bg-amber-50",   borderColor: "border-amber-200"   },
  ISO42001: { category: "AI Management",        color: "text-purple-700",  bgColor: "bg-purple-50",  borderColor: "border-purple-200"  },
};

type ProjectSummary = { name: string; score: number; id: string };

export default function StandardsPage() {
  const [activeProjects, setActiveProjects] = useState<Record<string, ProjectSummary>>({});

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, ProjectSummary> = {};
        for (const p of data.projects ?? []) {
          map[p.standardCode] = { name: p.name, score: p.score, id: p.id };
        }
        setActiveProjects(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ISO Standards</h1>
        <p className="text-sm text-muted-foreground">
          Browse all supported standards and start a compliance project
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <BookOpen className="size-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Real ISO control references</p>
          <p className="text-sm text-blue-700 mt-0.5">
            All standards include real clause numbers, control references, and descriptions based on the published ISO standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {ISO_STANDARDS.map((standard) => {
          const meta = standardMeta[standard.code] ?? {
            category: "Compliance", color: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200",
          };
          const project = activeProjects[standard.code];
          const totalClauseControls = standard.clauses.reduce((sum, c) => sum + c.controls.length, 0);

          return (
            <Card key={standard.code} className={`border ${meta.borderColor} flex flex-col`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className={`size-10 rounded-lg ${meta.bgColor} flex items-center justify-center shrink-0`}>
                    <Shield className={`size-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold">{standard.name}</CardTitle>
                    <Badge variant="outline" className={`mt-1 text-xs ${meta.color} border-current/30`}>
                      {meta.category}
                    </Badge>
                  </div>
                  {project && (
                    <Badge className="bg-green-100 text-green-700 border-0 shrink-0">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <CardDescription className="text-sm leading-relaxed">{standard.description}</CardDescription>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={`rounded-lg ${meta.bgColor} p-2`}>
                    <p className={`text-lg font-bold ${meta.color}`}>{standard.clauses.length}</p>
                    <p className="text-[10px] text-muted-foreground">Clauses</p>
                  </div>
                  <div className={`rounded-lg ${meta.bgColor} p-2`}>
                    <p className={`text-lg font-bold ${meta.color}`}>{totalClauseControls}</p>
                    <p className="text-[10px] text-muted-foreground">Controls</p>
                  </div>
                  <div className={`rounded-lg ${meta.bgColor} p-2`}>
                    <p className={`text-lg font-bold ${meta.color}`}>{standard.version}</p>
                    <p className="text-[10px] text-muted-foreground">Version</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key Clauses</p>
                  <ul className="space-y-1">
                    {standard.clauses.slice(0, 4).map((clause) => (
                      <li key={clause.number} className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle2 className="size-3 text-muted-foreground shrink-0" />
                        <span className="font-medium text-muted-foreground">{clause.number}</span>
                        <span className="truncate">{clause.title}</span>
                      </li>
                    ))}
                    {standard.clauses.length > 4 && (
                      <li className="text-xs text-muted-foreground pl-5">+{standard.clauses.length - 4} more clauses</li>
                    )}
                  </ul>
                </div>

                {project && (
                  <div className="rounded-lg bg-muted/60 p-3 text-xs">
                    <p className="text-muted-foreground">Active project:</p>
                    <p className="font-medium text-foreground mt-0.5 truncate">{project.name}</p>
                    <p className={`font-semibold mt-1 ${meta.color}`}>{project.score}% compliant</p>
                  </div>
                )}

                <div className="mt-auto pt-2 flex gap-2">
                  {project ? (
                    <Button variant="outline" size="sm" className="flex-1" render={<Link href="/projects" />}>
                      View Project <ArrowRight className="size-3 ml-1.5" />
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      render={<Link href={`/projects?new=${standard.code}`} />}>
                      Start Project <ArrowRight className="size-3 ml-1.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
