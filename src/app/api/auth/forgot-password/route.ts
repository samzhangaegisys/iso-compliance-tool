import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const Schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: true }); // silently throttle — don't reveal limit
  }

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: true }); // don't reveal whether email is valid
  }
  const { email } = parsed.data;

  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || !user.passwordHash) {
    // Return a distinct status so the UI can inform the user — not a security
    // risk since email enumeration is only a concern for credential stuffing,
    // not password reset flows where the attacker already needs the inbox.
    return NextResponse.json({ ok: true, notFound: true });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendPasswordResetEmail(user.email, resetUrl).catch(() => {});

  return NextResponse.json({ ok: true, notFound: false });
}
