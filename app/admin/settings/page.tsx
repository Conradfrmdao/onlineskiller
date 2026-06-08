import { asc } from "drizzle-orm";

import { platformSettings } from "@/db/schema";
import { savePlatformSettingAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await db.select().from(platformSettings).orderBy(asc(platformSettings.key));
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader eyebrow="Administration" title="Platform settings" description="Store simple operational values with an auditable update trail." />
      <form action={savePlatformSettingAdminAction} className="panel rounded-2xl p-5">
        <h2 className="font-semibold">Add or update a setting</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <div className="space-y-1"><Label>Key</Label><Input name="key" required placeholder="support_email" /></div>
          <div className="space-y-1"><Label>Value</Label><Input name="value" required /></div>
          <div className="self-end"><Button type="submit">Save</Button></div>
        </div>
      </form>
      <div className="space-y-3">
        {settings.map((setting) => (
          <form key={setting.id} action={savePlatformSettingAdminAction} className="panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_2fr_auto]">
            <Input name="key" value={setting.key} readOnly />
            <Input name="value" defaultValue={String(setting.value.value || "")} />
            <Button type="submit" variant="outline">Update</Button>
          </form>
        ))}
      </div>
    </div>
  );
}
