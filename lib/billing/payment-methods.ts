export const CHECKOUT_PAYMENT_METHODS = [
  {
    value: "card",
    label: "Card",
    description: "Visa or Mastercard",
  },
  {
    value: "mtn_mobile_money",
    label: "MTN Mobile Money",
    description: "Pay from your MTN wallet",
  },
  {
    value: "airtel_money",
    label: "Airtel Money",
    description: "Pay from your Airtel wallet",
  },
] as const;

export type CheckoutPaymentMethod = (typeof CHECKOUT_PAYMENT_METHODS)[number]["value"];

export function isCheckoutPaymentMethod(value: string): value is CheckoutPaymentMethod {
  return CHECKOUT_PAYMENT_METHODS.some((method) => method.value === value);
}

export function getCheckoutPaymentMethod(value: string | null | undefined) {
  return CHECKOUT_PAYMENT_METHODS.find((method) => method.value === value) || CHECKOUT_PAYMENT_METHODS[0];
}
