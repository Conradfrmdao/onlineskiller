import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  marketingAssets,
  marketingCaptions,
  marketingStrategies,
  platformSettings,
  templates,
} from "../db/schema";
import { MARKETING_ASSET_SEEDS, MARKETING_STRATEGY_SEEDS } from "../lib/marketing/seed-data";
import { TEMPLATE_SEEDS } from "../lib/pages/template-seeds";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed OnlineSkiller.");
}

const client = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(client);

async function main() {
  try {
    for (const template of TEMPLATE_SEEDS) {
      await db
        .insert(templates)
        .values(template)
        .onConflictDoUpdate({
          target: templates.slug,
          set: {
            name: template.name,
            description: template.description,
            pageType: template.pageType,
            isPremium: template.isPremium,
            isActive: true,
            config: template.config,
            updatedAt: new Date(),
          },
        });
    }

    for (const seed of MARKETING_ASSET_SEEDS) {
      const { caption, ...asset } = seed;
      const rows = await db
        .insert(marketingAssets)
        .values(asset)
        .onConflictDoUpdate({
          target: marketingAssets.source,
          set: {
            ...asset,
            updatedAt: new Date(),
          },
        })
        .returning({ id: marketingAssets.id });
      const assetId = rows[0]?.id;
      if (!assetId) continue;
      await db
        .insert(marketingCaptions)
        .values({ assetId, ...caption })
        .onConflictDoUpdate({
          target: marketingCaptions.assetId,
          set: { ...caption, updatedAt: new Date() },
        });
    }

    for (const strategy of MARKETING_STRATEGY_SEEDS) {
      await db
        .insert(marketingStrategies)
        .values(strategy)
        .onConflictDoUpdate({
          target: marketingStrategies.slug,
          set: {
            ...strategy,
            updatedAt: new Date(),
          },
        });
    }

    await db
      .insert(platformSettings)
      .values({
        key: "content_license_notice",
        value: {
          value: "Confirm source license and releases before publishing stock content in a paid campaign.",
        },
      })
      .onConflictDoNothing({ target: platformSettings.key });

    console.log(`Seeded ${TEMPLATE_SEEDS.length} templates.`);
    console.log(`Seeded ${MARKETING_ASSET_SEEDS.length} licensed-source marketing references.`);
    console.log(`Seeded ${MARKETING_STRATEGY_SEEDS.length} marketing strategies.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
