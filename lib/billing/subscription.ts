import "server-only";

import { eq } from "drizzle-orm";

import { subscriptions } from "@/db/schema";
import { hasValidAccess } from "@/lib/billing/periods";
import { getPlan, isPlanName } from "@/lib/billing/plans";
import { db } from "@/lib/db";

export async function getCreatorSubscription(creatorId: string) {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.creatorId, creatorId)).limit(1);
  const subscription = rows[0];

  if (
    subscription?.currentPeriodEnd &&
    subscription.currentPeriodEnd <= new Date() &&
    subscription.scheduledPlanName &&
    isPlanName(subscription.scheduledPlanName) &&
    subscription.scheduledPeriodStart &&
    subscription.scheduledPeriodEnd
  ) {
    const activatedRows = await db
      .update(subscriptions)
      .set({
        planName: subscription.scheduledPlanName,
        status: "active",
        currentPeriodStart: subscription.scheduledPeriodStart,
        currentPeriodEnd: subscription.scheduledPeriodEnd,
        scheduledPlanName: null,
        scheduledPeriodStart: null,
        scheduledPeriodEnd: null,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();

    return activatedRows[0] || subscription;
  }

  return subscription || null;
}

export async function getCreatorEntitlements(creatorId: string) {
  const subscription = await getCreatorSubscription(creatorId);
  const active = hasValidAccess(subscription);
  const plan = getPlan(subscription?.planName);

  return {
    subscription,
    active,
    plan,
  };
}
