export function cleanHttpUrl(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const candidate = value.trim();

  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export function cleanHandle(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, "").slice(0, 100);
}

export function whatsappUrl(phone: string, message = "") {
  const cleanPhone = phone.replace(/\D/g, "");

  if (!cleanPhone) {
    return "";
  }

  const url = new URL(`https://wa.me/${cleanPhone}`);

  if (message) {
    url.searchParams.set("text", message);
  }

  return url.toString();
}
