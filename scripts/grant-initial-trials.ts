import { config } from "dotenv";
import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { subscriptions } from "../db/schema";
import { addTrialDays } from "../lib/billing/periods";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to grant initial trials.");
}

const client = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(client);

async function main() {
  const trialStart = new Date();
  const trialEnd = addTrialDays(trialStart, 7);

  const updated = await db
    .update(subscriptions)
    .set({
      status: "trialing",
      planName: "starter",
      provider: "manual",
      currentPeriodStart: trialStart,
      currentPeriodEnd: trialEnd,
      updatedAt: trialStart,
    })
    .where(
      and(
        eq(subscriptions.status, "inactive"),
        isNull(subscriptions.currentPeriodStart),
        isNull(subscriptions.currentPeriodEnd),
      ),
    )
    .returning({ id: subscriptions.id });

  console.log(`Granted initial seven-day trials to ${updated.length} account(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
