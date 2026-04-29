import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const UpdateProfileSchema = z.object({
  name:  z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const parsed = UpdateProfileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { name, phone } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name  !== undefined ? { name:  name.trim()  || null } : {}),
      ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (membership) {
    void writeAuditLog({
      orgId: membership.orgId,
      userId: session.user.id,
      userName: session.user.name ?? session.user.email ?? "Unknown",
      action: "user.profile_updated",
      entityId: session.user.id,
      meta: { fields: Object.keys(parsed.data) },
    });
  }

  return NextResponse.json({ user: updated });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ user });
}
