const COUNTRY_CURRENCIES: Record<string, string> = {
  ghana: "GHS",
  kenya: "KES",
  nigeria: "NGN",
  rwanda: "RWF",
  tanzania: "TZS",
  uganda: "UGX",
};

export function formatOfferPrice(value: string, country = "") {
  const price = value.trim();
  if (!price) {
    return "";
  }

  if (/^[\d,.]+$/.test(price)) {
    const currency = COUNTRY_CURRENCIES[country.trim().toLowerCase()] || "USD";
    return `${currency} ${price}`;
  }

  return price;
}
