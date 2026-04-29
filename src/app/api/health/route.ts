import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!prisma) return NextResponse.json({ ok: false, reason: "no db" }, { status: 503 });
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true });
}
