import { describe, expect, it } from "vitest";

import { getLaunchScore, getStarterSections, resolveLaunchCta } from "@/lib/pages/launch-flow";

describe("guided launch flow", () => {
  it("creates useful starter sections for every offer", () => {
    const sections = getStarterSections("digital-product", "Creator Toolkit");
    const visibleCopy = sections
      .filter((section) => section.isVisible !== false)
      .map((section) => `${section.title} ${section.content.body} ${JSON.stringify(section.content.items)}`)
      .join(" ")
      .toLowerCase();

    expect(sections.length).toBeGreaterThanOrEqual(4);
    expect(sections.map((section) => section.type)).toContain("benefits");
    expect(sections.every((section) => section.title.length > 0)).toBe(true);
    expect(visibleCopy).not.toContain("replace this");
    expect(visibleCopy).not.toContain("update this");
  });

  it("builds a WhatsApp CTA from the creator profile", () => {
    const cta = resolveLaunchCta(
      "whatsapp",
      "",
      {
        whatsappNumber: "+256700000000",
        instagramHandle: "",
        displayName: "Conrad",
      },
      "Creator Toolkit",
    );

    expect(cta.ctaUrl).toContain("wa.me/256700000000");
    expect(cta.whatsappEnabled).toBe(true);
  });

  it("scores a complete launch page higher than an empty one", () => {
    const complete = getLaunchScore({
      page: {
        title: "Creator Toolkit",
        subtitle: "A practical system for launching online.",
        description: "Everything a creator needs to turn a useful skill into a clear offer.",
        priceText: "$49",
        ctaText: "Buy now",
        ctaUrl: "https://example.com",
        whatsappEnabled: false,
        introVideoUrl: "https://youtube.com/watch?v=test",
        heroImageUrl: "https://example.com/cover.jpg",
      },
      sections: [
        {
          sectionType: "testimonials",
          isVisible: true,
          content: { items: [{ title: "A real customer", description: "This helped me launch." }] },
        },
        {
          sectionType: "faq",
          isVisible: true,
          content: { items: [{ title: "How does it work?", description: "Follow the steps." }] },
        },
      ],
      videos: [],
    });
    const empty = getLaunchScore({
      page: {
        title: "",
        subtitle: "",
        description: "",
        priceText: "",
        ctaText: "",
        ctaUrl: null,
        whatsappEnabled: false,
        introVideoUrl: null,
        heroImageUrl: null,
      },
      sections: [],
      videos: [],
    });

    expect(complete.score).toBeGreaterThan(empty.score);
    expect(complete.publishReady).toBe(true);
    expect(empty.publishReady).toBe(false);
  });
});
