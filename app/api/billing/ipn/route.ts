import { NextResponse } from "next/server";

import { getBillingGateway } from "@/lib/billing/gateway.registry";
import { applyVerifiedPayment } from "@/lib/billing/payment.service";

export const runtime = "nodejs";

async function processIpn(request: Request) {
  const url = new URL(request.url);
  let trackingId = url.searchParams.get("OrderTrackingId") || "";
  let merchantReference = url.searchParams.get("OrderMerchantReference") || "";
  let notificationType = url.searchParams.get("OrderNotificationType") || "IPNCHANGE";

  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      trackingId = String(body.OrderTrackingId || body.orderTrackingId || trackingId);
      merchantReference = String(body.OrderMerchantReference || body.orderMerchantReference || merchantReference);
      notificationType = String(body.OrderNotificationType || body.orderNotificationType || notificationType);
    } else {
      const form = await request.formData().catch(() => new FormData());
      trackingId = String(form.get("OrderTrackingId") || trackingId);
      merchantReference = String(form.get("OrderMerchantReference") || merchantReference);
      notificationType = String(form.get("OrderNotificationType") || notificationType);
    }
  }

  if (!trackingId) {
    return NextResponse.json({ orderNotificationType: notificationType, orderTrackingId: "", orderMerchantReference: merchantReference, status: 400 }, { status: 400 });
  }

  try {
    const gateway = getBillingGateway();
    const verification = await gateway.verifyPayment(trackingId);
    await applyVerifiedPayment(verification, { notificationType });
    return NextResponse.json({
      orderNotificationType: notificationType,
      orderTrackingId: trackingId,
      orderMerchantReference: merchantReference,
      status: 200,
    });
  } catch (error) {
    console.error("Pesapal IPN processing failed:", error);
    return NextResponse.json({
      orderNotificationType: notificationType,
      orderTrackingId: trackingId,
      orderMerchantReference: merchantReference,
      status: 500,
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return processIpn(request);
}

export async function POST(request: Request) {
  return processIpn(request);
}
