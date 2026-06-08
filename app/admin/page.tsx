import Link from "next/link";
import { count } from "drizzle-orm";
import { CreditCard, Files, LayoutTemplate, Megaphone, Users } from "lucide-react";

import { marketingAssets, pages, subscriptions, templates, users } from "@/db/schema";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminHomePage() {
  const [userRows, pageRows, templateRows, assetRows, subscriptionRows] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(pages),
    db.select({ total: count() }).from(templates),
    db.select({ total: count() }).from(marketingAssets),
    db.select({ total: count() }).from(subscriptions),
  ]);
  const metrics = [
    ["Users", userRows[0]?.total || 0, "/admin/users", Users],
    ["Creator pages", pageRows[0]?.total || 0, "/admin/pages", Files],
    ["Templates", templateRows[0]?.total || 0, "/admin/templates", LayoutTemplate],
    ["Marketing assets", assetRows[0]?.total || 0, "/admin/marketing-assets", Megaphone],
    ["Subscriptions", subscriptionRows[0]?.total || 0, "/admin/subscriptions", CreditCard],
  ] as const;
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Operations" title="Platform overview" description="Review product data and make auditable administrative changes." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, href, Icon]) => (
          <Link key={href} href={href}>
            <Card className="h-full transition hover:-translate-y-1 hover:border-blue-200">
              <CardContent className="p-5"><Icon className="size-5 text-blue-600" /><p className="mt-8 text-3xl font-black">{value}</p><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
