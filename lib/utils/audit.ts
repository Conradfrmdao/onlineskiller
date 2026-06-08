import type { DbClient } from "@/lib/db";
import { auditLogs } from "@/db/schema";

type AuditWriter = Pick<DbClient, "insert">;

export async function writeAuditLog(
  client: AuditWriter,
  input: {
    actorType?: string;
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  },
) {
  await client.insert(auditLogs).values({
    actorType: input.actorType || "system",
    actorId: input.actorId || "system",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata || {},
  });
}
