import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordStrong } from "@/lib/password";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const Schema = z.object({
  token: z.string().length(64),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { token, password } = parsed.data;

  if (!isPasswordStrong(password)) {
    return NextResponse.json({ error: "Password does not meet complexity requirements." }, { status: 400 });
  }

  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const newHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
