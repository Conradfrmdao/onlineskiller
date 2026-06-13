import { describe, expect, it } from "vitest";

import { formatOfferPrice } from "@/lib/pages/pricing";

describe("offer price formatting", () => {
  it("uses the currency selected by the creator", () => {
    expect(formatOfferPrice("30", "USD")).toBe("$30");
    expect(formatOfferPrice("30", "EUR")).toBe("€30");
    expect(formatOfferPrice("30", "GBP")).toBe("£30");
    expect(formatOfferPrice("1,500", "KES")).toContain("1,500");
  });

  it("preserves explicit prices and non-price instructions", () => {
    expect(formatOfferPrice("$49", "EUR")).toBe("$49");
    expect(formatOfferPrice("Book a call", "GBP")).toBe("Book a call");
  });
});
