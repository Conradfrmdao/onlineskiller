import { UserProfile } from "@clerk/nextjs";

import { PageHeader } from "@/components/shared/PageHeader";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export default function AccountSecurityPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Account security"
        title="Login and password"
        description="Manage your email address, password, connected sign-in methods, active devices, and account security."
        backHref="/dashboard/settings"
        backLabel="Settings"
      />
      <UserProfile
        routing="path"
        path="/dashboard/account"
        appearance={clerkAppearance}
      />
    </div>
  );
}
