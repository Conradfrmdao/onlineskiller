import type {
  BillingGateway,
  CheckoutInput,
  CheckoutResult,
  PaymentVerification,
} from "@/lib/billing/gateway.interface";
import { mapPesapalStatus } from "@/lib/billing/status";

type PesapalEnvironment = "sandbox" | "production";

function baseUrl(environment: PesapalEnvironment) {
  if (environment === "production") {
    return "https://pay.pesapal.com/v3";
  }

  return "https://cybqa.pesapal.com/pesapalv3";
}

export class PesapalBillingGateway implements BillingGateway {
  name = "pesapal";

  constructor(
    private config: {
      environment: PesapalEnvironment;
      consumerKey: string;
      consumerSecret: string;
    },
  ) {}

  private async token() {
    const response = await fetch(`${baseUrl(this.config.environment)}/api/Auth/RequestToken`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      }),
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok || typeof payload.token !== "string") {
      throw new Error(`Pesapal authentication failed with HTTP ${response.status}.`);
    }

    return payload.token;
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!input.notificationId) {
      throw new Error("PESAPAL_IPN_ID is required for Pesapal checkout.");
    }

    const token = await this.token();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setUTCFullYear(subscriptionEndDate.getUTCFullYear() + 5);
    const payload: Record<string, unknown> = {
      id: input.merchantReference,
      currency: input.currency,
      amount: input.amount,
      description: input.description,
      callback_url: input.callbackUrl,
      notification_id: input.notificationId,
      billing_address: {
        email_address: input.customer.email,
        phone_number: input.customer.phoneNumber || "",
        country_code: input.customer.countryCode || "",
        first_name: input.customer.firstName,
        middle_name: "",
        last_name: input.customer.lastName,
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: "",
      },
    };

    if (input.recurring) {
      payload.subscription_details = {
        start_date: new Date().toISOString().slice(0, 10),
        end_date: subscriptionEndDate.toISOString().slice(0, 10),
        frequency: "MONTHLY",
      };
    }

    const response = await fetch(`${baseUrl(this.config.environment)}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (
      !response.ok ||
      typeof result.order_tracking_id !== "string" ||
      typeof result.redirect_url !== "string"
    ) {
      throw new Error(`Pesapal checkout failed with HTTP ${response.status}.`);
    }

    return {
      provider: this.name,
      providerTrackingId: result.order_tracking_id,
      redirectUrl: result.redirect_url,
      raw: result,
    };
  }

  async verifyPayment(providerTrackingId: string): Promise<PaymentVerification> {
    const token = await this.token();
    const url = new URL(`${baseUrl(this.config.environment)}/api/Transactions/GetTransactionStatus`);
    url.searchParams.set("orderTrackingId", providerTrackingId);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      throw new Error(`Pesapal verification failed with HTTP ${response.status}.`);
    }

    const currency = result.currency === "UGX" ? "UGX" : result.currency === "USD" ? "USD" : undefined;
    const amount = typeof result.amount === "number" ? result.amount : undefined;
    const merchantReference =
      typeof result.merchant_reference === "string" ? result.merchant_reference : "";

    return {
      status: mapPesapalStatus(result.status_code as number | string | null),
      providerTrackingId,
      merchantReference,
      amount,
      currency,
      paymentMethod:
        typeof result.payment_method === "string" ? result.payment_method : undefined,
      providerStatus:
        typeof result.payment_status_description === "string"
          ? result.payment_status_description
          : undefined,
      providerSubscriptionId:
        typeof result.subscription_id === "string" ? result.subscription_id : undefined,
      raw: result,
    };
  }
}
