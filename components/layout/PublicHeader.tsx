import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";
import { PublicMobileMenu } from "@/components/layout/PublicMobileMenu";
import { Button } from "@/components/ui/button";

export async function PublicHeader() {
  const { userId } = await auth();

  return (
    <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 rounded-2xl border border-slate-200/90 bg-white/92 px-3 py-2.5 shadow-[0_18px_60px_-42px_rgba(7,20,38,.6)] backdrop-blur-xl sm:top-5 sm:w-[calc(100%-2rem)] sm:rounded-full sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <OnlineSkillerLogo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#top" className="hover:text-slate-950">Home</Link>
          <Link href="/#how-it-works" className="hover:text-slate-950">How it works</Link>
          <Link href="/templates" className="hover:text-slate-950">Templates</Link>
          <Link href="/pricing" className="hover:text-slate-950">Pricing</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {!userId ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href={userId ? "/dashboard" : "/sign-up"}>{userId ? "Dashboard" : "Start building"}</Link>
          </Button>
        </div>
        <PublicMobileMenu signedIn={Boolean(userId)} />
      </div>
    </header>
  );
}
