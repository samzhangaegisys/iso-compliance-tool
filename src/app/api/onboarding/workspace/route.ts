import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const exists = await prisma!.organisation.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You need to be signed in to create a workspace." }, { status: 401 });
  }
  const userId = session.user.id;

  const { orgName, plan } = await req.json();
  if (!orgName) {
    return NextResponse.json({ error: "Missing organisation name." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (!user.emailVerified) {
    return NextResponse.json({ error: "Email not verified." }, { status: 403 });
  }

  const baseSlug = toSlug(orgName) || "workspace";
  const slug = await uniqueSlug(baseSlug);

  const org = await prisma.organisation.create({
    data: {
      name: orgName,
      slug,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  const planEnum = plan?.toUpperCase?.() === "PROFESSIONAL"
    ? "PROFESSIONAL"
    : plan?.toUpperCase?.() === "ENTERPRISE"
      ? "ENTERPRISE"
      : "STARTER";

  await prisma.subscription.create({
    data: {
      orgId: org.id,
      plan: planEnum,
      status: "ACTIVE",
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingDone: true },
  });

  // Clean up the registration token used pre-signin (best effort — it may have already expired).
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reg:${userId}` },
  });

  return NextResponse.json({ success: true, orgSlug: slug });
}
