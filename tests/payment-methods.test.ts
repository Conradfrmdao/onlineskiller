import { describe, expect, it } from "vitest";

import { hasEnabledPaymentMethods, isTrustedPayPalUrl } from "@/lib/pages/payment-methods";

describe("page payment methods", () => {
  it("accepts official PayPal payment hosts only", () => {
    expect(isTrustedPayPalUrl("https://paypal.me/onlineskiller")).toBe(true);
    expect(isTrustedPayPalUrl("https://www.paypal.com/ncp/payment/example")).toBe(true);
    expect(isTrustedPayPalUrl("https://paypal.com.example.com/steal")).toBe(false);
    expect(isTrustedPayPalUrl("http://paypal.me/insecure")).toBe(false);
  });

  it("detects whether a generated page has checkout options", () => {
    expect(hasEnabledPaymentMethods([{ isEnabled: false }, { isEnabled: true }])).toBe(true);
    expect(hasEnabledPaymentMethods([{ isEnabled: false }])).toBe(false);
  });
});
