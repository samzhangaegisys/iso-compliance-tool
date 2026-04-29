import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const CheckSchema = z.object({ email: z.string().email().max(254) });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`mfa-check:${ip}`, 20, 60 * 1000)) {
    return NextResponse.json({ mfaRequired: false }, { status: 429 });
  }

  const rawBody = await req.json();
  const parsed = CheckSchema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ mfaRequired: false });
  if (!prisma) return NextResponse.json({ mfaRequired: false });

  // Add a small constant-time delay to prevent timing-based enumeration
  const [user] = await Promise.all([
    prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { mfaEnabled: true },
    }),
    new Promise((r) => setTimeout(r, 50)),
  ]);

  // Return false for non-existent users — security decision happens server-side in auth.ts
  return NextResponse.json({ mfaRequired: (user as { mfaEnabled: boolean } | null)?.mfaEnabled ?? false });
}
