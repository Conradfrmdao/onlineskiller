import { describe, expect, it } from "vitest";

import { formatOfferPrice } from "@/lib/pages/pricing";

describe("offer price formatting", () => {
  it("adds a sensible country currency to bare numbers", () => {
    expect(formatOfferPrice("30", "Uganda")).toBe("UGX 30");
    expect(formatOfferPrice("1,500", "Kenya")).toBe("KES 1,500");
    expect(formatOfferPrice("49", "")).toBe("USD 49");
  });

  it("preserves explicit prices and non-price instructions", () => {
    expect(formatOfferPrice("$49", "Uganda")).toBe("$49");
    expect(formatOfferPrice("Book a call", "Uganda")).toBe("Book a call");
  });
});
