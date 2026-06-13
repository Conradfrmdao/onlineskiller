import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Eye, FilePlus2, Files, LayoutTemplate, Megaphone, MoreHorizontal, Pause, Pencil, Trash2, UserRoundCheck, WalletCards } from "lucide-react";

import { deletePageAction, pausePageAction } from "@/actions/page-actions";
import { pages, templates } from "@/db/schema";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { getPageAnalytics } from "@/lib/pages/queries";

export default async function PagesPage() {
  const { profile } = await requireCreator();
  const creatorPages = await db
    .select({ page: pages, template: templates })
    .from(pages)
    .leftJoin(templates, eq(templates.id, pages.templateId))
    .where(eq(pages.creatorId, profile.id))
    .orderBy(desc(pages.updatedAt));
  const analytics = await Promise.all(creatorPages.map(({ page }) => getPageAnalytics(page.id)));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Page studio"
        title="Your pages"
        description="Create, preview, publish, and measure every offer from one place."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/templates"><LayoutTemplate /> Browse templates</Link>
            </Button>
            <Button asChild><Link href="/dashboard/pages/new"><FilePlus2 /> New page</Link></Button>
          </>
        }
      />
      {creatorPages.length === 0 ? (
        <EmptyState
          icon={Files}
          title="Your first page starts here"
          description="Choose an offer type and template, then shape the content around what you sell."
          action={<Button asChild><Link href="/dashboard/pages/new">Create my first page</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {creatorPages.map(({ page, template }, index) => (
            <Card key={page.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={page.isLive ? "success" : page.status === "paused" ? "warning" : "secondary"}>{page.status}</Badge>
                      {page.moderationStatus === "taken_down" ? <Badge variant="destructive">admin takedown</Badge> : null}
                      <span className="text-xs text-slate-500">
                        {page.pageType.replaceAll("-", " ")} · {template?.name || "Default style"}
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-lg font-semibold">{page.title}</h2>
                    <p className="mt-1 truncate text-sm text-slate-500">/p/{page.slug}</p>
                  </div>
                  <MoreHorizontal className="size-5 text-slate-400" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold">{analytics[index].views}</p>
                    <p className="text-xs text-slate-500">Page views</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold">{analytics[index].ctaClicks}</p>
                    <p className="text-xs text-slate-500">CTA clicks</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold">{analytics[index].requests}</p>
                    <p className="text-xs text-slate-500">Requests</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild size="sm"><Link href={`/dashboard/pages/${page.id}/edit`}><Pencil /> Edit</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link href={`/dashboard/pages/${page.id}/payments`}><WalletCards /> Payments</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link href={`/dashboard/pages/${page.id}/customers`}><UserRoundCheck /> Customers</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link href={`/dashboard/pages/${page.id}/preview`}><Eye /> Preview</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link href="/dashboard/marketing"><Megaphone /> Marketing</Link></Button>
                  {page.isLive ? (
                    <form action={pausePageAction}>
                      <input type="hidden" name="pageId" value={page.id} />
                      <Button type="submit" variant="outline" size="sm"><Pause /> Pause</Button>
                    </form>
                  ) : null}
                  <form action={deletePageAction} className="ml-auto">
                    <input type="hidden" name="pageId" value={page.id} />
                    <Button type="submit" variant="destructive" size="sm"><Trash2 /> Delete</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
