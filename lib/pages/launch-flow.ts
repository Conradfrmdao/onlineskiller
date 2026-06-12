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
      { title: "Who is this for?", description: "Update this answer with the customer who benefits most from your offer." },
    ],
  },
};

const sharedTestimonials: StarterSection = {
  type: "testimonials",
  title: "What people say",
  content: {
    items: [{ title: "Add your first testimonial", description: "Share a real customer result here." }],
  },
};

export function getStarterSections(pageType: PageType, title: string): StarterSection[] {
  const benefits: StarterSection = {
    type: "benefits",
    title: "Why this is for you",
    content: {
      items: [
        { title: "Clear result", description: `Show the main result people can get from ${title}.` },
        { title: "Practical next steps", description: "Explain how your offer helps people move forward quickly." },
        { title: "Support that matters", description: "Describe the guidance, resources, or access included." },
      ],
    },
  };

  const whoItIsFor: StarterSection = {
    type: "who-it-is-for",
    title: "Who this is for",
    content: {
      body: "Describe the person who needs this offer most and the situation they are in today.",
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
            { title: "Module 1", description: "Introduce the first practical outcome." },
            { title: "Module 2", description: "Build confidence with guided practice." },
            { title: "Module 3", description: "Help learners apply the skill." },
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
            { title: "Practical guide", description: "Explain the core chapters or framework." },
            { title: "Action resources", description: "List worksheets, checklists, or bonuses." },
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
            { title: "Focused sessions", description: "Describe your calls, reviews, or coaching format." },
            { title: "Personal action plan", description: "Explain the support between sessions." },
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
            { title: "Clear scope", description: "List the main deliverable." },
            { title: "Simple process", description: "Explain how the client works with you." },
            { title: "Professional delivery", description: "Set expectations for timing and quality." },
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
            { title: "Date and time", description: "Add the workshop schedule." },
            { title: "Location or link", description: "Explain where attendees will join." },
            { title: "Seats and deadline", description: "Add capacity and the registration deadline." },
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
            { title: "Ready-to-use files", description: "List the templates and formats included." },
            { title: "Simple instructions", description: "Explain how buyers customize them." },
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
            { title: "Member conversations", description: "Describe the access and support." },
            { title: "Exclusive resources", description: "List events, lessons, or downloads." },
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
            { title: "Focused review", description: "Explain what you assess before or during the call." },
            { title: "Clear recommendations", description: "Describe what the client leaves with." },
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
    "title" | "subtitle" | "description" | "priceText" | "ctaText" | "ctaUrl" | "whatsappEnabled" | "introVideoUrl"
  >;
  sections: Array<Pick<PageSection, "sectionType" | "content" | "isVisible">>;
  videos: Array<Pick<PageVideo, "videoUrl">>;
}) {
  const checks = [
    {
      complete: Boolean(input.page.title && (input.page.subtitle || input.page.description)),
      suggestion: "Add a clear headline and short description.",
    },
    {
      complete: Boolean(input.page.priceText),
      suggestion: "Add a price or explain how customers should request a quote.",
    },
    {
      complete: Boolean(input.page.ctaText && (input.page.ctaUrl || input.page.whatsappEnabled)),
      suggestion: "Add a working call-to-action destination.",
    },
    {
      complete: Boolean(input.page.introVideoUrl || input.videos.some((video) => video.videoUrl)),
      suggestion: "Add an intro, demo, or testimonial video.",
    },
    {
      complete: input.sections.some(
        (section) =>
          section.isVisible &&
          section.sectionType === "testimonials" &&
          (section.content.items || []).some((item) => !item.title.toLowerCase().startsWith("add your first")),
      ),
      suggestion: "Replace the placeholder with a real testimonial.",
    },
    {
      complete: input.sections.some(
        (section) =>
          section.isVisible &&
          section.sectionType === "faq" &&
          (section.content.items || []).length > 0,
      ),
      suggestion: "Answer at least one common customer question.",
    },
  ];
  const completed = checks.filter((check) => check.complete).length;

  return {
    score: Math.round((completed / checks.length) * 100),
    suggestions: checks.filter((check) => !check.complete).map((check) => check.suggestion),
  };
}
