import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireCreator } from "@/lib/auth/user";

export default async function SettingsPage() {
  const { profile } = await requireCreator();
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader eyebrow="Brand settings" title="Creator profile" description="Keep the identity and contact details used across your public pages up to date." />
      <SettingsForm profile={profile} />
    </div>
  );
}
