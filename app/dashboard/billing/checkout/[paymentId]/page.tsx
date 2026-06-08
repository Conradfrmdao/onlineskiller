import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { EmbeddedPaymentFrame } from "@/components/billing/EmbeddedPaymentFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { payments } from "@/db/schema";
import { requireCreator } from "@/lib/auth/user";
import { formatCheckoutPrice } from "@/lib/billing/checkout-pricing";
import { getPlan } from "@/lib/billing/plans";
import { db } from "@/lib/db";

export default async function EmbeddedBillingCheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const { profile } = await requireCreator();
  const rows = await db
    .select()
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.creatorId, profile.id)))
    .limit(1);
  const payment = rows[0];

  if (!payment) {
    notFound();
  }

  if (payment.status === "completed") {
    redirect("/dashboard/billing?payment=success");
  }

  const checkoutUrl =
    typeof payment.providerPayload.redirectUrl === "string"
      ? payment.providerPayload.redirectUrl
      : "";

  if (!checkoutUrl) {
    redirect("/dashboard/billing?error=checkout-url");
  }

  const plan = getPlan(payment.planName);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/billing"><ArrowLeft /> Back to billing</Link>
      </Button>
      <PageHeader
        eyebrow="Secure checkout"
        title={`Activate ${plan.label}`}
        description={`Complete your ${formatCheckoutPrice({
          amountCents: payment.amountCents,
          currency: payment.currency === "UGX" ? "UGX" : "USD",
          isTestPrice: process.env.BILLING_TEST_MODE === "true",
        })} payment without leaving OnlineSkiller.`}
      />
      {process.env.BILLING_TEST_MODE === "true" ? (
        <Alert variant="warning">
          Test mode is active. This checkout uses the temporary UGX 500 validation price.
        </Alert>
      ) : null}
      <EmbeddedPaymentFrame checkoutUrl={checkoutUrl} provider={payment.provider} />
    </div>
  );
}
