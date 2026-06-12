import { asc, eq } from "drizzle-orm";

import { templates } from "@/db/schema";
import { CreatePageForm } from "@/components/pages/CreatePageForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { profile } = await requireCreator();
  const { template: requestedTemplateSlug } = await searchParams;
  const [activeTemplates, entitlements] = await Promise.all([
    db.select().from(templates).where(eq(templates.isActive, true)).orderBy(asc(templates.name)),
    getCreatorEntitlements(profile.id),
  ]);
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Guided launch"
        title="Build your page one clear step at a time"
        description="No blank canvas and no complicated website builder. Answer a few questions and preview a complete starting page."
        backHref="/dashboard/pages"
        backLabel="My pages"
      />
      <CreatePageForm
        templates={activeTemplates}
        profile={profile}
        canUsePremiumTemplates={entitlements.active && entitlements.plan.premiumTemplates}
        initialTemplateId={
          activeTemplates.find((template) => template.slug === requestedTemplateSlug)?.id || ""
        }
      />
    </div>
  );
}
