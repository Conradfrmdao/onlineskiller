import type { Plan } from "@/lib/billing/plans";
import { formatMoney, type BillingCurrency } from "@/lib/billing/money";

export type { BillingCurrency } from "@/lib/billing/money";

export type CheckoutPrice = {
  amount: number;
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
      amount,
      currency: options.testCurrency || "UGX",
      isTestPrice: true,
    };
  }

  return {
    amount: plan.priceUsd,
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
  return formatMoney(price.amount, price.currency);
}
