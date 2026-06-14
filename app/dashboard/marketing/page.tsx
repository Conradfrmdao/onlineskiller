import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { BookOpenCheck, Clapperboard, Star } from "lucide-react";

import {
  marketingAssets,
  marketingStrategies,
  savedMarketingAssets,
  savedMarketingStrategies,
} from "@/db/schema";
import { AssetCard } from "@/components/marketing/AssetCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function MarketingHomePage() {
  const { profile } = await requireCreator();
  const [entitlements, assets, strategies, savedAssets, savedStrategies] = await Promise.all([
    getCreatorEntitlements(profile.id),
    db
      .select()
      .from(marketingAssets)
      .where(eq(marketingAssets.isActive, true))
      .orderBy(desc(marketingAssets.createdAt), asc(marketingAssets.title))
      .limit(4),
    db.select().from(marketingStrategies).where(eq(marketingStrategies.isActive, true)).orderBy(asc(marketingStrategies.title)).limit(4),
    db.select().from(savedMarketingAssets).where(eq(savedMarketingAssets.creatorId, profile.id)),
    db.select().from(savedMarketingStrategies).where(eq(savedMarketingStrategies.creatorId, profile.id)),
  ]);
  const savedAssetIds = new Set(savedAssets.map((row) => row.assetId));

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Marketing room"
        title="Promote with a clearer plan"
        description="Use licensed clip references, practical hooks, captions, scripts, and step-by-step launch strategies."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#071426] text-white md:col-span-2">
          <CardContent className="p-6 sm:p-8">
            <Badge className="border-white/15 bg-white/10 text-blue-200">{entitlements.plan.label} access</Badge>
            <h2 className="mt-10 max-w-xl text-3xl font-bold">Start with the message. Then choose the clip.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              The library is organized to help you build a credible campaign, not simply collect random content.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="gold"><Link href="/dashboard/marketing/videos"><Clapperboard /> Browse videos</Link></Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Link href="/dashboard/marketing/strategies"><BookOpenCheck /> Open strategies</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Star className="size-6 text-amber-400" />
            <p className="mt-8 text-4xl font-black">{savedAssets.length + savedStrategies.length}</p>
            <p className="mt-1 text-sm text-slate-600">Saved marketing resources</p>
            <Button asChild variant="outline" className="mt-6 w-full"><Link href="/dashboard/calendar">Plan content</Link></Button>
          </CardContent>
        </Card>
      </section>
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Video concepts</h2>
          <Button asChild variant="link"><Link href="/dashboard/marketing/videos">View all</Link></Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              saved={savedAssetIds.has(asset.id)}
              locked={asset.isPremium && (!entitlements.active || !entitlements.plan.premiumMarketing)}
            />
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Strategy playbooks</h2>
          <Button asChild variant="link"><Link href="/dashboard/marketing/strategies">View all</Link></Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {strategies.map((strategy) => (
            <Link key={strategy.id} href={`/dashboard/marketing/strategies/${strategy.id}`} className="panel rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-200">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{strategy.category}</Badge>
                {strategy.isPremium ? <Badge variant="warning">Premium</Badge> : null}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{strategy.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{strategy.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
