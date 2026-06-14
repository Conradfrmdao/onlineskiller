import Link from "next/link";
import { KeyRound } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Button } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/user";

export default async function SettingsPage() {
  const { profile } = await requireCreator();
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader eyebrow="Brand settings" title="Creator profile" description="Keep the identity and contact details used across your public pages up to date." />
      <section className="panel flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-950">Account and password</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Change your password, review active devices, or add another secure sign-in method.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard/account">Manage security</Link>
        </Button>
      </section>
      <SettingsForm profile={profile} />
    </div>
  );
}
