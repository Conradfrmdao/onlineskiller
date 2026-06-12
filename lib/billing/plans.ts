export type PlanName = "starter" | "growth" | "pro";

export type Plan = {
  name: PlanName;
  label: string;
  priceUsd: number;
  livePageLimit: number | null;
  premiumTemplates: boolean;
  premiumMarketing: boolean;
  advancedSections: boolean;
  calendar: boolean;
  removableBranding: boolean;
  features: string[];
};

export const PLANS: Record<PlanName, Plan> = {
  starter: {
    name: "starter",
    label: "Starter",
    priceUsd: 20,
    livePageLimit: 1,
    premiumTemplates: false,
    premiumMarketing: false,
    advancedSections: false,
    calendar: false,
    removableBranding: false,
    features: ["1 live page", "Basic templates", "Video embeds", "WhatsApp CTA", "Basic marketing library"],
  },
  growth: {
    name: "growth",
    label: "Growth",
    priceUsd: 35,
    livePageLimit: 5,
    premiumTemplates: true,
    premiumMarketing: true,
    advancedSections: true,
    calendar: true,
    removableBranding: false,
    features: ["Up to 5 live pages", "Premium templates", "Full marketing library", "Advanced sections", "Content calendar"],
  },
  pro: {
    name: "pro",
    label: "Pro",
    priceUsd: 50,
    livePageLimit: null,
    premiumTemplates: true,
    premiumMarketing: true,
    advancedSections: true,
    calendar: true,
    removableBranding: true,
    features: ["Unlimited live pages", "Every template", "Full marketing library", "Advanced sections", "Remove branding"],
  },
};

const PLAN_ORDER: Record<PlanName, number> = {
  starter: 0,
  growth: 1,
  pro: 2,
};

export function isPlanName(value: string): value is PlanName {
  return value === "starter" || value === "growth" || value === "pro";
}

export function getPlan(value: string | null | undefined) {
  if (!value || !isPlanName(value)) {
    return PLANS.starter;
  }

  return PLANS[value];
}

export function isHigherPlan(target: PlanName, current: PlanName) {
  return PLAN_ORDER[target] > PLAN_ORDER[current];
}

export function canPurchasePlan(input: {
  active: boolean;
  currentPlan: PlanName;
  targetPlan: PlanName;
  scheduledPlanName?: string | null;
}) {
  if (!input.active) {
    return true;
  }

  if (input.scheduledPlanName) {
    return false;
  }

  return isHigherPlan(input.targetPlan, input.currentPlan);
}

export function formatPlanPrice(plan: Plan) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(plan.priceUsd);
}
