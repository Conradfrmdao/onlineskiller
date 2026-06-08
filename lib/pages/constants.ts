import type { SectionType } from "@/lib/pages/types";

export const DEFAULT_SECTIONS: Array<{
  type: SectionType;
  title: string;
  content: { body?: string; items?: Array<{ title: string; description?: string }> };
}> = [
  {
    type: "benefits",
    title: "Why this is for you",
    content: {
      items: [
        { title: "Clear outcome", description: "Explain the result your customer can expect." },
        { title: "Built for action", description: "Show how your offer makes the next step easier." },
        { title: "Practical support", description: "Describe the support or resources included." },
      ],
    },
  },
  {
    type: "who-it-is-for",
    title: "Who this is for",
    content: {
      body: "Describe the people who will get the most value from your offer.",
    },
  },
  {
    type: "what-you-get",
    title: "What you get",
    content: {
      items: [
        { title: "Core offer", description: "Add the main product, service, or learning outcome." },
        { title: "Useful resources", description: "List templates, guides, calls, or bonuses." },
      ],
    },
  },
  {
    type: "testimonials",
    title: "What people say",
    content: {
      items: [{ title: "Add your first testimonial", description: "Share a real customer result here." }],
    },
  },
  {
    type: "faq",
    title: "Frequently asked questions",
    content: {
      items: [
        { title: "How do I get started?", description: "Use the button on this page to contact or purchase." },
        { title: "Who is this for?", description: "Update this answer with your ideal customer." },
      ],
    },
  },
];
