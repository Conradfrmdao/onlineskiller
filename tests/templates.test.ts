import { describe, expect, it } from "vitest";

import { TEMPLATE_SEEDS } from "@/lib/pages/template-seeds";
import { templateConfigSchema } from "@/lib/validation/template-config.schema";

describe("template seed data", () => {
  it("contains thirty unique valid templates", () => {
    expect(TEMPLATE_SEEDS).toHaveLength(30);
    expect(new Set(TEMPLATE_SEEDS.map((template) => template.slug)).size).toBe(30);
    for (const template of TEMPLATE_SEEDS) {
      expect(templateConfigSchema.safeParse(template.config).success).toBe(true);
    }
  });

  it("keeps four templates in the basic tier", () => {
    expect(TEMPLATE_SEEDS.filter((template) => !template.isPremium)).toHaveLength(4);
  });
});
