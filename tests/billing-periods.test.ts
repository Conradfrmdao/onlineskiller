import { describe, expect, it } from "vitest";

import { addBillingMonth, addTrialDays, hasValidAccess, nextPeriod } from "@/lib/billing/periods";

describe("billing periods", () => {
  it("handles end-of-month renewal safely", () => {
    expect(addBillingMonth(new Date("2026-01-31T12:00:00.000Z")).toISOString()).toBe("2026-02-28T12:00:00.000Z");
  });

  it("extends an unexpired subscription from the existing end", () => {
    const now = new Date("2026-06-08T00:00:00.000Z");
    const currentEnd = new Date("2026-06-20T00:00:00.000Z");
    const period = nextPeriod(currentEnd, now);
    expect(period.start).toEqual(currentEnd);
    expect(period.end.toISOString()).toBe("2026-07-20T00:00:00.000Z");
  });

  it("creates an exact seven-day trial period", () => {
    expect(addTrialDays(new Date("2026-06-08T12:30:00.000Z"), 7).toISOString()).toBe(
      "2026-06-15T12:30:00.000Z",
    );
  });

  it("evaluates active and expired access server-side", () => {
    const now = new Date("2026-06-08T00:00:00.000Z");
    expect(hasValidAccess({ status: "active", currentPeriodEnd: new Date("2026-06-09T00:00:00.000Z") }, now)).toBe(true);
    expect(hasValidAccess({ status: "active", currentPeriodEnd: new Date("2026-06-07T00:00:00.000Z") }, now)).toBe(false);
    expect(hasValidAccess({ status: "inactive", currentPeriodEnd: new Date("2026-07-01T00:00:00.000Z") }, now)).toBe(false);
  });
});
