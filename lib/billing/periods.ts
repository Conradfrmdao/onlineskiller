export function addBillingMonth(value: Date) {
  const result = new Date(value);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

export function addTrialDays(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function nextPeriod(currentPeriodEnd: Date | null | undefined, now = new Date()) {
  const start = currentPeriodEnd && currentPeriodEnd > now ? currentPeriodEnd : now;
  return {
    start,
    end: addBillingMonth(start),
  };
}

export function hasValidAccess(
  subscription:
    | {
        status: string;
        currentPeriodEnd: Date | null;
      }
    | null
    | undefined,
  now = new Date(),
) {
  if (!subscription) {
    return false;
  }

  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return false;
  }

  return Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd > now);
}
