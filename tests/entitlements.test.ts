import { describe, expect, it } from "vitest";

import {
  canAccessOwnedResource,
  canPublishAnotherPage,
  canUsePremiumMarketing,
  canUsePremiumTemplate,
} from "@/lib/billing/entitlements";
import { PLANS } from "@/lib/billing/plans";

describe("plan entitlements", () => {
  it("enforces live page limits", () => {
    expect(canPublishAnotherPage(PLANS.starter, 0)).toBe(true);
    expect(canPublishAnotherPage(PLANS.starter, 1)).toBe(false);
    expect(canPublishAnotherPage(PLANS.growth, 4)).toBe(true);
    expect(canPublishAnotherPage(PLANS.growth, 5)).toBe(false);
    expect(canPublishAnotherPage(PLANS.pro, 500)).toBe(true);
  });

  it("requires both an active period and a capable plan for premium resources", () => {
    expect(canUsePremiumTemplate(PLANS.growth, true)).toBe(true);
    expect(canUsePremiumTemplate(PLANS.growth, false)).toBe(false);
    expect(canUsePremiumMarketing(PLANS.starter, true)).toBe(false);
  });

  it("denies cross-account ownership", () => {
    expect(canAccessOwnedResource("creator-a", "creator-a")).toBe(true);
    expect(canAccessOwnedResource("creator-a", "creator-b")).toBe(false);
  });
});
