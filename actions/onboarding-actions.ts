"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { creatorProfiles, subscriptions } from "@/db/schema";
import { requireUser } from "@/lib/auth/user";
import { addTrialDays } from "@/lib/billing/periods";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validation/onboarding.schema";
import { slugify } from "@/lib/utils/slugs";
import { cleanHandle, cleanHttpUrl } from "@/lib/utils/urls";

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

async function uniqueCreatorSlug(value: string, currentUserId: string) {
  const base = slugify(value);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`.slice(0, 100);
    const rows = await db
      .select({ id: creatorProfiles.id, userId: creatorProfiles.userId })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.slug, candidate))
      .limit(1);

    if (!rows[0] || rows[0].userId === currentUserId) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString(36)}`.slice(0, 100);
}

export async function completeOnboardingAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { user, profile } = await requireUser();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const errors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] || "form");
      errors[key] = issue.message;
    }

    return {
      success: false,
      message: "Review the highlighted fields.",
      errors,
    };
  }

  const input = parsed.data;
  const slug = await uniqueCreatorSlug(input.slug, user.id);
  const values = {
    displayName: input.displayName,
    businessName: input.businessName,
    bio: input.bio,
    country: input.country,
    niche: input.niche,
    phone: input.phone,
    whatsappNumber: input.whatsappNumber,
    instagramHandle: cleanHandle(input.instagramHandle),
    tiktokHandle: cleanHandle(input.tiktokHandle),
    websiteUrl: cleanHttpUrl(input.websiteUrl) || null,
    logoUrl: cleanHttpUrl(input.logoUrl) || null,
    brandColor: input.brandColor,
    slug,
    onboardingCompleted: true,
    updatedAt: new Date(),
  };

  await db.transaction(async (tx) => {
    const trialStart = new Date();
    const trialEnd = addTrialDays(trialStart, 7);
    let creatorId = profile?.id;

    if (profile) {
      await tx.update(creatorProfiles).set(values).where(eq(creatorProfiles.id, profile.id));
    } else {
      const inserted = await tx
        .insert(creatorProfiles)
        .values({
          userId: user.id,
          ...values,
        })
        .returning({ id: creatorProfiles.id });
      creatorId = inserted[0]?.id;
    }

    if (!creatorId) {
      throw new Error("Creator profile could not be saved.");
    }

    await tx
      .insert(subscriptions)
      .values({
        creatorId,
        status: "trialing",
        planName: "starter",
        provider: "manual",
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd,
      })
      .onConflictDoUpdate({
        target: subscriptions.creatorId,
        set: {
          status: "trialing",
          planName: "starter",
          provider: "manual",
          currentPeriodStart: trialStart,
          currentPeriodEnd: trialEnd,
          updatedAt: trialStart,
        },
      });
  });

  redirect("/dashboard");
}
