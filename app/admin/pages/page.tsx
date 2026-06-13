import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";

import { creatorProfiles, pages } from "@/db/schema";
import { moderatePageAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";

export default async function AdminPagesPage() {
  const rows = await db
    .select({ page: pages, creator: creatorProfiles })
    .from(pages)
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, pages.creatorId))
    .orderBy(asc(pages.createdAt));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title="Creator pages" description="Review ownership, open live pages, and take down or restore any page with an audit record." />
      <div className="panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader><TableRow><TableHead>Page</TableHead><TableHead>Creator</TableHead><TableHead>Status</TableHead><TableHead>Type</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map(({ page, creator }) => (
            <TableRow key={page.id}>
              <TableCell><p className="font-semibold">{page.title}</p><p className="text-xs text-slate-500">/p/{page.slug}</p></TableCell>
              <TableCell>{creator.businessName}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={page.isLive ? "success" : "secondary"}>{page.status}</Badge>
                  {page.moderationStatus === "taken_down" ? <Badge variant="destructive">admin takedown</Badge> : null}
                </div>
                {page.moderationReason ? <p className="mt-2 max-w-xs text-xs text-red-700">{page.moderationReason}</p> : null}
              </TableCell>
              <TableCell>{page.pageType}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm"><Link href={`/p/${page.slug}`} target="_blank"><ExternalLink />Open</Link></Button>
                  {page.moderationStatus === "taken_down" ? (
                    <form action={moderatePageAdminAction}>
                      <input type="hidden" name="pageId" value={page.id} />
                      <input type="hidden" name="moderationAction" value="restore" />
                      <Button type="submit" variant="secondary" size="sm"><ShieldCheck /> Restore</Button>
                    </form>
                  ) : (
                    <form action={moderatePageAdminAction} className="flex min-w-72 gap-2">
                      <input type="hidden" name="pageId" value={page.id} />
                      <input type="hidden" name="moderationAction" value="take_down" />
                      <input name="moderationReason" className="h-9 min-w-40 rounded-xl border border-slate-200 px-3 text-xs" placeholder="Reason" required />
                      <Button type="submit" variant="destructive" size="sm"><ShieldAlert /> Take down</Button>
                    </form>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  );
}
