import type {
  BillingGateway,
  CheckoutInput,
  CheckoutResult,
  PaymentVerification,
} from "@/lib/billing/gateway.interface";

export class MockBillingGateway implements BillingGateway {
  name = "mock";

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const providerTrackingId = `MOCK-${input.merchantReference}`;
    const callback = new URL(input.callbackUrl);
    callback.searchParams.set("OrderTrackingId", providerTrackingId);
    callback.searchParams.set("OrderMerchantReference", input.merchantReference);
    const checkout = new URL("/billing/mock-checkout", input.callbackUrl);
    checkout.searchParams.set("callback", callback.toString());
    checkout.searchParams.set("amount", String(input.amount));
    checkout.searchParams.set("currency", input.currency);
    checkout.searchParams.set("plan", input.planName);

    return {
      provider: this.name,
      providerTrackingId,
      redirectUrl: checkout.toString(),
      raw: {
        mock: true,
        recurring: input.recurring,
      },
    };
  }

  async verifyPayment(providerTrackingId: string): Promise<PaymentVerification> {
    return {
      status: providerTrackingId.includes("FAIL") ? "failed" : "completed",
      providerTrackingId,
      merchantReference: providerTrackingId.replace(/^MOCK-/, ""),
      paymentMethod: "mock",
      providerStatus: providerTrackingId.includes("FAIL") ? "Failed" : "Completed",
      raw: {
        mock: true,
      },
    };
  }
}
