import { describe, expect, it } from "vitest";

import { createMerchantReference, slugify } from "@/lib/utils/slugs";

describe("slug utilities", () => {
  it("normalizes creator-facing text", () => {
    expect(slugify("  Launch ÁI Skills!  ")).toBe("launch-ai-skills");
  });

  it("uses a safe fallback for empty values", () => {
    expect(slugify("!!!")).toBe("creator");
  });

  it("creates short unique merchant references", () => {
    const first = createMerchantReference();
    const second = createMerchantReference();
    expect(first).toMatch(/^OS-/);
    expect(first.length).toBeLessThanOrEqual(50);
    expect(first).not.toBe(second);
  });
});
