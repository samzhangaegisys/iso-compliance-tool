// In-memory MFA store for development.
// In production, replace with Prisma User fields: mfaSecret String? and mfaEnabled Boolean @default(false)

type MFARecord = {
  secret: string;
  enabled: boolean;
  pendingSecret?: string;
};

const g = globalThis as typeof globalThis & { _mfaStore?: Map<string, MFARecord> };
const store: Map<string, MFARecord> = g._mfaStore ?? (g._mfaStore = new Map());

export function getMfaRecord(email: string): MFARecord | undefined {
  return store.get(email);
}

export function setPendingSecret(email: string, secret: string) {
  const existing = store.get(email) ?? { secret: "", enabled: false };
  store.set(email, { ...existing, pendingSecret: secret });
}

export function enableMfa(email: string) {
  const existing = store.get(email);
  if (!existing?.pendingSecret) throw new Error("No pending secret");
  store.set(email, { secret: existing.pendingSecret, enabled: true });
}

export function disableMfa(email: string) {
  const existing = store.get(email);
  if (existing) store.set(email, { ...existing, enabled: false });
}
