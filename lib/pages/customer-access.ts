export const CUSTOMER_PAYMENT_STATUSES = ["pending", "confirmed", "refunded"] as const;
export const CUSTOMER_ACCESS_STATUSES = ["pending", "granted", "revoked"] as const;
export const CUSTOMER_FULFILLMENT_STATUSES = ["pending", "processing", "delivered"] as const;
export const CUSTOMER_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;

export function normalizeCustomerStatus<T extends readonly string[]>(
  value: string,
  options: T,
  fallback: T[number],
) {
  return options.includes(value as T[number]) ? (value as T[number]) : fallback;
}

export function hasActiveCustomerAccess(
  input: {
    accessStatus: string;
    requestStatus: string;
    accessExpiresAt: Date | null;
    userStatus: string;
    moderationStatus: string;
    pageStatus: string;
    pageIsLive: boolean;
    subscriptionStatus: string | null;
    subscriptionPeriodEnd: Date | null;
  },
  now = new Date(),
) {
  return (
    input.accessStatus === "granted" &&
    input.requestStatus === "approved" &&
    input.userStatus === "active" &&
    input.moderationStatus === "active" &&
    input.pageStatus === "live" &&
    input.pageIsLive &&
    (input.subscriptionStatus === "active" || input.subscriptionStatus === "trialing") &&
    Boolean(input.subscriptionPeriodEnd && input.subscriptionPeriodEnd > now) &&
    (!input.accessExpiresAt || input.accessExpiresAt > now)
  );
}

export function createWhatsAppAccessMessage(input: {
  customerName: string;
  customerPhone: string;
  pageTitle: string;
  accessUrl: string;
}) {
  const message = `Hi ${input.customerName}, your access to ${input.pageTitle} has been approved. Use this link to access it: ${input.accessUrl}`;
  const phone = input.customerPhone.replace(/\D/g, "");

  return {
    message,
    whatsappUrl: phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : null,
  };
}
