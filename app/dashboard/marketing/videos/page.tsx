import { and, asc, eq, ilike, or } from "drizzle-orm";

import { marketingAssets, savedMarketingAssets } from "@/db/schema";
import { AssetCard } from "@/components/marketing/AssetCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function MarketingVideosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireCreator();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const conditions = [eq(marketingAssets.isActive, true)];
  if (query) conditions.push(or(ilike(marketingAssets.title, `%${query}%`), ilike(marketingAssets.niche, `%${query}%`))!);
  if (category) conditions.push(eq(marketingAssets.category, category));

  const [assets, entitlements, savedRows, categoryRows] = await Promise.all([
    db.select().from(marketingAssets).where(and(...conditions)).orderBy(asc(marketingAssets.title)),
    getCreatorEntitlements(profile.id),
    db.select().from(savedMarketingAssets).where(eq(savedMarketingAssets.creatorId, profile.id)),
    db.selectDistinct({ value: marketingAssets.category }).from(marketingAssets).orderBy(asc(marketingAssets.category)),
  ]);
  const savedIds = new Set(savedRows.map((row) => row.assetId));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Marketing videos" title="Find the visual idea for your message" description="Every record includes its source and license information. Recheck source terms before publishing a campaign." />
      <form className="panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_260px_auto]">
        <Input name="q" defaultValue={query} placeholder="Search title or niche" />
        <Select name="category" defaultValue={category}>
          <option value="">All categories</option>
          {categoryRows.map((row) => <option key={row.value} value={row.value}>{row.value}</option>)}
        </Select>
        <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white">Filter</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            saved={savedIds.has(asset.id)}
            locked={asset.isPremium && (!entitlements.active || !entitlements.plan.premiumMarketing)}
          />
        ))}
      </div>
    </div>
  );
}
