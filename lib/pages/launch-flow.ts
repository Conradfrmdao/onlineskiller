import type { CreatorPage, PageSection, PageVideo } from "@/db/schema";
import type { PageType, SectionType } from "@/lib/pages/types";
import { cleanHandle, cleanHttpUrl, whatsappUrl } from "@/lib/utils/urls";

export const LAUNCH_GOALS = [
  {
    value: "whatsapp",
    label: "Message me on WhatsApp",
    description: "Start a direct sales conversation.",
    ctaText: "Chat on WhatsApp",
    needsDestination: false,
  },
  {
    value: "buy-now",
    label: "Buy now",
    description: "Send visitors to your secure checkout.",
    ctaText: "Buy now",
    needsDestination: true,
  },
  {
    value: "book-call",
    label: "Book a call",
    description: "Open your Calendly or booking page.",
    ctaText: "Book a call",
    needsDestination: true,
  },
  {
    value: "waitlist",
    label: "Join a waitlist",
    description: "Collect interest before launch.",
    ctaText: "Join the waitlist",
    needsDestination: true,
  },
  {
    value: "download",
    label: "Download a product",
    description: "Send buyers to a delivery or download page.",
    ctaText: "Get the product",
    needsDestination: true,
  },
  {
    value: "register",
    label: "Register for a class",
    description: "Send visitors to your registration form.",
    ctaText: "Register now",
    needsDestination: true,
  },
  {
    value: "instagram",
    label: "Follow me on Instagram",
    description: "Grow your audience from the page.",
    ctaText: "Follow on Instagram",
    needsDestination: false,
  },
] as const;

export type LaunchGoal = (typeof LAUNCH_GOALS)[number]["value"];

export function isLaunchGoal(value: string): value is LaunchGoal {
  return LAUNCH_GOALS.some((goal) => goal.value === value);
}

export function getLaunchGoal(value: LaunchGoal) {
  return LAUNCH_GOALS.find((goal) => goal.value === value) || LAUNCH_GOALS[0];
}

export function resolveLaunchCta(
  goal: LaunchGoal,
  destination: string,
  creator: { whatsappNumber: string; instagramHandle: string; displayName: string },
  pageTitle: string,
) {
  const config = getLaunchGoal(goal);

  if (goal === "whatsapp") {
    return {
      ctaText: config.ctaText,
      ctaUrl: whatsappUrl(
        creator.whatsappNumber,
        `Hi ${creator.displayName}, I am interested in ${pageTitle}.`,
      ),
      whatsappEnabled: true,
    };
  }

  if (goal === "instagram") {
    const handle = cleanHandle(creator.instagramHandle);
    return {
      ctaText: config.ctaText,
      ctaUrl: handle ? `https://www.instagram.com/${handle}/` : "",
      whatsappEnabled: false,
    };
  }

  return {
    ctaText: config.ctaText,
    ctaUrl: cleanHttpUrl(destination),
    whatsappEnabled: false,
  };
}

type StarterSection = {
  type: SectionType;
  title: string;
  isVisible?: boolean;
  content: {
    body?: string;
    items?: Array<{ title: string; description?: string }>;
  };
};

const sharedFaq: StarterSection = {
  type: "faq",
  title: "Frequently asked questions",
  content: {
    items: [
      { title: "How do I get started?", description: "Use the main button on this page to take the next step." },
      { title: "Can I ask a question first?", description: "Use the contact option on this page to speak directly with the creator." },
    ],
  },
};

const sharedTestimonials: StarterSection = {
  type: "testimonials",
  title: "Customer results",
  isVisible: false,
  content: {
    body: "Add verified customer feedback here before making this section visible.",
    items: [],
  },
};

export function getStarterSections(
  pageType: PageType,
  title: string,
  description = "",
  category = "",
): StarterSection[] {
  const niche = category.trim() || "this goal";
  const offerSummary =
    description.trim() || `${title} gives customers a practical way to move forward with confidence.`;
  const benefits: StarterSection = {
    type: "benefits",
    title: `Why choose ${title}`,
    content: {
      items: [
        { title: "Built around a clear outcome", description: offerSummary },
        { title: "A practical next step", description: `Move forward with a focused ${niche} offer instead of scattered information.` },
        { title: "Direct access", description: "Use the main action on this page to ask questions or get started." },
      ],
    },
  };

  const whoItIsFor: StarterSection = {
    type: "who-it-is-for",
    title: "Who this is for",
    content: {
      body: `For people interested in ${niche} who want a clear, practical path forward.`,
    },
  };

  const typeSpecific: Partial<Record<PageType, StarterSection[]>> = {
    "online-course": [
      benefits,
      {
        type: "curriculum",
        title: "What you will learn",
        content: {
          items: [
            { title: "Understand the essentials", description: `Build a strong foundation for ${niche}.` },
            { title: "Apply what you learn", description: "Turn the core ideas into practical action." },
            { title: "Create your next-step plan", description: "Leave with a clear way to keep making progress." },
          ],
        },
      },
      whoItIsFor,
    ],
    ebook: [
      benefits,
      {
        type: "what-you-get",
        title: "What is inside",
        content: {
          items: [
            { title: "A focused guide", description: offerSummary },
            { title: "Practical takeaways", description: `Use the ideas to take confident action in ${niche}.` },
          ],
        },
      },
    ],
    "coaching-program": [
      whoItIsFor,
      benefits,
      {
        type: "what-you-get",
        title: "How we will work together",
        content: {
          items: [
            { title: "Focused guidance", description: `Get support centered on your ${niche} goals.` },
            { title: "A personal action plan", description: "Turn each conversation into a clear next step." },
          ],
        },
      },
    ],
    service: [
      benefits,
      {
        type: "features",
        title: "What the service includes",
        content: {
          items: [
            { title: "A clear scope", description: offerSummary },
            { title: "A simple process", description: "Know the next step from the first conversation onward." },
            { title: "Professional delivery", description: `Get focused support for your ${niche} needs.` },
          ],
        },
      },
    ],
    workshop: [
      benefits,
      {
        type: "what-you-get",
        title: "Workshop details",
        content: {
          items: [
            { title: "A focused learning experience", description: offerSummary },
            { title: "Practical participation", description: "Work through the topic with clear examples and next steps." },
            { title: "Direct registration", description: "Use the main button to view availability and secure your place." },
          ],
        },
      },
    ],
    "template-pack": [
      benefits,
      {
        type: "what-you-get",
        title: "Templates included",
        content: {
          items: [
            { title: "Ready-to-use resources", description: offerSummary },
            { title: "Easy to adapt", description: `Put the resources to work for your own ${niche} goals.` },
          ],
        },
      },
    ],
    "paid-community": [
      whoItIsFor,
      benefits,
      {
        type: "what-you-get",
        title: "Inside the community",
        content: {
          items: [
            { title: "A focused member space", description: `Connect around shared ${niche} goals.` },
            { title: "Ongoing momentum", description: "Keep learning, sharing, and taking practical action." },
          ],
        },
      },
    ],
    consultation: [
      whoItIsFor,
      benefits,
      {
        type: "what-you-get",
        title: "Your consultation",
        content: {
          items: [
            { title: "A focused review", description: offerSummary },
            { title: "Clear recommendations", description: "Leave the conversation knowing what to do next." },
          ],
        },
      },
    ],
  };

  return [...(typeSpecific[pageType] || [benefits, whoItIsFor]), sharedTestimonials, sharedFaq];
}

export function getLaunchScore(input: {
  page: Pick<
    CreatorPage,
    "title" | "subtitle" | "description" | "priceText" | "ctaText" | "ctaUrl" | "whatsappEnabled" | "introVideoUrl" | "heroImageUrl"
  >;
  sections: Array<Pick<PageSection, "sectionType" | "content" | "isVisible">>;
  videos: Array<Pick<PageVideo, "videoUrl">>;
}) {
  const placeholderPhrases = [
    "add your first",
    "add verified",
    "update this",
    "describe the",
    "explain the",
    "list the",
    "introduce the",
    "share a real",
    "show the main",
    "set expectations",
    "add the workshop",
    "add capacity",
  ];
  const visibleSections = input.sections.filter((section) => section.isVisible);
  const containsPlaceholder = visibleSections.some((section) => {
    const content = [
      section.content.body || "",
      ...(section.content.items || []).flatMap((item) => [
        item.title,
        item.description || "",
      ]),
    ]
      .join(" ")
      .toLowerCase();

    return placeholderPhrases.some((phrase) => content.includes(phrase));
  });
  const hasMeaningfulSection = visibleSections.some(
    (section) =>
      Boolean(section.content.body?.trim()) ||
      (section.content.items || []).some(
        (item) => Boolean(item.title.trim() || item.description?.trim()),
      ),
  );
  const checks = [
    {
      complete: Boolean(input.page.title && (input.page.subtitle || input.page.description)),
      suggestion: "Add a clear headline and short description.",
      blocking: true,
    },
    {
      complete: Boolean(input.page.priceText),
      suggestion: "Add a price with its currency, or explain how customers request a quote.",
      blocking: false,
    },
    {
      complete: Boolean(input.page.ctaText && (input.page.ctaUrl || input.page.whatsappEnabled)),
      suggestion: "Add a working call-to-action destination.",
      blocking: true,
    },
    {
      complete: Boolean(
        input.page.heroImageUrl ||
        input.page.introVideoUrl ||
        input.videos.some((video) => video.videoUrl),
      ),
      suggestion: "Add a cover photo, demo, or testimonial video.",
      blocking: false,
    },
    {
      complete: hasMeaningfulSection && !containsPlaceholder,
      suggestion: containsPlaceholder
        ? "Replace the remaining starter instructions with your real offer details."
        : "Add at least one visible section with useful customer information.",
      blocking: true,
    },
    {
      complete: input.sections.some(
        (section) =>
          section.isVisible &&
          section.sectionType === "testimonials" &&
          (section.content.items || []).some((item) => !item.title.toLowerCase().startsWith("add your first")),
      ),
      suggestion: "Add a real testimonial when you have verified customer feedback.",
      blocking: false,
    },
    {
      complete: input.sections.some(
        (section) =>
          section.isVisible &&
          section.sectionType === "faq" &&
          (section.content.items || []).length > 0,
      ),
      suggestion: "Answer at least one common customer question.",
      blocking: false,
    },
  ];
  const completed = checks.filter((check) => check.complete).length;
  const blockingSuggestions = checks
    .filter((check) => check.blocking && !check.complete)
    .map((check) => check.suggestion);

  return {
    score: Math.round((completed / checks.length) * 100),
    suggestions: checks.filter((check) => !check.complete).map((check) => check.suggestion),
    blockingSuggestions,
    publishReady: blockingSuggestions.length === 0,
  };
}
