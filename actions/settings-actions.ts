"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { creatorProfiles } from "@/db/schema";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validation/onboarding.schema";
import { slugify } from "@/lib/utils/slugs";
import { cleanHandle, cleanHttpUrl } from "@/lib/utils/urls";

type State = { success: boolean; message: string };

export async function updateSettingsAction(_state: State, formData: FormData): Promise<State> {
  const { profile } = await requireCreator();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Check your profile details." };
  }

  const input = parsed.data;
  const slug = slugify(input.slug);
  const conflicting = await db
    .select({ id: creatorProfiles.id })
    .from(creatorProfiles)
    .where(and(eq(creatorProfiles.slug, slug), ne(creatorProfiles.id, profile.id)))
    .limit(1);

  if (conflicting[0]) {
    return { success: false, message: "That creator slug is already in use." };
  }

  await db
    .update(creatorProfiles)
    .set({
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
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.id, profile.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true, message: "Brand settings saved." };
}
