import { prisma } from "@/server/db";

export async function writeAuditLog(entry: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: object;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        payload: entry.payload ?? undefined
      }
    });
  } catch (error) {
    console.error("Audit-Log konnte nicht geschrieben werden:", error);
  }
}
