import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { CheckCircle2, ExternalLink, Mail, MessageCircle, UserRoundCheck } from "lucide-react";
import { notFound } from "next/navigation";

import {
  approveCustomerRequestAction,
  markCustomerContactedAction,
  rejectCustomerRequestAction,
  updateCustomerRequestAction,
} from "@/actions/customer-request-actions";
import { PageStudioNav } from "@/components/pages/PageStudioNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { customerRequests } from "@/db/schema";
import { requireCreator } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { getPageAnalytics, getPageStudioData } from "@/lib/pages/queries";
import { createWhatsAppAccessMessage } from "@/lib/pages/customer-access";
import { whatsappUrl } from "@/lib/utils/urls";

function statusVariant(value: string) {
  return value === "confirmed" || value === "granted" || value === "delivered" || value === "approved"
    ? "success"
    : value === "revoked" || value === "refunded" || value === "rejected"
      ? "destructive"
      : "warning";
}

export default async function PageCustomersPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const [{ pageId }, query] = await Promise.all([params, searchParams]);
  const { profile } = await requireCreator();
  const [data, requests, analytics] = await Promise.all([
    getPageStudioData(pageId, profile.id),
    db
      .select()
      .from(customerRequests)
      .where(
        and(
          eq(customerRequests.pageId, pageId),
          eq(customerRequests.creatorId, profile.id),
        ),
      )
      .orderBy(desc(customerRequests.createdAt)),
    getPageAnalytics(pageId),
  ]);

  if (!data) notFound();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Customer operations"
        title={`Customers for ${data.page.title}`}
        description="Anonymous activity stays as totals. People who submit their details appear below so you can confirm payment, grant access, deliver their purchase, and contact them."
      />
      <PageStudioNav pageId={pageId} pageType={data.page.pageType} />

      {query.review === "approved" ? (
        <Alert variant="success">Access approved and the customer email was sent.</Alert>
      ) : null}
      {query.review === "approved-manual" ? (
        <Alert variant="warning">
          Access was approved, but email is not configured or could not be sent. Copy the access link or use WhatsApp.
        </Alert>
      ) : null}
      {query.review === "rejected" ? (
        <Alert variant="success">The request was rejected and customer access remains blocked.</Alert>
      ) : null}
      {query.review === "subscription" ? (
        <Alert variant="destructive">Reactivate your OnlineSkiller subscription before approving customer access.</Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Anonymous page views", analytics.views],
          ["Anonymous CTA clicks", analytics.ctaClicks],
          ["Named customer requests", analytics.requests],
        ].map(([label, value]) => (
          <div key={label} className="panel rounded-2xl p-5">
            <p className="text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <Alert>
        OnlineSkiller cannot identify an anonymous visitor. A person becomes visible here only after submitting the customer request form.
      </Alert>

      {requests.length === 0 ? (
        <EmptyState
          icon={UserRoundCheck}
          title="No customer requests yet"
          description="Share the live page. Visitors who request access, purchase, or contact will appear here."
        />
      ) : (
        <div className="space-y-5">
          {requests.map((request) => {
            const accessUrl = new URL(`/access/${request.accessToken}`, appUrl).toString();
            const accessMessage = createWhatsAppAccessMessage({
              customerName: request.customerName,
              customerPhone: request.customerPhone,
              pageTitle: data.page.title,
              accessUrl,
            });
            return (
              <section key={request.id} className="panel overflow-hidden rounded-2xl">
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{request.customerName}</h2>
                      <Badge variant={statusVariant(request.requestStatus)}>{request.requestStatus}</Badge>
                      <Badge variant={statusVariant(request.paymentStatus)}>Payment: {request.paymentStatus}</Badge>
                      <Badge variant={statusVariant(request.accessStatus)}>Access: {request.accessStatus}</Badge>
                      <Badge variant={statusVariant(request.fulfillmentStatus)}>Delivery: {request.fulfillmentStatus}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Requested {request.createdAt.toLocaleString()} | {request.paymentMethod || "Payment method not chosen"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.customerEmail}
                      {request.paymentReference ? ` | Reference: ${request.paymentReference}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.customerEmail ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={`mailto:${request.customerEmail}`}><Mail /> Email</a>
                      </Button>
                    ) : null}
                    {request.customerPhone ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={whatsappUrl(request.customerPhone, `Hi ${request.customerName}, I am following up about ${data.page.title}.`)} target="_blank" rel="noreferrer">
                          <MessageCircle /> WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    {request.paymentProofUrl ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={request.paymentProofUrl} target="_blank" rel="noreferrer">
                          <ExternalLink /> Open payment proof
                        </a>
                      </Button>
                    ) : null}
                    <form action={markCustomerContactedAction}>
                      <input type="hidden" name="pageId" value={pageId} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        <CheckCircle2 /> {request.lastContactedAt ? "Contacted" : "Mark contacted"}
                      </Button>
                    </form>
                  </div>
                </div>

                {request.requestStatus === "pending" ? (
                  <div className="grid gap-4 border-b border-amber-200 bg-amber-50 p-5 lg:grid-cols-[auto_1fr]">
                    <form action={approveCustomerRequestAction}>
                      <input type="hidden" name="pageId" value={pageId} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <input type="hidden" name="returnPath" value={`/dashboard/pages/${pageId}/customers`} />
                      <Button type="submit">Approve access</Button>
                    </form>
                    <form action={rejectCustomerRequestAction} className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="pageId" value={pageId} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <input type="hidden" name="returnPath" value={`/dashboard/pages/${pageId}/customers`} />
                      <Input
                        name="rejectionReason"
                        placeholder="Reason for rejection"
                        required
                      />
                      <Button type="submit" variant="destructive">Reject request</Button>
                    </form>
                  </div>
                ) : null}

                <form action={updateCustomerRequestAction} className="p-5">
                  <input type="hidden" name="pageId" value={pageId} />
                  <input type="hidden" name="requestId" value={request.id} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Payment</Label>
                      <Select name="paymentStatus" defaultValue={request.paymentStatus}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed received</option>
                        <option value="refunded">Refunded</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Content access</Label>
                      {request.requestStatus === "approved" ? (
                        <Select name="accessStatus" defaultValue={request.accessStatus}>
                          <option value="granted">Granted</option>
                          <option value="revoked">Revoked</option>
                        </Select>
                      ) : (
                        <>
                          <input type="hidden" name="accessStatus" value={request.accessStatus} />
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            {request.requestStatus === "rejected" ? "Blocked after rejection" : "Approve the request to grant access"}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery</Label>
                      <Select name="fulfillmentStatus" defaultValue={request.fulfillmentStatus}>
                        <option value="pending">Pending</option>
                        <option value="processing">On the way / processing</option>
                        <option value="delivered">Delivered</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment reference</Label>
                      <Input name="paymentReference" defaultValue={request.paymentReference} />
                    </div>
                    <div className="space-y-2">
                      <Label>Access length in days</Label>
                      <Input name="accessDays" type="number" min="0" max="3650" defaultValue="0" />
                      <p className="text-xs text-slate-500">Use 0 for no expiry.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery or download URL</Label>
                      <Input name="deliveryUrl" type="url" defaultValue={request.deliveryUrl || ""} />
                    </div>
                    <div className="space-y-2 sm:col-span-3">
                      <Label>Message from customer</Label>
                      <p className="min-h-12 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                        {request.message || "No message supplied."}
                      </p>
                    </div>
                    <div className="space-y-2 sm:col-span-3">
                      <Label>Private note or customer instructions</Label>
                      <Textarea name="creatorNote" defaultValue={request.creatorNote} />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                    <div>
                      {request.accessStatus === "granted" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={accessUrl} target="_blank"><ExternalLink /> Open customer access</Link>
                          </Button>
                          {accessMessage.whatsappUrl ? (
                            <Button asChild variant="outline" size="sm">
                              <a href={accessMessage.whatsappUrl} target="_blank" rel="noreferrer">
                                <MessageCircle /> Send access on WhatsApp
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Grant access to activate the customer link.</p>
                      )}
                    </div>
                    <Button type="submit">Save customer status</Button>
                  </div>
                  {request.rejectionReason ? (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                      Rejection reason: {request.rejectionReason}
                    </p>
                  ) : null}
                </form>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
