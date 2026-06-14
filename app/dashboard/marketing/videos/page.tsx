import Link from "next/link";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { marketingAssets, savedMarketingAssets } from "@/db/schema";
import { AssetCard } from "@/components/marketing/AssetCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const initialPage = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
  const pageSize = 24;
  const conditions = [eq(marketingAssets.isActive, true)];
  if (query) conditions.push(or(ilike(marketingAssets.title, `%${query}%`), ilike(marketingAssets.niche, `%${query}%`))!);
  if (category) conditions.push(eq(marketingAssets.category, category));

  const [totalRows, entitlements, savedRows, categoryRows] = await Promise.all([
    db.select({ total: count() }).from(marketingAssets).where(and(...conditions)),
    getCreatorEntitlements(profile.id),
    db.select().from(savedMarketingAssets).where(eq(savedMarketingAssets.creatorId, profile.id)),
    db
      .selectDistinct({ value: marketingAssets.category })
      .from(marketingAssets)
      .where(eq(marketingAssets.isActive, true))
      .orderBy(asc(marketingAssets.category)),
  ]);
  const total = Number(totalRows[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(initialPage, totalPages);
  const assets = await db
    .select()
    .from(marketingAssets)
    .where(and(...conditions))
    .orderBy(desc(marketingAssets.createdAt), asc(marketingAssets.title))
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);
  const savedIds = new Set(savedRows.map((row) => row.assetId));
  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    next.set("page", String(page));
    return `/dashboard/marketing/videos?${next.toString()}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Marketing videos" title="Content gallery" description={`${total.toLocaleString()} downloadable clips and licensed-source references for your short-form content.`} />
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
      {!assets.length ? (
        <div className="panel rounded-2xl p-10 text-center">
          <h2 className="font-semibold text-slate-950">No clips match this filter</h2>
          <p className="mt-2 text-sm text-slate-600">Clear the search or choose another collection.</p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/dashboard/marketing/videos">Show every video</Link>
          </Button>
        </div>
      ) : null}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <Button asChild variant="outline" disabled={currentPage <= 1}>
            <Link href={pageHref(Math.max(1, currentPage - 1))}>Previous</Link>
          </Button>
          <p className="text-sm font-semibold text-slate-600">
            Page {Math.min(currentPage, totalPages)} of {totalPages}
          </p>
          <Button asChild variant="outline" disabled={currentPage >= totalPages}>
            <Link href={pageHref(Math.min(totalPages, currentPage + 1))}>Next</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
