import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { name, slug } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });

  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const org = await prisma.organisation.update({
    where: { id: membership.orgId },
    data: { name, slug: slugClean },
  });

  return NextResponse.json({ org: { id: org.id, name: org.name, slug: org.slug } });
}
