import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { templates } from "@/db/schema";
import { PageDetailsForm } from "@/components/pages/PageDetailsForm";
import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const [data, activeTemplates] = await Promise.all([
    getPageStudioData(pageId, profile.id),
    db.select().from(templates).where(eq(templates.isActive, true)).orderBy(asc(templates.name)),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader eyebrow="Page studio" title={data.page.title} description="Shape the core offer, media, CTA, and visual template." />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />
      <PageDetailsForm page={data.page} templates={activeTemplates} />
    </div>
  );
}
