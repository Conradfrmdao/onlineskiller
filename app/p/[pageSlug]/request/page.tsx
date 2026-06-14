import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import {
  createCustomerRequestAction,
  submitCustomerPaymentReferenceAction,
} from "@/actions/customer-request-actions";
import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { customerRequests } from "@/db/schema";
import { hasValidAccess } from "@/lib/billing/periods";
import { db } from "@/lib/db";
import { formatOfferPrice } from "@/lib/pages/pricing";
import { getPublicPageBySlug } from "@/lib/pages/queries";
import { whatsappUrl } from "@/lib/utils/urls";

export const dynamic = "force-dynamic";

export default async function CustomerRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageSlug: string }>;
  searchParams: Promise<{
    submitted?: string;
    error?: string;
    preview?: string;
    reference?: string;
    notice?: string;
  }>;
}) {
  const [{ pageSlug }, query] = await Promise.all([params, searchParams]);
  const data = await getPublicPageBySlug(pageSlug);
  if (!data) notFound();

  const { userId } = await auth();
  const ownerPreview = query.preview === "1" && userId === data.user.clerkUserId;
  const available =
    data.user.status === "active" &&
    data.page.status === "live" &&
    data.page.isLive &&
    data.page.moderationStatus === "active" &&
    hasValidAccess(data.subscription);

  if (!available && !ownerPreview) {
    notFound();
  }

  const submitted = query.submitted
    ? (
        await db
          .select()
          .from(customerRequests)
          .where(
            and(
              eq(customerRequests.accessToken, query.submitted),
              eq(customerRequests.pageId, data.page.id),
            ),
          )
          .limit(1)
      )[0]
    : null;
  const paymentMethods = data.paymentMethods.filter((method) => method.isEnabled);
  const displayPrice = formatOfferPrice(data.page.priceText, data.page.priceCurrency);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <OnlineSkillerLogo />
          <Button asChild variant="ghost" size="sm">
            <Link href={ownerPreview ? `/dashboard/pages/${data.page.id}/preview` : `/p/${pageSlug}`}>
              <ArrowLeft /> Back to offer
            </Link>
          </Button>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
          <div className="bg-[#071426] px-6 py-8 text-white sm:px-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
              Request access or purchase
            </p>
            <h1 className="mt-3 text-3xl font-black">{data.page.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span>{data.creator.businessName}</span>
              {displayPrice ? <span className="rounded-full bg-white/10 px-3 py-1 font-bold text-white">{displayPrice}</span> : null}
            </div>
          </div>

          {submitted ? (
            <div className="p-6 sm:p-9">
              <CheckCircle2 className="size-12 text-emerald-600" />
              <h2 className="mt-5 text-2xl font-bold">Your request has been sent.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {data.creator.businessName} can now see your request, contact you, confirm payment,
                and grant access or mark delivery from their OnlineSkiller dashboard.
              </p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Request ID</p>
                <p className="mt-2 break-all font-mono text-sm">{submitted.id}</p>
              </div>

              {paymentMethods.length ? (
                <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
                  <Link href={`/p/${pageSlug}/checkout?request=${submitted.accessToken}`}>
                    Continue to payment options
                  </Link>
                </Button>
              ) : data.creator.whatsappNumber ? (
                <Button asChild size="lg" className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto">
                  <a
                    href={whatsappUrl(
                      data.creator.whatsappNumber,
                      `Hi, I submitted request ${submitted.id} for ${data.page.title}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle /> Contact creator
                  </a>
                </Button>
              ) : null}

              <form action={submitCustomerPaymentReferenceAction} className="mt-8 rounded-2xl border border-slate-200 p-4">
                <input type="hidden" name="pageSlug" value={pageSlug} />
                <input type="hidden" name="accessToken" value={submitted.accessToken} />
                <Label htmlFor="paymentReference">Payment reference or transaction ID</Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="paymentReference"
                    name="paymentReference"
                    defaultValue={submitted.paymentReference}
                    placeholder="Add this after paying"
                  />
                  <Button type="submit" variant="outline">Save reference</Button>
                </div>
                {query.reference === "saved" ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">Payment reference saved.</p>
                ) : null}
              </form>

              {submitted.accessStatus === "granted" ? (
                <Alert variant="success" className="mt-6">
                  Access is approved. <Link href={`/access/${submitted.accessToken}`} className="font-bold underline">Open your content</Link>.
                </Alert>
              ) : null}
            </div>
          ) : (
            <form action={createCustomerRequestAction} className="p-6 sm:p-9">
              <input type="hidden" name="pageId" value={data.page.id} />
              <input type="hidden" name="pageSlug" value={pageSlug} />
              {ownerPreview ? <input type="hidden" name="preview" value="1" /> : null}
              <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
                Your details go to the creator so they can confirm payment, deliver the product,
                grant course access, or answer your questions.
              </div>
              {query.error === "contact" ? (
                <Alert variant="destructive" className="mt-5">
                  Add your name, email address, and payment method.
                </Alert>
              ) : null}
              {query.error === "proof" ? (
                <Alert variant="destructive" className="mt-5">
                  Add either a transaction ID or a link to your payment screenshot.
                </Alert>
              ) : null}
              {query.notice === "sent" ? (
                <Alert variant="success" className="mt-5">
                  Your access request has been sent. The creator will review your payment before approving access.
                </Alert>
              ) : null}
              {query.notice === "pending" ? (
                <Alert variant="warning" className="mt-5">
                  You already have a pending request for this product. The creator will review it soon.
                </Alert>
              ) : null}
              {query.notice === "active" ? (
                <Alert variant="success" className="mt-5">
                  You already have approved access. Check your email or contact the creator for your link.
                </Alert>
              ) : null}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customerName">Your name</Label>
                  <Input id="customerName" name="customerName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input id="customerEmail" name="customerEmail" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone or WhatsApp</Label>
                  <Input id="customerPhone" name="customerPhone" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="paymentMethod">Preferred payment method</Label>
                  <Select id="paymentMethod" name="paymentMethod" defaultValue="" required>
                    <option value="" disabled>Choose payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.methodType}>{method.label}</option>
                    ))}
                    <option value="contact">Discuss with creator</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentReference">Transaction ID or reference</Label>
                  <Input
                    id="paymentReference"
                    name="paymentReference"
                    placeholder="Example: MTN12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentProofUrl">Payment screenshot link</Label>
                  <Input
                    id="paymentProofUrl"
                    name="paymentProofUrl"
                    type="url"
                    placeholder="Google Drive or image URL"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">Question or delivery note</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell the creator what you need or ask a question."
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full">
                Submit payment proof
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
