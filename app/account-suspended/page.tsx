import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AccountSuspendedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] px-4 text-white">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 font-black">OS</span>
        <h1 className="mt-6 text-3xl font-bold">This account is unavailable.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Access has been suspended by an administrator. Contact platform support if you believe this is a mistake.
        </p>
        <Button asChild variant="gold" className="mt-6"><Link href="/">Return home</Link></Button>
      </div>
    </main>
  );
}
