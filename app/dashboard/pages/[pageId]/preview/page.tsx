import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Gauge, Pause, Rocket } from "lucide-react";

import { pausePageAction, publishPageAction } from "@/actions/page-actions";
import { PreviewViewport } from "@/components/pages/PreviewViewport";
import { PublicPageRenderer } from "@/components/public-page/PublicPageRenderer";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { getLaunchScore } from "@/lib/pages/launch-flow";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function PreviewPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const [data, entitlements] = await Promise.all([
    getPageStudioData(pageId, profile.id),
    getCreatorEntitlements(profile.id),
  ]);
  if (!data) notFound();
  const launchScore = getLaunchScore({
    page: data.page,
    sections: data.sections,
    videos: data.videos,
  });

  return (
    <div className="-mx-4 -mt-5 sm:-mx-6 lg:-mx-8">
      <div className="sticky top-[4.7rem] z-30 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">Private preview</p>
            <Badge variant={launchScore.score >= 80 ? "success" : "warning"}>
              <Gauge className="mr-1 size-3" /> {launchScore.score}% launch ready
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{entitlements.active ? `${entitlements.plan.label} publishing access active` : "Subscribe to publish"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href={`/dashboard/pages/${pageId}/edit`}>Back to editor</Link></Button>
          {data.page.isLive ? (
            <>
              <Button asChild variant="secondary" size="sm"><Link href={`/p/${data.page.slug}`} target="_blank">Open live <ExternalLink /></Link></Button>
              <form action={pausePageAction}><input type="hidden" name="pageId" value={pageId} /><Button type="submit" variant="outline" size="sm"><Pause /> Pause</Button></form>
            </>
          ) : (
            <form action={publishPageAction}><input type="hidden" name="pageId" value={pageId} /><Button type="submit" size="sm"><Rocket /> Publish page</Button></form>
          )}
        </div>
      </div>
      {launchScore.suggestions.length ? (
        <div className="bg-white px-4 py-4 sm:px-6 lg:px-8">
          <Alert variant={launchScore.score >= 67 ? "default" : "warning"}>
            <p className="font-semibold">Best next improvement</p>
            <p className="mt-1">{launchScore.suggestions[0]}</p>
          </Alert>
        </div>
      ) : null}
      <PreviewViewport>
        <PublicPageRenderer
          preview
          removableBranding={entitlements.active && entitlements.plan.removableBranding}
          data={{
            page: data.page,
            creator: profile,
            template: data.template,
            sections: data.sections,
            videos: data.videos,
            modules: data.modules,
            lessons: data.lessons,
            paymentMethods: data.paymentMethods,
          }}
        />
      </PreviewViewport>
    </div>
  );
}
