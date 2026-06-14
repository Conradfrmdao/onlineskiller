import type { TemplateConfig } from "@/lib/pages/types";

export type TemplateSeed = {
  name: string;
  slug: string;
  description: string;
  pageType: string;
  isPremium: boolean;
  config: TemplateConfig;
};

type ExtendedTemplateKeys = "visualStyle" | "buttonStyle" | "sectionLayout" | "heroMediaShape";

type TemplateSeedInput = Omit<TemplateSeed, "config"> & {
  config: Omit<TemplateConfig, ExtendedTemplateKeys> &
    Partial<Pick<TemplateConfig, ExtendedTemplateKeys>>;
};

const commonOrder = ["benefits", "who-it-is-for", "what-you-get", "pricing", "testimonials", "faq"];

const TEMPLATE_SEED_INPUTS: TemplateSeedInput[] = [
  {
    name: "Digital Hustle",
    slug: "digital-hustle",
    description: "A sharp, energetic layout for practical skills and modern digital offers.",
    pageType: "all",
    isPremium: false,
    config: {
      theme: { background: "#071426", surface: "#102a56", text: "#f8fafc", muted: "#b6c4da", accent: "#31d2ff" },
      typography: "bold",
      heroLayout: "split",
      ctaPlacement: "both",
      sectionOrder: commonOrder,
      cardStyle: "outlined",
      footerStyle: "full",
    },
  },
  {
    name: "Luxury Coach",
    slug: "luxury-coach",
    description: "Editorial spacing and refined gold details for premium coaching offers.",
    pageType: "coaching-program",
    isPremium: true,
    config: {
      theme: { background: "#17130f", surface: "#f7f1e7", text: "#211b14", muted: "#74695c", accent: "#c79a43" },
      typography: "editorial",
      heroLayout: "centered",
      ctaPlacement: "both",
      sectionOrder: ["who-it-is-for", "benefits", "testimonials", "what-you-get", "pricing", "faq"],
      cardStyle: "soft",
      footerStyle: "full",
    },
  },
  {
    name: "Clean Academy",
    slug: "clean-academy",
    description: "Clear structure and calm blue accents for courses and learning programs.",
    pageType: "online-course",
    isPremium: false,
    config: {
      theme: { background: "#edf6ff", surface: "#ffffff", text: "#10233f", muted: "#607089", accent: "#1877f2" },
      typography: "modern",
      heroLayout: "split",
      ctaPlacement: "hero",
      sectionOrder: ["benefits", "curriculum", "who-it-is-for", "what-you-get", "testimonials", "faq"],
      cardStyle: "outlined",
      footerStyle: "full",
    },
  },
  {
    name: "Creator Pro",
    slug: "creator-pro",
    description: "A modern personal-brand layout that balances story, proof, and conversion.",
    pageType: "all",
    isPremium: false,
    config: {
      theme: { background: "#f7f8fc", surface: "#ffffff", text: "#14162a", muted: "#666a7d", accent: "#7047eb" },
      typography: "modern",
      heroLayout: "centered",
      ctaPlacement: "both",
      sectionOrder: commonOrder,
      cardStyle: "elevated",
      footerStyle: "minimal",
    },
  },
  {
    name: "Bold Seller",
    slug: "bold-seller",
    description: "High-contrast sections and decisive calls to action for direct-response offers.",
    pageType: "digital-product",
    isPremium: false,
    config: {
      theme: { background: "#fff8df", surface: "#ffffff", text: "#101010", muted: "#615d51", accent: "#ff5a1f" },
      typography: "bold",
      heroLayout: "stacked",
      ctaPlacement: "both",
      sectionOrder: ["benefits", "pricing", "what-you-get", "testimonials", "faq"],
      cardStyle: "outlined",
      footerStyle: "minimal",
    },
  },
  {
    name: "Tech Mentor",
    slug: "tech-mentor",
    description: "A dark technical canvas for coding, AI, analytics, and career mentorship.",
    pageType: "coaching-program",
    isPremium: true,
    config: {
      theme: { background: "#08111d", surface: "#101d2c", text: "#eff8ff", muted: "#9fb0c3", accent: "#36e4a4" },
      typography: "modern",
      heroLayout: "split",
      ctaPlacement: "both",
      sectionOrder: commonOrder,
      cardStyle: "outlined",
      footerStyle: "full",
    },
  },
  {
    name: "Service Expert",
    slug: "service-expert",
    description: "Trust-first presentation for consultants, freelancers, and specialist services.",
    pageType: "service",
    isPremium: true,
    config: {
      theme: { background: "#f0f5f4", surface: "#ffffff", text: "#17312f", muted: "#667d79", accent: "#0f8b7a" },
      typography: "classic",
      heroLayout: "split",
      ctaPlacement: "both",
      sectionOrder: ["benefits", "who-it-is-for", "what-you-get", "testimonials", "pricing", "faq"],
      cardStyle: "soft",
      footerStyle: "full",
    },
  },
  {
    name: "Ebook Launch",
    slug: "ebook-launch",
    description: "A colorful cover-led layout for guides, ebooks, and downloadable resources.",
    pageType: "ebook",
    isPremium: true,
    config: {
      theme: { background: "#fff3f5", surface: "#ffffff", text: "#351721", muted: "#835f69", accent: "#e43d70" },
      typography: "editorial",
      heroLayout: "split",
      ctaPlacement: "both",
      sectionOrder: ["benefits", "what-you-get", "who-it-is-for", "pricing", "testimonials", "faq"],
      cardStyle: "elevated",
      footerStyle: "minimal",
    },
  },
  {
    name: "Workshop Page",
    slug: "workshop-page",
    description: "Time-sensitive energy with an agenda-focused structure for workshops and events.",
    pageType: "workshop",
    isPremium: true,
    config: {
      theme: { background: "#111827", surface: "#1f2937", text: "#ffffff", muted: "#cbd5e1", accent: "#f7c948" },
      typography: "bold",
      heroLayout: "centered",
      ctaPlacement: "both",
      sectionOrder: ["benefits", "what-you-get", "who-it-is-for", "testimonials", "faq"],
      cardStyle: "outlined",
      footerStyle: "full",
    },
  },
  {
    name: "Premium Consultant",
    slug: "premium-consultant",
    description: "A restrained executive layout for high-value advisory and consultation services.",
    pageType: "consultation",
    isPremium: true,
    config: {
      theme: { background: "#e9ecef", surface: "#ffffff", text: "#14191f", muted: "#68717c", accent: "#234d6f" },
      typography: "classic",
      heroLayout: "stacked",
      ctaPlacement: "both",
      sectionOrder: ["who-it-is-for", "benefits", "what-you-get", "testimonials", "pricing", "faq"],
      cardStyle: "elevated",
      footerStyle: "minimal",
    },
  },
  {
    name: "Cohort Lab",
    slug: "cohort-lab",
    description: "A bright, structured learning launch for cohort courses, bootcamps, and guided programs.",
    pageType: "online-course",
    isPremium: true,
    config: {
      theme: { background: "#f4f5ff", surface: "#ffffff", text: "#18183a", muted: "#66678b", accent: "#635bff" },
      typography: "modern", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["benefits", "curriculum", "who-it-is-for", "testimonials", "pricing", "faq"],
      cardStyle: "elevated", footerStyle: "full", visualStyle: "gradient", buttonStyle: "rounded",
      sectionLayout: "cards", heroMediaShape: "browser",
    },
  },
  {
    name: "Masterclass Noir",
    slug: "masterclass-noir",
    description: "A cinematic dark launch page for premium masterclasses and expert-led learning experiences.",
    pageType: "online-course",
    isPremium: true,
    config: {
      theme: { background: "#0c0c0d", surface: "#18181b", text: "#fafafa", muted: "#b3b3bb", accent: "#d8ff3e" },
      typography: "bold", heroLayout: "stacked", ctaPlacement: "sticky",
      sectionOrder: ["benefits", "curriculum", "creator-bio", "testimonials", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "minimal", visualStyle: "technical", buttonStyle: "square",
      sectionLayout: "bands", heroMediaShape: "landscape",
    },
  },
  {
    name: "Conversion Canvas",
    slug: "conversion-canvas",
    description: "A warm, confident storefront for toolkits, downloads, and focused digital products.",
    pageType: "digital-product",
    isPremium: true,
    config: {
      theme: { background: "#fff7ed", surface: "#ffffff", text: "#2b1709", muted: "#7c6250", accent: "#f97316" },
      typography: "bold", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["benefits", "what-you-get", "pricing", "testimonials", "faq"],
      cardStyle: "outlined", footerStyle: "full", visualStyle: "playful", buttonStyle: "rounded",
      sectionLayout: "cards", heroMediaShape: "portrait",
    },
  },
  {
    name: "Product Drop",
    slug: "product-drop",
    description: "A polished release-day layout for bundles, downloads, and limited digital drops.",
    pageType: "digital-product",
    isPremium: true,
    config: {
      theme: { background: "#f5f3ff", surface: "#ffffff", text: "#25133f", muted: "#77658e", accent: "#8b5cf6" },
      typography: "modern", heroLayout: "centered", ctaPlacement: "both",
      sectionOrder: ["features", "what-you-get", "pricing", "testimonials", "faq"],
      cardStyle: "elevated", footerStyle: "minimal", visualStyle: "gradient", buttonStyle: "pill",
      sectionLayout: "bands", heroMediaShape: "poster",
    },
  },
  {
    name: "Author's Desk",
    slug: "authors-desk",
    description: "An elegant editorial sales page for books, guides, reports, and signature written work.",
    pageType: "ebook",
    isPremium: true,
    config: {
      theme: { background: "#f4efe6", surface: "#fffaf1", text: "#2d241b", muted: "#796d5f", accent: "#9b6b3f" },
      typography: "editorial", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["creator-bio", "benefits", "what-you-get", "testimonials", "pricing", "faq"],
      cardStyle: "soft", footerStyle: "full", visualStyle: "editorial", buttonStyle: "rounded",
      sectionLayout: "editorial", heroMediaShape: "poster",
    },
  },
  {
    name: "Field Guide",
    slug: "field-guide",
    description: "A practical, grounded layout for handbooks, playbooks, and actionable downloadable guides.",
    pageType: "ebook",
    isPremium: true,
    config: {
      theme: { background: "#e9f5ec", surface: "#fafffb", text: "#143322", muted: "#5b7464", accent: "#2f855a" },
      typography: "classic", heroLayout: "stacked", ctaPlacement: "hero",
      sectionOrder: ["benefits", "what-you-get", "who-it-is-for", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "minimal", visualStyle: "minimal", buttonStyle: "square",
      sectionLayout: "bands", heroMediaShape: "portrait",
    },
  },
  {
    name: "Momentum Coach",
    slug: "momentum-coach",
    description: "An energetic personal-brand page for transformation, accountability, and coaching programs.",
    pageType: "coaching-program",
    isPremium: true,
    config: {
      theme: { background: "#fff1f4", surface: "#ffffff", text: "#32141e", muted: "#85606b", accent: "#e83e6d" },
      typography: "bold", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["who-it-is-for", "benefits", "creator-bio", "testimonials", "pricing", "faq"],
      cardStyle: "elevated", footerStyle: "full", visualStyle: "playful", buttonStyle: "pill",
      sectionLayout: "cards", heroMediaShape: "portrait",
    },
  },
  {
    name: "Executive Reset",
    slug: "executive-reset",
    description: "A calm, authoritative presentation for leadership coaching and premium advisory programs.",
    pageType: "coaching-program",
    isPremium: true,
    config: {
      theme: { background: "#edf2f7", surface: "#ffffff", text: "#10233a", muted: "#637286", accent: "#1d4f7a" },
      typography: "classic", heroLayout: "centered", ctaPlacement: "both",
      sectionOrder: ["who-it-is-for", "benefits", "testimonials", "what-you-get", "pricing", "faq"],
      cardStyle: "soft", footerStyle: "minimal", visualStyle: "luxury", buttonStyle: "rounded",
      sectionLayout: "editorial", heroMediaShape: "landscape",
    },
  },
  {
    name: "Studio Portfolio",
    slug: "studio-portfolio",
    description: "A visual, premium service page for designers, agencies, photographers, and creative studios.",
    pageType: "service",
    isPremium: true,
    config: {
      theme: { background: "#f2f0ff", surface: "#ffffff", text: "#211a42", muted: "#70688e", accent: "#6d5dfc" },
      typography: "editorial", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["features", "benefits", "creator-bio", "testimonials", "pricing", "faq"],
      cardStyle: "elevated", footerStyle: "full", visualStyle: "gradient", buttonStyle: "rounded",
      sectionLayout: "cards", heroMediaShape: "browser",
    },
  },
  {
    name: "Local Service",
    slug: "local-service",
    description: "A friendly trust-first page for local specialists, appointments, and professional services.",
    pageType: "service",
    isPremium: true,
    config: {
      theme: { background: "#f7fbff", surface: "#ffffff", text: "#12304a", muted: "#61778a", accent: "#0ea5e9" },
      typography: "modern", heroLayout: "stacked", ctaPlacement: "both",
      sectionOrder: ["benefits", "who-it-is-for", "testimonials", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "full", visualStyle: "minimal", buttonStyle: "rounded",
      sectionLayout: "bands", heroMediaShape: "landscape",
    },
  },
  {
    name: "Live Intensive",
    slug: "live-intensive",
    description: "A bold agenda-led launch for one-day workshops, challenges, and hands-on intensives.",
    pageType: "workshop",
    isPremium: true,
    config: {
      theme: { background: "#fff6e4", surface: "#ffffff", text: "#2e1b06", muted: "#806947", accent: "#f59e0b" },
      typography: "bold", heroLayout: "centered", ctaPlacement: "sticky",
      sectionOrder: ["benefits", "what-you-get", "who-it-is-for", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "minimal", visualStyle: "playful", buttonStyle: "square",
      sectionLayout: "cards", heroMediaShape: "poster",
    },
  },
  {
    name: "Event Spark",
    slug: "event-spark",
    description: "A vivid event page for live sessions, creator summits, and audience-building workshops.",
    pageType: "workshop",
    isPremium: true,
    config: {
      theme: { background: "#180b2e", surface: "#281347", text: "#ffffff", muted: "#d8c6f0", accent: "#ff5ca8" },
      typography: "bold", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["benefits", "what-you-get", "creator-bio", "testimonials", "faq"],
      cardStyle: "elevated", footerStyle: "full", visualStyle: "gradient", buttonStyle: "pill",
      sectionLayout: "bands", heroMediaShape: "landscape",
    },
  },
  {
    name: "Inner Circle",
    slug: "inner-circle",
    description: "A refined invitation page for masterminds, private memberships, and premium communities.",
    pageType: "paid-community",
    isPremium: true,
    config: {
      theme: { background: "#f8f4ed", surface: "#ffffff", text: "#2d241b", muted: "#786d60", accent: "#b38748" },
      typography: "editorial", heroLayout: "centered", ctaPlacement: "both",
      sectionOrder: ["who-it-is-for", "benefits", "what-you-get", "testimonials", "pricing", "faq"],
      cardStyle: "soft", footerStyle: "full", visualStyle: "luxury", buttonStyle: "pill",
      sectionLayout: "editorial", heroMediaShape: "portrait",
    },
  },
  {
    name: "Community Pulse",
    slug: "community-pulse",
    description: "A welcoming social layout for active memberships, peer groups, and creator communities.",
    pageType: "paid-community",
    isPremium: true,
    config: {
      theme: { background: "#ecfeff", surface: "#ffffff", text: "#083344", muted: "#4d7178", accent: "#06b6d4" },
      typography: "modern", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["benefits", "who-it-is-for", "what-you-get", "testimonials", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "full", visualStyle: "playful", buttonStyle: "rounded",
      sectionLayout: "cards", heroMediaShape: "browser",
    },
  },
  {
    name: "Design Vault",
    slug: "design-vault",
    description: "A dark product-library layout for design systems, templates, presets, and creative packs.",
    pageType: "template-pack",
    isPremium: true,
    config: {
      theme: { background: "#0d1117", surface: "#161b22", text: "#f8fafc", muted: "#9ca3af", accent: "#8b5cf6" },
      typography: "modern", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["features", "what-you-get", "benefits", "pricing", "testimonials", "faq"],
      cardStyle: "elevated", footerStyle: "minimal", visualStyle: "technical", buttonStyle: "rounded",
      sectionLayout: "cards", heroMediaShape: "browser",
    },
  },
  {
    name: "Resource Shop",
    slug: "resource-shop",
    description: "A cheerful catalog-style page for worksheets, swipe files, bundles, and resource libraries.",
    pageType: "template-pack",
    isPremium: true,
    config: {
      theme: { background: "#fffdf2", surface: "#ffffff", text: "#31230a", muted: "#7a6a48", accent: "#eab308" },
      typography: "bold", heroLayout: "stacked", ctaPlacement: "both",
      sectionOrder: ["what-you-get", "features", "benefits", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "full", visualStyle: "playful", buttonStyle: "square",
      sectionLayout: "bands", heroMediaShape: "poster",
    },
  },
  {
    name: "Strategy Session",
    slug: "strategy-session",
    description: "A focused authority page for audits, advisory calls, and outcome-driven consultations.",
    pageType: "consultation",
    isPremium: true,
    config: {
      theme: { background: "#edf4f8", surface: "#ffffff", text: "#112b3c", muted: "#61737e", accent: "#16697a" },
      typography: "classic", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["who-it-is-for", "benefits", "creator-bio", "testimonials", "pricing", "faq"],
      cardStyle: "soft", footerStyle: "full", visualStyle: "minimal", buttonStyle: "rounded",
      sectionLayout: "editorial", heroMediaShape: "landscape",
    },
  },
  {
    name: "Clinical Clarity",
    slug: "clinical-clarity",
    description: "A clean, reassuring booking page for wellness, specialist, and professional consultations.",
    pageType: "consultation",
    isPremium: true,
    config: {
      theme: { background: "#f3fbf8", surface: "#ffffff", text: "#14352a", muted: "#607b71", accent: "#1f9d72" },
      typography: "modern", heroLayout: "centered", ctaPlacement: "hero",
      sectionOrder: ["benefits", "who-it-is-for", "testimonials", "pricing", "faq"],
      cardStyle: "outlined", footerStyle: "minimal", visualStyle: "minimal", buttonStyle: "pill",
      sectionLayout: "cards", heroMediaShape: "portrait",
    },
  },
  {
    name: "Creator Newsroom",
    slug: "creator-newsroom",
    description: "An editorial personal-brand page for newsletters, media projects, and thought leadership.",
    pageType: "other",
    isPremium: true,
    config: {
      theme: { background: "#f4f4f0", surface: "#ffffff", text: "#181816", muted: "#6d6d66", accent: "#e11d48" },
      typography: "editorial", heroLayout: "stacked", ctaPlacement: "both",
      sectionOrder: ["creator-bio", "features", "benefits", "testimonials", "faq"],
      cardStyle: "outlined", footerStyle: "full", visualStyle: "editorial", buttonStyle: "square",
      sectionLayout: "editorial", heroMediaShape: "landscape",
    },
  },
  {
    name: "Personal Brand Wave",
    slug: "personal-brand-wave",
    description: "A versatile, high-energy personal site for creators launching an original offer or audience.",
    pageType: "other",
    isPremium: true,
    config: {
      theme: { background: "#eff6ff", surface: "#ffffff", text: "#101c35", muted: "#62708a", accent: "#2563eb" },
      typography: "bold", heroLayout: "split", ctaPlacement: "both",
      sectionOrder: ["creator-bio", "benefits", "what-you-get", "testimonials", "pricing", "faq"],
      cardStyle: "elevated", footerStyle: "full", visualStyle: "gradient", buttonStyle: "pill",
      sectionLayout: "cards", heroMediaShape: "portrait",
    },
  },
];

export const TEMPLATE_SEEDS: TemplateSeed[] = TEMPLATE_SEED_INPUTS.map((template) => ({
  ...template,
  config: {
    visualStyle:
      template.slug === "tech-mentor" || template.slug === "digital-hustle"
        ? "technical"
        : template.config.typography === "editorial"
          ? "editorial"
          : template.config.typography === "bold"
            ? "playful"
            : template.config.typography === "classic"
              ? "luxury"
              : "minimal",
    buttonStyle:
      template.config.typography === "bold"
        ? "square"
        : template.config.typography === "modern"
          ? "pill"
          : "rounded",
    sectionLayout:
      template.config.typography === "editorial"
        ? "editorial"
        : template.config.typography === "classic"
          ? "bands"
          : "cards",
    heroMediaShape:
      template.config.heroLayout === "split"
        ? "portrait"
        : template.config.heroLayout === "centered"
          ? "poster"
          : "landscape",
    ...template.config,
  },
}));
