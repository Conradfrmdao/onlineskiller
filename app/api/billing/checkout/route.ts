import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { payments } from "@/db/schema";
import { requireCreatorApi } from "@/lib/auth/user";
import { getCheckoutPrice } from "@/lib/billing/checkout-pricing";
import { getBillingGateway } from "@/lib/billing/gateway.registry";
import { canPurchasePlan, getPlan, isPlanName } from "@/lib/billing/plans";
import { getCreatorEntitlements } from "@/lib/billing/subscription";
import { db } from "@/lib/db";
import { createMerchantReference } from "@/lib/utils/slugs";
import { cleanInternalPath } from "@/lib/utils/urls";

export const runtime = "nodejs";

function countryCode(value: string) {
  const normalized = value.trim().toLowerCase();
  const codes: Record<string, string> = {
    uganda: "UG",
    kenya: "KE",
    tanzania: "TZ",
    rwanda: "RW",
    nigeria: "NG",
    ghana: "GH",
  };
  return codes[normalized] || "";
}

export async function POST(request: Request) {
  const { user, profile } = await requireCreatorApi();
  const formData = await request.formData();
  const planName = String(formData.get("plan") || "");
  const recurring = formData.get("recurring") === "on";
  const returnTo = cleanInternalPath(formData.get("returnTo"), "/dashboard/billing");

  if (!isPlanName(planName)) {
    return NextResponse.redirect(new URL("/dashboard/billing?error=plan", request.url), 303);
  }

  const plan = getPlan(planName);
  const entitlements = await getCreatorEntitlements(profile.id);
  if (
    !canPurchasePlan({
      active: entitlements.active,
      currentPlan: entitlements.plan.name,
      targetPlan: planName,
      scheduledPlanName: entitlements.subscription?.scheduledPlanName,
    })
  ) {
    return NextResponse.redirect(new URL("/dashboard/billing?error=plan-locked", request.url), 303);
  }
  const checkoutPrice = getCheckoutPrice(plan);
  const provider = process.env.BILLING_PROVIDER || "mock";
  const merchantReference = createMerchantReference();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const callbackUrl = new URL("/api/billing/callback", appUrl);
  callbackUrl.searchParams.set("returnTo", returnTo);
  const clerkUser = await currentUser();
  const nameParts = profile.displayName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Creator";
  const lastName = nameParts.slice(1).join(" ") || "OnlineSkiller";

  const inserted = await db
    .insert(payments)
    .values({
      creatorId: profile.id,
      merchantReference,
      planName,
      amount: checkoutPrice.amount,
      currency: checkoutPrice.currency,
      provider,
      requestedPaymentMethod: "pesapal",
      isRecurring: recurring,
      status: "pending",
      providerPayload: { returnTo },
    })
    .returning();
  const payment = inserted[0];

  if (!payment) {
    return NextResponse.redirect(new URL("/dashboard/billing?error=create", request.url), 303);
  }

  try {
    const gateway = getBillingGateway(provider);
    const result = await gateway.createCheckout({
      merchantReference,
      planName,
      amount: checkoutPrice.amount,
      currency: checkoutPrice.currency,
      description: `${plan.label} monthly subscription for OnlineSkiller`,
      callbackUrl: callbackUrl.toString(),
      notificationId: process.env.PESAPAL_IPN_ID,
      recurring,
      customer: {
        email: user.email || clerkUser?.emailAddresses[0]?.emailAddress || "",
        firstName,
        lastName,
        phoneNumber: profile.phone || profile.whatsappNumber,
        countryCode: countryCode(profile.country),
      },
    });

    await db
      .update(payments)
      .set({
        providerTrackingId: result.providerTrackingId,
        providerPayload: {
          ...result.raw,
          redirectUrl: result.redirectUrl,
          returnTo,
        },
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return NextResponse.redirect(
      new URL(`/dashboard/billing/checkout/${payment.id}`, request.url),
      303,
    );
  } catch (error) {
    console.error("Checkout creation failed:", error);
    await db
      .update(payments)
      .set({
        status: "failed",
        providerPayload: { message: error instanceof Error ? error.message : "Checkout failed." },
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));
    return NextResponse.redirect(new URL("/dashboard/billing?error=checkout", request.url), 303);
  }
}
