"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { supportMessages, supportTickets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin";
import { requireUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/utils/audit";

export async function createSupportTicketAction(formData: FormData) {
  const { user } = await requireUser();
  const subject = String(formData.get("subject") || "").trim().slice(0, 180);
  const message = String(formData.get("message") || "").trim().slice(0, 10000);
  const category = String(formData.get("category") || "general").trim().slice(0, 60);
  if (!subject || !message) return;

  const ticketId = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(supportTickets)
      .values({ userId: user.id, subject, category })
      .returning({ id: supportTickets.id });
    const id = inserted[0]?.id;
    if (!id) throw new Error("Support ticket could not be created.");
    await tx.insert(supportMessages).values({
      ticketId: id,
      senderType: "user",
      senderId: user.id,
      message,
    });
    return id;
  });

  redirect(`/dashboard/support?ticket=${ticketId}`);
}

export async function replySupportTicketAction(formData: FormData) {
  const { user } = await requireUser();
  const ticketId = String(formData.get("ticketId") || "");
  const message = String(formData.get("message") || "").trim().slice(0, 10000);
  if (!message) return;

  const tickets = await db
    .select({ id: supportTickets.id })
    .from(supportTickets)
    .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, user.id)))
    .limit(1);
  if (!tickets[0]) return;

  await db.transaction(async (tx) => {
    await tx.insert(supportMessages).values({
      ticketId,
      senderType: "user",
      senderId: user.id,
      message,
    });
    await tx
      .update(supportTickets)
      .set({ status: "open", updatedAt: new Date(), resolvedAt: null })
      .where(eq(supportTickets.id, ticketId));
  });

  revalidatePath("/dashboard/support");
  revalidatePath("/admin/support");
}

export async function adminReplySupportTicketAction(formData: FormData) {
  const admin = await requireAdmin();
  const ticketId = String(formData.get("ticketId") || "");
  const message = String(formData.get("message") || "").trim().slice(0, 10000);
  if (!message) return;

  const existing = await db
    .select({ id: supportTickets.id })
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);
  if (!existing[0]) return;

  await db.transaction(async (tx) => {
    await tx.insert(supportMessages).values({
      ticketId,
      senderType: "admin",
      senderId: admin.userId,
      message,
    });
    await tx
      .update(supportTickets)
      .set({ status: "waiting_on_customer", updatedAt: new Date(), resolvedAt: null })
      .where(eq(supportTickets.id, ticketId));
  });
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: admin.userId,
    action: "support.replied",
    entityType: "support_ticket",
    entityId: ticketId,
  });

  revalidatePath("/admin/support");
  revalidatePath("/dashboard/support");
}

export async function updateSupportTicketStatusAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const ticketId = String(formData.get("ticketId") || "");
  const requestedStatus = String(formData.get("status") || "open");
  const status = ["open", "waiting_on_customer", "resolved"].includes(requestedStatus)
    ? requestedStatus
    : "open";

  const updated = await db
    .update(supportTickets)
    .set({
      status,
      resolvedAt: status === "resolved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId))
    .returning({ id: supportTickets.id });
  if (!updated[0]) return;
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: admin.userId,
    action: "support.status_updated",
    entityType: "support_ticket",
    entityId: ticketId,
    metadata: { status },
  });

  revalidatePath("/admin/support");
  revalidatePath("/dashboard/support");
}
