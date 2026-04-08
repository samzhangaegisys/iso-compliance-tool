import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function uniqueSlug(prisma: ReturnType<typeof getPrisma>, base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const exists = await prisma.organisation.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { userId, regToken, orgName, plan } = await req.json();
  if (!userId || !regToken || !orgName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Validate registration token
  const regRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `reg:${userId}`, token: regToken, expires: { gt: new Date() } },
  });
  if (!regRecord) {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  // Verify user exists and email is verified
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (!user.emailVerified) {
    return NextResponse.json({ error: "Email not verified." }, { status: 403 });
  }

  // Create organisation
  const baseSlug = toSlug(orgName) || "workspace";
  const slug = await uniqueSlug(prisma, baseSlug);

  const org = await prisma.organisation.create({
    data: {
      name: orgName,
      slug,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  // Create free subscription
  const planEnum = plan?.toUpperCase?.() === "PROFESSIONAL"
    ? "PROFESSIONAL"
    : plan?.toUpperCase?.() === "ENTERPRISE"
      ? "ENTERPRISE"
      : "FREE";

  await prisma.subscription.create({
    data: {
      orgId: org.id,
      plan: planEnum,
      status: planEnum === "FREE" ? "ACTIVE" : "ACTIVE",
    },
  });

  // Mark onboarding complete
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingDone: true },
  });

  // Clean up registration token
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reg:${userId}` },
  });

  return NextResponse.json({ success: true, orgSlug: slug });
}
