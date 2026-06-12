import { describe, expect, it } from "vitest";

import { cleanHandle, cleanHttpUrl, cleanInternalPath, whatsappUrl } from "@/lib/utils/urls";

describe("URL utilities", () => {
  it("accepts http and https URLs only", () => {
    expect(cleanHttpUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(cleanHttpUrl("javascript:alert(1)")).toBe("");
    expect(cleanHttpUrl("not a url")).toBe("");
  });

  it("normalizes social handles", () => {
    expect(cleanHandle("@creator.name!")).toBe("creator.name");
  });

  it("builds a WhatsApp URL without storing unsafe characters", () => {
    expect(whatsappUrl("+256 700 000 000", "Hello").startsWith("https://wa.me/256700000000")).toBe(true);
  });

  it("allows local return paths and rejects external redirects", () => {
    expect(cleanInternalPath("/dashboard/pages/abc/preview?payment=success")).toBe(
      "/dashboard/pages/abc/preview?payment=success",
    );
    expect(cleanInternalPath("https://example.com", "/dashboard/billing")).toBe("/dashboard/billing");
    expect(cleanInternalPath("//example.com", "/dashboard/billing")).toBe("/dashboard/billing");
  });
});
