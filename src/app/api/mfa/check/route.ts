import { NextResponse } from "next/server";
import { getMfaRecord } from "@/lib/mfa-store";

// Called by the login page BEFORE signIn to determine if an MFA step is needed.
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ mfaRequired: false });

  const record = await getMfaRecord(email);
  return NextResponse.json({ mfaRequired: record?.enabled ?? false });
}
