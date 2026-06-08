"use client";

import { useActionState, useState } from "react";
import { BadgeDollarSign, Building2, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";

import { updatePagePaymentsAction } from "@/actions/page-payment-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PagePaymentMethod } from "@/db/schema";

const initialState = { success: false, message: "" };

function methodMap(methods: PagePaymentMethod[]) {
  return new Map(methods.map((method) => [method.methodType, method]));
}

export function PaymentSettingsForm({
  pageId,
  methods,
  defaultWhatsappNumber,
}: {
  pageId: string;
  methods: PagePaymentMethod[];
  defaultWhatsappNumber: string;
}) {
  const saved = methodMap(methods);
  const hosted = saved.get("hosted-link");
  const paypal = saved.get("paypal");
  const bank = saved.get("bank-transfer");
  const whatsapp = saved.get("whatsapp");
  const [state, action, pending] = useActionState(updatePagePaymentsAction, initialState);
  const [hostedEnabled, setHostedEnabled] = useState(Boolean(hosted?.isEnabled));
  const [paypalEnabled, setPaypalEnabled] = useState(Boolean(paypal?.isEnabled));
  const [bankEnabled, setBankEnabled] = useState(Boolean(bank?.isEnabled));
  const [whatsappEnabled, setWhatsappEnabled] = useState(Boolean(whatsapp?.isEnabled));

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="pageId" value={pageId} />

      <Alert>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <p className="leading-6">
            Customer money goes directly to your chosen provider or account. OnlineSkiller does not hold funds,
            verify bank transfers, issue refunds, or store card details.
          </p>
        </div>
      </Alert>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ExternalLink /></span>
          <div>
            <h2 className="font-semibold">Hosted checkout link</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Use a secure checkout created in Stripe, Pesapal, Flutterwave, Razorpay, Square, or another provider.</p>
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="hostedLinkEnabled" checked={hostedEnabled} onChange={(event) => setHostedEnabled(event.target.checked)} className="size-4 rounded" />
          Offer hosted online payment
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hostedProviderName">Provider name</Label>
            <Input id="hostedProviderName" name="hostedProviderName" defaultValue={hosted?.config.providerName || ""} placeholder="Stripe" readOnly={!hostedEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostedPaymentUrl">Secure payment link</Label>
            <Input id="hostedPaymentUrl" name="hostedPaymentUrl" type="url" defaultValue={hosted?.config.url || ""} placeholder="https://..." readOnly={!hostedEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" />
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700"><BadgeDollarSign /></span>
          <div>
            <h2 className="font-semibold">PayPal payment link</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create the product and price in your PayPal Business account, then paste the PayPal-hosted link here.</p>
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="paypalEnabled" checked={paypalEnabled} onChange={(event) => setPaypalEnabled(event.target.checked)} className="size-4 rounded" />
          Offer PayPal
        </label>
        <div className="mt-4 space-y-2">
          <Label htmlFor="paypalUrl">PayPal or PayPal.Me link</Label>
          <Input id="paypalUrl" name="paypalUrl" type="url" defaultValue={paypal?.config.url || ""} placeholder="https://paypal.me/..." readOnly={!paypalEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" />
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Building2 /></span>
          <div>
            <h2 className="font-semibold">Manual bank transfer</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Customers see your instructions and transfer outside OnlineSkiller. Confirm cleared funds yourself before delivering the product.</p>
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="bankEnabled" checked={bankEnabled} onChange={(event) => setBankEnabled(event.target.checked)} className="size-4 rounded" />
          Offer bank transfer
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="bankName">Bank name</Label><Input id="bankName" name="bankName" defaultValue={bank?.config.bankName || ""} readOnly={!bankEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
          <div className="space-y-2"><Label htmlFor="bankAccountName">Account name</Label><Input id="bankAccountName" name="bankAccountName" defaultValue={bank?.config.accountName || ""} readOnly={!bankEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
          <div className="space-y-2"><Label htmlFor="bankAccountNumber">Account number / IBAN</Label><Input id="bankAccountNumber" name="bankAccountNumber" defaultValue={bank?.config.accountNumber || ""} readOnly={!bankEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
          <div className="space-y-2"><Label htmlFor="bankBranch">Branch</Label><Input id="bankBranch" name="bankBranch" defaultValue={bank?.config.branch || ""} readOnly={!bankEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
          <div className="space-y-2"><Label htmlFor="bankSwiftCode">SWIFT / BIC</Label><Input id="bankSwiftCode" name="bankSwiftCode" defaultValue={bank?.config.swiftCode || ""} readOnly={!bankEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="bankInstructions">Customer instructions</Label><Textarea id="bankInstructions" name="bankInstructions" defaultValue={bank?.config.instructions || ""} placeholder="Use your name as the payment reference, then send the receipt on WhatsApp." readOnly={!bankEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><MessageCircle /></span>
          <div>
            <h2 className="font-semibold">WhatsApp payment coordination</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Let customers message you for mobile money, local transfer, invoice, or another payment arrangement.</p>
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="whatsappPaymentEnabled" checked={whatsappEnabled} onChange={(event) => setWhatsappEnabled(event.target.checked)} className="size-4 rounded" />
          Offer WhatsApp payment help
        </label>
        <div className="mt-4 grid gap-4">
          <div className="space-y-2"><Label htmlFor="whatsappPaymentNumber">WhatsApp number with country code</Label><Input id="whatsappPaymentNumber" name="whatsappPaymentNumber" defaultValue={whatsapp?.config.phone || defaultWhatsappNumber} placeholder="256700000000" readOnly={!whatsappEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
          <div className="space-y-2"><Label htmlFor="whatsappPaymentMessage">Prefilled customer message</Label><Textarea id="whatsappPaymentMessage" name="whatsappPaymentMessage" defaultValue={whatsapp?.config.message || ""} placeholder="Hi, I would like to pay for this offer." readOnly={!whatsappEnabled} className="read-only:bg-slate-50 read-only:text-slate-500" /></div>
        </div>
      </section>

      {state.message ? <Alert variant={state.success ? "success" : "destructive"}>{state.message}</Alert> : null}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving payment options..." : "Save payment options"}</Button>
    </form>
  );
}
