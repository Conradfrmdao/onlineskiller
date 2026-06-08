import type { Plan } from "@/lib/billing/plans";

export type BillingCurrency = "USD" | "UGX";

export type CheckoutPrice = {
  amountCents: number;
  currency: BillingCurrency;
  isTestPrice: boolean;
};

export function resolveCheckoutPrice(
  plan: Plan,
  options?: {
    testMode?: boolean;
    testAmount?: number;
    testCurrency?: BillingCurrency;
  },
): CheckoutPrice {
  if (options?.testMode) {
    const amount = Number.isFinite(options.testAmount) && Number(options.testAmount) > 0
      ? Number(options.testAmount)
      : 500;

    return {
      amountCents: Math.round(amount * 100),
      currency: options.testCurrency || "UGX",
      isTestPrice: true,
    };
  }

  return {
    amountCents: plan.priceCents,
    currency: "USD",
    isTestPrice: false,
  };
}

export function getCheckoutPrice(plan: Plan) {
  const currency = process.env.BILLING_TEST_CURRENCY === "USD" ? "USD" : "UGX";

  return resolveCheckoutPrice(plan, {
    testMode: process.env.BILLING_TEST_MODE === "true",
    testAmount: Number(process.env.BILLING_TEST_AMOUNT || "500"),
    testCurrency: currency,
  });
}

export function formatCheckoutPrice(price: CheckoutPrice) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: price.currency,
    currencyDisplay: "code",
    maximumFractionDigits: price.currency === "UGX" ? 0 : 2,
  }).format(price.amountCents / 100);
}
