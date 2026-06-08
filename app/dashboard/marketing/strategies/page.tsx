import Link from "next/link";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { LockKeyhole, Star } from "lucide-react";

import { marketingStrategies, savedMarketingStrategies } from "@/db/schema";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireCreator();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const condition = query
    ? and(eq(marketingStrategies.isActive, true), or(ilike(marketingStrategies.title, `%${query}%`), ilike(marketingStrategies.category, `%${query}%`)))
    : eq(marketingStrategies.isActive, true);
  const [strategies, entitlements, saved] = await Promise.all([
    db.select().from(marketingStrategies).where(condition).orderBy(asc(marketingStrategies.title)),
    getCreatorEntitlements(profile.id),
    db.select().from(savedMarketingStrategies).where(eq(savedMarketingStrategies.creatorId, profile.id)),
  ]);
  const savedIds = new Set(saved.map((row) => row.strategyId));

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dashboard/marketing"
        backLabel="Marketing room"
        eyebrow="Strategy library"
        title="Use a plan, not just another post idea"
        description="Each playbook turns a marketing goal into a practical sequence with examples and a clear CTA."
      />
      <form className="panel flex gap-3 rounded-2xl p-4">
        <Input name="q" defaultValue={query} placeholder="Search strategies" />
        <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white">Search</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {strategies.map((strategy) => {
          const locked = strategy.isPremium && (!entitlements.active || !entitlements.plan.premiumMarketing);
          return (
            <Link key={strategy.id} href={`/dashboard/marketing/strategies/${strategy.id}`} className="panel relative rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-200">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{strategy.category}</Badge>
                <div className="flex items-center gap-2">
                  {savedIds.has(strategy.id) ? <Star className="size-4 fill-amber-300 text-amber-400" /> : null}
                  {strategy.isPremium ? <Badge variant="warning">Premium</Badge> : null}
                </div>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{strategy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{strategy.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                <span>{strategy.bestPlatform}</span><span>{strategy.difficultyLevel}</span>
              </div>
              {locked ? <span className="absolute right-4 top-16 grid size-9 place-items-center rounded-xl bg-slate-950 text-white"><LockKeyhole className="size-4" /></span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
