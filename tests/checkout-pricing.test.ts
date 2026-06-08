import { describe, expect, it } from "vitest";

import { formatCheckoutPrice, resolveCheckoutPrice } from "@/lib/billing/checkout-pricing";
import { PLANS } from "@/lib/billing/plans";

describe("checkout pricing", () => {
  it("uses canonical USD plan pricing outside test mode", () => {
    expect(resolveCheckoutPrice(PLANS.starter)).toEqual({
      amountCents: 2000,
      currency: "USD",
      isTestPrice: false,
    });
  });

  it("uses the temporary UGX 500 payment test price", () => {
    const price = resolveCheckoutPrice(PLANS.pro, {
      testMode: true,
      testAmount: 500,
      testCurrency: "UGX",
    });

    expect(price).toEqual({
      amountCents: 50000,
      currency: "UGX",
      isTestPrice: true,
    });
    expect(formatCheckoutPrice(price)).toContain("500");
  });
});
