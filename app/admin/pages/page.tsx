import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ExternalLink, Pause } from "lucide-react";

import { creatorProfiles, pages } from "@/db/schema";
import { pausePageAdminAction } from "@/actions/admin-actions";
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
      <PageHeader eyebrow="Administration" title="Creator pages" description="Review ownership and pause pages that should not remain public." />
      <div className="panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader><TableRow><TableHead>Page</TableHead><TableHead>Creator</TableHead><TableHead>Status</TableHead><TableHead>Type</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map(({ page, creator }) => (
            <TableRow key={page.id}>
              <TableCell><p className="font-semibold">{page.title}</p><p className="text-xs text-slate-500">/p/{page.slug}</p></TableCell>
              <TableCell>{creator.businessName}</TableCell>
              <TableCell><Badge variant={page.isLive ? "success" : "secondary"}>{page.status}</Badge></TableCell>
              <TableCell>{page.pageType}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm"><Link href={`/p/${page.slug}`} target="_blank"><ExternalLink />Open</Link></Button>
                  {page.isLive ? <form action={pausePageAdminAction}><input type="hidden" name="pageId" value={page.id} /><Button type="submit" variant="destructive" size="sm"><Pause />Pause</Button></form> : null}
                </div>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  );
}
