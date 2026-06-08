import Link from "next/link";
import { CreditCard, ShieldCheck, Smartphone } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCheckoutPrice } from "@/lib/billing/checkout-pricing";

function safeCallback(value: string) {
  try {
    const callback = new URL(value);
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    if (callback.origin !== appUrl.origin || callback.pathname !== "/api/billing/callback") {
      return "";
    }

    return callback.toString();
  } catch {
    return "";
  }
}

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callback = safeCallback(typeof params.callback === "string" ? params.callback : "");
  const amountCents = Number(typeof params.amount === "string" ? params.amount : "0");
  const currency = params.currency === "USD" ? "USD" : "UGX";
  const plan = typeof params.plan === "string" ? params.plan : "plan";

  if (!callback || !Number.isFinite(amountCents) || amountCents <= 0) {
    notFound();
  }

  const mobileCallback = new URL(callback);
  mobileCallback.searchParams.set("TestPaymentMethod", "mobile_money");
  const cardCallback = new URL(callback);
  cardCallback.searchParams.set("TestPaymentMethod", "card");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <Badge variant="warning">OnlineSkiller test gateway</Badge>
          <h1 className="mt-4 text-3xl font-bold">Choose how to test payment</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This simulates the checkout flow only. No card or mobile money account will be charged.
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{plan} subscription</p>
              <p className="mt-2 text-3xl font-black">
                {formatCheckoutPrice({ amountCents, currency, isTestPrice: true })}
              </p>
            </div>
            <ShieldCheck className="size-9 text-blue-600" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Button asChild size="lg" className="h-auto w-full justify-between px-5 py-4">
            <Link href={mobileCallback.toString()}>
              <span className="flex items-center gap-3"><Smartphone /> Test mobile money</span>
              <span className="text-xs font-medium opacity-75">Recommended first</span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto w-full justify-start px-5 py-4">
            <Link href={cardCallback.toString()}><CreditCard /> Test card payment</Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Real mobile money becomes available through the embedded payment partner after a public HTTPS callback and IPN ID are configured.
        </p>
      </div>
    </main>
  );
}
