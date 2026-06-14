import { describe, expect, it } from "vitest";

import {
  CUSTOMER_ACCESS_STATUSES,
  createWhatsAppAccessMessage,
  hasActiveCustomerAccess,
  normalizeCustomerStatus,
} from "@/lib/pages/customer-access";

describe("customer access", () => {
  const now = new Date("2026-06-13T12:00:00.000Z");

  it("allows approved access without an expiry", () => {
    expect(
      hasActiveCustomerAccess(
        {
          accessStatus: "granted",
          requestStatus: "approved",
          accessExpiresAt: null,
          userStatus: "active",
          moderationStatus: "active",
          pageStatus: "live",
          pageIsLive: true,
          subscriptionStatus: "active",
          subscriptionPeriodEnd: new Date("2026-07-13T12:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
  });

  it("blocks expired, revoked, suspended, and moderated access", () => {
    const base = {
      accessStatus: "granted",
      requestStatus: "approved",
      accessExpiresAt: new Date("2026-06-14T12:00:00.000Z"),
      userStatus: "active",
      moderationStatus: "active",
      pageStatus: "live",
      pageIsLive: true,
      subscriptionStatus: "active",
      subscriptionPeriodEnd: new Date("2026-07-13T12:00:00.000Z"),
    };

    expect(hasActiveCustomerAccess({ ...base, accessExpiresAt: new Date("2026-06-12") }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, accessStatus: "revoked" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, requestStatus: "pending" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, userStatus: "suspended" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, moderationStatus: "taken_down" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, pageStatus: "paused" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, pageIsLive: false }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, subscriptionStatus: "inactive" }, now)).toBe(false);
    expect(
      hasActiveCustomerAccess(
        { ...base, subscriptionPeriodEnd: new Date("2026-06-12T12:00:00.000Z") },
        now,
      ),
    ).toBe(false);
  });

  it("normalizes unknown status input to a safe fallback", () => {
    expect(normalizeCustomerStatus("granted", CUSTOMER_ACCESS_STATUSES, "pending")).toBe("granted");
    expect(normalizeCustomerStatus("owner", CUSTOMER_ACCESS_STATUSES, "pending")).toBe("pending");
  });

  it("creates a clean WhatsApp approval message", () => {
    const result = createWhatsAppAccessMessage({
      customerName: "Brian",
      customerPhone: "+256 700-123-456",
      pageTitle: "AI Masterclass",
      accessUrl: "https://onlineskiller.vercel.app/access/token",
    });

    expect(result.whatsappUrl).toContain("https://wa.me/256700123456");
    expect(result.message).toContain("AI Masterclass");
  });
});
