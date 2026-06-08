import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import { CalendarDays, Eye, FilePlus2, Files, Megaphone, Rocket, Star } from "lucide-react";

import {
  contentCalendarItems,
  pages,
  savedMarketingAssets,
  savedMarketingStrategies,
} from "@/db/schema";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

const quickActions = [
  { title: "Create a page", description: "Turn an offer into a focused landing page.", href: "/dashboard/pages/new", icon: FilePlus2 },
  { title: "Explore templates", description: "Choose a visual direction for your next launch.", href: "/templates", icon: Rocket },
  { title: "Open marketing", description: "Find hooks, scripts, videos, and practical strategies.", href: "/dashboard/marketing", icon: Megaphone },
];

export default async function DashboardPage() {
  const { profile } = await requireCreator();
  const [entitlements, totalPages, livePages, savedAssets, savedStrategies, calendarItems] = await Promise.all([
    getCreatorEntitlements(profile.id),
    db.select({ total: count() }).from(pages).where(eq(pages.creatorId, profile.id)),
    db
      .select({ total: count() })
      .from(pages)
      .where(sql`${pages.creatorId} = ${profile.id} and ${pages.isLive} = true`),
    db.select({ total: count() }).from(savedMarketingAssets).where(eq(savedMarketingAssets.creatorId, profile.id)),
    db.select({ total: count() }).from(savedMarketingStrategies).where(eq(savedMarketingStrategies.creatorId, profile.id)),
    db.select({ total: count() }).from(contentCalendarItems).where(eq(contentCalendarItems.creatorId, profile.id)),
  ]);

  const metrics = [
    { label: "All pages", value: totalPages[0]?.total || 0, icon: Files },
    { label: "Live pages", value: livePages[0]?.total || 0, icon: Eye },
    { label: "Saved ideas", value: Number(savedAssets[0]?.total || 0) + Number(savedStrategies[0]?.total || 0), icon: Star },
    { label: "Calendar items", value: calendarItems[0]?.total || 0, icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creator dashboard"
        title={`Build something useful, ${profile.displayName.split(" ")[0]}.`}
        description="Your page builder, subscription, marketing library, and publishing workflow live here."
        actions={<Button asChild><Link href="/dashboard/pages/new"><FilePlus2 /> Create page</Link></Button>}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-3xl font-black">{metric.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                </div>
                <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon /></span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="overflow-hidden bg-[#071426] text-white">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge className="border-white/15 bg-white/10 text-blue-200">
                {entitlements.active ? `${entitlements.plan.label} active` : "Publishing locked"}
              </Badge>
              <span className="text-xs text-slate-400">
                {entitlements.subscription?.currentPeriodEnd
                  ? `Access until ${entitlements.subscription.currentPeriodEnd.toLocaleDateString()}`
                  : "No active billing period"}
              </span>
            </div>
            <h2 className="mt-12 max-w-xl text-2xl font-bold">
              {entitlements.active
                ? "Your publishing access is ready."
                : "Build and preview now. Activate a plan when you are ready to go live."}
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="gold"><Link href="/dashboard/billing">Manage subscription</Link></Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Link href="/dashboard/pages">View pages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your brand base</CardTitle>
            <CardDescription>These details flow into your public pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Business</p>
              <p className="font-semibold">{profile.businessName}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Niche</p>
              <p className="font-semibold">{profile.niche}</p>
            </div>
            <Button asChild variant="outline" className="w-full"><Link href="/dashboard/settings">Edit brand settings</Link></Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="panel group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-200">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon /></span>
                <h3 className="mt-8 font-semibold group-hover:text-blue-700">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
