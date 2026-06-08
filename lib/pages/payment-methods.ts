export const PAGE_PAYMENT_METHOD_TYPES = [
  "hosted-link",
  "paypal",
  "bank-transfer",
  "whatsapp",
] as const;

export type PagePaymentMethodType = (typeof PAGE_PAYMENT_METHOD_TYPES)[number];

export type PagePaymentMethodConfig = {
  url?: string;
  providerName?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string;
  swiftCode?: string;
  instructions?: string;
  phone?: string;
  message?: string;
};

export function isTrustedPayPalUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (hostname === "paypal.me" ||
        hostname.endsWith(".paypal.me") ||
        hostname === "paypal.com" ||
        hostname.endsWith(".paypal.com"))
    );
  } catch {
    return false;
  }
}

export function hasEnabledPaymentMethods(methods: Array<{ isEnabled: boolean }>) {
  return methods.some((method) => method.isEnabled);
}
