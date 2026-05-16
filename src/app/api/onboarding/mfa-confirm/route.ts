import { NextResponse } from "next/server";
import { verifySync } from "otplib";
import { getMfaRecord, enableMfa } from "@/lib/mfa-store";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "You need to be signed in to confirm MFA." }, { status: 401 });
  }
  const email = session.user.email;

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Missing authenticator code." }, { status: 400 });
  }

  const record = await getMfaRecord(email);
  if (!record?.pendingSecret) {
    return NextResponse.json({ error: "No MFA setup in progress. Please scan the QR code first." }, { status: 400 });
  }

  const result = verifySync({ secret: record.pendingSecret, token: code });
  const valid = typeof result === "object" ? result.valid : result;
  if (!valid) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
  }

  await enableMfa(email);
  return NextResponse.json({ success: true });
}
