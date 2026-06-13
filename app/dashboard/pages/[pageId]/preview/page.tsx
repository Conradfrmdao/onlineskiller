import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Gauge, Pause, Rocket } from "lucide-react";

import { pausePageAction, publishPageAction } from "@/actions/page-actions";
import { PreviewViewport } from "@/components/pages/PreviewViewport";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { getLaunchScore } from "@/lib/pages/launch-flow";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const [{ pageId }, query] = await Promise.all([params, searchParams]);
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
            launchScore.publishReady ? (
              <form action={publishPageAction}><input type="hidden" name="pageId" value={pageId} /><Button type="submit" size="sm"><Rocket /> Publish page</Button></form>
            ) : (
              <Button asChild size="sm">
                <Link href={`/dashboard/pages/${pageId}/builder?reason=publish-blocked`}>Finish page content</Link>
              </Button>
            )
          )}
        </div>
      </div>
      {launchScore.suggestions.length ? (
        <div className="bg-white px-4 py-4 sm:px-6 lg:px-8">
          <Alert variant={launchScore.score >= 67 ? "default" : "warning"}>
            <p className="font-semibold">
              {launchScore.publishReady ? "Best next improvement" : "Required before publishing"}
            </p>
            <p className="mt-1">{launchScore.suggestions[0]}</p>
          </Alert>
        </div>
      ) : null}
      <PreviewViewport previewUrl={`/p/${data.page.slug}?preview=1`} />
      {query.reason === "moderated" || data.page.moderationStatus === "taken_down" ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl">
          <Alert variant="destructive">
            <p className="font-semibold">This page was taken down by OnlineSkiller administration.</p>
            <p className="mt-1">{data.page.moderationReason || "Contact support if you need help resolving this moderation action."}</p>
          </Alert>
        </div>
      ) : null}
    </div>
  );
}
