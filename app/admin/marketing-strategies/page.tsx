import { asc } from "drizzle-orm";

import { marketingStrategies } from "@/db/schema";
import { saveMarketingStrategyAdminAction } from "@/actions/admin-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";

type Strategy = typeof marketingStrategies.$inferSelect;

function StrategyForm({ strategy }: { strategy?: Strategy }) {
  return (
    <details className="panel rounded-2xl p-5" open={!strategy}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
        {strategy?.title || "Create marketing strategy"}
        {strategy ? <Badge variant={strategy.isActive ? "success" : "warning"}>{strategy.isActive ? "Active" : "Hidden"}</Badge> : null}
      </summary>
      <form action={saveMarketingStrategyAdminAction} className="mt-5 grid gap-3 sm:grid-cols-2">
        {strategy ? <input type="hidden" name="strategyId" value={strategy.id} /> : null}
        <div className="space-y-1"><Label>Title</Label><Input name="title" defaultValue={strategy?.title} required /></div>
        <div className="space-y-1"><Label>Slug</Label><Input name="slug" defaultValue={strategy?.slug} /></div>
        <div className="space-y-1"><Label>Category</Label><Input name="category" defaultValue={strategy?.category} required /></div>
        <div className="space-y-1"><Label>Best platform</Label><Input name="bestPlatform" defaultValue={strategy?.bestPlatform} /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Textarea name="description" defaultValue={strategy?.description} /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Steps, one per line</Label><Textarea name="steps" defaultValue={strategy?.steps.join("\n")} /></div>
        <div className="space-y-1"><Label>Example captions</Label><Textarea name="exampleCaptions" defaultValue={strategy?.exampleCaptions.join("\n")} /></div>
        <div className="space-y-1"><Label>Example posts</Label><Textarea name="examplePosts" defaultValue={strategy?.examplePosts.join("\n")} /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Recommended CTA</Label><Textarea name="recommendedCta" defaultValue={strategy?.recommendedCta} /></div>
        <div className="space-y-1"><Label>Difficulty</Label><Input name="difficultyLevel" defaultValue={strategy?.difficultyLevel || "beginner"} /></div>
        <div className="space-y-1"><Label>Recommended page type</Label><Input name="recommendedPageType" defaultValue={strategy?.recommendedPageType || "all"} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPremium" defaultChecked={strategy?.isPremium} />Premium</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={strategy ? strategy.isActive : true} />Active</label>
        <div className="sm:col-span-2"><Button type="submit">{strategy ? "Save strategy" : "Create strategy"}</Button></div>
      </form>
    </details>
  );
}

export default async function AdminStrategiesPage() {
  const rows = await db.select().from(marketingStrategies).orderBy(asc(marketingStrategies.title));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title="Marketing strategies" description="Maintain the practical playbooks available to creators." />
      <StrategyForm />
      <div className="space-y-3">{rows.map((strategy) => <StrategyForm key={strategy.id} strategy={strategy} />)}</div>
    </div>
  );
}
