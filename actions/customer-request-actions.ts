"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  creatorProfiles,
  customerRequests,
  pages,
  subscriptions,
  users,
} from "@/db/schema";
import { requireOwnedPage } from "@/lib/auth/ownership";
import { requireCreator } from "@/lib/auth/user";
import { hasValidAccess } from "@/lib/billing/periods";
import { getCreatorSubscription } from "@/lib/billing/subscription";
import { db } from "@/lib/db";
import { sendAccessApprovedEmail } from "@/lib/email/access";
import {
  CUSTOMER_ACCESS_STATUSES,
  CUSTOMER_FULFILLMENT_STATUSES,
  CUSTOMER_PAYMENT_STATUSES,
  normalizeCustomerStatus,
} from "@/lib/pages/customer-access";
import { writeAuditLog } from "@/lib/utils/audit";
import { cleanHttpUrl, cleanInternalPath } from "@/lib/utils/urls";

export async function createCustomerRequestAction(formData: FormData) {
  const pageId = String(formData.get("pageId") || "");
  const pageSlug = String(formData.get("pageSlug") || "");
  const customerName = String(formData.get("customerName") || "").trim().slice(0, 160);
  const customerEmail = String(formData.get("customerEmail") || "").trim().toLowerCase().slice(0, 255);
  const customerPhone = String(formData.get("customerPhone") || "").trim().slice(0, 50);
  const message = String(formData.get("message") || "").trim().slice(0, 3000);
  const paymentMethod = String(formData.get("paymentMethod") || "").trim().slice(0, 80);
  const paymentReference = String(formData.get("paymentReference") || "").trim().slice(0, 180);
  const paymentProofUrl = cleanHttpUrl(formData.get("paymentProofUrl")) || null;

  if (!customerName || !customerEmail || !paymentMethod) {
    redirect(`/p/${pageSlug}/request?error=contact`);
  }
  if (!paymentReference && !paymentProofUrl) {
    redirect(`/p/${pageSlug}/request?error=proof`);
  }

  const rows = await db
    .select({
      page: pages,
      subscription: subscriptions,
      userStatus: users.status,
    })
    .from(pages)
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, pages.creatorId))
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .leftJoin(subscriptions, eq(subscriptions.creatorId, creatorProfiles.id))
    .where(and(eq(pages.id, pageId), eq(pages.slug, pageSlug)))
    .limit(1);
  const row = rows[0];

  if (
    !row ||
    row.userStatus !== "active" ||
    row.page.status !== "live" ||
    !row.page.isLive ||
    row.page.moderationStatus !== "active" ||
    !hasValidAccess(row.subscription)
  ) {
    redirect(`/p/${pageSlug}`);
  }

  const existing = await db
    .select({
      requestStatus: customerRequests.requestStatus,
      accessStatus: customerRequests.accessStatus,
    })
    .from(customerRequests)
    .where(
      and(
        eq(customerRequests.pageId, pageId),
        eq(customerRequests.customerEmail, customerEmail),
      ),
    );

  if (existing.some((request) => request.requestStatus === "pending")) {
    redirect(`/p/${pageSlug}/request?notice=pending`);
  }
  if (
    existing.some(
      (request) =>
        request.requestStatus === "approved" &&
        request.accessStatus === "granted",
    )
  ) {
    redirect(`/p/${pageSlug}/request?notice=active`);
  }

  const inserted = await db
    .insert(customerRequests)
    .values({
      pageId,
      creatorId: row.page.creatorId,
      customerName,
      customerEmail,
      customerPhone,
      message,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
    })
    .returning({ id: customerRequests.id });

  await writeAuditLog(db, {
    action: "access_request.created",
    entityType: "customer_request",
    entityId: inserted[0].id,
    metadata: { pageId, creatorId: row.page.creatorId },
  });

  redirect(`/p/${pageSlug}/request?notice=sent`);
}

export async function submitCustomerPaymentReferenceAction(formData: FormData) {
  const pageSlug = String(formData.get("pageSlug") || "");
  const accessToken = String(formData.get("accessToken") || "");
  const paymentReference = String(formData.get("paymentReference") || "").trim().slice(0, 180);

  if (paymentReference) {
    await db
      .update(customerRequests)
      .set({ paymentReference, updatedAt: new Date() })
      .where(eq(customerRequests.accessToken, accessToken));
  }

  redirect(`/p/${pageSlug}/request?submitted=${accessToken}&reference=saved`);
}

export async function updateCustomerRequestAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const requestId = String(formData.get("requestId") || "");
  await requireOwnedPage(pageId, profile.id);

  const paymentStatus = normalizeCustomerStatus(
    String(formData.get("paymentStatus") || ""),
    CUSTOMER_PAYMENT_STATUSES,
    "pending",
  );
  const accessStatus = normalizeCustomerStatus(
    String(formData.get("accessStatus") || ""),
    CUSTOMER_ACCESS_STATUSES,
    "pending",
  );
  const fulfillmentStatus = normalizeCustomerStatus(
    String(formData.get("fulfillmentStatus") || ""),
    CUSTOMER_FULFILLMENT_STATUSES,
    "pending",
  );
  const accessDays = Math.max(0, Math.min(3650, Number(formData.get("accessDays") || 0)));
  const accessExpiresAt =
    accessStatus === "granted" && accessDays
      ? new Date(Date.now() + accessDays * 24 * 60 * 60 * 1000)
      : null;
  const currentRows = await db
    .select({
      requestStatus: customerRequests.requestStatus,
      accessStatus: customerRequests.accessStatus,
    })
    .from(customerRequests)
    .where(
      and(
        eq(customerRequests.id, requestId),
        eq(customerRequests.pageId, pageId),
        eq(customerRequests.creatorId, profile.id),
      ),
    )
    .limit(1);
  const current = currentRows[0];
  if (!current) return;
  const allowedAccessStatus =
    current.requestStatus === "approved"
      ? accessStatus
      : current.requestStatus === "rejected"
        ? "revoked"
        : "pending";

  const updated = await db
    .update(customerRequests)
    .set({
      paymentStatus,
      accessStatus: allowedAccessStatus,
      fulfillmentStatus,
      paymentReference: String(formData.get("paymentReference") || "").trim().slice(0, 180),
      creatorNote: String(formData.get("creatorNote") || "").trim().slice(0, 5000),
      deliveryUrl: cleanHttpUrl(String(formData.get("deliveryUrl") || "")) || null,
      accessExpiresAt: allowedAccessStatus === "granted" ? accessExpiresAt : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(customerRequests.id, requestId),
        eq(customerRequests.pageId, pageId),
        eq(customerRequests.creatorId, profile.id),
      ),
    )
    .returning({ accessToken: customerRequests.accessToken });

  revalidatePath(`/dashboard/pages/${pageId}/customers`);
  if (updated[0]?.accessToken) {
    revalidatePath(`/access/${updated[0].accessToken}`);
  }
}

export async function approveCustomerRequestAction(formData: FormData) {
  const { user, profile } = await requireCreator();
  const requestId = String(formData.get("requestId") || "");
  const pageId = String(formData.get("pageId") || "");
  const returnPath = cleanInternalPath(
    formData.get("returnPath"),
    `/dashboard/pages/${pageId}/customers`,
  );
  await requireOwnedPage(pageId, profile.id);

  const [requestRows, subscription] = await Promise.all([
    db
      .select({
        request: customerRequests,
        page: pages,
        creator: creatorProfiles,
      })
      .from(customerRequests)
      .innerJoin(pages, eq(pages.id, customerRequests.pageId))
      .innerJoin(creatorProfiles, eq(creatorProfiles.id, customerRequests.creatorId))
      .where(
        and(
          eq(customerRequests.id, requestId),
          eq(customerRequests.pageId, pageId),
          eq(customerRequests.creatorId, profile.id),
        ),
      )
      .limit(1),
    getCreatorSubscription(profile.id),
  ]);
  const data = requestRows[0];

  if (!data || data.request.requestStatus !== "pending") {
    redirect(`${returnPath}?review=unavailable`);
  }
  if (!hasValidAccess(subscription)) {
    redirect(`${returnPath}?review=subscription`);
  }

  await db
    .update(customerRequests)
    .set({
      requestStatus: "approved",
      paymentStatus: "confirmed",
      accessStatus: "granted",
      reviewedAt: new Date(),
      reviewedBy: user.id,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(customerRequests.id, requestId),
        eq(customerRequests.creatorId, profile.id),
        eq(customerRequests.requestStatus, "pending"),
      ),
    );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const accessUrl = new URL(`/access/${data.request.accessToken}`, appUrl).toString();
  const emailResult = await sendAccessApprovedEmail({
    to: data.request.customerEmail,
    customerName: data.request.customerName,
    pageTitle: data.page.title,
    creatorName: data.creator.businessName,
    accessUrl,
  });
  await writeAuditLog(db, {
    actorType: "creator",
    actorId: user.id,
    action: "access_request.approved",
    entityType: "customer_request",
    entityId: requestId,
    metadata: { pageId, emailSent: emailResult.sent },
  });

  revalidatePath(returnPath);
  revalidatePath(`/access/${data.request.accessToken}`);
  redirect(`${returnPath}?review=${emailResult.sent ? "approved" : "approved-manual"}`);
}

export async function rejectCustomerRequestAction(formData: FormData) {
  const { user, profile } = await requireCreator();
  const requestId = String(formData.get("requestId") || "");
  const pageId = String(formData.get("pageId") || "");
  const returnPath = cleanInternalPath(
    formData.get("returnPath"),
    `/dashboard/pages/${pageId}/customers`,
  );
  const rejectionReason = String(formData.get("rejectionReason") || "")
    .trim()
    .slice(0, 2000);
  await requireOwnedPage(pageId, profile.id);

  const updated = await db
    .update(customerRequests)
    .set({
      requestStatus: "rejected",
      accessStatus: "revoked",
      reviewedAt: new Date(),
      reviewedBy: user.id,
      rejectionReason: rejectionReason || "Payment proof could not be confirmed.",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(customerRequests.id, requestId),
        eq(customerRequests.pageId, pageId),
        eq(customerRequests.creatorId, profile.id),
        eq(customerRequests.requestStatus, "pending"),
      ),
    )
    .returning({ id: customerRequests.id });

  if (!updated[0]) {
    redirect(`${returnPath}?review=unavailable`);
  }
  await writeAuditLog(db, {
    actorType: "creator",
    actorId: user.id,
    action: "access_request.rejected",
    entityType: "customer_request",
    entityId: requestId,
    metadata: { pageId, rejectionReason },
  });

  revalidatePath(returnPath);
  redirect(`${returnPath}?review=rejected`);
}

export async function markCustomerContactedAction(formData: FormData) {
  const { profile } = await requireCreator();
  const pageId = String(formData.get("pageId") || "");
  const requestId = String(formData.get("requestId") || "");
  await requireOwnedPage(pageId, profile.id);

  await db
    .update(customerRequests)
    .set({ lastContactedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(customerRequests.id, requestId),
        eq(customerRequests.pageId, pageId),
        eq(customerRequests.creatorId, profile.id),
      ),
    );

  revalidatePath(`/dashboard/pages/${pageId}/customers`);
}
