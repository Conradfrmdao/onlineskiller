import "server-only";

import type { BillingGateway } from "@/lib/billing/gateway.interface";
import { MockBillingGateway } from "@/lib/billing/providers/mock.provider";
import { PesapalBillingGateway } from "@/lib/billing/providers/pesapal.provider";

export function getBillingGateway(provider = process.env.BILLING_PROVIDER || "mock"): BillingGateway {
  if (provider === "mock") {
    return new MockBillingGateway();
  }

  if (provider === "pesapal") {
    const environment = process.env.PESAPAL_ENVIRONMENT === "production" ? "production" : "sandbox";
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY || "";
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || "";

    if (!consumerKey || !consumerSecret) {
      throw new Error("Pesapal credentials are not configured.");
    }

    return new PesapalBillingGateway({
      environment,
      consumerKey,
      consumerSecret,
    });
  }

  throw new Error(`Unsupported billing provider: ${provider}`);
}
