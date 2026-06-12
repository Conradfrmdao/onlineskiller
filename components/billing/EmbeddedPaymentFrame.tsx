"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";

export function EmbeddedPaymentFrame({
  checkoutUrl,
  provider,
  requestedMethod,
}: {
  checkoutUrl: string;
  provider: string;
  requestedMethod: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function receivePaymentResult(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data as { type?: string; status?: string };
      if (data?.type !== "onlineskiller-payment-result" || !data.status) {
        return;
      }

      router.replace(`/dashboard/billing?payment=${encodeURIComponent(data.status)}`);
      router.refresh();
    }

    window.addEventListener("message", receivePaymentResult);
    return () => window.removeEventListener("message", receivePaymentResult);
  }, [router]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_-55px_rgba(7,20,38,.55)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ShieldCheck className="size-4 text-blue-600" />
          Secure {requestedMethod} checkout
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <LoaderCircle className="size-3.5 animate-spin" />
          Waiting for payment
        </div>
      </div>
      <iframe
        src={checkoutUrl}
        title="Card or mobile money checkout"
        className="h-[46rem] w-full bg-white"
        allow="payment *"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="border-t border-slate-200 px-4 py-3 text-center text-xs leading-5 text-slate-500">
        {provider === "mock"
          ? "This payment is handled by the OnlineSkiller test gateway."
          : `You selected ${requestedMethod}. The secure payment form may ask you to confirm the available network or card option.`}
        {" "}OnlineSkiller verifies the final transaction status before activating your plan.
      </div>
    </div>
  );
}
