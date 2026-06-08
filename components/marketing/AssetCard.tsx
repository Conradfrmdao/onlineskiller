import Link from "next/link";
import { LockKeyhole, Play, Star } from "lucide-react";

import type { MarketingAsset } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export function AssetCard({ asset, locked = false, saved = false }: { asset: MarketingAsset; locked?: boolean; saved?: boolean }) {
  return (
    <Link href={`/dashboard/marketing/${asset.id}`} className="panel group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-blue-200">
      <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-[#071426] via-[#102a56] to-blue-600 text-white">
        <Play className="size-9 transition group-hover:scale-110" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="border-white/15 bg-white/10 text-white">{asset.orientation}</Badge>
          {asset.isPremium ? <Badge variant="warning">Premium</Badge> : null}
        </div>
        {locked ? <span className="absolute inset-0 grid place-items-center bg-slate-950/55"><LockKeyhole /></span> : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{asset.category}</p>
            <h3 className="mt-1 font-semibold group-hover:text-blue-700">{asset.title}</h3>
          </div>
          {saved ? <Star className="size-4 fill-amber-300 text-amber-400" /> : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{asset.description}</p>
      </div>
    </Link>
  );
}
