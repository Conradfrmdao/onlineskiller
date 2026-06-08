import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Building2, ExternalLink, MessageCircle, ShieldCheck, WalletCards } from "lucide-react";
import { notFound } from "next/navigation";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { CopyButton } from "@/components/marketing/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasValidAccess } from "@/lib/billing/periods";
import { getPublicPageBySlug } from "@/lib/pages/queries";
import { whatsappUrl } from "@/lib/utils/urls";

export const dynamic = "force-dynamic";

function CheckoutUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] px-4 text-white">
      <div className="max-w-md text-center">
        <WalletCards className="mx-auto size-11 text-blue-300" />
        <h1 className="mt-5 text-2xl font-bold">Checkout is currently unavailable.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Return to the offer page or contact the creator for help.</p>
      </div>
    </main>
  );
}

function displayHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "external provider";
  }
}

export default async function PublicCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const [{ pageSlug }, query] = await Promise.all([params, searchParams]);
  const data = await getPublicPageBySlug(pageSlug);

  if (!data) {
    notFound();
  }

  const previewRequested = query.preview === "1";
  const { userId } = await auth();
  const ownerPreview = previewRequested && userId === data.user.clerkUserId;
  const publiclyAvailable =
    data.user.status === "active" &&
    data.page.status === "live" &&
    data.page.isLive &&
    hasValidAccess(data.subscription);

  if (!publiclyAvailable && !ownerPreview) {
    return <CheckoutUnavailable />;
  }

  const methods = data.paymentMethods.filter((method) => method.isEnabled);

  if (methods.length === 0) {
    return <CheckoutUnavailable />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <OnlineSkillerLogo />
          <Button asChild variant="ghost" size="sm">
            <Link href={ownerPreview ? `/dashboard/pages/${data.page.id}/preview` : `/p/${pageSlug}`}>
              <ArrowLeft /> Back to offer
            </Link>
          </Button>
        </div>

        {ownerPreview ? (
          <div className="mt-6 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
            Checkout preview. Only you can access this while the page is unpublished.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card className="overflow-hidden">
              {data.page.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.page.heroImageUrl} alt="" className="aspect-video w-full object-cover" />
              ) : null}
              <CardContent className="p-6">
                <Badge variant="secondary">{data.page.category || data.page.pageType.replaceAll("-", " ")}</Badge>
                <h1 className="mt-4 text-2xl font-bold tracking-tight">{data.page.title}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">{data.page.subtitle}</p>
                {data.page.priceText ? <p className="mt-5 text-3xl font-black text-blue-700">{data.page.priceText}</p> : null}
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Sold by</p>
                  <p className="mt-1 font-semibold">{data.creator.businessName}</p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Choose how to pay</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Complete your purchase directly with the creator.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              OnlineSkiller displays the creator&apos;s payment options but does not receive, hold, or verify customer funds.
            </p>

            <div className="mt-6 space-y-4">
              {methods.map((method) => {
                if (method.methodType === "hosted-link" && method.config.url) {
                  const providerHost = displayHost(method.config.url);
                  return (
                    <Card key={method.id}>
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheck /></span>
                          <div>
                            <h3 className="font-semibold">Continue to {method.config.providerName || method.label}</h3>
                            <p className="mt-1 text-sm text-slate-600">External checkout at {providerHost}. Confirm the domain before paying.</p>
                          </div>
                        </div>
                        <Button asChild><a href={method.config.url} target="_blank" rel="noreferrer">Continue <ExternalLink /></a></Button>
                      </CardContent>
                    </Card>
                  );
                }

                if (method.methodType === "paypal" && method.config.url) {
                  return (
                    <Card key={method.id}>
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-50 font-black text-sky-700">P</span>
                          <div><h3 className="font-semibold">Pay with PayPal</h3><p className="mt-1 text-sm text-slate-600">Continue to PayPal&apos;s hosted payment page.</p></div>
                        </div>
                        <Button asChild><a href={method.config.url} target="_blank" rel="noreferrer">Open PayPal <ExternalLink /></a></Button>
                      </CardContent>
                    </Card>
                  );
                }

                if (method.methodType === "bank-transfer") {
                  const bankFields = [
                    ["Bank", method.config.bankName],
                    ["Account name", method.config.accountName],
                    ["Account number / IBAN", method.config.accountNumber],
                    ["Branch", method.config.branch],
                    ["SWIFT / BIC", method.config.swiftCode],
                  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

                  return (
                    <Card key={method.id}>
                      <CardContent className="p-5">
                        <div className="flex gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Building2 /></span>
                          <div><h3 className="font-semibold">Manual bank transfer</h3><p className="mt-1 text-sm text-slate-600">Send the exact amount using the creator&apos;s details below.</p></div>
                        </div>
                        <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
                          {bankFields.map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-4 p-3">
                              <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold">{value}</p></div>
                              <CopyButton value={value} label="Copy" />
                            </div>
                          ))}
                        </div>
                        {method.config.instructions ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6">{method.config.instructions}</p> : null}
                        <p className="mt-4 text-xs leading-5 text-amber-800">Manual payment is not verified by OnlineSkiller. Confirm the recipient and keep your transaction reference.</p>
                      </CardContent>
                    </Card>
                  );
                }

                if (method.methodType === "whatsapp" && method.config.phone) {
                  const url = whatsappUrl(method.config.phone, method.config.message || `Hi, I would like to pay for ${data.page.title}.`);
                  return (
                    <Card key={method.id}>
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><MessageCircle /></span>
                          <div><h3 className="font-semibold">Arrange payment on WhatsApp</h3><p className="mt-1 text-sm text-slate-600">Ask about mobile money, an invoice, or another local method.</p></div>
                        </div>
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700"><a href={url} target="_blank" rel="noreferrer">Open WhatsApp <ExternalLink /></a></Button>
                      </CardContent>
                    </Card>
                  );
                }

                return null;
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
