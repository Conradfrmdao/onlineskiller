import type { TemplateConfig } from "@/lib/pages/types";

export type TemplateSeed = {
  name: string;
  slug: string;
  description: string;
  pageType: string;
  isPremium: boolean;
  config: TemplateConfig;
};

const commonOrder = ["benefits", "who-it-is-for", "what-you-get", "pricing", "testimonials", "faq"];

export const TEMPLATE_SEEDS: TemplateSeed[] = [
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
];
