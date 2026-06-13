import { describe, expect, it } from "vitest";

import {
  CUSTOMER_ACCESS_STATUSES,
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
          accessExpiresAt: null,
          userStatus: "active",
          moderationStatus: "active",
        },
        now,
      ),
    ).toBe(true);
  });

  it("blocks expired, revoked, suspended, and moderated access", () => {
    const base = {
      accessStatus: "granted",
      accessExpiresAt: new Date("2026-06-14T12:00:00.000Z"),
      userStatus: "active",
      moderationStatus: "active",
    };

    expect(hasActiveCustomerAccess({ ...base, accessExpiresAt: new Date("2026-06-12") }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, accessStatus: "revoked" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, userStatus: "suspended" }, now)).toBe(false);
    expect(hasActiveCustomerAccess({ ...base, moderationStatus: "taken_down" }, now)).toBe(false);
  });

  it("normalizes unknown status input to a safe fallback", () => {
    expect(normalizeCustomerStatus("granted", CUSTOMER_ACCESS_STATUSES, "pending")).toBe("granted");
    expect(normalizeCustomerStatus("owner", CUSTOMER_ACCESS_STATUSES, "pending")).toBe("pending");
  });
});
