import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifySync } from "otplib";
import { getMfaRecord, disableMfa } from "@/lib/mfa-store";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const record = await getMfaRecord(email);
  if (!record?.enabled) {
    return NextResponse.json({ error: "MFA is not enabled." }, { status: 400 });
  }

  const result = verifySync({ secret: record.secret, token: code });
  const valid = typeof result === "object" ? result.valid : result;
  if (!valid) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
  }

  await disableMfa(email);
  return NextResponse.json({ success: true });
}
