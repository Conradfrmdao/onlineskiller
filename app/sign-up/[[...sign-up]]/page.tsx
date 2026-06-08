"use client";

import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthPageShell
      title="Give your skill a professional home."
      description="Create your account, shape your first offer, and preview the complete page before you choose a plan."
    >
      <SignUp
        appearance={clerkAppearance}
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signInForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </AuthPageShell>
  );
}
