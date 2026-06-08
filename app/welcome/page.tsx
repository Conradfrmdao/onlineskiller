"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import { OnlineSkillerLogo } from "@/components/brand/OnlineSkillerLogo";

export default function WelcomePage() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.replace(isSignedIn ? "/dashboard" : "/sign-in");
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, isSignedIn]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <OnlineSkillerLogo className="justify-center" />
        <div className="mx-auto mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full w-2/3 animate-pulse rounded-full bg-blue-600" />
        </div>
        <p className="mt-4 text-sm text-slate-600">Opening your creator workspace…</p>
      </div>
    </main>
  );
}
