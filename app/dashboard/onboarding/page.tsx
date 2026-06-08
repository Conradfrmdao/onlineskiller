import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireUser } from "@/lib/auth/user";
import { slugify } from "@/lib/utils/slugs";

export default async function OnboardingPage() {
  const { user, profile } = await requireUser();

  if (profile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  const defaults = {
    displayName: profile?.displayName || user.name || "",
    businessName: profile?.businessName || "",
    bio: profile?.bio || "",
    country: profile?.country || "Uganda",
    niche: profile?.niche || "",
    phone: profile?.phone || "",
    whatsappNumber: profile?.whatsappNumber || "",
    instagramHandle: profile?.instagramHandle || "",
    tiktokHandle: profile?.tiktokHandle || "",
    websiteUrl: profile?.websiteUrl || "",
    logoUrl: profile?.logoUrl || "",
    brandColor: profile?.brandColor || "#2563eb",
    slug: profile?.slug || slugify(user.name || "creator"),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Step 1 of 1"
        title="Set up your creator workspace"
        description="Tell us enough to personalize your pages. You can change every field later."
      />
      <OnboardingForm defaults={defaults} />
    </div>
  );
}
