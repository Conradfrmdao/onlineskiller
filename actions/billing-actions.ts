"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { subscriptions } from "@/db/schema";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";

export async function cancelAtPeriodEndAction() {
  const { profile } = await requireCreator();
  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscriptions.creatorId, profile.id));
  revalidatePath("/dashboard/billing");
}
