import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { PublicPageRenderer } from "@/components/public-page/PublicPageRenderer";
import { hasValidAccess } from "@/lib/billing/periods";
import { getPlan } from "@/lib/billing/plans";
import { getPublicPageBySlug } from "@/lib/pages/queries";

export const dynamic = "force-dynamic";

function UnavailablePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] px-4 text-white">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 font-black">OS</span>
        <h1 className="mt-6 text-3xl font-bold">This page is currently unavailable.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">The creator may be updating the offer or renewing publishing access.</p>
      </div>
    </main>
  );
}

export default async function PublicCreatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const [{ pageSlug }, query] = await Promise.all([params, searchParams]);
  const data = await getPublicPageBySlug(pageSlug);
  if (!data) notFound();
  const { userId } = await auth();
  const ownerPreview = query.preview === "1" && userId === data.user.clerkUserId;

  if (
    !ownerPreview &&
    (
      data.user.status !== "active" ||
      data.page.status !== "live" ||
      !data.page.isLive ||
      !hasValidAccess(data.subscription)
    )
  ) {
    return <UnavailablePage />;
  }

  const plan = getPlan(data.subscription?.planName);
  const allowedTemplate = data.template?.isPremium && !plan.premiumTemplates ? null : data.template;
  return (
    <PublicPageRenderer
      data={{ ...data, template: allowedTemplate }}
      removableBranding={plan.removableBranding}
      preview={ownerPreview}
    />
  );
}
