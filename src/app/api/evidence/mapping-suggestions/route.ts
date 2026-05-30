import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Given (projectId, controlRef), return cross-framework mappings where this control
// is the source or target — along with a candidate destination project for the
// other end of the mapping. The evidence upload form uses this to offer "also
// apply to the mapped control" toggles so a single piece of evidence can satisfy
// the equivalent control on another standard.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ suggestions: [] });
  if (!prisma) return NextResponse.json({ suggestions: [] });

  const url = new URL(req.url);
  const projectId  = url.searchParams.get("projectId");
  const controlRef = url.searchParams.get("controlRef");
  if (!projectId || !controlRef) return NextResponse.json({ suggestions: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ suggestions: [] });

  // Resolve which IsoControl the (project + controlRef) refers to
  const project = await prisma.complianceProject.findFirst({
    where: { id: projectId, orgId: membership.orgId },
    include: {
      standard: { include: { clauses: { include: { controls: true } } } },
    },
  });
  if (!project) return NextResponse.json({ suggestions: [] });

  const control = project.standard.clauses
    .flatMap((cl) => cl.controls)
    .find((c) => c.controlRef === controlRef);
  if (!control) return NextResponse.json({ suggestions: [] });

  // Look up all mappings where this control sits on either end
  const mappings = await prisma.controlMapping.findMany({
    where: {
      orgId: membership.orgId,
      OR: [{ sourceControlId: control.id }, { targetControlId: control.id }],
    },
    include: {
      sourceControl: { include: { clause: { include: { standard: true } } } },
      targetControl: { include: { clause: { include: { standard: true } } } },
    },
  });
  if (mappings.length === 0) return NextResponse.json({ suggestions: [] });

  // Index the org's projects by standardId for destination resolution
  const projects = await prisma.complianceProject.findMany({
    where: { orgId: membership.orgId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, standardId: true },
  });
  const projectsByStandard = new Map<string, { id: string; name: string }[]>();
  for (const p of projects) {
    const arr = projectsByStandard.get(p.standardId) ?? [];
    arr.push({ id: p.id, name: p.name });
    projectsByStandard.set(p.standardId, arr);
  }

  type Suggestion = {
    mappingId: string;
    mappingType: "EQUIVALENT" | "SIMILAR" | "RELATED";
    targetControlRef: string;
    targetControlTitle: string;
    targetStandardCode: string;
    targetStandardName: string;
    candidateProjectId: string | null;
    candidateProjectName: string | null;
  };

  const suggestions: Suggestion[] = [];
  for (const m of mappings) {
    const other = m.sourceControlId === control.id ? m.targetControl : m.sourceControl;
    const candidates = projectsByStandard.get(other.clause.standardId) ?? [];
    // skip the current project itself if (somehow) the mapping is intra-standard
    const dest = candidates.find((p) => p.id !== projectId) ?? null;
    suggestions.push({
      mappingId: m.id,
      mappingType: m.mappingType,
      targetControlRef: other.controlRef,
      targetControlTitle: other.title,
      targetStandardCode: other.clause.standard.code,
      targetStandardName: other.clause.standard.name,
      candidateProjectId: dest?.id ?? null,
      candidateProjectName: dest?.name ?? null,
    });
  }

  return NextResponse.json({ suggestions });
}
