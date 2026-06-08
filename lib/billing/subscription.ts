import "server-only";

import { eq } from "drizzle-orm";

import { subscriptions } from "@/db/schema";
import { hasValidAccess } from "@/lib/billing/periods";
import { getPlan } from "@/lib/billing/plans";
import { db } from "@/lib/db";

export async function getCreatorSubscription(creatorId: string) {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.creatorId, creatorId)).limit(1);
  return rows[0] || null;
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
