import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const connect = process.argv.includes("--connect");
const errors = [];
const notes = [];

function requireValue(name) {
  const value = process.env[name]?.trim();
  if (!value) errors.push(`${name} is missing.`);
  return value || "";
}

function requirePrefix(name, prefix) {
  const value = requireValue(name);
  if (value && !value.startsWith(prefix)) errors.push(`${name} must start with ${prefix}.`);
  return value;
}

function requireUrl(name, protocols) {
  const value = requireValue(name);
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol)) errors.push(`${name} must use ${protocols.join(" or ")}.`);
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
  return value;
}

const databaseUrl = requireUrl("DATABASE_URL", ["postgres:", "postgresql:"]);
const clerkPublishableKey = requirePrefix("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_");
const clerkSecretKey = requirePrefix("CLERK_SECRET_KEY", "sk_");
const appUrl = requireUrl("NEXT_PUBLIC_APP_URL", ["http:", "https:"]);
const billingProvider = (process.env.BILLING_PROVIDER || "mock").toLowerCase();
const billingTestMode = (process.env.BILLING_TEST_MODE || "false").toLowerCase();
const billingTestAmount = Number(process.env.BILLING_TEST_AMOUNT || "500");
const billingTestCurrency = (process.env.BILLING_TEST_CURRENCY || "UGX").toUpperCase();

if (!["mock", "pesapal"].includes(billingProvider)) {
  errors.push("BILLING_PROVIDER must be mock or pesapal.");
}
if (!["true", "false"].includes(billingTestMode)) {
  errors.push("BILLING_TEST_MODE must be true or false.");
}
if (!Number.isFinite(billingTestAmount) || billingTestAmount <= 0) {
  errors.push("BILLING_TEST_AMOUNT must be a positive number.");
}
if (!["UGX", "USD"].includes(billingTestCurrency)) {
  errors.push("BILLING_TEST_CURRENCY must be UGX or USD.");
}

if (billingProvider === "pesapal") {
  requireValue("PESAPAL_CONSUMER_KEY");
  requireValue("PESAPAL_CONSUMER_SECRET");
  requireValue("PESAPAL_IPN_ID");
  if (!["sandbox", "production"].includes(process.env.PESAPAL_ENVIRONMENT || "sandbox")) {
    errors.push("PESAPAL_ENVIRONMENT must be sandbox or production.");
  }
  if (appUrl && new URL(appUrl).protocol !== "https:") {
    errors.push("NEXT_PUBLIC_APP_URL must use HTTPS for Pesapal IPN callbacks.");
  }
} else {
  notes.push("Mock billing is enabled. No real money will be collected.");
}

if (errors.length) {
  console.error("Configuration check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Configuration values are present and correctly shaped.");
console.log(`- App URL: ${new URL(appUrl).origin}`);
console.log(`- Clerk environment: ${clerkPublishableKey.startsWith("pk_live_") ? "production" : "development"}`);
console.log(`- Billing provider: ${billingProvider}`);
console.log(
  `- Billing price mode: ${billingTestMode === "true" ? `${billingTestCurrency} ${billingTestAmount} test price` : "canonical plan prices"}`,
);
notes.forEach((note) => console.log(`- ${note}`));

if (!connect) {
  console.log("Run `npm run check:services` to test external service connections.");
  process.exit(0);
}

const database = postgres(databaseUrl, { max: 1, prepare: false, connect_timeout: 10 });
try {
  await database`select 1 as connected`;
  console.log("- Neon/Postgres connection: OK");
  const expectedTables = [
    "users",
    "creator_profiles",
    "pages",
    "page_payment_methods",
    "page_sections",
    "page_videos",
    "course_modules",
    "course_lessons",
    "templates",
    "subscriptions",
    "payments",
    "marketing_assets",
    "marketing_captions",
    "marketing_strategies",
    "saved_marketing_assets",
    "saved_marketing_strategies",
    "content_calendar_items",
    "instagram_accounts",
    "page_events",
    "audit_logs",
    "platform_settings",
    "idempotency_keys",
  ];
  const rows = await database`select table_name from information_schema.tables where table_schema = 'public'`;
  const existing = new Set(rows.map((row) => row.table_name));
  const missing = expectedTables.filter((table) => !existing.has(table));
  if (missing.length) throw new Error(`Database schema is missing: ${missing.join(", ")}. Run npm run db:push.`);
  console.log("- OnlineSkiller database schema: OK");
} finally {
  await database.end();
}

const clerkResponse = await fetch("https://api.clerk.com/v1/users?limit=1", {
  headers: { Authorization: `Bearer ${clerkSecretKey}` },
});
if (!clerkResponse.ok) throw new Error(`Clerk connection failed with HTTP ${clerkResponse.status}.`);
console.log("- Clerk API connection: OK");

if (billingProvider === "pesapal") {
  const base =
    process.env.PESAPAL_ENVIRONMENT === "production"
      ? "https://pay.pesapal.com/v3"
      : "https://cybqa.pesapal.com/pesapalv3";
  const response = await fetch(`${base}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  if (!response.ok) throw new Error(`Pesapal authentication failed with HTTP ${response.status}.`);
  console.log("- Pesapal API connection: OK");
}
