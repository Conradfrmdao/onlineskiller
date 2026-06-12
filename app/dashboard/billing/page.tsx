import { Check, CreditCard, ShieldCheck, Smartphone } from "lucide-react";

import { cancelAtPeriodEndAction } from "@/actions/billing-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";
import { formatCheckoutPrice, getCheckoutPrice } from "@/lib/billing/checkout-pricing";
import { CHECKOUT_PAYMENT_METHODS } from "@/lib/billing/payment-methods";
import { formatPlanPrice, PLANS } from "@/lib/billing/plans";
import { getCreatorEntitlements } from "@/lib/billing/subscription";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireCreator();
  const params = await searchParams;
  const entitlements = await getCreatorEntitlements(profile.id);
  const message =
    params.payment === "success"
      ? { variant: "success" as const, text: "Payment verified. Your publishing access is active." }
      : params.payment
        ? { variant: "warning" as const, text: `Payment status: ${String(params.payment)}. Access changes only after server verification.` }
        : params.reason === "publish"
          ? { variant: "warning" as const, text: "Choose a plan to make your page live." }
          : params.reason === "limit"
            ? { variant: "warning" as const, text: "Your current plan has reached its live-page limit." }
            : params.reason === "premium-template"
              ? { variant: "warning" as const, text: "The selected template requires an active Growth or Pro plan." }
            : params.error
              ? { variant: "destructive" as const, text: "Checkout could not be completed. Please try again." }
              : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Subscription"
        title="Billing and publishing access"
        description="Choose a plan and pay securely with card or mobile money without leaving OnlineSkiller."
      />
      {process.env.BILLING_TEST_MODE === "true" ? (
        <Alert variant="warning">
          Payment testing is active. Every plan temporarily charges UGX 500 while checkout and mobile money are being verified.
        </Alert>
      ) : null}
      {message ? <Alert variant={message.variant}>{message.text}</Alert> : null}
      <section className="panel flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={entitlements.active ? "success" : "warning"}>
              {entitlements.subscription?.status || "inactive"}
            </Badge>
            <span className="font-semibold">{entitlements.plan.label}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {entitlements.subscription?.currentPeriodEnd
              ? `Current access ends ${entitlements.subscription.currentPeriodEnd.toLocaleDateString()}.`
              : "You can build and preview pages without an active plan."}
          </p>
          {entitlements.subscription?.recurringEnabled ? (
            <p className="mt-1 text-xs text-slate-500">
              Automatic card renewal is active. Mobile money payments remain one-time unless your payment method supports renewal.
            </p>
          ) : null}
        </div>
        {entitlements.active && !entitlements.subscription?.cancelAtPeriodEnd ? (
          <form action={cancelAtPeriodEndAction}>
            <Button type="submit" variant="outline">Stop local renewal after this period</Button>
          </form>
        ) : null}
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(PLANS).map((plan) => {
          const checkoutPrice = getCheckoutPrice(plan);

          return (
          <article key={plan.name} className={`panel rounded-2xl p-5 ${plan.name === "growth" ? "ring-2 ring-blue-500" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold">{plan.label}</h2>
              <div className="flex items-center gap-2">
                {checkoutPrice.isTestPrice ? <Badge variant="warning">Test price</Badge> : null}
                {plan.name === entitlements.plan.name && entitlements.active ? <Badge variant="success">Current</Badge> : null}
              </div>
            </div>
            <p className="mt-4 text-4xl font-black">{formatPlanPrice(plan)}<span className="text-sm font-medium text-slate-500">/mo</span></p>
            {checkoutPrice.isTestPrice ? (
              <p className="mt-2 text-xs font-semibold text-amber-700">
                Current payment test charge: {formatCheckoutPrice(checkoutPrice)}
              </p>
            ) : null}
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <p key={feature} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 size-4 shrink-0 text-blue-600" />{feature}</p>
              ))}
            </div>
            <div className="mt-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Choose how to pay
              </p>
              <div className="space-y-2">
                {CHECKOUT_PAYMENT_METHODS.map((method, index) => (
                  <form key={method.value} action="/api/billing/checkout" method="post">
                    <input type="hidden" name="plan" value={plan.name} />
                    <input type="hidden" name="paymentMethod" value={method.value} />
                    <Button
                      type="submit"
                      className={
                        method.value === "mtn_mobile_money"
                          ? "w-full justify-start bg-yellow-400 text-slate-950 hover:bg-yellow-300"
                          : method.value === "airtel_money"
                            ? "w-full justify-start bg-red-600 text-white hover:bg-red-500"
                            : "w-full justify-start"
                      }
                      variant={index === 0 && plan.name === "growth" ? "default" : "outline"}
                    >
                      {method.value === "card" ? <CreditCard /> : <Smartphone />}
                      <span className="text-left">
                        <span className="block">{method.label}</span>
                        <span className="block text-[11px] font-medium opacity-75">{method.description}</span>
                      </span>
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          </article>
          );
        })}
      </div>
      <Alert>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <p>OnlineSkiller never activates a plan from the checkout screen alone. Every payment is verified server-side before publishing access changes.</p>
        </div>
      </Alert>
    </div>
  );
}
