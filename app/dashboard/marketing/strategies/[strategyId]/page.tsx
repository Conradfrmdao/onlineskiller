import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { CheckCircle2, LockKeyhole, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { marketingStrategies, savedMarketingStrategies } from "@/db/schema";
import { toggleSavedStrategyAction } from "@/actions/marketing-actions";
import { CopyButton } from "@/components/marketing/CopyButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function StrategyDetailPage({ params }: { params: Promise<{ strategyId: string }> }) {
  const { strategyId } = await params;
  const { profile } = await requireCreator();
  const [rows, entitlements, saved] = await Promise.all([
    db.select().from(marketingStrategies).where(and(eq(marketingStrategies.id, strategyId), eq(marketingStrategies.isActive, true))).limit(1),
    getCreatorEntitlements(profile.id),
    db.select().from(savedMarketingStrategies).where(and(eq(savedMarketingStrategies.creatorId, profile.id), eq(savedMarketingStrategies.strategyId, strategyId))).limit(1),
  ]);
  const strategy = rows[0];
  if (!strategy) notFound();
  const locked = strategy.isPremium && (!entitlements.active || !entitlements.plan.premiumMarketing);

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/marketing/strategies"
        backLabel="All strategies"
        eyebrow={strategy.category}
        title={strategy.title}
        description={strategy.description}
        actions={
          <form action={toggleSavedStrategyAction}>
            <input type="hidden" name="strategyId" value={strategyId} />
            <Button type="submit" variant="outline"><Star className={saved[0] ? "fill-amber-300 text-amber-400" : ""} />{saved[0] ? "Saved" : "Save"}</Button>
          </form>
        }
      />
      {locked ? (
        <div className="panel rounded-2xl p-10 text-center">
          <LockKeyhole className="mx-auto size-10 text-blue-600" />
          <h2 className="mt-4 text-xl font-semibold">Unlock this full strategy</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Growth and Pro include the complete premium strategy library.</p>
          <Button asChild className="mt-5"><Link href="/dashboard/billing">Compare plans</Link></Button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <Card>
              <CardHeader><CardTitle>Step-by-step plan</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {strategy.steps.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</span>
                    <p className="text-sm leading-6">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Best use</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-xs text-slate-500">Platform</p><p className="font-semibold">{strategy.bestPlatform}</p></div>
                <div><p className="text-xs text-slate-500">Difficulty</p><Badge variant="secondary">{strategy.difficultyLevel}</Badge></div>
                <div><p className="text-xs text-slate-500">Recommended page</p><p className="font-semibold">{strategy.recommendedPageType.replaceAll("-", " ")}</p></div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Recommended CTA</p>
                  <p className="mt-2 text-sm leading-6">{strategy.recommendedCta}</p>
                  <CopyButton value={strategy.recommendedCta} label="Copy CTA" />
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Example captions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {strategy.exampleCaptions.map((caption) => (
                  <div key={caption} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm leading-6">{caption}</p><div className="mt-3"><CopyButton value={caption} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Example posts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {strategy.examplePosts.map((post) => (
                  <div key={post} className="flex gap-3 rounded-xl border border-slate-200 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <p className="text-sm leading-6">{post}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
