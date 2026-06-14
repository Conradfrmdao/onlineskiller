import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { ExternalLink, UserRoundCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  creatorProfiles,
  customerRequests,
  pages,
  users,
} from "@/db/schema";
import { db } from "@/lib/db";

function badgeVariant(status: string) {
  return status === "approved"
    ? "success"
    : status === "rejected"
      ? "destructive"
      : "warning";
}

export default async function AdminAccessRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const status = ["pending", "approved", "rejected"].includes(params.status || "")
    ? params.status!
    : "";
  const conditions = [];
  if (status) conditions.push(eq(customerRequests.requestStatus, status));
  if (query) {
    conditions.push(
      or(
        ilike(customerRequests.customerName, `%${query}%`),
        ilike(customerRequests.customerEmail, `%${query}%`),
        ilike(pages.title, `%${query}%`),
        ilike(users.email, `%${query}%`),
      )!,
    );
  }

  const rows = await db
    .select({
      request: customerRequests,
      page: pages,
      creator: creatorProfiles,
      user: users,
    })
    .from(customerRequests)
    .innerJoin(pages, eq(pages.id, customerRequests.pageId))
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, customerRequests.creatorId))
    .innerJoin(users, eq(users.id, creatorProfiles.userId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(customerRequests.createdAt));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="God Mode"
        title="Customer access requests"
        description="Inspect external-payment access activity across every creator. Approval remains with the page owner."
      />
      <form className="panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_220px_auto]">
        <Input name="q" defaultValue={query} placeholder="Search customer, creator, email, or page" />
        <Select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Button type="submit">Filter</Button>
      </form>
      {rows.length === 0 ? (
        <EmptyState icon={UserRoundCheck} title="No access requests" description="Customer proof submissions will appear here." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {rows.map(({ request, page, creator, user }) => (
            <article key={request.id} className="panel rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{creator.businessName}</p>
                  <h2 className="mt-2 font-semibold">{request.customerName}</h2>
                  <p className="mt-1 text-sm text-slate-600">{request.customerEmail}</p>
                </div>
                <Badge variant={badgeVariant(request.requestStatus)}>{request.requestStatus}</Badge>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold">{page.title}</p>
                <p className="mt-1 text-slate-600">{request.paymentMethod} | {request.paymentReference || "No reference"}</p>
                <p className="mt-1 text-xs text-slate-500">Creator account: {user.email}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/admin/access-requests/${request.id}`}>Inspect request</Link>
                </Button>
                {request.paymentProofUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={request.paymentProofUrl} target="_blank" rel="noreferrer">Open proof <ExternalLink /></a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
