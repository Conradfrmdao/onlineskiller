"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="panel max-w-md rounded-2xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-bold">OnlineSkiller could not finish that request.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Try the action again. If the problem continues, check the database and service configuration.</p>
        <Button className="mt-5" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
