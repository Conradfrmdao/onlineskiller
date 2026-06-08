"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";

import { completeOnboardingAction, type FormState } from "@/actions/onboarding-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: FormState = { success: false, message: "" };

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-600">{message}</p> : null;
}

export function OnboardingForm({ defaults }: { defaults: Record<string, string> }) {
  const [state, action, pending] = useActionState(completeOnboardingAction, initialState);

  return (
    <form action={action} className="space-y-8">
      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Your creator identity</h2>
        <p className="mt-1 text-sm text-slate-600">This information powers your dashboard and public pages.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" name="displayName" defaultValue={defaults.displayName} required />
            <FieldError message={state.errors?.displayName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business or brand name</Label>
            <Input id="businessName" name="businessName" defaultValue={defaults.businessName} required />
            <FieldError message={state.errors?.businessName} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea id="bio" name="bio" defaultValue={defaults.bio} placeholder="What do you help people do?" />
            <FieldError message={state.errors?.bio} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue={defaults.country || "Uganda"} required />
            <FieldError message={state.errors?.country} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Niche</Label>
            <Input id="niche" name="niche" defaultValue={defaults.niche} placeholder="Career coaching, design, fitness…" required />
            <FieldError message={state.errors?.niche} />
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Contact and social links</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" name="phone" defaultValue={defaults.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp number</Label>
            <Input id="whatsappNumber" name="whatsappNumber" defaultValue={defaults.whatsappNumber} placeholder="+256…" required />
            <FieldError message={state.errors?.whatsappNumber} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramHandle">Instagram handle</Label>
            <Input id="instagramHandle" name="instagramHandle" defaultValue={defaults.instagramHandle} placeholder="yourbrand" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokHandle">TikTok handle</Label>
            <Input id="tiktokHandle" name="tiktokHandle" defaultValue={defaults.tiktokHandle} placeholder="yourbrand" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Existing website</Label>
            <Input id="websiteUrl" name="websiteUrl" defaultValue={defaults.websiteUrl} placeholder="https://…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" name="logoUrl" defaultValue={defaults.logoUrl} placeholder="https://…" />
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Brand basics</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brandColor">Brand color</Label>
            <div className="flex gap-2">
              <Input id="brandColor" name="brandColor" type="color" className="w-16 p-1" defaultValue={defaults.brandColor || "#2563eb"} />
              <Input value={defaults.brandColor || "#2563eb"} readOnly aria-label="Selected color" />
            </div>
            <FieldError message={state.errors?.brandColor} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Creator slug</Label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white pl-3 shadow-sm">
              <span className="text-sm text-slate-400">/creator/</span>
              <Input id="slug" name="slug" defaultValue={defaults.slug} className="border-0 shadow-none focus:ring-0" required />
            </div>
            <FieldError message={state.errors?.slug} />
          </div>
        </div>
      </section>

      {state.message ? <Alert variant="destructive">{state.message}</Alert> : null}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Creating workspace…" : "Enter my workspace"} <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
