"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  contentCalendarItems,
  savedMarketingAssets,
  savedMarketingStrategies,
} from "@/db/schema";
import { requireCreator } from "@/lib/auth/user";
import { hasValidAccess } from "@/lib/billing/periods";
import { getPlan } from "@/lib/billing/plans";
import { getCreatorSubscription } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export async function toggleSavedAssetAction(formData: FormData) {
  const { profile } = await requireCreator();
  const assetId = String(formData.get("assetId") || "");
  const rows = await db
    .select()
    .from(savedMarketingAssets)
    .where(and(eq(savedMarketingAssets.creatorId, profile.id), eq(savedMarketingAssets.assetId, assetId)))
    .limit(1);

  if (rows[0]) {
    await db.delete(savedMarketingAssets).where(eq(savedMarketingAssets.id, rows[0].id));
  } else {
    await db.insert(savedMarketingAssets).values({ creatorId: profile.id, assetId });
  }

  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/marketing/videos");
  revalidatePath(`/dashboard/marketing/${assetId}`);
}

export async function toggleSavedStrategyAction(formData: FormData) {
  const { profile } = await requireCreator();
  const strategyId = String(formData.get("strategyId") || "");
  const rows = await db
    .select()
    .from(savedMarketingStrategies)
    .where(and(eq(savedMarketingStrategies.creatorId, profile.id), eq(savedMarketingStrategies.strategyId, strategyId)))
    .limit(1);

  if (rows[0]) {
    await db.delete(savedMarketingStrategies).where(eq(savedMarketingStrategies.id, rows[0].id));
  } else {
    await db.insert(savedMarketingStrategies).values({ creatorId: profile.id, strategyId });
  }

  revalidatePath("/dashboard/marketing/strategies");
  revalidatePath(`/dashboard/marketing/strategies/${strategyId}`);
}

export async function createCalendarItemAction(formData: FormData) {
  const { profile } = await requireCreator();
  const subscription = await getCreatorSubscription(profile.id);
  const plan = getPlan(subscription?.planName);

  if (!hasValidAccess(subscription) || !plan.calendar) {
    return;
  }

  const title = String(formData.get("title") || "").trim().slice(0, 180);
  if (!title) return;
  const scheduledValue = String(formData.get("scheduledFor") || "");
  const scheduledFor = scheduledValue ? new Date(scheduledValue) : null;

  await db.insert(contentCalendarItems).values({
    creatorId: profile.id,
    pageId: String(formData.get("pageId") || "") || null,
    assetId: String(formData.get("assetId") || "") || null,
    strategyId: String(formData.get("strategyId") || "") || null,
    title,
    caption: String(formData.get("caption") || "").trim().slice(0, 5000),
    platform: String(formData.get("platform") || "instagram").slice(0, 60),
    scheduledFor: scheduledFor && !Number.isNaN(scheduledFor.getTime()) ? scheduledFor : null,
    status: String(formData.get("status") || "draft").slice(0, 30),
  });

  revalidatePath("/dashboard/calendar");
}

export async function deleteCalendarItemAction(formData: FormData) {
  const { profile } = await requireCreator();
  await db
    .delete(contentCalendarItems)
    .where(
      and(
        eq(contentCalendarItems.id, String(formData.get("itemId") || "")),
        eq(contentCalendarItems.creatorId, profile.id),
      ),
    );
  revalidatePath("/dashboard/calendar");
}
