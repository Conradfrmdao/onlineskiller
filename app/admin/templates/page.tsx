import { asc } from "drizzle-orm";

import { templates } from "@/db/schema";
import { saveTemplateAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";

function TemplateForm({ template }: { template?: typeof templates.$inferSelect }) {
  return (
    <form action={saveTemplateAdminAction} className="panel rounded-2xl p-5">
      {template ? <input type="hidden" name="templateId" value={template.id} /> : null}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{template ? template.name : "Create template"}</h2>
        {template ? <Badge variant={template.isPremium ? "warning" : "secondary"}>{template.isPremium ? "Premium" : "Basic"}</Badge> : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label>Name</Label><Input name="name" defaultValue={template?.name} required /></div>
        <div className="space-y-1"><Label>Slug</Label><Input name="slug" defaultValue={template?.slug} /></div>
        <div className="space-y-1"><Label>Page type</Label><Input name="pageType" defaultValue={template?.pageType || "all"} /></div>
        <div className="space-y-1"><Label>Accent</Label><Input name="accent" type="color" defaultValue={template?.config.theme.accent || "#1769ff"} className="p-1" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Textarea name="description" defaultValue={template?.description} required /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPremium" defaultChecked={template?.isPremium} />Premium</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={template ? template.isActive : true} />Active</label>
      </div>
      <Button type="submit" className="mt-4">{template ? "Save template" : "Create template"}</Button>
    </form>
  );
}

export default async function AdminTemplatesPage() {
  const rows = await db.select().from(templates).orderBy(asc(templates.name));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title="Templates" description="Create, edit, and control access to the public-page visual library." />
      <TemplateForm />
      <div className="grid gap-4 lg:grid-cols-2">{rows.map((template) => <TemplateForm key={template.id} template={template} />)}</div>
    </div>
  );
}
