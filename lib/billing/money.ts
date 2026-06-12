export type BillingCurrency = "USD" | "UGX";

export function currencyFractionDigits(currency: BillingCurrency) {
  return currency === "UGX" ? 0 : 2;
}

export function formatMoney(amount: number, currency: BillingCurrency) {
  const fractionDigits = currencyFractionDigits(currency);

  return new Intl.NumberFormat(currency === "UGX" ? "en-UG" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
