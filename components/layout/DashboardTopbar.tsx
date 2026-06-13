import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ExternalLink, Plus } from "lucide-react";

import { MobileDashboardMenu } from "@/components/layout/MobileDashboardMenu";
import { Button } from "@/components/ui/button";

export function DashboardTopbar({
  displayName,
  pageSlug,
}: {
  displayName: string;
  pageSlug?: string;
}) {
  return (
    <header className="sticky top-0 z-20 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-[0_18px_60px_-45px_rgba(7,20,38,.7)] backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <MobileDashboardMenu />
          <div className="hidden min-w-0 min-[430px]:block">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-600">Creator workspace</p>
            <p className="truncate text-sm font-semibold text-slate-950">Welcome, {displayName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {pageSlug ? (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href={`/p/${pageSlug}`} target="_blank">Live page <ExternalLink /></Link>
            </Button>
          ) : null}
          <Button asChild size="sm" className="hidden min-[430px]:inline-flex">
            <Link href="/dashboard/pages/new"><Plus /> New page</Link>
          </Button>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
