import { NextResponse } from "next/server";
import { getMfaRecord } from "@/lib/mfa-store";

// Called by the login page BEFORE signIn to determine if an MFA step is needed.
// Does not verify credentials — only reveals MFA status (acceptable UX trade-off for demo).
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ mfaRequired: false });

  const record = getMfaRecord(email);
  return NextResponse.json({ mfaRequired: record?.enabled ?? false });
}
