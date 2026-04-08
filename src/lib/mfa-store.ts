// MFA store — backed by the User table (mfaSecret, mfaEnabled fields).
// Pending secrets (mid-setup, not yet confirmed) are stored in memory only
// for the duration of the setup flow; they are never persisted until the user
// confirms the code. This is safe because the setup flow completes in one
// browser session within seconds.

import { prisma } from "./prisma";

// In-memory pending secrets only (setup not yet confirmed).
// These are short-lived (seconds) and don't need to survive a server restart.
const g = globalThis as typeof globalThis & { _mfaPending?: Map<string, string> };
const pending: Map<string, string> = g._mfaPending ?? (g._mfaPending = new Map());

export type MFARecord = {
  secret: string;
  enabled: boolean;
  pendingSecret?: string;
};

export async function getMfaRecord(email: string): Promise<MFARecord | undefined> {
  if (!prisma) return undefined;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { mfaSecret: true, mfaEnabled: true },
  });
  if (!user) return undefined;

  return {
    secret: user.mfaSecret ?? "",
    enabled: user.mfaEnabled,
    pendingSecret: pending.get(email),
  };
}

export function getMfaRecordSync(email: string): MFARecord | undefined {
  // Sync fallback used by NextAuth authorize() — can only check pending secrets.
  // For the enabled check in auth, use the async version or the DB user lookup.
  const p = pending.get(email);
  return p ? { secret: "", enabled: false, pendingSecret: p } : undefined;
}

export function setPendingSecret(email: string, secret: string) {
  pending.set(email, secret);
}

export async function enableMfa(email: string) {
  const secret = pending.get(email);
  if (!secret) throw new Error("No pending MFA secret for this email.");

  if (!prisma) throw new Error("Database not available.");

  await prisma.user.update({
    where: { email },
    data: { mfaSecret: secret, mfaEnabled: true },
  });

  pending.delete(email);
}

export async function disableMfa(email: string) {
  if (!prisma) throw new Error("Database not available.");

  await prisma.user.update({
    where: { email },
    data: { mfaSecret: null, mfaEnabled: false },
  });
}
