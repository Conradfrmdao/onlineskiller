"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { updatePageAction } from "@/actions/page-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/uploads/ImageUploadField";
import type { CreatorPage, Template } from "@/db/schema";
import { OFFER_CURRENCIES } from "@/lib/pages/pricing";
import { PAGE_TYPES, PAGE_TYPE_LABELS } from "@/lib/pages/types";

const initialState = { success: false, message: "" };

export function PageDetailsForm({ page, templates }: { page: CreatorPage; templates: Template[] }) {
  const [state, action, pending] = useActionState(updatePageAction, initialState);
  const [heroImageUrl, setHeroImageUrl] = useState(page.heroImageUrl || "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="pageId" value={page.id} />
      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Offer details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={page.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Public slug</Label>
            <Input id="slug" name="slug" defaultValue={page.slug} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageType">Page type</Label>
            <Select id="pageType" name="pageType" defaultValue={page.pageType}>
              {PAGE_TYPES.map((type) => <option key={type} value={type}>{PAGE_TYPE_LABELS[type]}</option>)}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" name="subtitle" defaultValue={page.subtitle} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={page.description} className="min-h-36" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={page.category} placeholder="Career, design, business…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceText">Offer price or label</Label>
            <Input id="priceText" name="priceText" defaultValue={page.priceText} placeholder="49 or Book a call" />
            <p className="text-xs leading-5 text-slate-500">
              Enter an amount only, or a label such as Free or Book a call.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceCurrency">Currency</Label>
            <Select id="priceCurrency" name="priceCurrency" defaultValue={page.priceCurrency || "USD"}>
              {OFFER_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.label}</option>
              ))}
            </Select>
            <p className="text-xs leading-5 text-slate-500">Used whenever the price is a number.</p>
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Conversion and media</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          The button URL is used when no customer payment options are enabled. Configure a dedicated checkout in{" "}
          <Link href={`/dashboard/pages/${page.id}/payments`} className="font-semibold text-blue-700 hover:underline">
            Payments
          </Link>.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Button text</Label>
            <Input id="ctaText" name="ctaText" defaultValue={page.ctaText} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaUrl">Button URL</Label>
            <Input id="ctaUrl" name="ctaUrl" defaultValue={page.ctaUrl || ""} placeholder="https://…" />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField
              name="heroImageUrl"
              label="Cover photo"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              purpose="cover"
              help="Use a wide, high-quality photo showing you, your product, or the result customers can achieve."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="introVideoUrl">Intro video URL</Label>
            <Input id="introVideoUrl" name="introVideoUrl" defaultValue={page.introVideoUrl || ""} placeholder="YouTube, Vimeo, Mux…" />
          </div>
          <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2">
            <input type="checkbox" name="whatsappEnabled" defaultChecked={page.whatsappEnabled} className="size-4 rounded" />
            Show a WhatsApp contact button
          </label>
        </div>
      </section>

      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Template</h2>
        <div className="mt-5 space-y-2">
          <Label htmlFor="templateId">Visual direction</Label>
          <Select id="templateId" name="templateId" defaultValue={page.templateId || ""}>
            <option value="">Use default styling</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}{template.isPremium ? " — Growth/Pro" : ""}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {state.message ? <Alert variant={state.success ? "success" : "destructive"}>{state.message}</Alert> : null}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : "Save page details"}</Button>
    </form>
  );
}
