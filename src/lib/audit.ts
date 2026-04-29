import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function writeAuditLog(params: {
  orgId: string;
  userId: string;
  userName: string;
  action: string;
  entityId?: string;
  meta?: Prisma.InputJsonValue;
}) {
  if (!prisma) return;
  try {
    await prisma.auditLog.create({ data: params });
  } catch {
    // Never let audit logging block the main flow
  }
}
