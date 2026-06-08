import { notFound } from "next/navigation";

import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { VideoManager } from "@/components/pages/VideoManager";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireCreator } from "@/lib/auth/user";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function VideosPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const data = await getPageStudioData(pageId, profile.id);
  if (!data) notFound();

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Video library" title={data.page.title} description="Embed videos from YouTube, Vimeo, Bunny, Cloudflare, Mux, or another public URL." />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />
      <VideoManager pageId={pageId} videos={data.videos} />
    </div>
  );
}
