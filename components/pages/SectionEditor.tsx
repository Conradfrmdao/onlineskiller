"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import {
  addSectionAction,
  deleteSectionAction,
  moveSectionAction,
  updateSectionAction,
} from "@/actions/page-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PageSection } from "@/db/schema";
import { SECTION_TYPES } from "@/lib/pages/types";

const initialState = { success: false, message: "" };

function itemsToText(section: PageSection) {
  return (section.content.items || [])
    .map((item) => `${item.title}${item.description ? ` | ${item.description}` : ""}`)
    .join("\n");
}

export function ExistingSectionEditor({ section, pageId }: { section: PageSection; pageId: string }) {
  const [state, action, pending] = useActionState(updateSectionAction, initialState);
  return (
    <article className="panel rounded-2xl p-5">
      <form action={action} className="space-y-4">
        <input type="hidden" name="pageId" value={pageId} />
        <input type="hidden" name="sectionId" value={section.id} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select name="sectionType" defaultValue={section.sectionType} className="w-auto">
            {SECTION_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("-", " ")}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input type="checkbox" name="isVisible" defaultChecked={section.isVisible} /> Visible
          </label>
        </div>
        <Input name="title" defaultValue={section.title} required />
        <Textarea name="body" defaultValue={section.content.body || ""} placeholder="Section introduction or body" />
        <div>
          <Textarea name="items" defaultValue={itemsToText(section)} placeholder={"One item per line:\nItem title | Optional description"} />
          <p className="mt-1 text-xs text-slate-500">Use one line per item and separate title from description with a vertical bar.</p>
        </div>
        {state.message ? <Alert variant={state.success ? "success" : "destructive"}>{state.message}</Alert> : null}
        <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Saving…" : "Save section"}</Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <form action={moveSectionAction}>
          <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="sectionId" value={section.id} />
          <input type="hidden" name="direction" value="up" />
          <Button type="submit" variant="ghost" size="sm"><ArrowUp /> Move up</Button>
        </form>
        <form action={moveSectionAction}>
          <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="sectionId" value={section.id} />
          <input type="hidden" name="direction" value="down" />
          <Button type="submit" variant="ghost" size="sm"><ArrowDown /> Move down</Button>
        </form>
        <form action={deleteSectionAction} className="ml-auto">
          <input type="hidden" name="pageId" value={pageId} /><input type="hidden" name="sectionId" value={section.id} />
          <Button type="submit" variant="destructive" size="sm"><Trash2 /> Delete</Button>
        </form>
      </div>
    </article>
  );
}

export function AddSectionForm({ pageId }: { pageId: string }) {
  const [state, action, pending] = useActionState(addSectionAction, initialState);
  return (
    <form action={action} className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 p-5">
      <input type="hidden" name="pageId" value={pageId} />
      <h2 className="font-semibold">Add another section</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Section type</Label>
          <Select name="sectionType" defaultValue="custom">
            {SECTION_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("-", " ")}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Body</Label>
          <Textarea name="body" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Items</Label>
          <Textarea name="items" placeholder="Item title | Optional description" />
        </div>
      </div>
      {state.message ? <Alert className="mt-4" variant={state.success ? "success" : "destructive"}>{state.message}</Alert> : null}
      <Button type="submit" className="mt-4" disabled={pending}>{pending ? "Adding…" : "Add section"}</Button>
    </form>
  );
}
