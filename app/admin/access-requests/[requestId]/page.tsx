import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  creatorProfiles,
  customerRequests,
  pages,
  users,
} from "@/db/schema";
import { db } from "@/lib/db";

export default async function AdminAccessRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
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
    .where(eq(customerRequests.id, requestId))
    .limit(1);
  const data = rows[0];
  if (!data) notFound();

  const fields = [
    ["Creator", `${data.creator.businessName} (${data.user.email})`],
    ["Page", data.page.title],
    ["Customer", data.request.customerName],
    ["Email", data.request.customerEmail],
    ["WhatsApp", data.request.customerPhone || "Not supplied"],
    ["Payment method", data.request.paymentMethod || "Not supplied"],
    ["Transaction ID", data.request.paymentReference || "Not supplied"],
    ["Submitted", data.request.createdAt.toLocaleString()],
    ["Reviewed", data.request.reviewedAt?.toLocaleString() || "Not reviewed"],
    ["Rejection reason", data.request.rejectionReason || "None"],
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/admin/access-requests"><ArrowLeft /> All access requests</Link>
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">God Mode inspection</p>
          <h1 className="mt-2 text-3xl font-black">{data.request.customerName}</h1>
        </div>
        <Badge variant={data.request.requestStatus === "approved" ? "success" : data.request.requestStatus === "rejected" ? "destructive" : "warning"}>
          {data.request.requestStatus}
        </Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Request details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 break-words text-sm font-medium">{value}</p>
            </div>
          ))}
          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer message</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{data.request.message || "No message."}</p>
          </div>
          {data.request.paymentProofUrl ? (
            <Button asChild className="sm:col-span-2">
              <a href={data.request.paymentProofUrl} target="_blank" rel="noreferrer">
                Open payment proof <ExternalLink />
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
