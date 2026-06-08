import { notFound } from "next/navigation";

import { AddSectionForm, ExistingSectionEditor } from "@/components/pages/SectionEditor";
import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireCreator } from "@/lib/auth/user";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const data = await getPageStudioData(pageId, profile.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader
        eyebrow="Section builder"
        title={data.page.title}
        description="Show, hide, reorder, and rewrite the structured sections on your public page."
      />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />
      <div className="space-y-4">
        {data.sections.map((section) => <ExistingSectionEditor key={section.id} section={section} pageId={pageId} />)}
        <AddSectionForm pageId={pageId} />
      </div>
    </div>
  );
}
