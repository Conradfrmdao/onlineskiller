import { describe, expect, it } from "vitest";

import { formatMoney } from "@/lib/billing/money";

describe("exact money handling", () => {
  it("formats the exact UGX amount", () => {
    expect(formatMoney(500, "UGX")).toContain("500");
  });

  it("formats the exact USD amount", () => {
    expect(formatMoney(20, "USD")).toContain("20.00");
  });
});
