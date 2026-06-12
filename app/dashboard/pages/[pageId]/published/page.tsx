import Link from "next/link";
import { ExternalLink, Megaphone, PartyPopper, Pencil, Video } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { ShareLaunchActions } from "@/components/pages/ShareLaunchActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";
import { getPageStudioData } from "@/lib/pages/queries";

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const { profile } = await requireCreator();
  const data = await getPageStudioData(pageId, profile.id);

  if (!data) {
    notFound();
  }

  if (!data.page.isLive) {
    redirect(`/dashboard/pages/${pageId}/preview`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = new URL(`/p/${data.page.slug}`, appUrl).toString();

  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-10">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-[0_35px_100px_-70px_rgba(5,150,105,.65)]">
        <div className="bg-emerald-600 px-6 py-10 text-center text-white sm:px-10">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/15">
            <PartyPopper className="size-8" />
          </span>
          <Badge className="mt-5 border-white/20 bg-white/10 text-white">Page published</Badge>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">Your page is live.</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-emerald-50">
            Share it where your customers already spend time, then use the marketing room to keep the offer visible.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Public page</p>
            <p className="mt-2 break-all font-semibold text-slate-950">{publicUrl}</p>
          </div>
          <div className="mt-5">
            <ShareLaunchActions publicUrl={publicUrl} pageTitle={data.page.title} />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link href={`/p/${data.page.slug}`} target="_blank" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50">
              <ExternalLink className="size-5 text-blue-600" />
              <h2 className="mt-6 font-semibold">Open live page</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">Check the final customer experience.</p>
            </Link>
            <Link href="/dashboard/marketing/videos" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50">
              <Video className="size-5 text-blue-600" />
              <h2 className="mt-6 font-semibold">Get promo videos</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">Find an idea to announce the launch.</p>
            </Link>
            <Link href="/dashboard/marketing/strategies" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50">
              <Megaphone className="size-5 text-blue-600" />
              <h2 className="mt-6 font-semibold">Choose a strategy</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">Follow a practical sales plan.</p>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <Button asChild variant="outline">
              <Link href={`/dashboard/pages/${pageId}/edit`}><Pencil /> Keep editing</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/pages">Back to my pages</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
