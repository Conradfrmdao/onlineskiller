import Link from "next/link";
import { Eye, ImagePlus } from "lucide-react";
import { notFound } from "next/navigation";

import { AddSectionForm, ExistingSectionEditor } from "@/components/pages/SectionEditor";
import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function BuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ created?: string; reason?: string }>;
}) {
  const { pageId } = await params;
  const query = await searchParams;
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
      {query.created === "1" ? (
        <Alert variant="success">
          <p className="font-semibold">Your page structure is ready. Now make it unmistakably yours.</p>
          <p className="mt-1">
            Review the copy below, remove anything you do not need, then add your cover photo and final offer details before previewing.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/dashboard/pages/${pageId}/edit`}><ImagePlus /> Add photos and details</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/pages/${pageId}/preview`}><Eye /> Preview progress</Link>
            </Button>
          </div>
        </Alert>
      ) : query.reason === "publish-blocked" ? (
        <Alert variant="warning">
          <p className="font-semibold">This page still needs real customer-facing content.</p>
          <p className="mt-1">
            Replace any starter instructions, keep at least one useful section visible, and confirm your button destination before publishing.
          </p>
        </Alert>
      ) : null}
      <div className="space-y-4">
        {data.sections.map((section, index) => (
          <ExistingSectionEditor
            key={section.id}
            section={section}
            pageId={pageId}
            defaultOpen={query.created === "1" && index === 0}
          />
        ))}
        <AddSectionForm pageId={pageId} />
      </div>
    </div>
  );
}
