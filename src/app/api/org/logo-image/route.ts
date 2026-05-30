import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLimits } from "@/lib/plan-limits";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);

// Server-side proxy that fetches the org's branded logo URL and returns it as
// a base64 data URL. Pro+ only. jsPDF can embed PNG and JPEG directly via
// addImage(); proxying lets the PDF generator dodge cross-origin issues.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { limits } = await getLimits(membership.orgId);
  if (!limits.brandedReports) {
    return NextResponse.json({ logo: null });
  }

  const org = await prisma.organisation.findUnique({
    where: { id: membership.orgId },
    select: { logoUrl: true },
  });
  if (!org?.logoUrl) return NextResponse.json({ logo: null });

  let url: URL;
  try {
    url = new URL(org.logoUrl);
  } catch {
    return NextResponse.json({ logo: null });
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return NextResponse.json({ logo: null });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "ISOComply-LogoFetcher/1.0" },
      // 5s server-side fetch budget so a slow logo host doesn't tie up the API
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ logo: null });

    const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.has(contentType)) return NextResponse.json({ logo: null });

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return NextResponse.json({ logo: null });

    const format = contentType === "image/png" ? "PNG" : "JPEG";
    const dataUrl = `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;
    return NextResponse.json({ logo: { dataUrl, format } });
  } catch {
    return NextResponse.json({ logo: null });
  }
}
