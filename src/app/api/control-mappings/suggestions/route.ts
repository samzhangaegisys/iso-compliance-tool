import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Title-similarity suggester for cross-framework control mappings.
//
// Algorithm: for every pair of controls across DIFFERENT standards the org has
// projects against, compute a Jaccard similarity on normalised title tokens
// (boosted when both tokens overlap and the controlRef tails align). Suggestions
// with score >= MIN_SCORE are returned, sorted descending, capped at MAX_RESULTS.
//
// Mappings that already exist for the org (in either direction) are excluded.

const MIN_SCORE = 0.34;
const MAX_RESULTS = 25;

const STOPWORDS = new Set([
  "a", "an", "and", "the", "of", "to", "for", "in", "on", "or", "by", "with",
  "is", "are", "be", "as", "at", "from", "shall", "should", "must", "control",
  "controls", "policy", "policies", "procedure", "procedures", "process",
  "processes", "system", "systems", "management", "information", "data",
]);

function tokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ suggestions: [] });
  if (!prisma) return NextResponse.json({ suggestions: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ suggestions: [] });

  const projects = await prisma.complianceProject.findMany({
    where: { orgId: membership.orgId },
    select: { standardId: true },
  });
  const standardIds = Array.from(new Set(projects.map((p) => p.standardId)));
  if (standardIds.length < 2) return NextResponse.json({ suggestions: [] });

  const [standards, existing] = await Promise.all([
    prisma.isoStandard.findMany({
      where: { id: { in: standardIds } },
      include: { clauses: { include: { controls: true } } },
    }),
    prisma.controlMapping.findMany({
      where: { orgId: membership.orgId },
      select: { sourceControlId: true, targetControlId: true },
    }),
  ]);

  // Flatten controls with their standard + clause context, precompute token sets
  type Item = {
    id: string;
    ref: string;
    title: string;
    clauseNumber: string;
    standardId: string;
    standardCode: string;
    standardName: string;
    tokens: Set<string>;
    refTail: string; // last numeric component of controlRef
  };
  const items: Item[] = [];
  for (const std of standards) {
    for (const cl of std.clauses) {
      for (const ctrl of cl.controls) {
        const tailMatch = ctrl.controlRef.match(/(\d+)\s*$/);
        items.push({
          id: ctrl.id,
          ref: ctrl.controlRef,
          title: ctrl.title,
          clauseNumber: cl.clauseNumber,
          standardId: std.id,
          standardCode: std.code,
          standardName: std.name,
          tokens: tokens(ctrl.title),
          refTail: tailMatch?.[1] ?? "",
        });
      }
    }
  }

  // Build the exclude set: unordered pair keys for existing mappings (both directions).
  const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const excluded = new Set(existing.map((m) => pairKey(m.sourceControlId, m.targetControlId)));

  type Suggestion = { score: number; src: Item; tgt: Item };
  const candidates: Suggestion[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (a.standardId === b.standardId) continue;
      if (excluded.has(pairKey(a.id, b.id))) continue;
      let s = jaccard(a.tokens, b.tokens);
      if (s < MIN_SCORE) continue;
      // small boost when controlRef tails match — signals analogous numbering
      if (a.refTail && a.refTail === b.refTail) s = Math.min(1, s + 0.08);
      candidates.push({ score: s, src: a, tgt: b });
    }
  }

  candidates.sort((x, y) => y.score - x.score);
  const top = candidates.slice(0, MAX_RESULTS);

  return NextResponse.json({
    suggestions: top.map((c) => ({
      score: Math.round(c.score * 100) / 100,
      source: {
        id: c.src.id, ref: c.src.ref, title: c.src.title,
        clause: c.src.clauseNumber, standardCode: c.src.standardCode, standardName: c.src.standardName,
      },
      target: {
        id: c.tgt.id, ref: c.tgt.ref, title: c.tgt.title,
        clause: c.tgt.clauseNumber, standardCode: c.tgt.standardCode, standardName: c.tgt.standardName,
      },
    })),
  });
}
