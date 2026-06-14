import Link from "next/link";
import { Download, LockKeyhole, Play, Star } from "lucide-react";

import type { MarketingAsset } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { VideoPreview } from "@/components/marketing/VideoPreview";

function isDirectVideo(asset: MarketingAsset) {
  return Boolean(
    asset.downloadUrl ||
      asset.videoUrl.includes(".blob.vercel-storage.com") ||
      /\.mp4(?:$|\?)/i.test(asset.videoUrl),
  );
}

export function AssetCard({
  asset,
  locked = false,
  saved = false,
}: {
  asset: MarketingAsset;
  locked?: boolean;
  saved?: boolean;
}) {
  const downloadableUrl = asset.downloadUrl || asset.videoUrl;

  return (
    <article className="panel group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-blue-200">
      <Link href={`/dashboard/marketing/${asset.id}`} className="block">
        <div className="relative grid aspect-[9/12] place-items-center overflow-hidden bg-[#071426] text-white sm:aspect-[4/5]">
          {isDirectVideo(asset) ? (
            <VideoPreview src={asset.videoUrl} title={asset.title} />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#071426] via-[#102a56] to-blue-600">
              <Play className="size-9 transition group-hover:scale-110" />
            </div>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-slate-950/45 text-white">{asset.orientation}</Badge>
            {asset.isPremium ? <Badge variant="warning">Premium</Badge> : null}
          </div>
          <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-slate-950 shadow-lg">
            <Play className="size-4 fill-current" />
          </span>
          {locked ? (
            <span className="absolute inset-0 grid place-items-center bg-slate-950/65">
              <LockKeyhole />
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{asset.category}</p>
              <h3 className="mt-1 line-clamp-2 font-semibold group-hover:text-blue-700">{asset.title}</h3>
            </div>
            {saved ? <Star className="size-4 shrink-0 fill-amber-300 text-amber-400" /> : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{asset.description}</p>
        </div>
      </Link>
      <div className="border-t border-slate-200 p-3">
        {locked ? (
          <Link href="/dashboard/billing" className="block rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">
            Upgrade to download
          </Link>
        ) : (
          <a
            href={downloadableUrl}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download className="size-4" /> Download video
          </a>
        )}
      </div>
    </article>
  );
}
