import Link from "next/link";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#071426] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <OnlineSkillerLogo inverse />
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
            Launch your digital product or online business with a professional page and practical marketing support.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
          <Link href="/templates" className="hover:text-white">Templates</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/sign-in" className="hover:text-white">Sign in</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} OnlineSkiller. Build something worth sharing.
      </div>
    </footer>
  );
}
