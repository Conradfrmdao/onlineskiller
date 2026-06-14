import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { ExternalLink, UserRoundCheck } from "lucide-react";

import {
  approveCustomerRequestAction,
  rejectCustomerRequestAction,
} from "@/actions/customer-request-actions";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  customerRequests,
  pages,
} from "@/db/schema";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";

function badgeVariant(status: string) {
  return status === "approved"
    ? "success"
    : status === "rejected"
      ? "destructive"
      : "warning";
}

export default async function AccessRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; review?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireCreator();
  const query = params.q?.trim() || "";
  const status = ["pending", "approved", "rejected"].includes(params.status || "")
    ? params.status!
    : "";
  const conditions = [eq(customerRequests.creatorId, profile.id)];

  if (status) conditions.push(eq(customerRequests.requestStatus, status));
  if (query) {
    conditions.push(
      or(
        ilike(customerRequests.customerName, `%${query}%`),
        ilike(customerRequests.customerEmail, `%${query}%`),
        ilike(customerRequests.paymentReference, `%${query}%`),
        ilike(pages.title, `%${query}%`),
      )!,
    );
  }

  const rows = await db
    .select({ request: customerRequests, page: pages })
    .from(customerRequests)
    .innerJoin(pages, eq(pages.id, customerRequests.pageId))
    .where(and(...conditions))
    .orderBy(desc(customerRequests.createdAt));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Customer access"
        title="Access requests"
        description="Review external payment proof across every page before granting protected access."
      />
      {params.review === "approved" ? <Alert variant="success">Access approved and email sent.</Alert> : null}
      {params.review === "approved-manual" ? (
        <Alert variant="warning">Access approved. Email was not sent, so share the access link manually.</Alert>
      ) : null}
      {params.review === "rejected" ? <Alert variant="success">Request rejected.</Alert> : null}
      {params.review === "subscription" ? (
        <Alert variant="destructive">Your subscription must be active before you can approve access.</Alert>
      ) : null}

      <form className="panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_220px_auto]">
        <Input name="q" defaultValue={query} placeholder="Search customer, email, reference, or page" />
        <Select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Button type="submit">Filter</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={UserRoundCheck}
          title="No access requests yet"
          description="When customers pay externally, they can submit proof and request access here."
        />
      ) : (
        <div className="space-y-4">
          {rows.map(({ request, page }) => (
            <article key={request.id} className="panel rounded-2xl p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{request.customerName}</h2>
                    <Badge variant={badgeVariant(request.requestStatus)}>{request.requestStatus}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{request.customerEmail}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {page.title} | {request.paymentMethod || "Payment method missing"} | {request.paymentReference || "No reference"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{request.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/pages/${page.id}/customers`}>View details</Link>
                  </Button>
                  {request.paymentProofUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={request.paymentProofUrl} target="_blank" rel="noreferrer">
                        Proof <ExternalLink />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>

              {request.requestStatus === "pending" ? (
                <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 lg:grid-cols-[auto_1fr]">
                  <form action={approveCustomerRequestAction}>
                    <input type="hidden" name="pageId" value={page.id} />
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="returnPath" value="/dashboard/access-requests" />
                    <Button type="submit">Approve access</Button>
                  </form>
                  <form action={rejectCustomerRequestAction} className="flex flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="pageId" value={page.id} />
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="returnPath" value="/dashboard/access-requests" />
                    <Input name="rejectionReason" required placeholder="Reason for rejection" />
                    <Button type="submit" variant="destructive">Reject</Button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
