import type { Plan } from "@/lib/billing/plans";

export function canPublishAnotherPage(plan: Plan, otherLivePages: number) {
  if (plan.livePageLimit === null) {
    return true;
  }

  return otherLivePages < plan.livePageLimit;
}

export function canUsePremiumTemplate(plan: Plan, active: boolean) {
  return active && plan.premiumTemplates;
}

export function canUsePremiumMarketing(plan: Plan, active: boolean) {
  return active && plan.premiumMarketing;
}

export function canAccessOwnedResource(ownerId: string, actorOwnerId: string) {
  return Boolean(ownerId && actorOwnerId && ownerId === actorOwnerId);
}
