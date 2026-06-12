import { describe, expect, it } from "vitest";

import { MockBillingGateway } from "@/lib/billing/providers/mock.provider";
import { mapPesapalStatus } from "@/lib/billing/status";

describe("billing providers", () => {
  it("maps Pesapal status codes", () => {
    expect(mapPesapalStatus(0)).toBe("pending");
    expect(mapPesapalStatus(1)).toBe("completed");
    expect(mapPesapalStatus(2)).toBe("failed");
    expect(mapPesapalStatus(3)).toBe("canceled");
  });

  it("creates and verifies mock checkout", async () => {
    const gateway = new MockBillingGateway();
    const checkout = await gateway.createCheckout({
      merchantReference: "OS-TEST",
      planName: "starter",
      amount: 20,
      currency: "USD",
      description: "Test",
      callbackUrl: "http://localhost:3000/api/billing/callback",
      recurring: false,
      requestedPaymentMethod: "card",
      customer: { email: "creator@example.com", firstName: "Test", lastName: "Creator" },
    });
    expect(checkout.providerTrackingId).toBe("MOCK-OS-TEST");
    const verification = await gateway.verifyPayment(checkout.providerTrackingId);
    expect(verification.status).toBe("completed");
    expect(verification.merchantReference).toBe("OS-TEST");
  });
});
