"use client";

import { useActionState, useState } from "react";

import { updateSettingsAction } from "@/actions/settings-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/uploads/ImageUploadField";
import type { CreatorProfile } from "@/db/schema";

const initialState = { success: false, message: "" };

export function SettingsForm({ profile }: { profile: CreatorProfile }) {
  const [state, action, pending] = useActionState(updateSettingsAction, initialState);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "");
  const fields = [
    ["displayName", "Display name", profile.displayName],
    ["businessName", "Business name", profile.businessName],
    ["country", "Country", profile.country],
    ["niche", "Niche", profile.niche],
    ["phone", "Phone", profile.phone],
    ["whatsappNumber", "WhatsApp number", profile.whatsappNumber],
    ["instagramHandle", "Instagram handle", profile.instagramHandle],
    ["tiktokHandle", "TikTok handle", profile.tiktokHandle],
    ["websiteUrl", "Website URL", profile.websiteUrl || ""],
    ["slug", "Creator slug", profile.slug],
  ];

  return (
    <form action={action} className="panel rounded-2xl p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([name, label, value]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} defaultValue={value} required={["displayName", "businessName", "country", "niche", "whatsappNumber", "slug"].includes(name)} />
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="brandColor">Brand color</Label>
          <Input id="brandColor" name="brandColor" type="color" defaultValue={profile.brandColor} className="p-1" />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            name="logoUrl"
            label="Brand logo"
            value={logoUrl}
            onChange={setLogoUrl}
            purpose="logo"
            compact
            help="Use a square logo or brand mark with a clear background."
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={profile.bio} />
        </div>
      </div>
      {state.message ? <Alert className="mt-5" variant={state.success ? "success" : "destructive"}>{state.message}</Alert> : null}
      <Button type="submit" className="mt-5" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
    </form>
  );
}
