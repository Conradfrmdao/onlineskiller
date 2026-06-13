"use client";

import { useActionState, useState } from "react";
import { EyeOff, Pencil, Trash2, X } from "lucide-react";

import { deleteSectionAction, updateSectionAction } from "@/actions/page-actions";
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

export function PreviewSectionEditor({
  pageId,
  section,
}: {
  pageId: string;
  section: PageSection;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateSectionAction, initialState);

  return (
    <>
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-blue-200 bg-white/95 text-blue-700 shadow-lg backdrop-blur"
          onClick={() => setOpen(true)}
        >
          <Pencil /> Edit section
        </Button>
        <form
          action={deleteSectionAction}
          onSubmit={(event) => {
            if (!window.confirm(`Delete "${section.title}"? This cannot be undone.`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="pageId" value={pageId} />
          <input type="hidden" name="sectionId" value={section.id} />
          <Button
            type="submit"
            size="icon"
            variant="destructive"
            className="size-9 bg-white/95 shadow-lg backdrop-blur"
            aria-label={`Delete ${section.title}`}
          >
            <Trash2 />
          </Button>
        </form>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-4 max-w-2xl rounded-3xl bg-white p-5 text-slate-950 shadow-2xl sm:my-8 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Preview editor
                </p>
                <h2 className="mt-2 text-2xl font-bold">Edit this section</h2>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close editor"
              >
                <X />
              </Button>
            </div>

            <form action={action} className="mt-6 space-y-4">
              <input type="hidden" name="pageId" value={pageId} />
              <input type="hidden" name="sectionId" value={section.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`section-type-${section.id}`}>Section type</Label>
                  <Select
                    id={`section-type-${section.id}`}
                    name="sectionType"
                    defaultValue={section.sectionType}
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type} value={type}>{type.replaceAll("-", " ")}</option>
                    ))}
                  </Select>
                </div>
                <label className="flex items-center gap-3 self-end rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold">
                  <input type="checkbox" name="isVisible" defaultChecked={section.isVisible} />
                  Keep this section visible
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`section-title-${section.id}`}>Title</Label>
                <Input
                  id={`section-title-${section.id}`}
                  name="title"
                  defaultValue={section.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-body-${section.id}`}>Introduction</Label>
                <Textarea
                  id={`section-body-${section.id}`}
                  name="body"
                  defaultValue={section.content.body || ""}
                  className="min-h-28"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-items-${section.id}`}>Cards or answers</Label>
                <Textarea
                  id={`section-items-${section.id}`}
                  name="items"
                  defaultValue={itemsToText(section)}
                  className="min-h-40"
                  placeholder={"One item per line:\nItem title | Optional description"}
                />
                <p className="text-xs leading-5 text-slate-500">
                  Put one item on each line. Separate its title and description with a vertical bar.
                </p>
              </div>

              {state.message ? (
                <Alert variant={state.success ? "success" : "destructive"}>{state.message}</Alert>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : "Save and refresh preview"}
                </Button>
              </div>
            </form>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <EyeOff className="size-4" />
              Turn off visibility to hide this section without deleting it.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
