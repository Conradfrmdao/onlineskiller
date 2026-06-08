export const PAGE_TYPES = [
  "online-course",
  "digital-product",
  "ebook",
  "coaching-program",
  "service",
  "workshop",
  "paid-community",
  "template-pack",
  "consultation",
  "other",
] as const;

export type PageType = (typeof PAGE_TYPES)[number];

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  "online-course": "Online course",
  "digital-product": "Digital product",
  ebook: "Ebook",
  "coaching-program": "Coaching program",
  service: "Service",
  workshop: "Workshop",
  "paid-community": "Paid community",
  "template-pack": "Template pack",
  consultation: "Consultation",
  other: "Other",
};

export const SECTION_TYPES = [
  "benefits",
  "features",
  "what-you-get",
  "who-it-is-for",
  "testimonials",
  "faq",
  "pricing",
  "creator-bio",
  "curriculum",
  "custom",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type PageSectionContent = {
  body?: string;
  items?: Array<{
    title: string;
    description?: string;
    name?: string;
    role?: string;
  }>;
};

export type TemplateConfig = {
  theme: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
  };
  typography: "modern" | "editorial" | "bold" | "classic";
  heroLayout: "split" | "centered" | "stacked";
  ctaPlacement: "hero" | "sticky" | "both";
  sectionOrder: string[];
  cardStyle: "soft" | "outlined" | "elevated";
  footerStyle: "minimal" | "full";
};
