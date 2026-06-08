import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { payments } from "@/db/schema";
import { getBillingGateway } from "@/lib/billing/gateway.registry";
import { applyVerifiedPayment } from "@/lib/billing/payment.service";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const trackingId = url.searchParams.get("OrderTrackingId") || "";
  const merchantReference = url.searchParams.get("OrderMerchantReference") || "";

  if (!trackingId) {
    return NextResponse.redirect(new URL("/dashboard/billing?error=missing-tracking", request.url));
  }

  const paymentRows = await db
    .select()
    .from(payments)
    .where(merchantReference ? eq(payments.merchantReference, merchantReference) : eq(payments.providerTrackingId, trackingId))
    .limit(1);
  const payment = paymentRows[0];

  if (!payment) {
    return NextResponse.redirect(new URL("/dashboard/billing?error=payment-not-found", request.url));
  }

  try {
    const gateway = getBillingGateway(payment.provider);
    const verification = await gateway.verifyPayment(trackingId);
    await applyVerifiedPayment(verification);
    const status = verification.status === "completed" ? "success" : verification.status;
    return NextResponse.redirect(new URL(`/billing/result?payment=${status}`, request.url));
  } catch (error) {
    console.error("Payment callback verification failed:", error);
    return NextResponse.redirect(new URL("/billing/result?payment=verification-error", request.url));
  }
}
