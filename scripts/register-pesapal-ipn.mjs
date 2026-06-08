import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const key = process.env.PESAPAL_CONSUMER_KEY;
const secret = process.env.PESAPAL_CONSUMER_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const environment = process.env.PESAPAL_ENVIRONMENT === "production" ? "production" : "sandbox";

if (!key || !secret || !appUrl) {
  throw new Error("PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, and NEXT_PUBLIC_APP_URL are required.");
}

const base = environment === "production" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";
const authResponse = await fetch(`${base}/api/Auth/RequestToken`, {
  method: "POST",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
});
const authPayload = await authResponse.json();
if (!authResponse.ok || !authPayload.token) throw new Error(`Pesapal authentication failed: ${JSON.stringify(authPayload)}`);

const ipnUrl = new URL("/api/billing/ipn", appUrl).toString();
const response = await fetch(`${base}/api/URLSetup/RegisterIPN`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${authPayload.token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
});
const payload = await response.json();
if (!response.ok || !payload.ipn_id) throw new Error(`IPN registration failed: ${JSON.stringify(payload)}`);

console.log(`Registered Pesapal IPN URL: ${ipnUrl}`);
console.log(`PESAPAL_IPN_ID=${payload.ipn_id}`);
