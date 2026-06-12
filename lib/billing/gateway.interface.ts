import type { PlanName } from "@/lib/billing/plans";
import type { BillingCurrency } from "@/lib/billing/money";

export type CheckoutInput = {
  merchantReference: string;
  planName: PlanName;
  amount: number;
  currency: BillingCurrency;
  description: string;
  callbackUrl: string;
  notificationId?: string;
  recurring: boolean;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    countryCode?: string;
  };
};

export type CheckoutResult = {
  provider: string;
  providerTrackingId: string;
  redirectUrl: string;
  raw: Record<string, unknown>;
};

export type PaymentVerification = {
  status: "pending" | "completed" | "failed" | "canceled";
  providerTrackingId: string;
  merchantReference: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  providerStatus?: string;
  providerSubscriptionId?: string;
  raw: Record<string, unknown>;
};

export interface BillingGateway {
  name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyPayment(providerTrackingId: string): Promise<PaymentVerification>;
}
