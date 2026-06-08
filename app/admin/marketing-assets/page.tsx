import { asc, eq } from "drizzle-orm";

import { marketingAssets, marketingCaptions } from "@/db/schema";
import { saveMarketingAssetAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";

type AssetRow = { asset: typeof marketingAssets.$inferSelect; caption: typeof marketingCaptions.$inferSelect | null };

function AssetForm({ row }: { row?: AssetRow }) {
  const asset = row?.asset;
  const caption = row?.caption;
  return (
    <details className="panel rounded-2xl p-5" open={!row}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
        {asset?.title || "Create marketing asset"}
        {asset ? <Badge variant={asset.isActive ? "success" : "warning"}>{asset.isActive ? "Active" : "Hidden"}</Badge> : null}
      </summary>
      <form action={saveMarketingAssetAdminAction} className="mt-5 grid gap-3 sm:grid-cols-2">
        {asset ? <input type="hidden" name="assetId" value={asset.id} /> : null}
        <div className="space-y-1"><Label>Title</Label><Input name="title" defaultValue={asset?.title} required /></div>
        <div className="space-y-1"><Label>Category</Label><Input name="category" defaultValue={asset?.category} required /></div>
        <div className="space-y-1"><Label>Niche</Label><Input name="niche" defaultValue={asset?.niche || "all"} /></div>
        <div className="space-y-1"><Label>Tags, comma separated</Label><Input name="tags" defaultValue={asset?.tags.join(", ")} /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Textarea name="description" defaultValue={asset?.description} /></div>
        <div className="space-y-1"><Label>Video/source URL</Label><Input name="videoUrl" defaultValue={asset?.videoUrl} required /></div>
        <div className="space-y-1"><Label>Thumbnail URL</Label><Input name="thumbnailUrl" defaultValue={asset?.thumbnailUrl || ""} /></div>
        <div className="space-y-1"><Label>Source record</Label><Input name="source" defaultValue={asset?.source} required /></div>
        <div className="space-y-1"><Label>License type</Label><Input name="licenseType" defaultValue={asset?.licenseType} required /></div>
        <div className="space-y-1"><Label>Duration</Label><Input name="duration" defaultValue={asset?.duration} /></div>
        <div className="space-y-1"><Label>Orientation</Label><Input name="orientation" defaultValue={asset?.orientation || "vertical"} /></div>
        <div className="space-y-1"><Label>Hook</Label><Textarea name="hook" defaultValue={caption?.hook} /></div>
        <div className="space-y-1"><Label>Caption</Label><Textarea name="caption" defaultValue={caption?.caption} /></div>
        <div className="space-y-1"><Label>Hashtags</Label><Textarea name="hashtags" defaultValue={caption?.hashtags} /></div>
        <div className="space-y-1"><Label>CTA</Label><Textarea name="cta" defaultValue={caption?.cta} /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Voiceover script</Label><Textarea name="voiceoverScript" defaultValue={caption?.voiceoverScript} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPremium" defaultChecked={asset?.isPremium} />Premium</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={asset ? asset.isActive : true} />Active</label>
        <div className="sm:col-span-2"><Button type="submit">{asset ? "Save asset" : "Create asset"}</Button></div>
      </form>
    </details>
  );
}

export default async function AdminMarketingAssetsPage() {
  const rows = await db
    .select({ asset: marketingAssets, caption: marketingCaptions })
    .from(marketingAssets)
    .leftJoin(marketingCaptions, eq(marketingCaptions.assetId, marketingAssets.id))
    .orderBy(asc(marketingAssets.title));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title="Marketing assets" description="Maintain source, licensing, captions, scripts, visibility, and plan access." />
      <AssetForm />
      <div className="space-y-3">{rows.map((row) => <AssetForm key={row.asset.id} row={row} />)}</div>
    </div>
  );
}
