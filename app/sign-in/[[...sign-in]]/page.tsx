"use client";

import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthPageShell
      title="Your business page is waiting."
      description="Continue building your offer, publishing your page, and using practical marketing support."
    >
      <SignIn
        appearance={clerkAppearance}
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </AuthPageShell>
  );
}
