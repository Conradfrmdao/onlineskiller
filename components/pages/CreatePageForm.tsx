"use client";

import { useActionState, useState } from "react";
import { ArrowRight } from "lucide-react";

import { createPageAction } from "@/actions/page-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Template } from "@/db/schema";
import { PAGE_TYPES, PAGE_TYPE_LABELS } from "@/lib/pages/types";
import { slugify } from "@/lib/utils/slugs";

const initialState = { success: false, message: "" };

export function CreatePageForm({ templates }: { templates: Template[] }) {
  const [state, action, pending] = useActionState(createPageAction, initialState);
  const [title, setTitle] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slug, setSlug] = useState("");

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={action} className="panel rounded-2xl p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">What are you launching?</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => updateTitle(event.target.value)}
            placeholder="AI Skills Sprint"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pageType">Page type</Label>
          <Select id="pageType" name="pageType" required defaultValue="digital-product">
            {PAGE_TYPES.map((type) => <option key={type} value={type}>{PAGE_TYPE_LABELS[type]}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Public URL</Label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-white pl-3">
            <span className="text-sm text-slate-400">/p/</span>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(slugify(event.target.value));
              }}
              className="border-0 shadow-none focus:ring-0"
              required
            />
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="templateId">Starting template</Label>
          <Select id="templateId" name="templateId" defaultValue={templates[0]?.id || ""}>
            <option value="">No template yet</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}{template.isPremium ? " — Growth/Pro" : ""}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">Premium templates require an active Growth or Pro plan.</p>
        </div>
      </div>
      {state.message ? <Alert variant="destructive" className="mt-5">{state.message}</Alert> : null}
      <div className="mt-7 flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Creating page…" : "Create and customize"} <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
