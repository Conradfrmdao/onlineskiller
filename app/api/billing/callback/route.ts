import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { payments } from "@/db/schema";
import { getBillingGateway } from "@/lib/billing/gateway.registry";
import { applyVerifiedPayment } from "@/lib/billing/payment.service";
import { db } from "@/lib/db";
import { cleanInternalPath } from "@/lib/utils/urls";

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

  const storedReturnTo =
    typeof payment.providerPayload.returnTo === "string"
      ? payment.providerPayload.returnTo
      : "";
  const returnTo = cleanInternalPath(
    url.searchParams.get("returnTo") || storedReturnTo,
    "/dashboard/billing",
  );

  try {
    const gateway = getBillingGateway(payment.provider);
    const verification = await gateway.verifyPayment(trackingId);
    await applyVerifiedPayment(verification);
    const status = verification.status === "completed" ? "success" : verification.status;
    const resultUrl = new URL("/billing/result", request.url);
    resultUrl.searchParams.set("payment", status);
    resultUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(resultUrl);
  } catch (error) {
    console.error("Payment callback verification failed:", error);
    const resultUrl = new URL("/billing/result", request.url);
    resultUrl.searchParams.set("payment", "verification-error");
    resultUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(resultUrl);
  }
}
