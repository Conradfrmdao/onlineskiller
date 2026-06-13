export const OFFER_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "CHF",
  "JPY",
  "CNY",
  "INR",
  "AED",
  "SAR",
  "ZAR",
  "NGN",
  "GHS",
  "KES",
  "UGX",
  "TZS",
  "RWF",
] as const;

export type OfferCurrency = (typeof OFFER_CURRENCY_CODES)[number];

const CURRENCY_NAMES: Record<OfferCurrency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CHF: "Swiss Franc",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  ZAR: "South African Rand",
  NGN: "Nigerian Naira",
  GHS: "Ghanaian Cedi",
  KES: "Kenyan Shilling",
  UGX: "Ugandan Shilling",
  TZS: "Tanzanian Shilling",
  RWF: "Rwandan Franc",
};

export const OFFER_CURRENCIES = OFFER_CURRENCY_CODES.map((code) => ({
  code,
  label: `${code} - ${CURRENCY_NAMES[code]}`,
}));

export function formatOfferPrice(value: string, currency: string = "USD") {
  const price = value.trim();
  if (!price) {
    return "";
  }

  if (/^[\d,.]+$/.test(price)) {
    const amount = Number(price.replaceAll(",", ""));
    const safeCurrency = OFFER_CURRENCY_CODES.includes(currency as OfferCurrency)
      ? currency
      : "USD";

    if (Number.isFinite(amount)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: safeCurrency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  }

  return price;
}
