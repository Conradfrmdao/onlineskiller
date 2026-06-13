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
import { db } from "@/lib/db";
import {
  CUSTOMER_ACCESS_STATUSES,
  CUSTOMER_FULFILLMENT_STATUSES,
  CUSTOMER_PAYMENT_STATUSES,
  normalizeCustomerStatus,
} from "@/lib/pages/customer-access";
import { cleanHttpUrl } from "@/lib/utils/urls";

export async function createCustomerRequestAction(formData: FormData) {
  const pageId = String(formData.get("pageId") || "");
  const pageSlug = String(formData.get("pageSlug") || "");
  const customerName = String(formData.get("customerName") || "").trim().slice(0, 160);
  const customerEmail = String(formData.get("customerEmail") || "").trim().toLowerCase().slice(0, 255);
  const customerPhone = String(formData.get("customerPhone") || "").trim().slice(0, 50);
  const message = String(formData.get("message") || "").trim().slice(0, 3000);
  const paymentMethod = String(formData.get("paymentMethod") || "").trim().slice(0, 80);

  if (!customerName || (!customerEmail && !customerPhone)) {
    redirect(`/p/${pageSlug}/request?error=contact`);
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
    })
    .returning({ accessToken: customerRequests.accessToken });

  redirect(`/p/${pageSlug}/request?submitted=${inserted[0].accessToken}`);
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

  const updated = await db
    .update(customerRequests)
    .set({
      paymentStatus,
      accessStatus,
      fulfillmentStatus,
      paymentReference: String(formData.get("paymentReference") || "").trim().slice(0, 180),
      creatorNote: String(formData.get("creatorNote") || "").trim().slice(0, 5000),
      deliveryUrl: cleanHttpUrl(String(formData.get("deliveryUrl") || "")) || null,
      accessExpiresAt,
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
