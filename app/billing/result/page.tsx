"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function BillingResultPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const params = use(searchParams);
  const status = params.payment || "pending";
  const successful = status === "success";

  useEffect(() => {
    window.parent.postMessage(
      { type: "onlineskiller-payment-result", status },
      window.location.origin,
    );
  }, [status]);

  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 text-center">
      <div className="max-w-sm">
        {successful ? (
          <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        ) : (
          <LoaderCircle className="mx-auto size-12 animate-spin text-blue-600" />
        )}
        <h1 className="mt-5 text-2xl font-bold">
          {successful ? "Payment verified" : "Checking payment status"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {successful
            ? "Your OnlineSkiller access is being refreshed."
            : "You can return to billing and retry if the payment was not completed."}
        </p>
        <Button asChild className="mt-6">
          <Link href={`/dashboard/billing?payment=${encodeURIComponent(status)}`}>Return to billing</Link>
        </Button>
      </div>
    </main>
  );
}
