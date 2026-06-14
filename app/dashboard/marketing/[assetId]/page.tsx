import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { Download, ExternalLink, LockKeyhole, Star } from "lucide-react";
import { notFound } from "next/navigation";

import {
  marketingAssets,
  marketingCaptions,
  savedMarketingAssets,
} from "@/db/schema";
import { toggleSavedAssetAction } from "@/actions/marketing-actions";
import { CopyButton } from "@/components/marketing/CopyButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function MarketingAssetPage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const { profile } = await requireCreator();
  const [rows, entitlements, saved] = await Promise.all([
    db
      .select({ asset: marketingAssets, caption: marketingCaptions })
      .from(marketingAssets)
      .leftJoin(marketingCaptions, eq(marketingCaptions.assetId, marketingAssets.id))
      .where(and(eq(marketingAssets.id, assetId), eq(marketingAssets.isActive, true)))
      .limit(1),
    getCreatorEntitlements(profile.id),
    db
      .select()
      .from(savedMarketingAssets)
      .where(and(eq(savedMarketingAssets.creatorId, profile.id), eq(savedMarketingAssets.assetId, assetId)))
      .limit(1),
  ]);
  const data = rows[0];
  if (!data) notFound();
  const locked = data.asset.isPremium && (!entitlements.active || !entitlements.plan.premiumMarketing);
  const directVideo = Boolean(
    data.asset.downloadUrl ||
      data.asset.videoUrl.includes(".blob.vercel-storage.com") ||
      /\.mp4(?:$|\?)/i.test(data.asset.videoUrl),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/marketing/videos"
        backLabel="All video ideas"
        eyebrow={data.asset.category}
        title={data.asset.title}
        description={data.asset.description}
        actions={
          <form action={toggleSavedAssetAction}>
            <input type="hidden" name="assetId" value={assetId} />
            <Button type="submit" variant="outline"><Star className={saved[0] ? "fill-amber-300 text-amber-400" : ""} />{saved[0] ? "Saved" : "Save"}</Button>
          </form>
        }
      />
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="relative grid min-h-80 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#071426] via-[#102a56] to-blue-600 text-center text-white">
          {locked ? (
            <div className="p-8">
              <LockKeyhole className="mx-auto size-10 text-amber-300" />
              <h2 className="mt-4 text-xl font-semibold">Premium marketing resource</h2>
              <p className="mt-2 text-sm text-slate-300">Activate Growth or Pro to unlock the full script and campaign use.</p>
              <Button asChild variant="gold" className="mt-5"><Link href="/dashboard/billing">View plans</Link></Button>
            </div>
          ) : directVideo ? (
            <video
              src={data.asset.videoUrl}
              controls
              playsInline
              preload="metadata"
              className="max-h-[44rem] w-full bg-black object-contain"
            />
          ) : (
            <div className="p-8">
              <Badge className="border-white/15 bg-white/10 text-white">Licensed source reference</Badge>
              <h2 className="mt-5 text-2xl font-bold">{data.asset.title}</h2>
              <Button asChild variant="gold" className="mt-6">
                <a href={data.asset.videoUrl} target="_blank" rel="noreferrer">Open source clip <ExternalLink /></a>
              </Button>
            </div>
          )}
        </div>
        <Card>
          <CardHeader><CardTitle>Source and license</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs text-slate-500">Source</p><a href={data.asset.source} className="mt-1 block break-all text-sm font-semibold text-blue-700" target="_blank" rel="noreferrer">{data.asset.source}</a></div>
            <div><p className="text-xs text-slate-500">License record</p><p className="mt-1 text-sm leading-6">{data.asset.licenseType}</p></div>
            <div className="flex flex-wrap gap-2">{data.asset.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
            <Alert variant="warning">Always confirm the current source license and releases before using stock content in a paid campaign.</Alert>
            {!locked ? (
              <Button asChild className="w-full">
                <a href={data.asset.downloadUrl || data.asset.videoUrl}>
                  <Download /> Download video
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>
      {!locked && data.caption ? (
        <section className="grid gap-4 md:grid-cols-2">
          {[
            ["Hook", data.caption.hook],
            ["Caption", data.caption.caption],
            ["Hashtags", data.caption.hashtags],
            ["Call to action", data.caption.cta],
            ["Voiceover script", data.caption.voiceoverScript],
          ].map(([label, value]) => (
            <Card key={label} className={label === "Voiceover script" ? "md:col-span-2" : ""}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>{label}</CardTitle><CopyButton value={value} />
              </CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{value}</p></CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
