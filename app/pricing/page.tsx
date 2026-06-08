import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Check } from "lucide-react";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS, formatPlanPrice } from "@/lib/billing/plans";

export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <main>
      <PublicHeader />
      <section className="px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <Badge>Simple monthly pricing</Badge>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-6xl">
            Pick the plan that matches your momentum.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Build and preview before paying. A valid subscription is only required when you are ready to publish.
          </p>
          <div className="mt-12 grid gap-4 text-left md:grid-cols-3">
            {Object.values(PLANS).map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border bg-white p-6 shadow-[0_30px_80px_-60px_rgba(7,20,38,.5)] ${
                  plan.name === "growth" ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">{plan.label}</h2>
                  {plan.name === "growth" ? <Badge>Most popular</Badge> : null}
                </div>
                <p className="mt-5 text-4xl font-black tracking-tight">
                  {formatPlanPrice(plan)}
                  <span className="text-sm font-medium text-slate-500">/month</span>
                </p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue-600" /> {feature}
                    </p>
                  ))}
                </div>
                <Button asChild className="mt-8 w-full" variant={plan.name === "growth" ? "default" : "outline"}>
                  <Link href={userId ? `/dashboard/billing?plan=${plan.name}` : "/sign-up"}>
                    Choose {plan.label}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
