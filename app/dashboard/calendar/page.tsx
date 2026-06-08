import { asc, eq } from "drizzle-orm";
import { CalendarDays, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  contentCalendarItems,
  marketingAssets,
  marketingStrategies,
  pages,
} from "@/db/schema";
import { createCalendarItemAction, deleteCalendarItemAction } from "@/actions/marketing-actions";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireCreator } from "@/lib/auth/user";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";

export default async function CalendarPage() {
  const { profile } = await requireCreator();
  const [entitlements, items, creatorPages, assets, strategies] = await Promise.all([
    getCreatorEntitlements(profile.id),
    db.select().from(contentCalendarItems).where(eq(contentCalendarItems.creatorId, profile.id)).orderBy(asc(contentCalendarItems.scheduledFor)),
    db.select({ id: pages.id, title: pages.title }).from(pages).where(eq(pages.creatorId, profile.id)).orderBy(asc(pages.title)),
    db.select({ id: marketingAssets.id, title: marketingAssets.title }).from(marketingAssets).where(eq(marketingAssets.isActive, true)).orderBy(asc(marketingAssets.title)),
    db.select({ id: marketingStrategies.id, title: marketingStrategies.title }).from(marketingStrategies).where(eq(marketingStrategies.isActive, true)).orderBy(asc(marketingStrategies.title)),
  ]);
  const canUseCalendar = entitlements.active && entitlements.plan.calendar;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Content calendar" title="Turn saved ideas into a posting rhythm" description="Plan manually for the MVP. Nothing is automatically published to a social platform." />
      {!canUseCalendar ? (
        <Alert variant="warning">
          Content calendar tools are included with Growth and Pro. <Link href="/dashboard/billing" className="font-semibold underline">View plans</Link>
        </Alert>
      ) : (
        <form action={createCalendarItemAction} className="panel rounded-2xl p-5">
          <h2 className="font-semibold">Add content item</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Title</Label><Input name="title" required /></div>
            <div className="space-y-2"><Label>Platform</Label><Select name="platform"><option>instagram</option><option>tiktok</option><option>whatsapp</option><option>youtube-shorts</option><option>facebook</option></Select></div>
            <div className="space-y-2"><Label>Related page</Label><Select name="pageId"><option value="">None</option>{creatorPages.map((page) => <option key={page.id} value={page.id}>{page.title}</option>)}</Select></div>
            <div className="space-y-2"><Label>Marketing asset</Label><Select name="assetId"><option value="">None</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.title}</option>)}</Select></div>
            <div className="space-y-2"><Label>Strategy</Label><Select name="strategyId"><option value="">None</option>{strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.title}</option>)}</Select></div>
            <div className="space-y-2"><Label>Date and time</Label><Input type="datetime-local" name="scheduledFor" /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Caption draft</Label><Textarea name="caption" /></div>
            <div className="space-y-2"><Label>Status</Label><Select name="status"><option value="draft">Draft</option><option value="scheduled">Scheduled placeholder</option><option value="posted">Posted</option></Select></div>
          </div>
          <Button type="submit" className="mt-5">Add to calendar</Button>
        </form>
      )}
      {items.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No content planned yet" description="Add your first draft, idea, or scheduled placeholder to build a consistent week." />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="panel flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{item.platform}</Badge><Badge variant={item.status === "posted" ? "success" : "outline"}>{item.status}</Badge></div>
                <h2 className="mt-2 font-semibold">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{item.scheduledFor ? item.scheduledFor.toLocaleString() : "No date selected"}</p>
                {item.caption ? <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.caption}</p> : null}
              </div>
              <form action={deleteCalendarItemAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <Button type="submit" variant="destructive" size="icon"><Trash2 /></Button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
