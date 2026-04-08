import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifySync } from "otplib";
import { getMfaRecord, enableMfa } from "@/lib/mfa-store";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const record = await getMfaRecord(email);
  if (!record?.pendingSecret) {
    return NextResponse.json({ error: "No pending setup. Start setup first." }, { status: 400 });
  }

  const result = verifySync({ secret: record.pendingSecret, token: code });
  const valid = typeof result === "object" ? result.valid : result;
  if (!valid) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
  }

  await enableMfa(email);
  return NextResponse.json({ success: true });
}
