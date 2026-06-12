import { describe, expect, it } from "vitest";

import {
  CHECKOUT_PAYMENT_METHODS,
  getCheckoutPaymentMethod,
  isCheckoutPaymentMethod,
} from "@/lib/billing/payment-methods";

describe("checkout payment methods", () => {
  it("offers card, MTN, and Airtel in that order", () => {
    expect(CHECKOUT_PAYMENT_METHODS.map((method) => method.value)).toEqual([
      "card",
      "mtn_mobile_money",
      "airtel_money",
    ]);
  });

  it("validates submitted methods and safely defaults to card", () => {
    expect(isCheckoutPaymentMethod("airtel_money")).toBe(true);
    expect(isCheckoutPaymentMethod("cash")).toBe(false);
    expect(getCheckoutPaymentMethod("cash").value).toBe("card");
  });
});
