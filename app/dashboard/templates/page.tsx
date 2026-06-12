import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { templates } from "@/db/schema";
import { PageHeader } from "@/components/shared/PageHeader";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function DashboardTemplatesPage() {
  const { profile } = await requireCreator();
  const [activeTemplates, entitlements] = await Promise.all([
    db.select().from(templates).where(eq(templates.isActive, true)).orderBy(asc(templates.name)),
    getCreatorEntitlements(profile.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Page studio"
        title="Choose a template inside your workspace"
        description="Preview every active style, then open the guided builder with your choice already selected."
        backHref="/dashboard/pages"
        backLabel="My pages"
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {activeTemplates.map((template) => {
          const locked =
            template.isPremium &&
            (!entitlements.active || !entitlements.plan.premiumTemplates);

          return (
            <TemplatePreview
              key={template.id}
              template={template}
              action={
                locked ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/billing?reason=premium-template">
                      <LockKeyhole /> Unlock with Growth
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/pages/new?template=${template.slug}`}>
                      Use this template <ArrowRight />
                    </Link>
                  </Button>
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}
