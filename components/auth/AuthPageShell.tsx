import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";

export function AuthPageShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <section className="hidden bg-[#071426] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <OnlineSkillerLogo inverse />
          <Link href="/#top" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Build. Launch. Market.</p>
          <h1 className="mt-4 text-5xl font-black leading-tight tracking-[-0.04em]">{title}</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">{description}</p>
        </div>
        <p className="text-xs text-slate-500">OnlineSkiller creator workspace</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <OnlineSkillerLogo />
            <Link href="/#top" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
