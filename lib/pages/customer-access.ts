export const CUSTOMER_PAYMENT_STATUSES = ["pending", "confirmed", "refunded"] as const;
export const CUSTOMER_ACCESS_STATUSES = ["pending", "granted", "revoked"] as const;
export const CUSTOMER_FULFILLMENT_STATUSES = ["pending", "processing", "delivered"] as const;

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
    accessExpiresAt: Date | null;
    userStatus: string;
    moderationStatus: string;
  },
  now = new Date(),
) {
  return (
    input.accessStatus === "granted" &&
    input.userStatus === "active" &&
    input.moderationStatus === "active" &&
    (!input.accessExpiresAt || input.accessExpiresAt > now)
  );
}
