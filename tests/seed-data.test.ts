import { describe, expect, it } from "vitest";

import { MARKETING_ASSET_SEEDS, MARKETING_STRATEGY_SEEDS } from "@/lib/marketing/seed-data";

describe("marketing seed data", () => {
  it("includes twelve source-attributed assets", () => {
    expect(MARKETING_ASSET_SEEDS).toHaveLength(12);
    for (const asset of MARKETING_ASSET_SEEDS) {
      expect(asset.source).toMatch(/^https:\/\/www\.pexels\.com\//);
      expect(asset.licenseType).toContain("Pexels");
    }
  });

  it("includes ten unique strategy playbooks", () => {
    expect(MARKETING_STRATEGY_SEEDS).toHaveLength(10);
    expect(new Set(MARKETING_STRATEGY_SEEDS.map((strategy) => strategy.slug)).size).toBe(10);
  });
});
