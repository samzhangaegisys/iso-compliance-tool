import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!prisma) return NextResponse.json({ standards: [] });
  const standards = await prisma.isoStandard.findMany({
    select: { id: true, code: true, name: true },
  });
  return NextResponse.json({ standards });
}
