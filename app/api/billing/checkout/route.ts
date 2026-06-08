import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { payments } from "@/db/schema";
import { requireCreatorApi } from "@/lib/auth/user";
import { getCheckoutPrice } from "@/lib/billing/checkout-pricing";
import { getBillingGateway } from "@/lib/billing/gateway.registry";
import { getPlan, isPlanName } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { createMerchantReference } from "@/lib/utils/slugs";

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

  if (!isPlanName(planName)) {
    return NextResponse.redirect(new URL("/dashboard/billing?error=plan", request.url), 303);
  }

  const plan = getPlan(planName);
  const checkoutPrice = getCheckoutPrice(plan);
  const provider = process.env.BILLING_PROVIDER || "mock";
  const merchantReference = createMerchantReference();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const callbackUrl = new URL("/api/billing/callback", appUrl).toString();
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
      amountCents: checkoutPrice.amountCents,
      currency: checkoutPrice.currency,
      provider,
      isRecurring: recurring,
      status: "pending",
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
      amountCents: checkoutPrice.amountCents,
      currency: checkoutPrice.currency,
      description: `${plan.label} monthly subscription for OnlineSkiller`,
      callbackUrl,
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
