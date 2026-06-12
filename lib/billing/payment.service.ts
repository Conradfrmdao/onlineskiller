import "server-only";

import { eq, or } from "drizzle-orm";

import { payments, subscriptions } from "@/db/schema";
import type { PaymentVerification } from "@/lib/billing/gateway.interface";
import { nextPeriod } from "@/lib/billing/periods";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/utils/audit";
import { createMerchantReference } from "@/lib/utils/slugs";

export async function applyVerifiedPayment(
  verification: PaymentVerification,
  options?: { notificationType?: string },
) {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.providerTrackingId, verification.providerTrackingId),
          eq(payments.merchantReference, verification.merchantReference),
        ),
      )
      .limit(1);
    let payment = rows[0];

    if (!payment) {
      throw new Error("Payment record not found.");
    }

    const recurringNotification = options?.notificationType?.toUpperCase() === "RECURRING";

    if (
      recurringNotification &&
      payment.status === "completed" &&
      payment.providerTrackingId !== verification.providerTrackingId
    ) {
      const renewalRows = await tx
        .insert(payments)
        .values({
          creatorId: payment.creatorId,
          subscriptionId: payment.subscriptionId,
          merchantReference: createMerchantReference("OSR"),
          providerTrackingId: verification.providerTrackingId,
          providerSubscriptionId: verification.providerSubscriptionId || payment.providerSubscriptionId,
          planName: payment.planName,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          requestedPaymentMethod: payment.requestedPaymentMethod,
          isRecurring: true,
          status: "pending",
          providerPayload: verification.raw,
        })
        .onConflictDoNothing({ target: payments.providerTrackingId })
        .returning();

      if (renewalRows[0]) {
        payment = renewalRows[0];
      } else {
        const existingRenewals = await tx
          .select()
          .from(payments)
          .where(eq(payments.providerTrackingId, verification.providerTrackingId))
          .limit(1);
        payment = existingRenewals[0] || payment;
      }
    }

    if (payment.status === "completed") {
      return { alreadyProcessed: true, payment };
    }

    if (
      verification.status === "completed" &&
      verification.amount !== undefined &&
      Math.abs(verification.amount - payment.amount) > 0.001
    ) {
      await tx
        .update(payments)
        .set({
          status: "failed",
          providerPayload: {
            ...verification.raw,
            verificationError: "amount_mismatch",
          },
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));
      throw new Error("Verified payment amount does not match the selected plan.");
    }

    if (
      verification.status === "completed" &&
      verification.currency &&
      verification.currency !== payment.currency
    ) {
      throw new Error("Verified payment currency does not match the selected plan.");
    }

    if (verification.status !== "completed") {
      await tx
        .update(payments)
        .set({
          status: verification.status,
          paymentMethod: verification.paymentMethod || payment.paymentMethod,
          providerPayload: verification.raw,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      return { alreadyProcessed: false, payment: { ...payment, status: verification.status } };
    }

    const subscriptionRows = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, payment.creatorId))
      .limit(1);
    const subscription = subscriptionRows[0];
    const period = nextPeriod(subscription?.currentPeriodEnd);

    let subscriptionId = subscription?.id;
    if (subscription) {
      await tx
        .update(subscriptions)
        .set({
          planName: payment.planName,
          provider: payment.provider,
          providerSubscriptionId:
            verification.providerSubscriptionId ||
            payment.providerSubscriptionId ||
            subscription.providerSubscriptionId,
          status: "active",
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          recurringEnabled: payment.isRecurring || subscription.recurringEnabled,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id));
    } else {
      const insertedSubscriptions = await tx
        .insert(subscriptions)
        .values({
          creatorId: payment.creatorId,
          planName: payment.planName,
          provider: payment.provider,
          providerSubscriptionId: verification.providerSubscriptionId || payment.providerSubscriptionId,
          status: "active",
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          recurringEnabled: payment.isRecurring,
        })
        .returning({ id: subscriptions.id });
      subscriptionId = insertedSubscriptions[0]?.id;
    }

    const updatedPayments = await tx
      .update(payments)
      .set({
        subscriptionId: subscriptionId || null,
        providerTrackingId: verification.providerTrackingId,
        providerSubscriptionId: verification.providerSubscriptionId || payment.providerSubscriptionId,
        paymentMethod: verification.paymentMethod || payment.paymentMethod,
        status: "completed",
        providerPayload: verification.raw,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning();

    await writeAuditLog(tx, {
      action: recurringNotification ? "subscription.renewed" : "subscription.activated",
      entityType: "subscription",
      entityId: subscriptionId || payment.creatorId,
      metadata: {
        paymentId: payment.id,
        planName: payment.planName,
        providerTrackingId: verification.providerTrackingId,
        currentPeriodEnd: period.end.toISOString(),
      },
    });

    return {
      alreadyProcessed: false,
      payment: updatedPayments[0] || payment,
      period,
    };
  });
}
